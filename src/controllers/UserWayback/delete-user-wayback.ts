import axios from 'axios';
import * as dotenv from 'dotenv';
import { Request, Response } from 'express';
dotenv.config();
import UserExternalId from '../../models/user-external-id';
import UserTVShow from '../../models/user-tv-show';
const apiUrl = 'https://api.themoviedb.org/3/';
const APIKEY = process.env.API_KEY;


/*
 * function to delete a user input url from the user wayback database
 */

export const deleteUserWayback = async (req: Request, res: Response): Promise<void> => {
	try {
		const userId: string = req.body._id;
		const website: string = req.body.website;
		const TMDB_show_id = Number(req.params.TMDB_show_Id);
		const deleted = await UserExternalId.findOneAndDelete({ userId: userId, TMDB_show_id:
			TMDB_show_id, "website.name": website
		});
			res.status(204);
			res.send(deleted);
	} catch (e) {
		console.error(e, 'deleteUserWayback is failing');
		res.status(500);
	}
};