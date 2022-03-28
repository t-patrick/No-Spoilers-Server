import express from 'express';
import * as dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import router from './src/router';
import morgan from 'morgan';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

const sockets = {} as any;

io.on('connection', (socket) => {
  console.log('connected');
  io.emit('to everyone', 'to everyone');

  socket.on('register', (user) => {
    sockets[user] = socket.id;
  });

  socket.on('privatemsg', (payload) => {
    io.to(sockets[payload.user]).emit('private', payload.message);
  });

  socket.on('message', (msg: string) => {
    console.log(msg);
  });
});

app.use(cors());
app.use(express.json());
app.use(router);
morgan('tiny');

server.listen(process.env.PORT, () => {
  console.log(`Listening on ${process.env.PORT}`);
});
