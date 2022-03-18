import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export const generateAccessToken = (id: string) => {
  const token = jwt.sign({ id: id }, process.env.SECRET_KEY as string, {
    expiresIn: '1d',
  });

  return token;
};

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.TOKEN_SECRET as string, (err: any, id: any) => {
    console.log(err);

    if (err) return res.sendStatus(403);

    req.body.id = id;

    next();
  });
};
