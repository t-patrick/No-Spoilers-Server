import express, { Request, Response } from 'express';
import { createUser, login } from './controllers/User/user-controller';

const router = express.Router();

router.post('/register', createUser);

router.post('/login', login);

export default router;
