import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { createDBUser } from './db-user-interface';

const createUser = async (req: Request, res: Response) => {
  try {
    const user = await createDBUser(req.body);

    const token = jwt.sign(
      { id: req.body.id },
      process.env.SECRET_KEY as string
    );

    const response = {
      user: user,
      token: token,
    };

    res.status(201).send(response);
  } catch (e: any) {
    console.error(e.toString());
    res.status(500).send(e.toString());
  }
};

// const login = async (req: Request, res: Response) => {
//   try {
//     cosnt
//   }
// }
