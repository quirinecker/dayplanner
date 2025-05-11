import type { Moment } from "moment"

export type Seperator = {
	text: string,
	time: Moment
}

export type Timespan = {
	from: number,
	to: number
}

export type Event = AnonymousEvent & {
	title: string
}

export type AnonymousEvent = {
	from: Moment,
	to: Moment
}

export type SerializableEvent = {
	title: string,
	from: string,
	to: string
}

export type EventWithCollisions = Event & {
	collisions: number
}

export type EventDimensions = {
	from: number,
	to: number
}

export function percentToPixelDimensions(dimensions: EventDimensions, totalHeight: number): EventDimensions {
	return {
		from: (dimensions.from / 100) * totalHeight,
		to: (dimensions.to / 100) * totalHeight
	}
}
