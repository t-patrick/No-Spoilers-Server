import axios from 'axios';
import * as dotenv from 'dotenv';
import express, { Request, Response } from 'express';
dotenv.config();
import User from '../../models/db-user';
const apiUrl = 'https://api.themoviedb.org/3/';
const APIKEY = process.env.API_KEY;

/*
 * function to load home page on login
 */

export const onLoadHome = async (req: Request, res: Response): Promise<void> => {
	try {
		const userId: string = req.body._id;
		const user: User | null = await User.findOne({ userId: userId });
		// extract their tv shows
		// send to front end
		res.status(200);
		res.send();
	} catch (e) {
		console.error(e, 'onLoadHome is failing');
		res.status(500);
	}
};