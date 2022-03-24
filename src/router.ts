import express, { Request, Response } from 'express';
import { createUser, login } from './controllers/User/user-controller';
import { onLoadShow } from './controllers/showcontrollers/on-load-show';
import { onLoadWaybackUrls } from './controllers/Wayback/on-load-wayback';
import { addTVShow } from './controllers/Home/add-tv-show';
import { deleteTVShow } from './controllers/Home/delete-tv-show';
import { searchDebounce } from './controllers/AddShow/search-debounce';
import { searchEnter } from './controllers/AddShow/search-enter';
import { updateEpisodesWatched } from './controllers/showcontrollers/update-episodes-watched';
import { addUserWayback } from './controllers/UserWayback/add-user-wayback';
import { deleteUserWayback } from './controllers/UserWayback/delete-user-wayback';
import { onLoadUserWayback } from './controllers/UserWayback/on-load-user-wayback';
import { updateUserWayback } from './controllers/UserWayback/update-user-wayback';
import { addTopic } from './controllers/Forum/add-topic';
import { deleteTopic } from './controllers/Forum/delete-topic';
import { addReply } from './controllers/Forum/add-reply';
import { deleteReply } from './controllers/Forum/delete-reply';
import { onLoadForum } from './controllers/Forum/on-load-forum';

const router = express.Router();

router.post('/register', createUser);
router.post('/login', login);

router.post('/home/add/:TMDB_show_Id', addTVShow);
router.delete('/home/delete/:TMDB_show_Id', deleteTVShow);

router.post('/quicksearch', searchDebounce);
router.post('/search', searchEnter);

router.post('/show/:TMDB_show_Id', onLoadShow);
router.patch('/show/:TMDB_show_Id', updateEpisodesWatched);
router.post('/wayback/:TMDB_show_Id', onLoadWaybackUrls);
router.post('/wayback/update/:TMDB_show_Id', onLoadWaybackUrls);

router.post('/userwayback/:TMDB_show_Id', onLoadUserWayback);
router.post('/userwayback/add/:TMDB_show_Id', addUserWayback);
router.delete('/userwayback/delete/:TMDB_show_Id', deleteUserWayback);
router.patch('/userwayback/update/:TMDB_show_Id', updateUserWayback);

router.post('/forum/:TMDB_show_Id', onLoadForum);
router.post('/forum/update/:TMDB_show_Id', onLoadForum);
router.post('/forum/topic/add/:TMDB_show_Id', addTopic);
router.delete('/forum/topic/delete', deleteTopic);
router.post('/forum/reply/add/:TMDB_show_Id', addReply);
router.delete('/forum/reply/delete', deleteReply);

export default router;
