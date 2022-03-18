import mongoose from '.';

const dbUserSchema = new mongoose.Schema<DBUser>({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  displayName: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: String,
});

const DBUser = mongoose.model<DBUser>('User', dbUserSchema);

export default DBUser;
