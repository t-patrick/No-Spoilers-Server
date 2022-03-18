import mongoose from '.';

const tvShowSnippetSchema = new mongoose.Schema<TVShowSnippet>({
  name: String,
  TMDB_show_id: Number,
  poster_path: String,
  first_air_date: String,
});

const TVShowSnippet = mongoose.model<TVShowSnippet>(
  'UserTVShow',
  tvShowSnippetSchema
);

export default TVShowSnippet;
