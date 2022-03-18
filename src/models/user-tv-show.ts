import mongoose from '.';

const userTVShowSchema = new mongoose.Schema<UserTVShow>({
  userId: mongoose.SchemaTypes.ObjectId,
  TMDB_show_id: Number,
  name: Number,
  poster_path: String,
  isCompleted: Boolean,
  episodeIdUpTo: Number,
  episodeCodeUpTo: String,
  episodesWatchedSoFar: Number,
});


const UserTVShow = mongoose.model<UserTVShow>('UserTVShow', userTVShowSchema);

export default UserTVShow;
