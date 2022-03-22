import mongoose from '.';

const topicSchema = new mongoose.Schema<Topic>({
  _id: Number,
  TMDB_show_id: Number,
  TMDB_episode_id: Number,
  authorUserId: mongoose.SchemaTypes.ObjectId,
  title: String,
  body: String,
  authorName: String,
  numberOfReplies: Number,
  episodeCode: String,
  date: Date,
  voteScore: Number,
});

const Topic = mongoose.model<Topic>('Topic', topicSchema);

export default Topic;
