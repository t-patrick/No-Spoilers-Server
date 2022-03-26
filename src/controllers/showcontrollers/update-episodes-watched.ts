import { Request, Response } from 'express';
import FullTVShow from '../../models/full-tv-show';
import UserTVShow from '../../models/user-tv-show';


/*
 * function to get new amount of episodes watched
 */

const getEpisodesWatchedSoFar = (
  seasons: Season[],
  seasonNumber: number,
  episodeNumber: number
): number => {
  let count = 0;
	for (let i = 0; i < seasonNumber - 1; i++) {
		const number = seasons[i].numberOfEpisodes;
		if (number) {
			count = count + number;
		}
  }
  count = count + episodeNumber;
  return count;
};

/*
 * function to update episodes watched for a show
 */

export const updateEpisodesWatched = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId: string = req.body.id.id;
		const newEpisodeCode: string = req.body.newEpisodeCode;
		const newEpisodeId: number = req.body.TMDB_episode_id;
		const TMDB_show_id = Number(req.params.TMDB_show_Id);
		const tvShow: TVShow | null = await FullTVShow.findOne({TMDB_show_id: TMDB_show_id})
		if (!tvShow) {
			res.status(500);
			res.send('Failed to find TV show in database');
			return;
}
    const episodeCodeArray: string[] = newEpisodeCode.slice(1).split('e');
    let seasonNumber = Number(episodeCodeArray[0]);
    let episodeNumber = Number(episodeCodeArray[1]);
    const numberOfEpisodes: number | undefined = tvShow.number_of_episodes;
    const userTVShow: UserTVShowUpdate | null = await UserTVShow.findOne({
      userId: userId,
      TMDB_show_id: TMDB_show_id,
    });
    if (!userTVShow) {
      res.status(500);
			res.send('Failed to find TV show in user database');
			return;
    }
		userTVShow.episodeCodeUpTo = newEpisodeCode;
		userTVShow.episodeIdUpTo = newEpisodeId;
		let current_poster_path: string | null | undefined;
		if (tvShow.seasons) {
			current_poster_path = tvShow.seasons[seasonNumber-1].poster_path
		}
		userTVShow.current_poster_path = current_poster_path;
		const episodesWatchedSoFar = getEpisodesWatchedSoFar(
			tvShow.seasons,
			seasonNumber,
			episodeNumber
		);
		userTVShow.episodesWatchedSoFar = episodesWatchedSoFar;
		if (numberOfEpisodes) {
			const percentComplete = Math.floor(
				(episodesWatchedSoFar / numberOfEpisodes) * 100
			);
			userTVShow.percentComplete = percentComplete;
			if (percentComplete === 100) {
				userTVShow.isCompleted = true;
				userTVShow.episodeCodeNext = '';
				userTVShow.current_poster_path = '';
			} else {
				userTVShow.isCompleted = false;
				if (tvShow.seasons[seasonNumber - 1].numberOfEpisodes === episodeNumber) {
						seasonNumber++;
						episodeNumber = 1;
				} else {
					episodeNumber++;
				}
				const newEpisodeCodeNext = `s${seasonNumber}e${episodeNumber}`;
				userTVShow.episodeCodeNext = newEpisodeCodeNext;
			}
      await UserTVShow.findOneAndUpdate(
        { userId: userId, TMDB_show_id: TMDB_show_id },
				userTVShow
      );
    }
    res.status(200);
		res.send(userTVShow);
  } catch (e) {
    console.error(e, 'updateEpisodesWatched is failing');
    res.status(500);
  }
};
