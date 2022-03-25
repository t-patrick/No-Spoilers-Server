import { Request, Response } from 'express';
import Topic from '../../models/topic';
import Report from '../../models/report';

/*
 * function to report a topic or reply on the forum
 */

// reporterId: mongoose.SchemaTypes.ObjectId,  GOT
// 	offendingUserId: mongoose.SchemaTypes.ObjectId,   get from DB
// 		itemId: mongoose.SchemaTypes.ObjectId,  GOT
// 			offenceType: String,  GOT
// 				topicOrReply: String,     get from DB
// 					date: Date,   GOT

export const report = async (req: Request, res: Response): Promise<void> => {
	try {
		const reporterId: string = req.body._id;
		const itemId: string = req.body.itemId;
		const offenceType: string = req.body.body;
		const date = new Date();
		const offendingTopic: Topic | null = await Topic.findOne({ _id: itemId });
		if (offendingTopic) {
			const offendingUserId: string = offendingTopic.authorUserId;
			const report: Report = {
				reporterId: reporterId,
				offendingUserId: offendingUserId,
				itemId: itemId,
				offenceType: offenceType,
				topicOrReply: offendingTopic,
				date: date
			};
			const dbReport: Report = await Report.create(report);
			await Topic.updateOne({ _id: itemId }, { isReported: true });
			res.status(200);
			res.send(dbReport);
		} else {
			const offendingTopic: Topic | null = await Topic.findOne({ "replies._id": itemId });
			const offendingReply = offendingTopic?.replies.filter(reply => reply._id?.toString() === itemId);
			console.log(offendingReply)
			if (offendingReply?.length) {
				const offendingUserId: string = offendingReply[0].authorUserId;
				const report: Report = {
					reporterId: reporterId,
					offendingUserId: offendingUserId,
					itemId: itemId,
					offenceType: offenceType,
					topicOrReply: offendingReply[0],
					date: date
				};
				const dbReport: Report = await Report.create(report);
				await Topic.updateOne({ "replies._id": itemId }, {
					$set: { "replies.$.isReported": true }
				});
				res.status(200);
				res.send(dbReport);
			}
		}
	} catch (e) {
		console.error(e, 'report is failing');
		res.status(500);
	}
};