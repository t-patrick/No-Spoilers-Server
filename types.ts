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
  avatar: string;
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
  userId: string;
  TMDB_show_id: number;
  name: string;
  poster_path: string;
  isCompleted: boolean;
  episodeIdUpTo: number;
  episodeCodeUpTo: string;
  episodeCodeNext: string;
  episodesWatchedSoFar: number;
};

interface UserTVShowUpdate extends UserTVShow {
  percentComplete: number;
}

/////////////////////// ADD SHOW

type TVShowSnippet = {
  name: string;
  TMDB_show_id: number;
  poster_path?: string | null;
  first_air_date?: string | null;
  searchable?: string;
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

type UserExternalIds = {
  userId: string;
  TMDB_show_id: number;
  websites?: Website[];
};

type Website = {
  name: string;
  waybackUrl: string;
};

/**
 * Forum Stuff
 */

type Topic = {
  _id?: string;
  TMDB_show_id: number;
  TMDB_episode_id: number;
  authorUserId: string;
  authorName: string;
  episodeCode: string;
  title: string;
  body: string;
  numberOfReplies: number;
  avatar: string;
  date: Date;
  voteScore: number;
  replies: Reply[];
};

type Reply = {
  _id: string;
  topicId: number;
  authorUserId: string;
  avatar: string;
  replierEpisodeUpTo: number;
  authorName: string;
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

/**
 * Mongoose response types
 */

type ModificationResponse = {
  acknowledged: boolean;
  modifiedCount: number;
  upsertedId: Object | null;
  upsertedCount: number;
  matchedCount: number;
};

type DeleteResponse = {
  acknowledged: boolean;
  deletedCount: number;
}

/**
 * Axios types
 */

type ShowTextSearch = {
  data: {
    page: number;
    results: ShowTextSearchResults[];
    total_pages: number;
    total_results: number;
  };
};

type ShowTextSearchResults = {
  poster_path: string | null;
  popularity: number;
  id: number;
  backdrop_path: string | null;
  vote_average: number;
  overview: string;
  first_air_date: string;
  origin_country: string[];
  genre_ids: number[];
  original_language: string;
  vote_count: number;
  name: string;
  original_name: string;
};

type UserWayback = {
  name: string;
  url: string;
};
