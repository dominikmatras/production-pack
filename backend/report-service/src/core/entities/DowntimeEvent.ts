export interface DowntimeEvent {
	id: string
	reportId: string
	reasonCode: string
	description?: string
	startedAt: Date
	endedAt: Date
	durationSeconds: number
	createdAt: Date
}
