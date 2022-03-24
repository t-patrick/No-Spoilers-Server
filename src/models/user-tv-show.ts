import mongoose from '.';

const userTVShowSchema = new mongoose.Schema<UserTVShow>({
  userId: mongoose.SchemaTypes.ObjectId,
  TMDB_show_id: Number,
  name: String,
  poster_path: String,
  current_poster_path: String,
  isCompleted: Boolean,
  episodeIdUpTo: Number,
  episodeCodeUpTo: String,
  episodeCodeNext: String,
  episodesWatchedSoFar: Number,
});

const UserTVShow = mongoose.model<UserTVShow>('UserTVShow', userTVShowSchema);

export default UserTVShow;
