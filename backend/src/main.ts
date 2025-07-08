import express from 'express'
import cors from 'cors'
import http from 'http'
import taskRouter from './routers/task';
import eventRouter from './routers/event'

import { Server } from 'socket.io'
import { clerkMiddleware, requireAuth } from '@clerk/express';

const app = express();
const server = http.createServer(app)
const io = new Server(server, {
	cors: {
		origin: "*",
	},
})

app.use(clerkMiddleware())
app.use(cors())
app.use(requireAuth())
app.use('/tasks', taskRouter)
app.use('/events', eventRouter)
app.use(express.json());

app.get('/', (req, res) => {
	res.send('Hello World');
});

io.on('connection', (socket) => {
	console.log('A user connected:', socket.id);

	socket.on('change', () => {
		console.log('Message received');
		socket.broadcast.emit('change')
	});

	socket.on('disconnect', () => {
		console.log('User disconnected:', socket.id);
	});
});

server.listen(8080, () => {
	console.log('Listening on port 8080');
});
