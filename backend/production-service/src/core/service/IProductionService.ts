import type { OrderStatus } from '@prisma/client'

export interface DowntimeInfo {
	reasonCode: string
	description?: string
	startedAt: Date
	endedAt: Date
}

export interface ProductionReportData {
	orderId: string
	productionLineId: string
	productCode: string
	producedOk: number
	producedNok: number
	startedAt: Date
	endedAt: Date
	status: OrderStatus
	downtimes: DowntimeInfo[]
}

export interface PauseOptions {
	reasonCode?: string
	description?: string
}

export interface IProductionService {
	startProduction(orderId: string): Promise<void>
	pauseProduction(orderId: string, options?: PauseOptions): Promise<void>
	resumeProduction(orderId: string): Promise<void>
	stopProduction(orderId: string): Promise<ProductionReportData>
}
