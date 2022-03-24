import { Request, Response } from 'express';
import UserTVShow from '../../models/user-tv-show';
import User from '../../models/db-user';
import Topic from '../../models/topic';
import { collapseTextChangeRangesAcrossMultipleVersions, nodeModuleNameResolver } from 'typescript';

/*
 * function to add reply
 */

export const addReply = async (req: Request, res: Response): Promise<void> => {
	try {
		const userId: string = req.body._id;
		const body: string = req.body.body;
		const topicId: string = req.body.topicId;
		const TMDB_show_id = Number(req.params.TMDB_show_Id);
		const tvShow: UserTVShow | null = await UserTVShow.findOne({ userId: userId, TMDB_show_id: TMDB_show_id });
		if (!tvShow) {
			res.status(400);
			res.send('TV show does not exist in user TV show database.');
			return;
		}
		const episodesWatchedSoFar: number = tvShow.episodesWatchedSoFar
		const user: User | null = await User.findOne({ _id: userId });
		if (!user) {
			res.status(400);
			res.send('User does not exist in user database.');
			return;
		}
		const authorName: string = user.displayName;
		const avatar: string = user.avatar;
		const date = new Date();
		const isReported: boolean = false;
		await Topic.findOneAndUpdate(
			{
				_id: topicId
			},
			{
				$inc: {
				numberOfReplies: 1
			},
				$push: {
					replies: {
						topicId: topicId,
						authorUserId: userId,
						avatar: avatar,
						replierEpisodeUpTo: episodesWatchedSoFar,
						authorName: authorName,
						body: body,
						isReported: isReported,
						date: date, } } }
		);
		const topic: Topic | null = await Topic.findOne({ _id: topicId });
		if (topic) {
			const reply: Reply = topic.replies[topic.replies.length - 1]
			res.status(200);
			res.send(reply);
		}
	} catch (e) {
		console.error(e, 'addReply is failing');
		res.status(500);
	}
};