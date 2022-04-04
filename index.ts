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

app.use(cors());
app.use(express.json());
app.use(router);
morgan('tiny');

const waiting: ChatRequest[] = [];
const paused: ChatRequest[] = [];
const currentlyConnected: string[] = [];

io.on('connection', (socket) => {
  console.log('a user connected');
  currentlyConnected.push(socket.id);
  socket.on('request', (newRequest) => {
    console.log(newRequest);
    newRequest.socketId = socket.id;
    const match = waiting.filter(
      (chatRequest) =>
        chatRequest.showId === newRequest.showId &&
        chatRequest.episodeId === newRequest.episodeId
    );
    const duplicate = waiting.filter(
      (object) =>
        object.userId === newRequest.userId &&
        object.showId === newRequest.showId
    );
    if (duplicate.length === 0) {
      waiting.push(newRequest);
    }

    if (match.length > 0) {
      const response: Chatter[] = match.map((obj) => {
        return {
          socketId: obj.socketId,
          displayName: obj.displayName,
          avatar: obj.avatar,
          userId: obj.userId,
          showId: obj.showId,
        };
      });
      // console.log('response', response);
      io.to(socket.id).emit('subscribed', response);
      const otherUsers: string[] = match.map((obj) => obj.socketId);
      const resp: Chatter = {
        socketId: newRequest.socketId,
        displayName: newRequest.displayName,
        avatar: newRequest.avatar,
        userId: newRequest.userId,
        showId: newRequest.showId,
      };
      console.log('about to emit found with', resp);
      io.to(otherUsers).emit('found', resp);
    } else {
      io.to(socket.id).emit('subscribed', []);
    }
  });

  socket.on('message', (message) => {
    const match: ChatRequest[] = waiting.filter(
      (chatRequest) =>
        chatRequest.userId === message.receiverId &&
        chatRequest.showId === message.showId
    );
    console.log('match lower down', match);
    if (match) {
      io.to(match[0].socketId).emit('receivemessage', message);
    } else {
      io.to(socket.id).emit('not-found', 'chatter not found');
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    currentlyConnected.splice(currentlyConnected.indexOf(socket.id), 1);
    const cli = waiting.findIndex((client) => client.socketId === socket.id);
    waiting.splice(cli);
  });
});

server.listen(process.env.PORT, () => {
  console.log(`Listening on ${process.env.PORT}`);
});
