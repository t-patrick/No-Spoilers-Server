import axios from 'axios';
import { Request, Response } from 'express';
import UserTVShow from '../../models/user-tv-show';
import FullTVShow from '../../models/full-tv-show';


/*
 * function to convert external urls to wayback urls
 */

const externalUrlReformat = (
  externalUrls: ExternalIds | undefined,
  nextEpisodeDate: string
): ExternalIds => {
  let year = Number(nextEpisodeDate.slice(0, 4));
  year--;
  const fromDate = `${year}0101`;
	const waybackUrls: ExternalIds | undefined = {};
	if (externalUrls?.imdb_id) waybackUrls.imdb_id = `http://web.archive.org/cdx/search/cdx?url=${externalUrls.imdb_id}&output=json&from=${fromDate}&to=${nextEpisodeDate}`;
	if (externalUrls?.facebook_id) waybackUrls.facebook_id = `http://web.archive.org/cdx/search/cdx?url=${externalUrls.facebook_id}&output=json&from=${fromDate}&to=${nextEpisodeDate}`;
	if (externalUrls?.instagram_id) waybackUrls.instagram_id = `http://web.archive.org/cdx/search/cdx?url=${externalUrls.instagram_id}&output=json&from=${fromDate}&to=${nextEpisodeDate}`;
	if (externalUrls?.twitter_id) waybackUrls.twitter_id = `http://web.archive.org/cdx/search/cdx?url=${externalUrls.twitter_id}&output=json&from=${fromDate}&to=${nextEpisodeDate}`;
	if (externalUrls?.wikipediaId) waybackUrls.wikipediaId = `http://web.archive.org/cdx/search/cdx?url=${externalUrls.wikipediaId}&output=json&from=${fromDate}&to=${nextEpisodeDate}`;
	if (externalUrls?.homepage) waybackUrls.homepage = `http://web.archive.org/cdx/search/cdx?url=${externalUrls.homepage}&output=json&from=${fromDate}&to=${nextEpisodeDate}`;
  return waybackUrls;
};

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
 * function to call wayback API and access final array
 */

const waybackApiCalls = async (
  waybackUrls: ExternalIds
): Promise<ExternalIds> => {
  try {
    for (const el in waybackUrls) {
      if (Object.prototype.hasOwnProperty.call(waybackUrls, el)) {
        const key = el as keyof ExternalIds;
        const { data } = await axios.get(waybackUrls[key] || '');
        if (data.length) {
          const finalSnapshot: string[] = data[data.length - 1];
          const finalUrl = `http://web.archive.org/web/${finalSnapshot[1]}/${finalSnapshot[2]}`;
          waybackUrls[key] = finalUrl;
        } else {
          waybackUrls[key] = '';
        }
      }
    }
    return waybackUrls;
  } catch (e) {
    console.error(e, 'waybackApiCalls is failing');
    return {
      imdb_id: ``,
      facebook_id: ``,
      instagram_id: ``,
      twitter_id: ``,
      wikipediaId: ``,
      homepage: ``,
    };
  }
};

/*
 * function to load wayback occuring on load of show page
 */

export const onLoadWaybackUrls = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId: string = req.body.id.id;
		const TMDB_show_id = Number(req.params.TMDB_show_Id);
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
			const waybackUrls: ExternalIds = externalUrlReformat(
				fullTVShow.externalIds,
				nextEpisodeDate
			);
			const finalUrls: ExternalIds = await waybackApiCalls(waybackUrls);
			res.status(200);
			res.send(finalUrls);
			return;
		} else {
      res.status(200);
      res.send(fullTVShow.externalIds);
    }
  } catch (e) {
    console.error(e, 'onLoadWaybackUrls is failing');
    res.status(500);
  }
};
