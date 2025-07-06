import express from 'express'
import cors from 'cors'

import taskRouter from './routers/task';
import eventRouter from './routers/event'

const app = express();

app.use(cors())
app.use('/tasks', taskRouter)
app.use('/events', eventRouter)
app.use(express.json());

app.get('/', (req, res) => {
	res.send('Hello World');
});

app.listen(8080, () => {
	console.log('Listening on port 8080');
});
