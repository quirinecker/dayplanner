import { DateTime } from "luxon"

export class Event {
	private static readonly MINUTES_IN_DAY = 24 * 60

	constructor(
		public id: number | undefined,
		public title: string,
		public from: DateTime,
		public to: DateTime,
		public description: string,
		public task: Task | undefined = undefined
	) { }


	getPercentDimensions(): EventDimensions {
		const start_of_day = this.from.startOf('day')
		const from_percentage = (this.from.diff(start_of_day, 'minutes').minutes) / Event.MINUTES_IN_DAY
		const to_percentage = (this.to.diff(start_of_day, 'minutes').minutes) / Event.MINUTES_IN_DAY
		return {
			from: from_percentage * 100,
			to: to_percentage * 100
		}
	}

	getPixelDimensions(maxHeight: number): EventDimensions {
		const percentDimensions = this.getPercentDimensions()
		return {
			from: (percentDimensions.from / 100) * maxHeight,
			to: (percentDimensions.to / 100) * maxHeight
		}
	}

	updateWithSimple(simple: SimpleEvent): Event {
		this.title = simple.title
		this.from = simple.from
		this.to = simple.to
		this.description = simple.description

		return this
	}

	static fromSimple(event: SimpleEvent): Event {
		return new Event(
			event.id,
			event.title,
			event.from,
			event.to,
			event.description
		)
	}

	static fromSerializable(event: SerializableEvent) {
		return new Event(
			event.id,
			event.title,
			DateTime.fromISO(event.from),
			DateTime.fromISO(event.to),
			event.description
		)
	}

	static fromPercentDimensions(id: number | undefined, title: string, dimensions: EventDimensions, date: DateTime, description: string): Event {
		return new Event(
			id,
			title,
			date.startOf('day').plus({ minutes: (dimensions.from / 100) * Event.MINUTES_IN_DAY }),
			date.startOf('day').plus({ minutes: (dimensions.to / 100) * Event.MINUTES_IN_DAY }),
			description
		)
	}

	static fromPixelDimensions(id: number | undefined, title: string, dimensions: EventDimensions, height: number, date: DateTime, description: string): Event {
		const percentDimensions: EventDimensions = {
			from: dimensions.from * 100 / height,
			to: dimensions.to * 100 / height
		}

		return Event.fromPercentDimensions(id, title, percentDimensions, date, description)
	}

	static fromDraggedEvent(draggedEvent: DraggedEvent, height: number): Event {
		const pixelDimensions: EventDimensions = {
			from: draggedEvent.top,
			to: draggedEvent.top + draggedEvent.height
		}

		return Event.fromPixelDimensions(
			draggedEvent.target.id,
			draggedEvent.target.title,
			pixelDimensions,
			height,
			draggedEvent.date,
			draggedEvent.target.description
		)
	}

	updateWithDraggedEvent(draggedEvent: DraggedEvent, height: number): Event {
		const newEventData = Event.fromDraggedEvent(draggedEvent, height)

		this.from = newEventData.from
		this.to = newEventData.to

		return this
	}


	toSimple(): SimpleEvent {
		return {
			id: this.id,
			title: this.title,
			from: this.from,
			to: this.to,
			description: this.description
		}
	}

	toSerializable(): SerializableEvent {
		return {
			id: this.id,
			title: this.title,
			from: this.from.toISO() ?? '',
			to: this.to.toISO() ?? '',
			description: this.description
		}
	}

	withCollisions(collisions: number = 0): CollissionWrapper {
		return {
			event: this,
			collisions
		}
	}

	toDraggedEvent(height: number, mouseY: number): DraggedEvent {
		const pixelDimensions = this.getPixelDimensions(height)
		const offset = mouseY - pixelDimensions.from

		return {
			date: this.from.startOf('day'),
			top: pixelDimensions.from,
			height: pixelDimensions.to - pixelDimensions.from,
			target: this,
			offset: offset
		}
	}

	isTask() {
		return this.task !== undefined
	}

}

export type EventDimensions = {
	from: number,
	to: number
}

export type SimpleEvent = {
	id: number | undefined,
	title: string,
	from: DateTime,
	to: DateTime
	description: string
}

export type SerializableEvent = {
	id: number | undefined,
	title: string,
	from: string,
	to: string
	description: string
}

export type CollissionWrapper = {
	event: Event,
	collisions: number
}

export type DraggedEvent = {
	date: DateTime,
	top: number,
	height: number,
	target: Event,
	offset: number
}
