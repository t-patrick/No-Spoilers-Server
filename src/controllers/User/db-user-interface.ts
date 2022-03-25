import User from '../../models/db-user';
import bcrypt from 'bcrypt';

const saltRounds = 10;

export const loginCheck = async (user: DBUser) => {
  try {
    const userFromDB: DBUser = (await User.findOne({
      email: user.email,
    })) as DBUser;
    const match = await bcrypt.compare(user.password, userFromDB.password);

    if (match) {
      return userFromDB;
    } else {
      return false;
    }
  } catch (e) {
    console.error('login credentials not found');
    return 'login credentials not found';
  }
};

export const createDBUser = async (user: DBUser): Promise<DBUser | Error> => {
  const resp = await User.exists({ email: user.email });
  if (resp) throw new Error('email already exists');

  try {
    if (user.email && user.password) {
      const hashPassword = await bcrypt.hash(user.password, saltRounds);
      const newUser = await User.create({
        email: user.email,
        password: hashPassword,
        displayName: user.displayName,
        avatar: user.avatar,
      });

      return newUser;
    } else {
      console.error('user or password is missing');
      return new Error('user or password is missing');
    }
  } catch (e: any) {
    if (e.code === 11000) {
      console.error('Email already in use', e);
    } else {
      console.error('Other database error', e);
    }
    return new Error('Other database error');
  }
};
