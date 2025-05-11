import type { Moment } from "moment"
import moment from "moment"

export class Event {
	private static readonly MINUTES_IN_DAY = 24 * 60

	constructor(
		public readonly title: string,
		public from: Moment,
		public to: Moment
	) { }


	getPercentDimensions(): EventDimensions {
		const start_of_day = moment(this.from).startOf('day')
		const from_percentage = this.from.diff(start_of_day, 'minutes') / Event.MINUTES_IN_DAY
		const to_percentage = this.to.diff(start_of_day, 'minutes') / Event.MINUTES_IN_DAY
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

	static fromSimple(event: SimpleEvent): Event {
		return new Event(event.title, event.from, event.to)
	}

	static fromSerializable(event: SerializableEvent) {
		return new Event(event.title, moment(event.from), moment(event.to))
	}

	static fromPercentDimensions(title: string, dimensions: EventDimensions, date: Moment): Event {
		return new Event(
			title,
			moment(date).startOf('day').minutes((dimensions.from / 100) * Event.MINUTES_IN_DAY),
			moment(date).startOf('day').minutes((dimensions.to / 100) * Event.MINUTES_IN_DAY)
		)
	}

	static fromPixelDimensions(title: string, dimensions: EventDimensions, height: number, date: Moment): Event {
		const percentDimensions: EventDimensions = {
			from: dimensions.from * 100 / height,
			to: dimensions.to * 100 / height
		}

		return Event.fromPercentDimensions(title, percentDimensions, date)
	}

	static fromDraggedEvent(draggedEvent: DraggedEvent, height: number): Event {
		const pixelDimensions: EventDimensions = {
			from: draggedEvent.top,
			to: draggedEvent.top + draggedEvent.height
		}

		return Event.fromPixelDimensions(draggedEvent.target.title, pixelDimensions, height, draggedEvent.date)
	}

	updateWithDraggedEvent(draggedEvent: DraggedEvent, height: number): Event {
		const newEventData = Event.fromDraggedEvent(draggedEvent, height)

		this.from = newEventData.from
		this.to = newEventData.to

		return this
	}


	toSimple(): SimpleEvent {
		return {
			title: this.title,
			from: this.from,
			to: this.to
		}
	}

	toSerializable(): SerializableEvent {
		return {
			title: this.title,
			from: this.from.toISOString(),
			to: this.to.toISOString()
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
			date: moment(this.from).startOf('day'),
			top: pixelDimensions.from,
			height: pixelDimensions.to - pixelDimensions.from,
			target: this,
			offset: offset
		}
	}

}

export type EventDimensions = {
	from: number,
	to: number
}

export type SimpleEvent = {
	title: string,
	from: Moment,
	to: Moment
}

export type SerializableEvent = {
	title: string,
	from: string,
	to: string
}

export type CollissionWrapper = {
	event: Event,
	collisions: number
}

export type DraggedEvent = {
	date: Moment,
	top: number,
	height: number,
	target: Event,
	offset: number
}
