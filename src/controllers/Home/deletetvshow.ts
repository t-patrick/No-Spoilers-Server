import axios from 'axios';
import * as dotenv from 'dotenv';
import { Request, Response } from 'express';
dotenv.config();
import UserTVShow from '../../models/user-tv-show';
const apiUrl = 'https://api.themoviedb.org/3/';
const APIKEY = process.env.API_KEY;

/*
 * function to delete TV show from home page
 */

export const deleteTVShow = async (req: Request, res: Response): Promise<void> => {
	try {
		const userId: string = req.body._id;
		const TMDB_show_id = Number(req.params.TMDB_show_Id);
		await UserTVShow.deleteOne({ userId: userId, TMDB_show_id: TMDB_show_id });
		res.status(204);
		res.send('Delete successful');
	} catch (e) {
		console.error(e, 'deleteTVShow is failing');
		res.status(500);
	}
};