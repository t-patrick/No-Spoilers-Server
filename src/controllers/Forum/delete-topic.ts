import { Request, Response } from 'express';
import Topic from '../../models/topic';

/*
 * function to delete topic from forum
 */

export const deleteTopic = async (req: Request, res: Response): Promise<void> => {
	try {
		const topicId: string = req.body.topicId;
		const deleted: DeleteResponse = await Topic.deleteOne({ _id: topicId });
		res.status(200);
		res.send(deleted);
	} catch (e) {
		console.error(e, 'deleteTopic is failing');
		res.status(500);
	}
};