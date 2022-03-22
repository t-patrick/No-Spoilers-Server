import axios from 'axios';
import { Request, Response } from 'express';
import TVShowSnippet from '../../models/tv-show-snippet';
import * as dotenv from 'dotenv';
dotenv.config();
const apiUrl = 'https://api.themoviedb.org/3/';
const APIKEY = process.env.API_KEY;

/*
 * function to return 20 matches for search bar entry with manual enter
 */

export const searchEnter = async (req: Request, res: Response): Promise<void> => {
	try {
		const search: string = req.body.search;
		const page: number = req.body.page;
		const { data } = await axios.get(`${apiUrl}search/tv?api_key=${APIKEY}&page=${page}&query=${search}&include_adult=false`);
		let tvShows: TVShowSnippet[] = [];
		for (let i = 0; i < data.results.length; i++) {
			tvShows.push({
			  name: data.results[i].name,
				TMDB_show_id: data.results[i].id,
				poster_path: data.results[i].poster_path,
				first_air_date: data.results[i].first_air_date,
				searchable: data.results[i].searchable,
      })
		};
		res.status(200);
		res.send(tvShows);
	} catch (e) {
		console.error(e, 'searchEnter is failing');
		res.status(500);
	}
};