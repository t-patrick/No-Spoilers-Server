import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { createDBUser, loginCheck } from './db-user-interface';

export const createUser = async (req: Request, res: Response) => {
  try {
    const user = await createDBUser(req.body);

    res.status(201).send(user);
  } catch (e: any) {
    console.error(e.toString());
    res.status(500).send(e.toString());
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const user = req.body;

    const data = await loginCheck(user);

    res.status(200).send(data);
  } catch (e: any) {
    console.error(e.toString());
    res.status(500).send(e.toString());
  }
};
