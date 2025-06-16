import express from 'express'
import cors from 'cors'
import { drizzle } from 'drizzle-orm/libsql';
import { event, task } from './db/schema';
import { eq, ne, gt, gte } from 'drizzle-orm';

const db = drizzle("file:local.db");
const app = express();
const userId = "Detlef";

app.use(cors())
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.get('/tasks', async(req, res) => {
    const tasks = await db.select().from(task)
    console.log(tasks)
    res.send(tasks);
});

app.get('/events', async(req, res) => {
    res.send(await db.select().from(event))
});

app.get('/user/:id', (req, res) => {
    const id = req.params['id'];

    if (id == null) {
        res.status(400).send({error: 'Needs an user id'});
        return;
    }

    const user = {id: id, name: 'Cracker'}  //TODO
    res.json(user);

});

app.get('/task/:id', async(req, res) => {

    const id = parseInt(req.params['id']);

    if (id == null) {
        res.status(400).send({error: 'Needs an id'});
        return;
    }

    const returnedTask = await db.select().from(task).where(eq(task.id, id))
    //
    console.log(returnedTask)
    res.json(returnedTask);
});

app.get('/event/:id', (req, res) => {

    const id = req.params['id'];

    if (id == null) {
        res.status(400).send({error: 'Needs an id'});
        return;
    }

    const event = {id: id, name: 'Pary'}  //TODO
    res.json(event);
});

app.post('/task', async(req, res) => {

    const newTask = req.body
    newTask.userid = userId

    const returnedTask = await db.insert(task).values(newTask).returning()
    console.log(returnedTask)

    res.status(201).json(returnedTask);
});

app.post('/event', async(req, res) => {

    const newEvent: typeof event.$inferInsert = req.body
    newEvent.description = ""
    newEvent.userid = userId

    const returnedEvent = await db.insert(event).values(newEvent).returning()
    console.log(returnedEvent)

    res.status(201).json(returnedEvent);
});

app.put('/task', (req, res) => {

    const updatedTask = req.body;

    //Validate (having id)

    //const updatedTaskWithId = db.updateTask(updatedTask)

    res.status(200).json(updatedTask);
});

app.put('/event', (req, res) => {
    const updatedEvent = req.body;

    //Validate (having id)

    //const updatedEventWithId = db.updateEvent(updatedEvent)

    res.status(200).json(updatedEvent);
});

app.delete('/task/:id', async(req, res) => {
    const id = parseInt(req.params['id']);

    const success = await db.delete(task).where(eq(task.id, id))
    res.send("Deleted");
});

app.delete('/event/:id', async(req, res) => {
    const id = parseInt(req.params['id']);

    const success = await db.delete(event).where(eq(event.id, id))
    res.send("Deleted");
});

app.listen(8080, () => {
    console.log('Listening on port 8080');
});