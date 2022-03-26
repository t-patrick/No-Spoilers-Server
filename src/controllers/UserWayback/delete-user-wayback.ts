import { Request, Response } from 'express';
import UserExternalId from '../../models/user-external-id';

/*
 * function to delete a user input url from the user wayback database
 */

export const deleteUserWayback = async (req: Request, res: Response): Promise<void> => {
	try {
		const userId: string = req.body.id.id;
		const website: string = req.body.website;
		const TMDB_show_id = Number(req.params.TMDB_show_Id);
		const deleted: ModificationResponse  = await UserExternalId.updateOne({
			userId: userId, TMDB_show_id: TMDB_show_id
		}, { $pull: { websites: { name: website } } }, { safe: true, multi: true });
		res.status(200);
		res.send(deleted);
	} catch (e) {
		console.error(e, 'deleteUserWayback is failing');
		res.status(500);
	}
};