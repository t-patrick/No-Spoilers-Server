import axios from 'axios';
import * as dotenv from 'dotenv';
import { Request, Response } from 'express';
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
 * function to get the full season data for a show
 */

const getFullSeasonData = async (TMDB_show_id: number): Promise<Season[] | undefined> => {
	try {
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
		return tvShowSeasons;
	} catch (e) {
		console.error(e, 'getFullSeasonData is failing');
		return;
	}
};

/*
 * function to get an episode ID
 */

const getNewEpisodeID = async (seasonNumber: number, episodeNumber: number, showId: number): Promise<number | undefined> => {
	try {
		const { data } = await axios.get(`${apiUrl}tv/${showId}/season/${seasonNumber}/episode/${episodeNumber}?api_key=${APIKEY}`);
		return data.id;
	} catch (e) {
		console.error(e, 'getNewEpisodeId is failing');
		return;
	}
};

/*
 * function to get new amount of episodes watched
 */

const getEpisodesWatchedSoFar = (
	seasons: Season[],
	seasonNumber: number,
	episodeNumber: number
): number => {
	let count: number = 0;
	for (let i = 0; i < seasonNumber-1; i++) {
		count = count + seasons[i].numberOfEpisodes;
		}
  count = count + episodeNumber
	return count;
};

/*
 * function to update episodes watched for a show
 */

export const updateEpisodesWatched = async (req: Request, res: Response): Promise<void> => {
	try {
		const userId = req.body._id;
		const newEpisodeCode = req.body.newEpisodeCode
		const TMDB_show_Id = Number(req.params.TMDB_show_Id);
		const episodeCodeArray: string[] = newEpisodeCode.slice(1).split('e');
		let seasonNumber = Number(episodeCodeArray[0]);
		let episodeNumber = Number(episodeCodeArray[1]);
		const {data} = await axios.get(`${apiUrl}tv/${TMDB_show_Id}?api_key=${APIKEY}`)
		const numberOfEpisodes: number = data.number_of_episodes;
		let tvShow: UserTVShowUpdate | null = await UserTVShow.findOne({ userId: userId, TMDB_show_Id: TMDB_show_Id });
		if (!tvShow) {
			res.status(500);
			res.send('Failed to find TV show');
		}
		if (tvShow) {
			tvShow.episodeCodeUpTo = newEpisodeCode;
			const newEpisodeId: number | undefined = await getNewEpisodeID(seasonNumber, episodeNumber, TMDB_show_Id);
			if (!newEpisodeId) {
				res.status(500);
				res.send('Failed to find new episode ID');
			}
			if (newEpisodeId) tvShow.episodeIdUpTo = newEpisodeId;
			const seasons = await getFullSeasonData(TMDB_show_Id);
			if (!seasons) {
				res.status(500);
				res.send('Failed to get full season data');
			}
			if (seasons) {
				const episodesWatchedSoFar = getEpisodesWatchedSoFar(seasons, seasonNumber, episodeNumber);
				tvShow.episodesWatchedSoFar = episodesWatchedSoFar;
				const percentComplete = Math.floor((episodesWatchedSoFar / numberOfEpisodes) * 100);
				tvShow.percentComplete = percentComplete;
				if (percentComplete === 100) {
					tvShow.isCompleted = true;
					tvShow.episodeCodeNext = '';
				} else {
					tvShow.isCompleted = false;
					if (seasons[seasonNumber - 1].numberOfEpisodes === episodeNumber) {
						seasonNumber++;
						episodeNumber = 1;
					} else {
						episodeNumber++;
					}
					const newEpisodeCodeNext = `s${seasonNumber}e${episodeNumber}`;
					tvShow.episodeCodeNext = newEpisodeCodeNext;
				}
			}
		}
		res.status(200);
		res.send(tvShow);
	} catch (e) {
		console.error(e, 'updateEpisodesWatched is failing');
		res.status(500);
	}
};
