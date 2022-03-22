import { Request, Response } from 'express';
import TVShowSnippet from '../../models/tv-show-snippet';


/*
 * function to return top 5 matches to debounce search bar
 */

export const searchDebounce = async (req: Request, res: Response): Promise<void> => {
	try {
		const search: string = req.body.search;
		const normalized = search.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
		const punctuationless = normalized.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
		const regex = new RegExp(punctuationless, 'i');
		const tvShows: TVShowSnippet[] | null = await TVShowSnippet.find({ searchable: { $regex: regex } });
		const result = tvShows.slice(0, 5);
		res.status(200);
		res.send(result);
	} catch (e) {
		console.error(e, 'searchDebounce is failing');
		res.status(500);
	}
};