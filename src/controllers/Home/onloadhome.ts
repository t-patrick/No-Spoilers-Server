import axios from 'axios';
import * as dotenv from 'dotenv';
import express, { Request, Response } from 'express';
dotenv.config();
import UserTVShow from '../../models/user-tv-show';
const apiUrl = 'https://api.themoviedb.org/3/';
const APIKEY = process.env.API_KEY;

/*
 * function to load home page on login
 */

export const onLoadWaybackUrls = async (req: Request, res: Response): Promise<void> => {
	try {

		res.status(200);
		res.send();
	} catch (e) {
		console.error(e, 'onLoadWaybackUrls is failing');
		res.status(500);
	}
};