import axios from 'axios';
import * as dotenv from 'dotenv';
import { Request, Response } from 'express';
dotenv.config();
import UserExternalId from '../../models/user-external-id';
import UserTVShow from '../../models/user-tv-show';
const apiUrl = 'https://api.themoviedb.org/3/';
const APIKEY = process.env.API_KEY;

/*
 * function to get next episode date for a user's tv show
 */

const getNextEpisodeDate = async (userId: string, showId: number): Promise<string | undefined> => {
	try {
		const tvShow: UserTVShow | null = await UserTVShow.findOne({ userId: userId, TMDB_show_id: showId });
		if (tvShow) {
			const nextEpisodeCode = tvShow.episodeCodeNext
			if (nextEpisodeCode === "") return "";
			const nextEpisodeCodeArray: string[] = nextEpisodeCode.slice(1).split('e');
			const seasonNumber = Number(nextEpisodeCodeArray[0]);
			const episodeNumber = Number(nextEpisodeCodeArray[1]);
			const { data } = await axios.get(`${apiUrl}tv/${showId}/season/${seasonNumber}/episode/${episodeNumber}?api_key=${APIKEY}`);
			const regex = /-/g;
			const airDateNoHyphen: string = data.air_date.replace(regex, '');
			return airDateNoHyphen;
		} else return;
	} catch (e) {
		console.error(e, 'getNextEpisodeDate is failing');
		return;
	}
}

/*
 * function to add a user input url to the user wayback database
 */

export const updateUserWayback = async (req: Request, res: Response): Promise<void> => {
	try {
		const userId: string = req.body._id;
		const TMDB_show_id = Number(req.params.TMDB_show_Id);
		const user: UserExternalIds | null = await UserExternalId.findOne({
			userId: userId, TMDB_show_id: TMDB_show_id
		});
		if (!user) {
			res.status(400);
			res.send('User not found in wayback database');
			return;
		}
		const websites: Website[] | undefined = user.websites;
		if (!websites || websites.length === 0) {
			res.status(200);
			res.send('No user wayback websites to update');
			return;
		};
		const nextEpisodeDate: string | undefined = await getNextEpisodeDate(userId, TMDB_show_id);
		if (nextEpisodeDate) {
			let year: number = Number(nextEpisodeDate.slice(0, 4));
			year--;
			const fromDate: string = `${year}0101`
			for (let i = 0; i < websites.length; i++) {
				const { data } = await axios.get(`http://web.archive.org/cdx/search/cdx?url=${websites[i].name}&output=json&from=${fromDate}&to=${nextEpisodeDate}`);
				if (data.length) {
					const finalSnapshot: string[] = data[data.length - 1];
					const finalUrl = `http://web.archive.org/web/${finalSnapshot[1]}/${finalSnapshot[2]}`;
					websites[i].waybackUrl = finalUrl;
				} else {
					const finalUrl = '';
					websites[i].waybackUrl = finalUrl;
				}
			}
			await UserExternalId.updateOne({
				userId: userId, TMDB_show_id: TMDB_show_id
			}, { websites: websites });
			res.status(200);
			res.send(websites);
		} else {
			for (let i = 0; i < websites.length; i++) {
				websites[i].waybackUrl = websites[i].name;
			}
			await UserExternalId.updateOne({
				userId: userId, TMDB_show_id: TMDB_show_id
			}, { websites: websites });
			res.status(200);
			res.send(websites);
		}
	} catch (e) {
		console.error(e, 'updateUserWayback is failing');
		res.status(500);
	}
};