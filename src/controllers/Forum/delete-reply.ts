import { Request, Response } from 'express';
import Topic from '../../models/topic';

/*
 * function to delete reply from topic
 */

export const deleteReply = async (req: Request, res: Response): Promise<void> => {
	try {
    const topicId: string = req.body.topicId;
    const replyId: string = req.body.replyId;
    const deleted: ModificationResponse = await Topic.updateOne({
      _id: topicId
    }, { $inc: { numberOfReplies: -1 }, $pull: { replies: { _id: replyId } } }, { safe: true, multi: true });
		res.status(200);
		res.send(deleted);
	} catch (e) {
		console.error(e, 'deleteReply is failing');
		res.status(500);
	}
};