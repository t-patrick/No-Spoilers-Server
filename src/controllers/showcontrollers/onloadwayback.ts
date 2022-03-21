import axios from 'axios';
import * as dotenv from 'dotenv';
import express, { Request, Response } from 'express';
dotenv.config();
import UserTVShow from '../../models/user-tv-show';
const apiUrl = 'https://api.themoviedb.org/3/';
const APIKEY = process.env.API_KEY;

/*
 * function to call external ids from API and return required properties
 */

const externalIdApiCall = async (	showId: number): Promise<ExternalIds | undefined> => {
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
 * function to convert external urls to wayback urls
 */

const externalUrlReformat = (	externalUrls: ExternalIds, nextEpisodeDate: string): ExternalIds => {
		const waybackUrls: ExternalIds = {
			imdb_id: `http://web.archive.org/cdx/search/cdx?url=${externalUrls.imdb_id}&output=json&to=${nextEpisodeDate}`,
			facebook_id: `http://web.archive.org/cdx/search/cdx?url=${externalUrls.facebook_id}&output=json&to=${nextEpisodeDate}`,
			instagram_id: `http://web.archive.org/cdx/search/cdx?url=${externalUrls.instagram_id}&output=json&to=${nextEpisodeDate}`,
			twitter_id: `http://web.archive.org/cdx/search/cdx?url=${externalUrls.twitter_id}&output=json&to=${nextEpisodeDate}`,
			wikipediaId: `http://web.archive.org/cdx/search/cdx?url=${externalUrls.wikipediaId}&output=json&to=${nextEpisodeDate}`,
			homepage: `http://web.archive.org/cdx/search/cdx?url=${externalUrls.homepage}&output=json&to=${nextEpisodeDate}`
		};
	return waybackUrls;
};

/*
 * function to get next episode date for a user's tv show
 */

const getNextEpisodeDate = async (	userId: number,	showId: number): Promise<string | undefined> => {
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
 * function to call wayback API and access final array
 */

const waybackApiCalls = async (	waybackUrls: ExternalIds ): Promise<ExternalIds> => {
	try {
		for ( let el in waybackUrls ) {
			if (waybackUrls.hasOwnProperty(el)) {
				const key = el as keyof ExternalIds;
				const { data } = await axios.get(waybackUrls[key] || "");
				const finalSnapshot: string[] = data[data.length - 1];
				const finalUrl: string = `http://web.archive.org/web/${finalSnapshot[1]}/${finalSnapshot[2]}`
				waybackUrls[key] = finalUrl
      }
    }
		return waybackUrls;
	} catch (e) {
		console.error(e, 'waybackApiCalls is failing');
		return {
			imdb_id: ``,
			facebook_id: ``,
			instagram_id: ``,
			twitter_id: ``,
			wikipediaId: ``,
			homepage: ``
		};
	}
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
		const nextEpisodeDate: string | undefined = await getNextEpisodeDate(userId, TMDB_show_id);
		if (nextEpisodeDate) {
			const waybackUrls: ExternalIds = externalUrlReformat(externalUrls, nextEpisodeDate);
			const finalUrls: ExternalIds = await waybackApiCalls(waybackUrls);
			res.status(200);
			res.send(finalUrls);
		}
		else {
			res.status(200);
			res.send(externalUrls);
		}
	} catch (e) {
		console.error(e, 'onLoadWaybackUrls is failing');
		res.status(500);
	}
};