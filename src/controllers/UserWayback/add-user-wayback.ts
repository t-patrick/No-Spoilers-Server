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

export const addUserWayback = async (req: Request, res: Response): Promise<void> => {
	try {
		const userId: string = req.body._id;
		const website: string = req.body.website;
		const TMDB_show_id = Number(req.params.TMDB_show_id);
		// const duplicateCheck = await UserExternalId.findOne({ userId: userId, TMDB_show_id: TMDB_show_id, websites: [website] });
		// if (duplicateCheck) {
		// 	res.status(400);
		// 	res.send('Website already added');
		// } else {
		// 	const duplicateCheck = await UserExternalId.findOne({
		// 		userId: userId, TMDB_show_id: TMDB_show_id
		// 	});
		// 	if (duplicateCheck) {
		// 		await UserExternalId.findOneAndUpdate({
		// 			userId: userId,
		// 			TMDB_show_id: TMDB_show_id,
		// 		},
		// 			{ $push: { websites: website } }
		// 		);
		// 	} else {
		// 		await UserExternalId.create({
		// 			userId: userId,
		// 			TMDB_show_id: TMDB_show_id,
    //       websites: [website] }
		// 		);
		// 	}
		// }
		const nextEpisodeDate: string | undefined = await getNextEpisodeDate(userId, TMDB_show_id);
		if (nextEpisodeDate && nextEpisodeDate !== '') {
			const { data } = await axios.get(`http://web.archive.org/cdx/search/cdx?url=${website}&output=json&to=${nextEpisodeDate}`);
			if (data.length) {
				const finalSnapshot: string[] = data[data.length - 1];
				const finalUrl: string = `http://web.archive.org/web/${finalSnapshot[1]}/${finalSnapshot[2]}`;
				res.status(200);
				res.send(finalUrl);
			}
			else {
				
}
		} else {
			res.status(200);
			res.send(website);
		}
	} catch (e) {
		console.error(e, 'addUserWayback is failing');
		res.status(500);
	}
};