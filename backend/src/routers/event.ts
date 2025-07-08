import express from 'express'
import cors from 'cors'
import { drizzle } from 'drizzle-orm/libsql';
import { event } from '../db/schema';
import { eq, ne, gt, gte, and } from 'drizzle-orm';
import { Router } from "express";
import { getAuth } from '@clerk/express';

const db = drizzle("file:local.db");
const router = Router()

router.use(cors())
router.use(express.json());

router.get('/', async (req, res) => {
	const { userId } = getAuth(req)

	if (userId == null) {
		res.status(400).send({ error: 'Not Authorized' });
		return;
	}

	res.status(200).send(await db.select().from(event).where(eq(event.userid, userId)))
});

router.post('/', async (req, res) => {
	console.log("loll")
	const newEvent: typeof event.$inferInsert = req.body
	const { userId } = getAuth(req)

	if (userId == null) {
		res.status(400).send({ error: 'Not Authorized' });
		return;
	}

	newEvent.userid = userId

	const returnedEvent = await db.insert(event).values(newEvent).returning()
	console.log(returnedEvent)

	res.status(201).json(returnedEvent);
});

router.put('/:id', async (req, res) => {
	const { userId } = getAuth(req)
	const id = parseInt(req.params['id']);
	const updatedEvent: Partial<typeof event.$inferSelect> = req.body

	if (id == null) {
		res.status(400).send({ error: 'Needs an id' });
		return;
	}

	if (userId == null) {
		res.status(400).send({ error: 'Not Authorized' });
		return;
	}

	await db.update(event).set(updatedEvent).where(and(eq(event.id, id), eq(event.userid, userId)))

	res.status(200).json(updatedEvent);
});

router.delete('/:id', async (req, res) => {
	const { userId } = getAuth(req)
	const id = parseInt(req.params['id']);

	if (userId == null) {
		res.status(400).send({ error: 'Not Authorized' });
		return;
	}

	await db.delete(event).where(and(eq(event.id, id), eq(event.userid, userId)))
	res.send("Deleted");
});

export default router
