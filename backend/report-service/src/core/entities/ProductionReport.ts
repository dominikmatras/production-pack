import type { DowntimeEvent } from './DowntimeEvent'
import type { ReportStatus } from './ReportStatus'

export interface ProductionReport {
	id: string
	orderId: string
	productionLineId: string
	productCode: string
	producedOk: number
	producedNok: number
	startedAt: Date
	endedAt: Date
	durationSeconds: number
	status: ReportStatus
	downtimes: DowntimeEvent[]
	createdAt: Date
	updatedAt: Date
}

export interface CreateProductionReport {
	orderId: string
	productionLineId: string
	productCode: string
	producedOk: number
	producedNok: number
	startedAt: Date
	endedAt: Date
	status?: ReportStatus
	downtimes?: CreateDowntimeEvent[]
}

export interface CreateDowntimeEvent {
	reasonCode: string
	description?: string
	startedAt: Date
	endedAt: Date
}
