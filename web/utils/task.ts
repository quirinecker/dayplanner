import { DateTime } from "luxon"

export class Task {
	constructor(
		public id: number | undefined,
		public title: string,
		public description: string,
		public done: boolean,
		public estimated_time: number,
		public due_date: DateTime | undefined,
		public scheduled_at: DateTime | undefined
	) { }

	static fromSimpleTask(simpleTask: SimpleTask) {
		return new Task(
			simpleTask.id,
			simpleTask.title,
			simpleTask.description,
			simpleTask.done,
			simpleTask.estimated_time,
			simpleTask.due_date,
			simpleTask.scheduled_at
		)
	}

	static fromSerializable(serializableTask: SerializableTask) {
		console.log('dings', serializableTask.due_date)
		return new Task(
			serializableTask.id,
			serializableTask.title,
			serializableTask.description,
			serializableTask.done,
			serializableTask.estimated_time,
			stringToDate(serializableTask.due_date),
			stringToDate(serializableTask.scheduled_at),
		)
	}

	isPersistent() {
		return this.id !== undefined
	}

	isScheduled() {
		return this.scheduled_at !== undefined
	}
}

export type SimpleTask = {
	id: number | undefined
	title: string
	description: string
	done: boolean
	estimated_time: number
	scheduled_at: DateTime | undefined
	due_date: DateTime | undefined
}

export type SerializableTask = {
	id: number | undefined
	title: string
	description: string
	done: boolean
	estimated_time: number
	due_date: string | undefined
	scheduled_at: string | undefined
	created_at: string
	updated_at: string
	userid: string
}

export type DraggedTask = {
	target: Task,
	dragInfo: {
		top: number,
		date: DateTime
		height: number
	} | undefined
}

function stringToDate(date: string | undefined) {
	if (date === undefined) {
		return undefined
	}
	return DateTime.fromISO(date)
}
