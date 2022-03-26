import Jwt from "jsonwebtoken"
import { Request, Response, NextFunction } from 'express';
import * as dotenv from 'dotenv';
dotenv.config();
const TOKEN_SECRET: string = process.env.TOKEN_SECRET || 'needamoresecuresecret';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
	const authHeader: string | undefined = req.headers.authorization
	const token = authHeader && authHeader.split(' ')[1]

	if (token == null) return res.sendStatus(401)

	Jwt.verify(token, TOKEN_SECRET, (err: any, user: any) => {
		if (err) return res.sendStatus(403)

		req.body.id = user
		next()
	})
}
