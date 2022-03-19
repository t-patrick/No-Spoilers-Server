import express, { Request, Response } from 'express';
import { createUser, login } from './controllers/User/user-controller';
import { onLoad } from "./controllers/showcontrollers/onloadshow";

const router = express.Router();

router.post('/register', createUser);

router.post('/login', login);

router.get('/show/:TMDB_show_Id', onLoad);

export default router;
