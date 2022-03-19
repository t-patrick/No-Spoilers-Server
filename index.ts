import express from 'express';
import * as dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import router from './src/router';
import morgan from 'morgan';

const app = express();

app.use(cors());
app.use(express.json());
app.use(router);
morgan('tiny');

app.listen(process.env.PORT, () => {
  console.log(`Listening on ${process.env.PORT}`);
});
