import { Request, Response } from 'express';
import Topic from '../../models/topic';
import UserTVShow from '../../models/user-tv-show';

/*
 * function to add visible flag to replies depending on the user's watched progress
 */

const replyVisibleFlag = (filteredTopics: Topic[], episodeWatchFilter: number) => {
	for (let i = 0; i < filteredTopics.length; i++) {
		filteredTopics[i].replies.forEach(reply => {
			if (reply.replierEpisodeUpTo <= episodeWatchFilter) reply.visible = true;
			else reply.visible = false;
		})
	}
	return filteredTopics;
};

/*
 * function to load messages on load of show page
 */

export const onLoadForum = async (req: Request, res: Response): Promise<void> => {
	try {
		const userId: string = req.body._id;
		const TMDB_show_id = Number(req.params.TMDB_show_Id);
		const topics: Topic[] | null = await Topic.find({
			userId: userId, TMDB_show_id: TMDB_show_id
		});
		if (!topics || topics.length === 0) {
			res.status(200);
			res.send('No topics found');
			return;
		}
		const user: UserTVShow | null = await UserTVShow.findOne({
			userId: userId, TMDB_show_id: TMDB_show_id
		});
		if (!user) {
			res.status(400);
			res.send('User does not exist in user database.');
			return;
		}
		const episodeWatchFilter: number = user.episodesWatchedSoFar;
		const filteredTopics = topics.filter(topic => topic.authorEpisodeUpTo <= episodeWatchFilter);
		if (!filteredTopics || filteredTopics.length === 0) {
			res.status(200);
			res.send('No topics found');
			return;
		}
		const flaggedAndFilteredTopics = replyVisibleFlag(filteredTopics, episodeWatchFilter);
		res.status(200);
		res.send(flaggedAndFilteredTopics);
	} catch (e) {
		console.error(e, 'onLoadForum is failing');
		res.status(500);
	}
};