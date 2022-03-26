import axios from 'axios';
import { Request, Response } from 'express';
import UserExternalId from '../../models/user-external-id';
import UserTVShow from '../../models/user-tv-show';
import FullTVShow from '../../models/full-tv-show';

/*
 * function to get next episode date for a user's tv show
 */

const getNextEpisodeDate = async (
  fullTVShow: TVShow,
  userId: string,
  showId: number
): Promise<string | undefined> => {
  try {
    const tvShow: UserTVShow | null = await UserTVShow.findOne({
      userId: userId,
      TMDB_show_id: showId,
    });
    if (tvShow) {
      const nextEpisodeCode = tvShow.episodeCodeNext;
      if (nextEpisodeCode === '') return '';
      const nextEpisodeCodeArray: string[] = nextEpisodeCode
        .slice(1)
        .split('e');
      const seasonNumber = Number(nextEpisodeCodeArray[0]);
      const episodeNumber = Number(nextEpisodeCodeArray[1]);
      const season = fullTVShow.seasons[seasonNumber - 1];
      const episode = season.episodes[episodeNumber - 1];
      const regex = /-/g;
      const airDateNoHyphen: string | undefined = episode.air_date?.replace(regex, '');
      return airDateNoHyphen;
    } else return;
  } catch (e) {
    console.error(e, 'getNextEpisodeDate is failing');
    return;
  }
};

/*
 * check if an existing user in database and create if not or update if yes with the new url
 */

const updateDatabaseWithUrl = async (
  userId: string,
  showId: number,
  website: string,
  finalUrl: string
): Promise<void> => {
  try {
    const existingUser = await UserExternalId.findOne({
      userId: userId,
      TMDB_show_id: showId,
    });
    if (existingUser) {
      await UserExternalId.findOneAndUpdate(
        {
          userId: userId,
          TMDB_show_id: showId,
        },
        { $push: { websites: { name: website, waybackUrl: finalUrl } } }
      );
    } else {
      await UserExternalId.create({
        userId: userId,
        TMDB_show_id: showId,
        websites: [{ name: website, waybackUrl: finalUrl }],
      });
    }
    return;
  } catch (e) {
    console.error(e, 'updateDatabaseWithUrl is failing');
    return;
  }
};

/*
 * function to add a user input url to the user wayback database
 */

export const addUserWayback = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId: string = req.body._id;
    const website: string = req.body.website;
    const TMDB_show_id = Number(req.params.TMDB_show_Id);
    let finalUrl: string;
    const duplicateCheck = await UserExternalId.findOne({
      userId: userId,
      TMDB_show_id: TMDB_show_id,
      'website.name': website,
    });
    if (duplicateCheck && duplicateCheck.websites) {
      const filterDuplicate = duplicateCheck.websites.filter(
        (site) => site.name === website
      );
      if (filterDuplicate.length) {
        res.status(400);
        res.end('Website already added');
        return;
      }
    }
    const fullTVShow: TVShow | null = await FullTVShow.findOne({ TMDB_show_id: TMDB_show_id });
    if (!fullTVShow) {
      res.status(400);
      res.send('TV show does not exist in full tv show database');
      return;
    }
    const nextEpisodeDate: string | undefined = await getNextEpisodeDate(
      fullTVShow,
      userId,
      TMDB_show_id
    );
    if (nextEpisodeDate && nextEpisodeDate !== '') {
      let year = Number(nextEpisodeDate.slice(0, 4));
      year--;
      const fromDate = `${year}0101`;
      const { data } = await axios.get(
        `http://web.archive.org/cdx/search/cdx?url=${website}&output=json&from=${fromDate}&to=${nextEpisodeDate}`
      );
      if (data.length) {
        const finalSnapshot: string[] = data[data.length - 1];
        finalUrl = `http://web.archive.org/web/${finalSnapshot[1]}/${finalSnapshot[2]}`;
        updateDatabaseWithUrl(userId, TMDB_show_id, website, finalUrl);
        res.status(200);
        res.send({ name: website, waybackUrl: finalUrl });
        return;
      } else {
        finalUrl = '';
        updateDatabaseWithUrl(userId, TMDB_show_id, website, finalUrl);
        res.status(200);
        res.send({ name: website, waybackUrl: finalUrl });
      }
    } else {
      updateDatabaseWithUrl(userId, TMDB_show_id, website, website);
      res.status(200);
      res.send({ name: website, waybackUrl: website });
    }
  } catch (e) {
    console.error(e, 'addUserWayback is failing');
    res.status(500);
  }
};
