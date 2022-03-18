import mongoose from '.';

const reportSchema = new mongoose.Schema<Report>({
  reporterId: mongoose.SchemaTypes.ObjectId,
  offendingUserId: mongoose.SchemaTypes.ObjectId,
  itemId: mongoose.SchemaTypes.ObjectId,
  offenceType: String,
  topicOrReply: String,
  date: Date,
});

const Report = mongoose.model<Report>('Report', reportSchema);

export default Report;
