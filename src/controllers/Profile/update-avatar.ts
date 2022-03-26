import { Request, Response } from 'express';
import User from '../../models/db-user';
import Topic from '../../models/topic';


/*
 * function to update avatar
 */

export const updateAvatar = async (req: Request, res: Response) => {
	try {
		const userId: string = req.body.id.id;
		const avatar: string = req.body.avatar;
		const currentUser: DBUser | null = await User.findOne({ _id: userId });
		if (!currentUser) {
			res.status(400);
			res.send('User not found');
			return;
		}
		let avatarChanged: boolean = false;
		if (avatar && avatar !== currentUser.avatar) {
			currentUser.avatar = avatar;
			avatarChanged = true;
		}
		const newUser: DBUser | null = await User.findOneAndUpdate({ _id: userId }, { $set: currentUser }, { new: true });
		res.status(200);
		res.send(newUser);
		if (avatarChanged) {
			await Topic.updateMany();
		};
	}  catch (e: any) {
		console.error('updateAvatar is failing');
		res.status(500);
	}
};