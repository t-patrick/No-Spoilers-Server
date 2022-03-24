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
  name?: string;
  TMDB_show_id?: number;
  poster_path?: string | null;
  first_air_date?: string | null;
  searchable?: string;
};

/**
 * Details for the Add Show and TV Show pages
 */

type Season = {
  TMDB_season_id?: number;
  numberOfEpisodes?: number;
  poster_path?: string | null;
  episodes: Episode[];
};

type Episode = {
  name: string;
  TMDB_episode_id?: number;
  season_number: number;
  episode_number: number;
};

interface EpisodefromAPI extends Episode {
  id?: number;
  air_date?: string;
}

type TVShow = {
  TMDB_show_id?: number;
  name?: string;
  first_air_date?: string;
  last_air_date?: string;
  homepage?: string;
  tagline?: string;
  backdrop_path?: string | null;
  poster_path?: string | null;
  created_by?: CreatedBy[];
  next_episode_to_air?: AxiosEpisode | null;
  number_of_episodes?: number;
  number_of_seasons?: number;
  percentComplete: number;
  seasons: Array<Season>;
  overview?: string;
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
  authorEpisodeUpTo: number;
  title: string;
  body: string;
  numberOfReplies: number;
  avatar: string;
  date: Date;
  voteScore: number;
  upVoteIds: string[];
  downVoteIds: string[];
  replies: Reply[];
  isReported: boolean;
};

interface UserTopic extends Topic {
  userVote: number;
}

type Reply = {
  topicId: string;
  authorUserId: string;
  avatar: string;
  replierEpisodeUpTo: number;
  authorName: string;
  body: string;
  date: Date;
  isReported: boolean;
  visible?: boolean;
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
    page?: number;
    results?: ShowTextSearchResults[];
    total_pages?: number;
    total_results?: number;
  };
};

type ShowTextSearchResults = {
  poster_path?: string | null;
  popularity?: number;
  id?: number;
  backdrop_path?: string | null;
  vote_average?: number;
  overview?: string;
  first_air_date?: string;
  origin_country?: string[];
  genre_ids?: number[];
  original_language?: string;
  vote_count?: number;
  name?: string;
  original_name?: string;
};

type AxiosTVShow = {
  data: {
    name?: string;
    number_of_episodes?: number;
    id?: number;
    seasons?: AxiosSeason[];
    first_air_date?: string;
    homepage?: string;
    last_air_date?: string;
    tagline?: string;
    backdrop_path?: string | null;
    poster_path?: string | null;
    created_by?: CreatedBy[];
    next_episode_to_air?: AxiosEpisode | null;
    number_of_seasons?: number;
    overview?: string;
  };
};

type CreatedBy = {
  id?: number;
  credit_id?: string;
  name?: string;
  gender?: number;
  profile_path?: string | null;
};

type AxiosEpisode = {
  air_date?: string;
  episode_number?: number;
  id?: number;
  name?: string;
  overview?: string;
  production_code?: string;
  season_number?: number;
  still_path?: string | null;
  vote_average?: number;
  vote_count?: number;
};

type AxiosSeason = {
  air_date?: string;
  episode_count?: number;
  id?: number;
  name?: string;
  overview?: string;
  poster_path?: string;
  season_number?: number;
};

type AxiosAPICallSeason = {
  data: {
    id?: number;
    episodes?: EpisodefromAPI[];
    poster_path?: string | null
  };
};
