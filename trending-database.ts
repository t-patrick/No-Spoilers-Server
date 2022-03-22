import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import axios from 'axios';
import TVShowSnippet from './src/models/tv-show-snippet';
dotenv.config();
const apiUrl = 'https://api.themoviedb.org/3/';
const APIKEY = process.env.API_KEY;
mongoose.connect(`${process.env.DB_URL}${process.env.DB_NAME}`);

// const duplicateCheck = async (tvShow: TVShowSnippet): Promise<any> => {
// 	try {
// 		const duplicate = await TVShowSnippet.find({ name: tvShow.name });
// 		if (duplicate) return duplicate;
// 		else return undefined;
// 	} catch (e) {
// 		console.error(e, 'duplicateCheck is failing');
// 		return;
// 	}
// }

export const trendDatabase = async (): Promise<void> => {
	try {
		for (let i = 1; i <= 1000; i++) {
			const { data } = await axios.get(`${apiUrl}trending/tv/week?api_key=${APIKEY}&page=${i}`);
			const tvShows = data.results;
			for (let j = 0; j < tvShows.length; j++) {
				const name = tvShows[j].name;
				const normalized = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
				const punctuationless = normalized.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
				const tvShow: TVShowSnippet = {
					name: tvShows[j].name,
					TMDB_show_id: tvShows[j].id,
					poster_path: tvShows[j].poster_path,
					first_air_date: tvShows[j].first_air_date,
					searchable: punctuationless
				}
				// const duplicate = duplicateCheck(tvShow);
				// if (!duplicate) {
					await TVShowSnippet.create(tvShow);
				// }
			}
		}
		return;
	} catch (e) {
		console.error(e);
		return;
	}
}

trendDatabase();