import { Request, Response } from 'express';
import UserTVShow from '../../models/user-tv-show';


/*
 * function to delete TV show from home page
 */

export const deleteTVShow = async (req: Request, res: Response): Promise<void> => {
	try {
		const userId: string = req.body._id;
		const TMDB_show_id = Number(req.params.TMDB_show_Id);
		await UserTVShow.deleteOne({ userId: userId, TMDB_show_id: TMDB_show_id });
		res.status(204);
		res.end();
	} catch (e) {
		console.error(e, 'deleteTVShow is failing');
		res.status(500);
	}
};