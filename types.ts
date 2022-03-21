/*

 Notes

 camelCase for data we have created or stored in our database

 under_scores for data fields we have received from external APIs.

 */

//////////////////////////////////////// HOMEPAGE
/** Basic User type
 *  - combines DBUser and UserTVShow from db.
 */

type User = {
  _id: string;
  email: string;
  displayName: string;
  userTVInfo?: Array<UserTVShow>;
};

/**
 * user creation / login
 */
type DBUser = {
  email: string;
  displayName: string;
  password: string;
  avatar: string;
};

/**
 * Details about the users progress with the Show,
 * and presentational details for the Home page.
 * + userId refers to DBUser's _id
 */

type UserTVShow = {
  userId?: string;
  TMDB_show_id: number;
  name: string;
  poster_path: string;
  isCompleted: boolean;
  episodeIdUpTo: number;
  episodeCodeUpTo: string;
  episodeCodeNext: string;
  episodesWatchedSoFar: number;
};

/////////////////////// ADD SHOW

type TVShowSnippet = {
  name: string;
  TMDB_show_id: number;
  poster_path?: string;
  first_air_date: string;
};

/**
 * Details for the Add Show and TV Show pages
 */

type Season = {
  TMDB_season_id: number;
  numberOfEpisodes: number;
  episodes: Episode[];
};

type Episode = {
  name: string;
  TMDB_episode_id: number;
  season_number: number;
  episode_number: number;
};

interface EpisodefromAPI extends Episode {
  id: number;
  air_date?: string;
}

type TVShow = {
  TMDB_show_id: number;
  name: string;
  first_air_date: string;
  last_air_date: string;
  homepage: string;
  tagline: string;
  backdrop_path: string;
  poster_path: string;
  created_by: string;
  next_episode_to_air: string;
  number_of_episodes: number;
  number_of_seasons: number;
  percentComplete: number;
  seasons: Array<Season>;
  overview: string;
};

type ExternalIds = {
  imdb_id?: string;
  facebook_id?: string;
  instagram_id?: string;
  twitter_id?: string;
  wikipediaId?: string;
  homepage?: string;
};

/**
 * Forum Stuff
 */

type Topic = {
  _id: number;
  TMDB_show_id: number;
  TMDB_episode_id: number;
  authorUserId: number;
  title: string;
  body: string;
  date: Date;
  voteScore: number;
};

type Reply = {
  _id: number;
  topicId: number;
  authorUserId: number;
  replierEpisodeUpTo: number;
  body: string;
  date: Date;
};

type Report = {
  reporterId: number;
  offendingUserId: number;
  offenceType: string;
  topicOrReply: 'Topic' | 'Reply';
  itemId: number;
  date: Date;
};
