export type ReportStatus = 'COMPLETED' | 'PARTIAL' | 'CANCELLED' | 'ERROR'

export interface DowntimeEvent {
	id: string
	reasonCode: string
	description?: string | null
	startedAt: string
	endedAt: string
	durationSeconds: number
}

export interface ProductionReport {
	id: string
	orderId: string
	productionLineId: string
	productCode: string
	producedOk: number
	producedNok: number
	startedAt: string
	endedAt: string
	durationSeconds: number
	status: ReportStatus
	createdAt: string
	updatedAt: string
	downtimes?: DowntimeEvent[]
}
