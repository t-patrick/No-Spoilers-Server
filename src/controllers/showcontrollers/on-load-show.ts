import axios from 'axios';
import * as dotenv from 'dotenv';
import { Request, Response } from 'express';
import FullTVShow from '../../models/full-tv-show';
import UserTVShow from '../../models/user-tv-show';
dotenv.config();
const apiUrl = 'https://api.themoviedb.org/3/';
const APIKEY = process.env.API_KEY;

/*
 * function to reformat episode information from API to required episode type
 */

const episodeReformat = (episodes: EpisodefromAPI[]): Episode[] => {
  const newEpisodeArray: Episode[] = [];
  for (let i = 0; i < episodes.length; i++) {
    const newEpisode: Episode = {
      name: episodes[i].name,
      TMDB_episode_id: episodes[i].id,
      season_number: episodes[i].season_number,
      episode_number: episodes[i].episode_number,
      air_date: episodes[i].air_date
    };
    newEpisodeArray.push(newEpisode);
  }
  return newEpisodeArray;
};

/*
 * function to call season data from API and return required season type
 */

const seasonApiCall = async (
  showId: number,
  seasonNumber: number | undefined
): Promise<Season | undefined> => {
  try {
    const axiosAPISeason: AxiosAPICallSeason = await axios.get(
      `${apiUrl}tv/${showId}/season/${seasonNumber}?api_key=${APIKEY}`
    );
    const data = axiosAPISeason.data;
    if (data.episodes) {
      const newEpisodeArray: Episode[] = episodeReformat(data.episodes);
      const season: Season = {
        TMDB_season_id: data.id,
        poster_path: data.poster_path,
        numberOfEpisodes: data.episodes.length,
        episodes: newEpisodeArray,
      };
      return season;
    }
  } catch (e) {
    console.error(e, 'seasonApiCall is failing');
    return;
  }
};

const calculatePercentComplete = async (
  userId: number,
  showId: number,
  number_of_episodes: number
): Promise<number> => {
  try {
    let percentComplete: number;
    const tvShow: UserTVShow | null = await UserTVShow.findOne({
      userId: userId,
      TMDB_show_id: showId,
    });
    if (tvShow) {
      percentComplete = Math.floor(
        (tvShow.episodesWatchedSoFar / number_of_episodes) * 100
      );
    } else percentComplete = 0;
    return percentComplete;
  } catch (e) {
    console.error(e, 'calculatePercentComplete is failing');
    return 0;
  }
};

/*
 * function to call external ids from API and return required properties
 */

const externalIdApiCall = async (
  showId: number
): Promise<ExternalIds | undefined> => {
  try {
    const { data } = await axios.get(
      `${apiUrl}tv/${showId}/external_ids?api_key=${APIKEY}`
    );
    const externalIds: ExternalIds = {
      imdb_id: data.imdb_id,
      facebook_id: data.facebook_id,
      instagram_id: data.instagram_id,
      twitter_id: data.twitter_id,
    };
    return externalIds;
  } catch (e) {
    console.error(e, 'externalIdApiCall is failing');
    return;
  }
};

/*
 * function to convert external IDs to required urls
 */

const externalIdReformat = (
  externalIds: ExternalIds | undefined,
  showName: string | undefined,
  homepage: string | undefined
): ExternalIds => {
  const wikiName = showName?.split(' ').join('_');
  let externalUrls: ExternalIds;
  if (externalIds) {
    externalUrls = {
      imdb_id: `https://www.imdb.com/title/${externalIds.imdb_id}/`,
      facebook_id: `https://www.facebook.com/${externalIds.facebook_id}/`,
      instagram_id: `https://www.instagram.com/${externalIds.instagram_id}/`,
      twitter_id: `https://twitter.com/${externalIds.twitter_id}`,
      wikipediaId: `https://en.wikipedia.org/wiki/${wikiName}`,
      homepage: homepage,
    };
  } else {
    externalUrls = {
      wikipediaId: `https://en.wikipedia.org/wiki/${wikiName}`,
      homepage: homepage,
    };
  }
  return externalUrls;
};

/*
 * function occuring on load of show page
 */

export const onLoadShow = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.body.id.id;
    const TMDB_show_id = Number(req.params.TMDB_show_Id);
    const dbShow: TVShow | null = await FullTVShow.findOne({ TMDB_show_id: TMDB_show_id });
    if (dbShow) {
      res.status(200);
      res.send(dbShow);
      return;
    }
    const axiosTVShow: AxiosTVShow  = await axios.get(
      `${apiUrl}tv/${TMDB_show_id}?api_key=${APIKEY}`
    );
    const data = axiosTVShow.data;
    let percentComplete: number = 0;
    if (data.number_of_episodes) {
      percentComplete = await calculatePercentComplete(
        userId,
        TMDB_show_id,
        data.number_of_episodes
      );
    }
    const tvShowSeasons: Season[] = [];
    if (data.seasons) {
      for (let i = 0; i < data.seasons.length; i++) {
        if (data.seasons[i].name !== 'Specials') {
            const season: Season | undefined = await seasonApiCall(
              TMDB_show_id,
              data.seasons[i].season_number
            );
            if (season) {
              tvShowSeasons.push(season);
          }
        }
      }
    }
    const externalIds: ExternalIds | undefined = await externalIdApiCall(
      TMDB_show_id
    );
    const externalUrls: ExternalIds = externalIdReformat(
      externalIds,
      data.name,
      data.homepage
    );
    const tvShow: TVShow = {
      TMDB_show_id: data.id,
      name: data.name,
      first_air_date: data.first_air_date,
      last_air_date: data.last_air_date,
      homepage: data.homepage,
      tagline: data.tagline,
      backdrop_path: data.backdrop_path,
      poster_path: data.poster_path,
      created_by: data.created_by,
      next_episode_to_air: data.next_episode_to_air,
      number_of_episodes: data.number_of_episodes,
      number_of_seasons: data.number_of_seasons,
      percentComplete: percentComplete,
      seasons: tvShowSeasons,
      overview: data.overview,
      externalIds: externalUrls
    };
    await FullTVShow.create(tvShow);
    res.status(200);
    res.send(tvShow);
  } catch (e) {
    console.error(e, 'onLoadShow is failing');
    res.status(500);
  }
};
