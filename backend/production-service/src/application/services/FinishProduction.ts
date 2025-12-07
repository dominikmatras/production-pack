import { OrderStatus } from '@prisma/client'
import type { ReportPayload } from '../../infrastructure/http/ReportClient'
import { ReportClient } from '../../infrastructure/http/ReportClient'

type ProductionStatus = OrderStatus

export interface DowntimeInput {
	reasonCode: string
	description?: string
	startedAt: string | Date
	endedAt: string | Date
}

export interface FinishProductionInput {
	orderId: string
	productionLineId: string
	productCode: string
	producedOk: number
	producedNok: number
	startedAt: string | Date
	endedAt?: string | Date
	status?: ProductionStatus
	downtimes?: DowntimeInput[]
}

export class FinishProduction {
	constructor(private readonly reportClient = new ReportClient()) {}

	async execute(input: FinishProductionInput): Promise<void> {
		const startedAt = this.parseDate(input.startedAt, 'startedAt')
		const endedAt = input.endedAt ? this.parseDate(input.endedAt, 'endedAt') : new Date()
		const status: ProductionStatus = input.status ?? 'COMPLETED'

		const downtimes =
			input.downtimes?.map(d => ({
				reasonCode: d.reasonCode,
				description: d.description,
				startedAt: this.parseDate(d.startedAt, 'downtime.startedAt').toISOString(),
				endedAt: this.parseDate(d.endedAt, 'downtime.endedAt').toISOString(),
			})) ?? []

		try {
			await this.reportClient.sendProductionReport({
				orderId: input.orderId,
				productionLineId: input.productionLineId,
				productCode: input.productCode,
				producedOk: input.producedOk,
				producedNok: input.producedNok,
				startedAt: startedAt.toISOString(),
				endedAt: endedAt.toISOString(),
				status: this.mapReportStatus(status),
				downtimes,
			})
		} catch (err) {
			console.error('[FinishProduction] Failed to send production report:', err)
		}
	}

	private parseDate(value: string | Date, label: string): Date {
		const date = typeof value === 'string' ? new Date(value) : value
		if (Number.isNaN(date.getTime())) {
			throw new Error(`Invalid ${label} date`)
		}
		return date
	}

	private mapReportStatus(status: ProductionStatus): ReportPayload['status'] {
		if (status === 'COMPLETED') return 'COMPLETED'
		if (status === 'CANCELLED') return 'CANCELLED'
		return undefined
	}
}
