/* 
 
 Notes
 
 camelCase for data we have created or stored in our database

 under_scores for data fields we have received from external APIs.
 
 */

//////////////////////////////////////// HOMEPAGE
/** Basic User type
 *  - for front end API
 */

type User = {
  _id: Number;
  email: String;
  displayName: String;
  userTVInfo: [UserTVShow];
};

/**
 * user creation / login
 */
type DBUser = {
  email: String;
  displayName: String;
  password: String;
};

/**
 * Details about the users progress with the Show,
 * + Presentational details for the Home page.
 */

type UserTVShow = {
  TMDB_show_id: Number;
  name: String;
  poster_path: String;
  isCompleted: Boolean;
  episodeIdUpTo: Number;
  episodeCodeUpTo: String;
  episodesWatchedSoFar: Number;
};

/////////////////////// ADD SHOW

type MovieSnippet = {
  name: String;
  TMDB_show_id: Number;
  poster_path?: String;
  first_air_date: String;
};

/**
 * Details for the Add Show and TV Show pages
 */

type Season = {
  TMDB_season_id: Number;
  numberOfEpisodes: Number;
  episodes: Episode[];
};

type Episode = {
  name: String;
  TMDB_episode_id: Number;
  season_number: Number;
  episode_number: Number;
};

type TVShow = {
  TMDB_show_id: Number;
  name: String;
  first_air_date: String;
  last_air_date: String;
  homepage: String;
  tagline: String;
  backdrop_path: String;
  poster_path: String;
  created_by: String;
  next_episode_to_air: String;
  number_of_episodes: Number;
  number_of_seasons: Number;
  percentComplete: Number;
  seasons: Array<Season>;
  externalIds: ExternalIds;
};

type ExternalIds = {
  imdb_id?: String;
  facebook_id?: String;
  instagram_id?: String;
  twitter_id?: String;
  wikipediaId?: String;
};

/**
 * Forum Stuff
 */

type Topic = {
  _id: Number;
  TMDB_show_id: Number;
  TMDB_episode_id: Number;
  authorUserId: Number;
  title: String;
  body: String;
  date: Date;
  voteScore: Number;
};

type Reply = {
  _id: Number;
  topicId: Number;
  authorUserId: Number;
  replierEpisodeUpTo: Number;
  body: String;
  date: Date;
};

type Report = {
  reporterId: Number;
  offendingUserId: Number;
  offenceType: String;
  topicOrReply: "Topic" | "Reply";
  itemId: Number;
  date: Date;
};
