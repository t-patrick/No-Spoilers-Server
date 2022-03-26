import { Request, Response } from 'express';
import UserExternalId from '../../models/user-external-id';

/*
 * function to load user input urls from the user wayback database on load of show page
 */

export const onLoadUserWayback = async (req: Request, res: Response): Promise<void> => {
	try {
		const userId: string = req.body.id.id;
		const TMDB_show_id = Number(req.params.TMDB_show_Id);
		const user: UserExternalIds | null = await UserExternalId.findOne({
			userId: userId, TMDB_show_id: TMDB_show_id
		});
		res.status(200);
		res.send(user);
	} catch (e) {
		console.error(e, 'onLoadUserWayback is failing');
		res.status(500);
	}
};