import axios from 'axios';
import * as dotenv from 'dotenv';
import { Request, Response } from 'express';
import UserTVShow from '../../models/user-tv-show';
dotenv.config();
const apiUrl = 'https://api.themoviedb.org/3/';
const APIKEY = process.env.API_KEY;


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
 * function to get the current episode ID
 */

const getNewEpisodeID = async (episodeCode: string, showId: number): Promise<number | undefined> => {
	try {
		const episodeCodeArray: string[] = episodeCode.slice(1).split('e');
		const seasonNumber = Number(episodeCodeArray[0]);
		const episodeNumber = Number(episodeCodeArray[1]);
		const { data } = await axios.get(`${apiUrl}tv/${showId}/season/${seasonNumber}/episode/${episodeNumber}?api_key=${APIKEY}`);
		const episodeId: number = data.id;
		return episodeId;
	} catch (e) {
		console.error(e, 'getNewEpisodeId is failing');
		return;
	}
};

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

/*
 * function to get new amount of episodes watched
 */

const getEpisodesWatchedSoFar= async (
	tvShowSeasons: Season[],
	newEpisodeCode: String,
): Promise<number | undefined> => {
	try {
		const episodeCodeArray: string[] = newEpisodeCode.slice(1).split('e');
		const seasonNumber = Number(episodeCodeArray[0]);
		const episodeNumber = Number(episodeCodeArray[1]);
		let count: number = 0;
		// for (let i = 1; i<seasonNumber)
		// const newEpisodeArray: Episode[] = episodeReformat(data.episodes);
		// const season: Season = {
		// 	TMDB_season_id: data.id,
		// 	numberOfEpisodes: data.episodes.length,
		// 	episodes: newEpisodeArray,
		// };
		return 2;
	} catch (e) {
		console.error(e, 'seasonApiCall is failing');
		return;
	}
};

/*
 * function to update episodes watched for a show
 */

export const updateEpisodesWatched = async (req: Request, res: Response): Promise<void> => {
	try {
		const userId = req.body._id;
		const newEpisodeCode = req.body.newEpisodeCode
		const TMDB_show_id = Number(req.params.TMDB_show_Id);
		let tvShow: UserTVShow | null = await UserTVShow.findOne({ userId: userId, TMDB_show_id: TMDB_show_id });
		if (tvShow) {
			tvShow.episodeCodeUpTo = newEpisodeCode;
			const newEpisodeId: number | undefined = await getNewEpisodeID(newEpisodeCode, TMDB_show_id);
			if (newEpisodeId) tvShow.episodeIdUpTo = newEpisodeId;
		  const { data } = await axios.get(`${apiUrl}tv/${TMDB_show_id}?api_key=${APIKEY}`);
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
			const episodesWatchedSoFar = await getEpisodesWatchedSoFar(tvShowSeasons, newEpisodeCode);

			const percentComplete: number = await calculatePercentComplete(userId, TMDB_show_id, data.number_of_episodes);
		}
		res.status(200);
		res.send(tvShow);
	} catch (e) {
		console.error(e, 'updateEpisodesWatched is failing');
		res.status(500);
	}
};

// isCompleted: boolean; if next episode is null then this is true, else false
// episodeCodeNext: string; find next episode code
// episodesWatchedSoFar: number;
// percentComplete: number