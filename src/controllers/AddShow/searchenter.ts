import axios from 'axios';
import { Request, Response } from 'express';
import TVShowSnippet from '../../models/tv-show-snippet';


/*
 * function to return 20 matches for search bar entry with manual enter
 */

export const searchEnter = async (req: Request, res: Response): Promise<void> => {
	try {
		const search: string = req.body.search;
		const page: number = req.body.page;
		const {data} = await axios.get(`${apiUrl}trending/tv/week?api_key=${APIKEY}&page=${page}`);
		res.status(200);
		res.send(tvShows);
	} catch (e) {
		console.error(e, 'searchEnter is failing');
		res.status(500);
	}
};