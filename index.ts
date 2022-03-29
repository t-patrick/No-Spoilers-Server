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

const waiting: ChatRequest[] = [];
const paused: ChatRequest[] = [];

const loadUserChats = async (userId: string, showId: number): Promise<TVShowChats | undefined> => {
  const unparsedUserCollections = await redisClient.get(`chats?userId=${userId}showID=${showId}`)
    .catch((err) => console.log(err));
  if (unparsedUserCollections) {
    return JSON.parse(unparsedUserCollections)
  }
  else return;
};

const saveMultipleNewChattersOneShow = (chatters: Chatter[], userId: string): void => {
  let chatsCollection: TVShowChats = {
    showId: chatters[0].showId,
    showName: chatters[0].showName,
    chats: []
  };
  chatters.forEach(chatter => {
    chatsCollection.chats.push({
      chatterId: chatter.userId,
      displayName: chatter.displayName,
      avatar: chatter.avatar,
      showId: chatter.showId,
      messages: []
    })
  });
  redisClient.set(`chats?userId=${userId}?showId=${chatters[0].showId}`, JSON.stringify(chatsCollection));
};

const saveSingleNewChatterNewCollection = (chatter: Chatter, userId: string): void => {
  let chatsCollection: TVShowChats = {
    showId: chatter.showId,
    showName: chatter.showName,
    chats: [{
      chatterId: chatter.userId,
      displayName: chatter.displayName,
      avatar: chatter.avatar,
      showId: chatter.showId,
      messages: []
    }]
  };
  redisClient.set(`chats?userId=${userId}?showID=${chatter.showId}`, JSON.stringify(chatsCollection));
};

const saveSingleNewChatterExistingCollection = (userCollections: TVShowChats, chatter: Chatter, userId: string): void => {
  userCollections.chats.push({
    chatterId: chatter.userId,
    displayName: chatter.displayName,
    avatar: chatter.avatar,
    showId: chatter.showId,
    messages: []
  });
  redisClient.set(`chats?userId=${userId}?showID=${chatter.showId}`, JSON.stringify(userCollections));
};

const updateMessages = async (senderId: string, receiverId: string, showId: number, message: Message): Promise<void> => {
  const unparsedSenderCollections = await redisClient.get(`chats?userId=${senderId}showID=${showId}`)
    .catch((err) => console.log(err));
  if (unparsedSenderCollections) {
    const senderCollections: TVShowChats = JSON.parse(unparsedSenderCollections);
    senderCollections.chats.forEach(chat => {
      if (chat.chatterId === receiverId) {
        chat.messages.push(message);
      }
      redisClient.set(`chats?userId=${senderId}?showID=${showId}`, JSON.stringify(senderCollections))
    });
  }
  const unparsedReceiverCollections = await redisClient.get(`chats?userId=${receiverId}showID=${showId}`)
    .catch((err) => console.log(err));
  if (unparsedReceiverCollections) {
    const receiverCollections: TVShowChats = JSON.parse(unparsedReceiverCollections);
    receiverCollections.chats.forEach(chat => {
      if (chat.chatterId === senderId) {
        chat.messages.push(message);
      }
      redisClient.set(`chats?userId=${receiverId}?showID=${showId}`, JSON.stringify(receiverCollections))
    });
  }
};

const updateShows = async (userId: string, showId: number): Promise<void> => {
  const unparsedUserShows = await redisClient.get(`shows?userId=${userId}`)
    .catch((err) => console.log(err));
  if (unparsedUserShows) {
    const userShows: Number[] = JSON.parse(unparsedUserShows);
    userShows.push(showId);
    redisClient.set(`shows?userId=${userId}`, JSON.stringify(userShows));
  } else {
    const userShows: number[] = [showId];
    redisClient.set(`shows?userId=${userId}`, JSON.stringify(userShows));
  }
};

io.on("connection", socket => {
  socket.on("connect", async (userId: string) => {
    console.log('a user connected');
    let chatConnect: ChatConnect = {
      isPaused: false,
      chatsCollection: []
    };
    const pausedState = await redisClient.get(`isPaused?userId=${userId}`)
      .catch((err) => console.log(err));
    if (pausedState) {
      const isPaused: boolean = JSON.parse(pausedState);
      chatConnect.isPaused = isPaused
    };
    const unparsedUserShows = await redisClient.get(`shows?userId=${userId}`)
      .catch((err) => console.log(err));
    if (unparsedUserShows) {
      const userShows: Number[] = JSON.parse(unparsedUserShows);
      userShows.forEach(async (show) => {
        const unparsedCollection = await redisClient.get(`chats?userId=${userId}showID=${show}`)
          .catch((err) => console.log(err));
        if (unparsedCollection) {
          const collection: TVShowChats = JSON.parse(unparsedCollection);
          chatConnect.chatsCollection.push(collection);
        }
      });
      io.to(socket.id).emit('loaded', chatConnect);
    }
    else {
      io.to(socket.id).emit('loaded', chatConnect);
    }
  });

  socket.on("request", async (newRequest: ChatRequest) => {
    newRequest.socketId = socket.id;
    const match = waiting.filter(chatRequest => chatRequest.showId === newRequest.showId && chatRequest.episodeId === newRequest.episodeId);
    const duplicate = waiting.filter(object => object.userId === newRequest.userId && object.showId === newRequest.showId)
    if (duplicate.length === 0) {
      waiting.push(newRequest);
    }
    if (match.length > 0) {
      const response: Chatter[] = match.map(obj => { return { socketId: obj.socketId, displayName: obj.displayName, avatar: obj.avatar, userId: obj.userId, showId: obj.showId, showName: obj.showName } })
      io.to(socket.id).emit('subscribed', response);
      const otherUsers: string[] = match.map(obj => obj.socketId);
      const otherUsersId: string[] = match.map(obj => obj.userId);
      const resp: Chatter = {
        socketId: newRequest.socketId,
        displayName: newRequest.displayName,
        avatar: newRequest.avatar,
        userId: newRequest.userId,
        showId: newRequest.showId,
        showName: newRequest.showName
      };
      io.to(otherUsers).emit('found', resp);
      await updateShows(newRequest.userId, newRequest.showId);
      if (response.length > 0) {
        saveMultipleNewChattersOneShow(response, newRequest.userId);
      }
      if (otherUsersId.length > 0) {
        otherUsersId.forEach(async otherUserId => {
          const userCollections = await loadUserChats(otherUserId, newRequest.showId);
          if (!userCollections) {
            saveSingleNewChatterNewCollection(resp, otherUserId);
          }
          if (userCollections) {
            saveSingleNewChatterExistingCollection(userCollections, resp, otherUserId);
          }
        })
      }
    } else {
      io.to(socket.id).emit('subscribed', []);
    }
  });

  socket.on("message", async (message: Message) => {
    const match: ChatRequest[] = waiting.filter(chatRequest => chatRequest.userId === message.receiverId && chatRequest.showId === message.showId)
    if (match.length > 0) {
      io.to(match[0].socketId).emit("receive-message", message);
    } else {
      io.to(socket.id).emit('not-found', 'chatter not found')
    }
    await updateMessages(message.senderId, message.receiverId, message.showId, message);
  });

  socket.on("isPaused", (pausedState: PausedState) => {
    redisClient.set(`isPaused?userId=${pausedState.userId}`, JSON.stringify(pausedState.isPaused))
  });

  socket.on('disconnect', () => {
    // remove sockets
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
