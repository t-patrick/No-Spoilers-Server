import express, { Request, Response } from 'express';
import { createUser, login } from './controllers/User/user-controller';
import { onLoadShow } from "./controllers/showcontrollers/onloadshow";
import { onLoadWaybackUrls } from './controllers/showcontrollers/onloadwayback';

const router = express.Router();

router.post('/register', createUser);

router.post('/login', login);

router.get('/show/:TMDB_show_Id', onLoadShow);
router.get('/wayback/:TMDB_show_Id', onLoadWaybackUrls);

export default router;
