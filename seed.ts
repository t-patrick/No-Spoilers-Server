import fs = require('fs');
import path = require('path');
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

import User from './src/models/db-user';
import UserTVShow from './src/models/user-tv-show';

mongoose.connect(`${process.env.DB_URL}${process.env.DB_NAME}`);

export async function seed() {
	try {
		const file = fs.readFileSync('./dummy.json', 'utf-8');

		const usersAll = JSON.parse(file);

		const users = usersAll.map((userAll: any) => {
			return (({ email, displayName, password }) => ({
				email,
				password,
				displayName,
			}))(userAll);
		});

		const userTVShows = usersAll.map((userAll: any) => userAll.userTVInfo);
		const shows: any = [];
		userTVShows.forEach((arr: any): void => {
			for (const show of arr) {
				shows.push(show);
			}
		});
		console.log(shows);

		const resp = await User.create(users);
		const tvshowResp = await UserTVShow.create(shows);
		return { resp, tvshowResp };
	} catch (e) {
		console.error(e);
		return {};
	}
}

seed();