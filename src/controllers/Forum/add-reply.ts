import { Request, Response } from 'express';
import UserTVShow from '../../models/user-tv-show';
import User from '../../models/db-user';
import Topic from '../../models/topic';

/*
 * function to add reply
 */

// topicId: number; GOT
// authorUserId: string; GOT
// avatar: string; get from DB
// replierEpisodeUpTo: number; get from DB
// authorName: string; get from DB
// body: string; GOT
// date: Date; To be made

export const addReply = async (req: Request, res: Response): Promise<void> => {
	try {
		const userId: string = req.body._id;
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
		const user: User | null = await User.findOne({ _id: userId });
		if (!user) {
			res.status(400);
			res.send('User does not exist in user database.');
			return;
		}
		// const authorName: string = user.displayName;
		// const avatar: string = user.avatar;
		// const date = new Date();
		// const topic: Topic = {
		// 	TMDB_show_id: TMDB_show_id,
		// 	TMDB_episode_id: TMDB_episode_id,
		// 	authorUserId: userId,
		// 	authorName: authorName,
		// 	episodeCode: episodeCode,
		// 	title: title,
		// 	body: body,
		// 	numberOfReplies: 0,
		// 	avatar: avatar,
		// 	date: date,
		// 	voteScore: 0,
		// 	replies: []
		// };
		// const dbTopic = await Topic.create(topic);
		res.status(200);
		res.send();
	} catch (e) {
		console.error(e, 'addTopic is failing');
		res.status(500);
	}
};