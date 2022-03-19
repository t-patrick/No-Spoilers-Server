import axios from 'axios';
import * as dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import UserTVShow from '../../models/user-tv-show';
dotenv.config();
const apiUrl = 'https://api.themoviedb.org/3/';
const APIKEY = process.env.API_KEY;

/*
 * function to reformat episode information from API ro required episode type
 */

const episodeReformat = (episodes: EpisodefromAPI[]): Episode[] => {
  const newEpisodeArray: Episode[] = [];
  for (let i = 0; i < episodes.length; i++) {
    const newEpisode: Episode = {
      name: episodes[i].name,
      TMDB_episode_id: episodes[i].id,
      season_number: episodes[i].season_number,
      episode_number: episodes[i].episode_number,
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
  seasonNumber: number
): Promise<Season | undefined> => {
  try {
    const { data } = await axios.get(
      `${apiUrl}tv/${showId}/season/${seasonNumber}?api_key=${APIKEY}`
    );
    const newEpisodeArray: Episode[] = episodeReformat(data.episodes);
    const season: Season = {
      TMDB_season_id: data.id,
      numberOfEpisodes: data.episodes.length,
      episodes: newEpisodeArray,
    };
    return season;
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
		const tvShow: UserTVShow | null = await UserTVShow.findOne({ userId: userId, TMDB_show_id: showId });
		if (tvShow) {
			percentComplete = (tvShow.episodesWatchedSoFar / number_of_episodes) * 100;
		} else percentComplete = 0;
		return percentComplete;
	} catch (e) {
		console.error(e, 'calculatePercentComplete is failing');
		return 0;
	}
};

/*
 * function occuring on load of show page
 */

export const onLoadShow = async (req: Request, res: Response): Promise<void> => {
  try {
		const userId = req.body._id;
    const TMDB_show_id = Number(req.params.TMDB_show_Id);
    const { data } = await axios.get(
      `${apiUrl}tv/${TMDB_show_id}?api_key=${APIKEY}`
		);
		const percentComplete: number = await calculatePercentComplete(userId, TMDB_show_id, data.number_of_episodes);
    const tvShowSeasons: Season[] = [];
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
    };
    res.status(200);
    res.send(tvShow);
  } catch (e) {
    console.error(e, 'onLoadShow is failing');
    res.status(500);
  }
};