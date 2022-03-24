import { Request, Response } from 'express';
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
    const userId: string = req.body._id;
		const newEpisodeCode: string = req.body.newEpisodeCode;
		const newEpisodeId: number = req.body.TMDB_episode_id;
		const tvShow: TVShow = req.body.tvShow;
		const TMDB_show_Id = tvShow.TMDB_show_id;
    const episodeCodeArray: string[] = newEpisodeCode.slice(1).split('e');
    let seasonNumber = Number(episodeCodeArray[0]);
    let episodeNumber = Number(episodeCodeArray[1]);
    const numberOfEpisodes: number | undefined = tvShow.number_of_episodes;
    const userTVShow: UserTVShowUpdate | null = await UserTVShow.findOne({
      userId: userId,
      TMDB_show_id: TMDB_show_Id,
    });
    if (!userTVShow) {
      res.status(500);
			res.send('Failed to find TV show');
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
        { userId: userId, TMDB_show_id: TMDB_show_Id },
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
