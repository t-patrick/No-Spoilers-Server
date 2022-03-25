import { Request, Response } from 'express';
import Topic from '../../models/topic';

/*
 * function to edit topic from forum
 */

export const editTopic = async (req: Request, res: Response): Promise<void> => {
	try {
		const topicId: string = req.body.topicId;
		const title: string = req.body.title;
		const body: string = req.body.body;
		const updated: ModificationResponse = await Topic.updateOne({_id: topicId}, { title: title, body: body });
		res.status(200);
		res.send(updated);
	} catch (e) {
		console.error(e, 'editTopic is failing');
		res.status(500);
	}
};