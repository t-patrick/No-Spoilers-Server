import express, { Request, Response } from 'express';
import { createUser, login } from './controllers/User/user-controller';
import { onLoadShow } from './controllers/showcontrollers/onloadshow';
import { onLoadWaybackUrls } from './controllers/showcontrollers/onloadwayback';
import { addTVShow } from './controllers/Home/addtvshow';
import { deleteTVShow } from './controllers/Home/deletetvshow';
import { searchDebounce } from './controllers/AddShow/searchdebounce';
import { searchEnter } from './controllers/AddShow/searchenter';
import { updateEpisodesWatched } from './controllers/showcontrollers/update-episodes-watched';

const router = express.Router();

router.post('/register', createUser);
router.post('/login', login);

router.post('/home/add/:TMDB_show_Id', addTVShow);
router.delete('/home/delete/:TMDB_show_Id', deleteTVShow);

router.post('/quicksearch', searchDebounce);
router.post('/search', searchEnter);

router.get('/show/:TMDB_show_Id', onLoadShow);
router.patch('/show/:TMDB_show_Id', updateEpisodesWatched);
router.get('/wayback/:TMDB_show_Id', onLoadWaybackUrls);

export default router;
