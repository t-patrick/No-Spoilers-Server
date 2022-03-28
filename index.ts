import express from 'express';
import * as dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import router from './src/router';
import morgan from 'morgan';
import { Server } from 'socket.io';
import http from 'http';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

const waiting: ChatRequest[] = [];
const paused: ChatRequest[] = [];
const chats: ChatObject[] = [];

io.on("connection", socket => {
  console.log('a user connected');
  socket.on("request", newRequest => {
    newRequest.socketId = socket.id;
    const match = waiting.filter(chatRequest => chatRequest.showId === newRequest.showId && chatRequest.episodeId === newRequest.episodeId);
    const duplicate = waiting.filter(object => object.userId === newRequest.userId && object.showId === newRequest.showId)
    if (duplicate.length = 0) {
      waiting.push(newRequest);
    }
    console.log('match', match, 'waiting', waiting);
    if (match.length > 0) {
      const response: chatResponse[] = match.map(obj => { return { socketId: obj.socketId, displayName: obj.displayName, avatar: obj.avatar } })
      io.to(socket.id).emit('subscribed', response);
      const otherUsers: string[] = match.map(obj => obj.socketId);
      const resp: chatResponse = {
        socketId: newRequest.socketId,
        displayName: newRequest.displayName,
        avatar: newRequest.avatar
      };
      io.to(otherUsers).emit('found', resp);
    } else {
      io.to(socket.id).emit('subscribed', []);
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

app.use(cors());
app.use(express.json());
app.use(router);
morgan('tiny');

server.listen(process.env.PORT, () => {
  console.log(`Listening on ${process.env.PORT}`);
});
