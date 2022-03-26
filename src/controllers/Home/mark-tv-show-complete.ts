import { Request, Response } from 'express';
import FullTVShow from '../../models/full-tv-show';
import UserTVShow from '../../models/user-tv-show';


/*
 * function to mark tv show as complete from home page
 */

export const completeTVShow = async (req: Request, res: Response): Promise<void> => {
	try {
		const userId: string = req.body.id.id;
		const TMDB_show_id = Number(req.params.TMDB_show_Id);
		const tvShow: TVShow | null = await FullTVShow.findOne({ TMDB_show_id: TMDB_show_id })
		if (!tvShow) {
			res.status(500);
			res.send('Failed to find TV show in database. Visit the shwo page first.');
			return;
		};
		const userTVShow: UserTVShowUpdate | null = await UserTVShow.findOne({
			userId: userId,
			TMDB_show_id: TMDB_show_id,
		});
		if (!userTVShow) {
			res.status(500);
			res.send('Failed to find TV show in user database');
			return;
		}
		userTVShow.current_poster_path = "";
		if (tvShow.number_of_episodes) userTVShow.episodesWatchedSoFar = tvShow.number_of_episodes;
		userTVShow.isCompleted = true;
		userTVShow.episodeCodeNext = '';
		const finalSeason = tvShow.seasons[tvShow.seasons.length - 1];
		const finalEpisode = finalSeason.episodes[finalSeason.episodes.length - 1];
		if (finalEpisode.TMDB_episode_id) userTVShow.episodeIdUpTo = finalEpisode.TMDB_episode_id;
		const newEpisodeCode: string = `s${finalEpisode.season_number}e${finalEpisode.episode_number}`;
		userTVShow.episodeCodeUpTo = newEpisodeCode;
		await UserTVShow.findOneAndUpdate(
			{ userId: userId, TMDB_show_id: TMDB_show_id },
			userTVShow
		);
		res.status(200);
		res.send(userTVShow);
	} catch (e) {
		console.error(e, 'completeTVShow is failing');
		res.status(500);
	}
};
