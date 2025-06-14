import express from 'express'
import cors from 'cors'
import { drizzle } from 'drizzle-orm/libsql';
import { event } from './db/schema';

const db = drizzle("file:local.db");
const app = express();
const userId = "Detlef";

app.use(cors())
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.get('/tasks', (req, res) => {
    res.send(
        ["Homework", "cleaning", "learn Arrow-functions"]
    );
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

app.get('/task/:id', (req, res) => {

    const id = req.params['id'];

    if (id == null) {
        res.status(400).send({error: 'Needs an id'});
        return;
    }

    const task = {id: id, name: 'Homework'}  //TODO
    res.json(task);
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

app.post('/task', (req, res) => {

    const newTask = req.body;

    //Validate

    //const newTaskWithId = db.createEvent(newTask)

    res.status(200).json(newTask);
});

app.post('/event', async(req, res) => {

    const newEvent: typeof event.$inferInsert = req.body
    newEvent.description = ""
    newEvent.userid = userId

    const returnedEvent = await db.insert(event).values(newEvent).returning()
    console.log(returnedEvent)

    //Validate

    //const newEventWithId = db.createEvent(newEvent)

    res.status(201).json(newEvent);
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

app.delete('/task/:id', (req, res) => {
    const id = req.params['id'];

    //const success = db.deleteTask(id)
    res.send("Deleted");
});

app.delete('/event', (req, res) => {
    const id = req.params['id'];

    //const success = db.deleteEvent(id)
    res.send("Deleted");
});

app.listen(8080, () => {
    console.log('Listening on port 8080');
});