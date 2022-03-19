import express from "express";
import { onLoad } from "./controllers/showcontrollers/onloadshow";

const router = express.Router();

router.get('/show/:TMDB_show_Id', onLoad);

export default router;
