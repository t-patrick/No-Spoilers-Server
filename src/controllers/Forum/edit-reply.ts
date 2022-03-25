import { Request, Response } from 'express';
import Topic from '../../models/topic';

/*
 * function to edit reply from forum
 */

export const editReply = async (req: Request, res: Response): Promise<void> => {
	try {
		const topicId: string = req.body.topicId;
		const replyId: string = req.body.replyId;
		const body: string = req.body.body;
		const updated: ModificationResponse = await Topic.updateOne({ _id: topicId, "replies._id": replyId }, {
			$set: { "replies.$.body": body }
		});
		res.status(200);
		res.send(updated);
	} catch (e) {
		console.error(e, 'editReply is failing');
		res.status(500);
	}
};