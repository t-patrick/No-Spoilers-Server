import mongoose from '.';

const fullTVShowSchema = new mongoose.Schema<TVShow>({
	TMDB_show_id: Number,
	name: String,
	first_air_date: String,
	last_air_date: String,
	homepage: String,
	tagline: String,
	backdrop_path: String,
	poster_path: String,
	created_by: [
		{
			id: Number,
			credit_id: String,
			name: String,
			gender: Number,
			profile_path: String
		}],
	next_episode_to_air: {
		air_date: String,
		episode_number: Number,
		id: Number,
		name: String,
		overview: String,
		production_code: String,
		season_number: Number,
		still_path: String,
		vote_average: Number,
		vote_count: Number
	},
	number_of_episodes: Number,
	number_of_seasons: Number,
	percentComplete: Number,
	seasons: [{
		TMDB_season_id: Number,
		numberOfEpisodes: Number,
		poster_path: String,
		episodes: [{
			name: String,
			TMDB_episode_id: Number,
			season_number: Number,
			episode_number: Number,
			air_date: String,
		}]
	}],
	externalIds: {
		imdb_id: String,
		facebook_id: String,
		instagram_id: String,
		twitter_id: String,
		wikipediaId: String,
		homepage: String,
	},
	overview: String,
});

const FullTVShow = mongoose.model<TVShow>(
	'FullTVShow',
	fullTVShowSchema
);

export default FullTVShow;