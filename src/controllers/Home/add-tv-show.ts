import axios from 'axios';
import * as dotenv from 'dotenv';
import { Request, Response } from 'express';
import FullTVShow from '../../models/full-tv-show';
dotenv.config();
import UserTVShow from '../../models/user-tv-show';
const apiUrl = 'https://api.themoviedb.org/3/';
const APIKEY = process.env.API_KEY;

/*
 * function to add TV show from home page
 */

export const addTVShow = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId: string = req.body._id;
    const TMDB_show_id = Number(req.params.TMDB_show_Id);
    const tvShow: UserTVShow | null = await UserTVShow.findOne({
      userId: userId,
      TMDB_show_id: TMDB_show_id,
    });
    if (tvShow) {
      res.status(400);
      res.send(
        'TV show already exists in your TV show list. Please choose a new show instead.'
      );
      return;
		}
		let newTVShow: UserTVShow;
		const fullTVShow: TVShow | null = await FullTVShow.findOne({ TMDB_show_id: TMDB_show_id });
		if (fullTVShow) {
			if (fullTVShow.seasons) {
				newTVShow = {
					userId: userId,
					TMDB_show_id: TMDB_show_id,
					name: fullTVShow.name,
					poster_path: fullTVShow.poster_path,
					current_poster_path: fullTVShow.seasons[0].poster_path,
					isCompleted: false,
					episodeIdUpTo: 0,
					episodeCodeUpTo: '',
					episodeCodeNext: 's1e1',
					episodesWatchedSoFar: 0,
				};
			} else {
				newTVShow = {
					userId: userId,
					TMDB_show_id: TMDB_show_id,
					name: fullTVShow.name,
					poster_path: fullTVShow.poster_path,
					isCompleted: false,
					episodeIdUpTo: 0,
					episodeCodeUpTo: '',
					episodeCodeNext: 's1e1',
					episodesWatchedSoFar: 0,
				};
			}
			await UserTVShow.create(newTVShow);
			res.status(200);
			res.send(newTVShow);
			return;
		}
    const { data }: AxiosTVShow = await axios.get(
      `${apiUrl}tv/${TMDB_show_id}?api_key=${APIKEY}`
		);
		let firstSeason: AxiosSeason[];

		if (data.seasons) {
			firstSeason = data.seasons.filter(season => season.season_number === 1);
			newTVShow = {
				userId: userId,
				TMDB_show_id: TMDB_show_id,
				name: data.name,
				poster_path: data.poster_path,
				current_poster_path: firstSeason[0].poster_path,
				isCompleted: false,
				episodeIdUpTo: 0,
				episodeCodeUpTo: '',
				episodeCodeNext: 's1e1',
				episodesWatchedSoFar: 0,
			};
		} else {
			newTVShow = {
				userId: userId,
				TMDB_show_id: TMDB_show_id,
				name: data.name,
				poster_path: data.poster_path,
				isCompleted: false,
				episodeIdUpTo: 0,
				episodeCodeUpTo: '',
				episodeCodeNext: 's1e1',
				episodesWatchedSoFar: 0,
			};
		}
    await UserTVShow.create(newTVShow);
    res.status(200);
    res.send(newTVShow);
  } catch (e) {
    console.error(e, 'addTVShow is failing');
    res.status(500);
  }
};
