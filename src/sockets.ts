import { io } from '../index'

const waiting: ChatRequest[] = [];
const paused: ChatRequest[] = [];
const chats: ChatObject[] = [];

io.on("connection", socket => {
	socket.on("request", newRequest => {
		console.log('a user connected');
		waiting.push(newRequest);
		const match = waiting.filter(chatRequest => chatRequest.showId === newRequest.showId && chatRequest.episodeId === newRequest.episodeId);
		if (match) {
			const response: chatResponse[] = match.map(obj => { return { socketId: obj.socketId, displayName: obj.displayName, avatar: obj.avatar } })
			socket.to(newRequest).emit('subscribed', response);
			const otherUsers: string[] = match.map(obj => obj.socketId);
			const resp: chatResponse = {
				socketId: newRequest.socketId,
				displayName: newRequest.displayName,
				avatar: newRequest.avatar
			};
			io.to(otherUsers).emit('found', resp);
		} else {
			socket.to(newRequest).emit('subscribed', []);
		};
	});

	socket.on('disconnect', () => {
		console.log('user disconnected');
	});
});