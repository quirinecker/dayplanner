import express from 'express'
import cors from 'cors'

const app = express();

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

app.get('/events', (req, res) => {
    res.send(
        [
            {
                "title": "wedding",
                "from": "2025-05-19T08:30:26.195+02:00",
                "to": "2025-05-19T12:32:55.883+02:00"
            },
            {
                "title": "funeral",
                "from": "2025-05-19T15:26:34.178+02:00",
                "to": "2025-05-19T18:12:43.409+02:00"
            }
        ]
    );
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

app.post('/event', (req, res) => {

    const newEvent = req.body;

    console.log(newEvent)

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