import mongoose from '.';

const replySchema = new mongoose.Schema<Reply>({
  topicId: mongoose.SchemaTypes.ObjectId,
  authorUserId: mongoose.SchemaTypes.ObjectId,
  replierEpisodeUpTo: Number,
  body: String,
  date: Date,
  avatar: String,
  authorName: String,
  isReported: Boolean,
  visible: Boolean,
});

const Reply = mongoose.model<Reply>('Reply', replySchema);

export default Reply;
