import { Request, Response } from 'express';
import { createDBUser, loginCheck } from './db-user-interface';
import User from '../../models/db-user';
import UserTVShow from '../../models/user-tv-show';
import Jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
dotenv.config();
const TOKEN_SECRET: string =
  process.env.TOKEN_SECRET || 'needamoresecuresecret';

const generateAccessToken = (id: string): string => {
  return Jwt.sign({ id: id }, TOKEN_SECRET, { expiresIn: 24 * 60 * 60 });
};

const onLoadHome = async (email: string): Promise<User | undefined> => {
  try {
    const user: User | null = await User.findOne({ email: email });
    let tvShows: UserTVShow[] | undefined;
    let accessToken: string = '';
    if (user) {
      tvShows = await UserTVShow.find({ userId: user._id });
      accessToken = generateAccessToken(user._id);
    }
    let result: User | undefined;
    if (user) {
      result = {
        _id: user._id,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar,
        userTVInfo: tvShows,
        token: accessToken,
      };
      return result;
    }
    return;
  } catch (e) {
    console.error(e, 'onLoadHome is failing');
    return;
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const user = await createDBUser(req.body);
    const result = await onLoadHome(req.body.email);
    if (!result) {
      res
        .status(401)
        .send('user or password is missing, or display name already exists');
    }
    res.status(201).send(result);
  } catch (e: any) {
    console.error(e.toString());
    res.status(500).send(e.toString());
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    console.log(req.body);
    const user = req.body;
    const data = await loginCheck(user);
    if (data === false || data === 'login credentials not found') {
      res.status(401).send(data);
    }
    const result = await onLoadHome(user.email);
    res.status(200).send(result);
  } catch (e: any) {
    console.error(e.toString());
    res.status(500).send(e.toString());
  }
};

export const authenticate = async (req: Request, res: Response) => {
  try {
    const userId: string = req.body.id.id;
    const currentUser: DBUser | null = await User.findOne({ _id: userId });
    if (!currentUser) {
      res.status(400);
      res.send('User not found');
      return;
    }
    const result = await onLoadHome(currentUser.email);
    res.status(200).send(result);
  } catch (e: any) {
    console.error('authenticate is failing');
    res.status(500);
  }
};
