import mongoose from '.';

const topicSchema = new mongoose.Schema<Topic>({
  TMDB_show_id: Number,
  TMDB_episode_id: Number,
  authorUserId: mongoose.SchemaTypes.ObjectId,
  title: String,
  body: String,
  authorName: String,
  numberOfReplies: Number,
  avatar: String,
  episodeCode: String,
  authorEpisodeUpTo: Number,
  date: Date,
  voteScore: Number,
  upVoteIds: [String],
  downVoteIds: [String],
  replies: [
    {
      topicId: mongoose.SchemaTypes.ObjectId,
      authorUserId: mongoose.SchemaTypes.ObjectId,
      replierEpisodeUpTo: Number,
      body: String,
      date: Date,
      avatar: String,
      authorName: String,
      isReported: Boolean,
      visible: Boolean,
    }
  ],
  isReported: Boolean,
});

const Topic = mongoose.model<Topic>('Topic', topicSchema);

export default Topic;
