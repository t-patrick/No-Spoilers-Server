import { Request, Response } from 'express';
import Topic from '../../models/topic';
import Report from '../../models/report';

/*
 * function to report a topic or reply on the forum
 */


export const report = async (req: Request, res: Response): Promise<void> => {
	try {
		const reporterId: string = req.body.id.id;
		const offendingUserId: string = req.body.offendingUserId;
		const offenceType: string = req.body.offenceType;
		const type: string = req.body.type;
		const topicId: string = req.body.topicId;
		let replyId: string = "";
		if (type === "Reply") replyId = req.body.replyId;
		const date = new Date();
    if (type === "Topic") {
			const offendingTopic: Topic | null = await Topic.findOne({ _id: topicId });
			if (offendingTopic) {
		    const report: Report = {
			    reporterId: reporterId,
			    offendingUserId: offendingUserId,
			    itemId: topicId,
			    offenceType: offenceType,
			    topicOrReply: offendingTopic,
			    date: date
		    };
		    const dbReport: Report = await Report.create(report);
		    await Topic.updateOne({ _id: topicId }, { isReported: true });
		    res.status(200);
		    res.send(dbReport);
	    }
		};
		if (type === "Reply") {
			const offendingTopic: Topic | null = await Topic.findOne({ "replies._id": replyId });
			const offendingReply = offendingTopic?.replies.filter(reply => reply._id?.toString() === replyId);
			console.log(offendingReply)
			if (offendingReply?.length) {
				const offendingUserId: string = offendingReply[0].authorUserId;
				const report: Report = {
					reporterId: reporterId,
					offendingUserId: offendingUserId,
					itemId: replyId,
					offenceType: offenceType,
					topicOrReply: offendingReply[0],
					date: date
				};
				const dbReport: Report = await Report.create(report);
				await Topic.updateOne({ "replies._id": replyId }, {
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