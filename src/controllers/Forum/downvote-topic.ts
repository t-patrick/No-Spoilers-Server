import { Request, Response } from 'express';
import Topic from '../../models/topic';

/*
 * function to downvote topic from forum
 */

export const downvoteTopic = async (req: Request, res: Response): Promise<void> => {
	try {
		const userId: string = req.body.id.id;
		const topicId: string = req.body.topicId;
		const match: Topic | null = await Topic.findOne({ _id: topicId, authorUserId: userId });
		if (match) {
			res.status(400);
			res.send("You can't vote for your own topic");
			return;
		}
		const topic: Topic | null = await Topic.findOne({ _id: topicId });
		if (topic) {
			const downMatch = topic.downVoteIds.filter(id => id === userId);
			if (downMatch.length) {
				res.status(400);
				res.send("You can't vote for a topic twice");
				return;
			}
			const upMatch = topic.upVoteIds.filter(id => id === userId);
			if (upMatch.length === 1) {
				const updated: ModificationResponse = await Topic.updateOne({ _id: topicId }, {
					$inc: {
						voteScore: -1
					},
					$pull: {
						upVoteIds: userId
					}
				});
				res.status(200);
				res.send(updated);
			} else {
				const updated: ModificationResponse = await Topic.updateOne({ _id: topicId }, {
					$inc: {
						voteScore: -1
					},
					$push: {
						downVoteIds: userId
					}
				});
				res.status(200);
				res.send(updated);
			}
		}
	} catch (e) {
		console.error(e, 'downvoteTopic is failing');
		res.status(500);
	}
};