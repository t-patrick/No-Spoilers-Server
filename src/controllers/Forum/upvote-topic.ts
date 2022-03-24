import { Request, Response } from 'express';
import Topic from '../../models/topic';

/*
 * function to upvote topic from forum
 */

export const upvoteTopic = async (req: Request, res: Response): Promise<void> => {
	try {
		const userId: string = req.body._id;
		const topicId: string = req.body.topicId;
		const match: Topic | null = await Topic.findOne({ _id: topicId, authorUserId: userId });
		if (match) {
			res.status(400);
			res.send("You can't vote for your own topic");
			return;
		}
		const topic: Topic | null = await Topic.findOne({ _id: topicId });
		if (topic) {
			const upMatch = topic.upVoteIds.filter(id => id === userId);
			if (upMatch.length) {
				res.status(400);
				res.send("You can't vote for a topic twice");
				return;
			}
			const downMatch = topic.downVoteIds.filter(id => id === userId);
			if (downMatch.length === 1) {
				const updated: ModificationResponse = await Topic.updateOne({ _id: topicId }, {
					$inc: {
						voteScore: 1
					},
					$pull: {
						downVoteIds: userId
					}
				});
				res.status(200);
				res.send(updated);
			} else {
				const updated: ModificationResponse = await Topic.updateOne({ _id: topicId }, {
					$inc: {
						voteScore: 1
					},
					$push: {
						upVoteIds: userId
					}
				});
				res.status(200);
				res.send(updated);
			}
		}
	} catch (e) {
		console.error(e, 'upvoteTopic is failing');
		res.status(500);
	}
};