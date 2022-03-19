import axios from 'axios';
import * as dotenv from 'dotenv';
import express, { Request, Response } from 'express';
dotenv.config();
const apiUrl = 'https://api.themoviedb.org/3/';
const APIKEY = process.env.API_KEY;

/*
 * function to call external ids from API and return required properties
 */

const externalIdApiCall = async (
	showId: number
): Promise<ExternalIds | undefined> => {
	try {
		const { data } = await axios.get(
			`${apiUrl}tv/${showId}/external_ids?api_key=${APIKEY}`
		);
		const externalIds: ExternalIds = {
			imdb_id: data.imdb_id,
			facebook_id: data.facebook_id,
			instagram_id: data.instagram_id,
			twitter_id: data.twitter_id,
		};
		return externalIds;
	} catch (e) {
		console.error(e, 'externalIdApiCall is failing');
		return;
	}
};

/*
 * function to convert external IDs to required urls
 */

const externalIdReformat = (
	externalIds: ExternalIds | undefined,
	showName: string,
	homepage: string
): ExternalIds => {
	const wikiName = showName.split(' ').join('_');
	let externalUrls: ExternalIds;
	if (externalIds) {
		externalUrls = {
			imdb_id: `https://www.imdb.com/title/${externalIds.imdb_id}/`,
			facebook_id: `https://www.facebook.com/${externalIds.facebook_id}/`,
			instagram_id: `https://www.instagram.com/${externalIds.instagram_id}/`,
			twitter_id: `https://twitter.com/${externalIds.twitter_id}`,
			wikipediaId: `https://en.wikipedia.org/wiki/${wikiName}`,
			homepage: homepage,
		};
	} else {
		externalUrls = {
			wikipediaId: `https://en.wikipedia.org/wiki/${wikiName}`,
			homepage: homepage,
		};
	}
	return externalUrls;
};

/*
 * function to load wayback occuring on load of show page
 */

export const onLoadWaybackUrls = async (req: Request, res: Response): Promise<void> => {
	try {
		const userId = req.body._id;
		const TMDB_show_id = Number(req.params.TMDB_show_Id);
		const { data } = await axios.get(
			`${apiUrl}tv/${TMDB_show_id}?api_key=${APIKEY}`
		);
		const externalIds: ExternalIds | undefined = await externalIdApiCall(
			TMDB_show_id
		);
		const externalUrls: ExternalIds = externalIdReformat(
			externalIds,
			data.name,
			data.homepage
		);
		res.status(200);
		res.send(externalUrls);
	} catch (e) {
		console.error(e, 'onLoadWaybackUrls is failing');
		res.status(500);
	}
};