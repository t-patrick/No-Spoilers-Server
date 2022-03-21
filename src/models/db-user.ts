import mongoose from '.';

const dbUserSchema = new mongoose.Schema<DBUser>({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  displayName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: String,
});

const User = mongoose.model<DBUser>('User', dbUserSchema);

export default User;
