import express from 'express'
import cors from 'cors'
import { drizzle } from 'drizzle-orm/libsql';
import { event } from '../db/schema';
import { eq, ne, gt, gte } from 'drizzle-orm';
import { Router } from "express";

const db = drizzle("file:local.db");
const userId = "Detlef";

const router = Router()

router.use(cors())
router.use(express.json());

router.get('/', async (req, res) => {
    res.status(200).send(await db.select().from(event))
});

router.get('/:id', (req, res) => {

	const id = req.params['id'];

	if (id == null) {
		res.status(400).send({ error: 'Needs an id' });
		return;
	}

	const event = { id: id, name: 'Pary' }  //TODO
	res.json(event);
});

router.post('/', async (req, res) => {
    console.log("loll")
    const newEvent: typeof event.$inferInsert = req.body
    newEvent.userid = userId

    const returnedEvent = await db.insert(event).values(newEvent).returning()
    console.log(returnedEvent)

    res.status(201).json(returnedEvent);
});

router.put('/', (req, res) => {

    const id = parseInt(req.params['id']);
    const updatedEvent: Partial<typeof event.$inferSelect> = req.body

    if (id == null) {
        res.status(400).send({ error: 'Needs an id' });
        return;
    }
    db.update(event).set(updatedEvent).where(eq(event.id, id))

    res.status(200).json(updatedEvent);
});

router.delete('/:id', async (req, res) => {
    const id = parseInt(req.params['id']);

    const success = await db.delete(event).where(eq(event.id, id))
    res.send("Deleted");
});

export default router