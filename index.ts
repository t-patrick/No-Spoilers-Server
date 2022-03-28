import express from 'express';
import * as dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import router from './src/router';
import morgan from 'morgan';
import { Server } from "socket.io";
import http from "http";
import redis from "redis";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

const redisClient = redis.createClient();
// const redisGetAsync = async (): Promise<string | null> => {
//   const client = redis.createClient();
//   client.on('error', (err) => console.log('Redis Client Error', err));
//   await client.connect();
//   await client.set('key', 'value');
//   const value = await client.get('key');
//   return value;
// };

const waiting: ChatRequest[] = [];
const paused: ChatRequest[] = [];


io.on("connection", socket => {
  socket.on("connect", async (userId: string) => {
    console.log('a user connected');
    let chatConnect: ChatConnect = {
      isPaused: false,
      chatsCollection: []
    };
    const messages = await redisClient.get(`messages?senderId=${userId}`)
      .catch((err) => console.log(err));
      if (messages) {
        const jsonMessages: Message[] = JSON.parse(messages);
        let chatsCollection: TVShowChats[] = [];
        // chatsCollection.push({
        //   showId: jsonMessages[0].showId,
        //   showName: jsonMessages[0].showName,
        //   chats: [{
        //     chatterId: // this is the id on the message that isn't the userId
        //     displayName:

        //   }]
        // })
        // for (let i = 0; i < jsonMessages.length; i++) {
        //   for (let j = 0; j <= chatsCollection.length)
        // }

      }
    const pausedState = await redisClient.get(`isPaused?userId=${userId}`)
      .catch((err) => console.log(err));
    if (pausedState) {
      const isPaused: boolean = JSON.parse(pausedState);
      chatConnect.isPaused = isPaused
    }
    });
  socket.on("request", (newRequest: ChatRequest) => {
    newRequest.socketId = socket.id;
    const match = waiting.filter(chatRequest => chatRequest.showId === newRequest.showId && chatRequest.episodeId === newRequest.episodeId);
    const duplicate = waiting.filter(object => object.userId === newRequest.userId && object.showId === newRequest.showId)
    if (duplicate.length === 0) {
      waiting.push(newRequest);
    }
    if (match.length > 0) {
      const response: Chatter[] = match.map(obj => { return { socketId: obj.socketId, displayName: obj.displayName, avatar: obj.avatar, userId: obj.userId, showId: obj.showId} })
      io.to(socket.id).emit('subscribed', response);
      const otherUsers: string[] = match.map(obj => obj.socketId);
      const resp: Chatter = {
        socketId: newRequest.socketId,
        displayName: newRequest.displayName,
        avatar: newRequest.avatar,
        userId: newRequest.userId,
        showId: newRequest.showId
      };
      io.to(otherUsers).emit('found', resp);
    } else {
      io.to(socket.id).emit('subscribed', []);
    }
    socket.on("message", (message: Message) => {
      const match: ChatRequest[] = waiting.filter(chatRequest => chatRequest.userId === message.receiverId && chatRequest.showId === message.showId)
      if (match.length > 0) {
        io.to(match[0].socketId).emit("receive-message", message)
        redisClient.set(`messages?senderId=${message.senderId}`, JSON.stringify(message))
      } else {
        io.to(socket.id).emit('not-found', 'chatter not found')
      }
    })
  });
  socket.on("isPaused", (pausedState: PausedState) => {
    redisClient.set(`isPaused?userId=${pausedState.userId}`, JSON.stringify(pausedState.isPaused))
  })
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
