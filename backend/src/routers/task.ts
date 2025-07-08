import express from 'express'
import cors from 'cors'
import { drizzle } from 'drizzle-orm/libsql';
import { task } from '../db/schema';
import { eq, ne, gt, gte, and } from 'drizzle-orm';
import { Router } from "express";
import { getAuth } from '@clerk/express';

const db = drizzle("file:local.db");

type Prettify<T> = {
	[K in keyof T]: T[K];
} & {};

type TaskResponse = Prettify<Omit<typeof task.$inferSelect, 'done'> & { done: boolean }>

const router = Router()

router.use(cors())
router.use(express.json());

router.get('/', async (req, res) => {
	const { userId } = getAuth(req)

	if (userId == null) {
		res.status(400).send({ error: 'Not Authorized' });
		return;
	}

	const tasks: typeof task.$inferSelect[] = await db.select().from(task)
		.where(eq(task.userid, userId))
	console.log(tasks)

	res.status(200).send(tasks.map<TaskResponse>(task => {
		return { ...task, done: task.done === 1 }
	}));
});

router.get('/:id', async (req, res) => {

	const id = parseInt(req.params['id']);
	const { userId } = getAuth(req)

	if (userId == null) {
		res.status(400).send({ error: 'Not Authorized' });
		return;
	}

	if (id == null) {
		res.status(400).send({ error: 'Needs an id' });
		return;
	}

	const returnedTask = await db.select().from(task)
		.where(and(eq(task.id, id), eq(task.userid, userId)))

	//
	console.log(returnedTask)
	res.json(returnedTask);
});

router.post('/', async (req, res) => {

	const newTask = req.body
	const { userId } = getAuth(req)
	newTask.userid = userId

	console.log(newTask)
	const returnedTasks = await db.insert(task).values(newTask).returning()
	console.log(returnedTasks)

	res.status(201).json(returnedTasks[0]);
});

router.put('/:id', async (req, res) => {

	const { userId } = getAuth(req)
	const id = parseInt(req.params['id']);
	const updatedTask: Partial<typeof task.$inferSelect> = req.body

	if (userId == null) {
		res.status(400).send({ error: 'Not Authorized' });
		return;
	}

	if (id == null) {
		res.status(400).send({ error: 'Needs an id' });
		return;
	}

	await db.update(task).set(updatedTask).where(and(eq(task.id, id), eq(task.userid, userId)))

	res.status(200).json(updatedTask);
});

router.delete('/:id', async (req, res) => {
	const { userId } = getAuth(req)
	const id = parseInt(req.params['id']);

	if (userId == null) {
		res.status(400).send({ error: 'Not Authorized' });
		return;
	}

	if (id == null) {
		res.status(400).send({ error: 'Needs an id' });
		return;
	}

	await db.delete(task).where(and(eq(task.id, id), eq(task.userid, userId)))
	res.send("Deleted");
});

export default router
