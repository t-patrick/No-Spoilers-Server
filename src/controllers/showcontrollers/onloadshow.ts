import axios from "axios";
import * as dotenv from "dotenv";
import express, { Request, Response } from "express";
dotenv.config();
const apiUrl = 'https://api.themoviedb.org/3/';
const APIKEY = process.env.API_KEY;



const episodeReformat = (episodes: EpisodefromAPI[]): Episode[] => {
	const newEpisodeArray: Episode[] = []
	for (let i = 0; i < episodes.length; i++) {
		const newEpisode: Episode = {
			name: episodes[i].name,
			TMDB_episode_id: episodes[i].id,
			season_number: episodes[i].season_number,
			episode_number: episodes[i].episode_number
		}
		newEpisodeArray.push(newEpisode);
	}
	return newEpisodeArray;
}

const seasonApiCall = async (showId: number, seasonNumber: number): Promise<Season | undefined> => {
	try {
		const { data } = await axios.get(`${apiUrl}tv/${showId}/season/${seasonNumber}?api_key=${APIKEY}`);
		const newEpisodeArray: Episode[] = episodeReformat(data.episodes);
		const season: Season = {
			TMDB_season_id: data.id,
			numberOfEpisodes: data.episodes.length,
			episodes: newEpisodeArray
		};
		return season;
	}
	catch (e) {
		console.error(e, "seasonApiCall is failing");
		return;
	}
};

const externalIdApiCall = async (showId: number): Promise<ExternalIds | undefined> => {
	try {
		const { data } = await axios.get(`${apiUrl}tv/${showId}/external_ids?api_key=${APIKEY}`);
		const externalIds: ExternalIds = {
			imdb_id: data.imdb_id,
			facebook_id: data.facebook_id,
			instagram_id: data.instagram_id,
			twitter_id: data.twitter_id,
			wikipediaId: string,
			homepage: string,
		}
	}
	catch (e) {
		console.error(e, "externalIdApiCall is failing");
		return;
	}
};

/*
function occurs on load of show page
*/

export const onLoad = async (req: Request, res: Response): Promise<void> => {
	try {
		const userId: number = req.body._id;
		const TMDB_show_id: number = req.body.TMDB_show_id;
		const { data } = await axios.get(`${apiUrl}tv/${TMDB_show_id}?api_key=${APIKEY}`);
		const tvShowSeasons: Season[] = []
		for (let i = 0; i < data.seasons.length; i++) {
			if (data.seasons[i].name !== "Specials") {
				const season: Season | undefined = await seasonApiCall(TMDB_show_id, data.seasons[i].season_number);
				if (season) {
					tvShowSeasons.push(season)
				}
			}
		};
		const externalIds: ExternalIds = externalIdApiCall(TMDB_show_id);
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
			percentComplete: 0,
			seasons: tvShowSeasons,
			externalIds: externalIds,
			overview: data.overview
		}
	} catch (e) {
		console.error(e, "onLoad is failing");
		res.status(500);
  }
};