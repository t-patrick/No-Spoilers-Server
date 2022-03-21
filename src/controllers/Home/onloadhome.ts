import { Request, Response } from 'express';
import UserTVShow from '../../models/user-tv-show';
import User from '../../models/db-user';


/*
 * function to load home page on login
 */

export const onLoadHome = async (req: Request, res: Response): Promise<void> => {
	try {
		const userId: string = req.body._id;
		const user: User | null = await User.findOne({ _id: userId });
		const tvShows: UserTVShow[] = await UserTVShow.find({ userId: userId });
		let result: User | undefined;
		if (user) {
			result = {
				_id: userId,
				email: user.email,
				displayName: user.displayName,
				userTVInfo: tvShows
			}
		}
		res.status(200);
		res.send(result);
	} catch (e) {
		console.error(e, 'onLoadHome is failing');
		res.status(500);
	}
};