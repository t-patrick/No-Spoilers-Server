import { Request, Response } from 'express';
import TVShowSnippet from '../../models/tv-show-snippet';


/*
 * function to return top 5 matches to debounce search bar
 */

export const searchDebounce = async (req: Request, res: Response): Promise<void> => {
	try {
		const search: string = req.body.search;
		const regex = new RegExp(search, 'i');
		const tvShows: TVShowSnippet[] | null = await TVShowSnippet.find({name: {$regex: regex}});
		res.status(200);
		res.send(tvShows);
	} catch (e) {
		console.error(e, 'searchDebounce is failing');
		res.status(500);
	}
};