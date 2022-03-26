import { Request, Response } from 'express';
import UserTVShow from '../../models/user-tv-show';
import User from '../../models/db-user';
import Topic from '../../models/topic';

/*
 * function to add topic
 */

export const addTopic = async (req: Request, res: Response): Promise<void> => {
	try {
		const userId: string = req.body.id.id;
		const title: string = req.body.title;
		const body: string = req.body.body;
		const TMDB_show_id = Number(req.params.TMDB_show_Id);
		const tvShow: UserTVShow | null = await UserTVShow.findOne({ userId: userId, TMDB_show_id: TMDB_show_id });
		if (!tvShow) {
			res.status(400);
			res.send('TV show does not exist in user TV show database.');
			return;
		}
		const TMDB_episode_id: number = tvShow.episodeIdUpTo;
		const episodeCode: string = tvShow.episodeCodeUpTo;
		const authorEpisodeUpTo: number = tvShow.episodesWatchedSoFar;
		const user: User | null = await User.findOne({ _id: userId });
		if (!user) {
			res.status(400);
			res.send('User does not exist in user database.');
			return;
		}
		const authorName: string = user.displayName;
		const avatar: string = user.avatar;
		const date = new Date();
		const topic: Topic = {
			TMDB_show_id: TMDB_show_id,
			TMDB_episode_id: TMDB_episode_id,
			authorUserId: userId,
			authorName: authorName,
			episodeCode: episodeCode,
			authorEpisodeUpTo: authorEpisodeUpTo,
			title: title,
			body: body,
			numberOfReplies: 0,
			avatar: avatar,
			date: date,
			voteScore: 0,
			upVoteIds: [],
			downVoteIds: [],
			replies: [],
			isReported: false,
		};
		const dbTopic = await Topic.create(topic);
		topic._id = dbTopic._id
		const userTopic: UserTopic = { ...topic, userVote: 0 };
		res.status(200);
		res.send(userTopic);
	} catch (e) {
		console.error(e, 'addTopic is failing');
		res.status(500);
	}
};