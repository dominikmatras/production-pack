import type { ReportStatus } from '../core/entities/ReportStatus'
import type { IReportService } from '../core/service/IReportService'
import { PrismaReportService } from '../infrastructure/prisma/PrismaReportService'

export interface CreateProductionReportInput {
	orderId: string
	productionLineId: string
	productCode: string
	producedOk: number
	producedNok: number
	startedAt: string
	endedAt: string
	status?: ReportStatus
	downtimes?: {
		reasonCode: string
		description?: string
		startedAt: string
		endedAt: string
	}[]
}

export class CreateProductionReport {
	constructor(private readonly reportService: IReportService = new PrismaReportService()) {}

	async execute(input: CreateProductionReportInput) {
		const startedAt = new Date(input.startedAt)
		const endedAt = new Date(input.endedAt)

		if (Number.isNaN(startedAt.getTime()) || Number.isNaN(endedAt.getTime())) {
			throw new Error('Invalid startedAt or endedAt date format')
		}

		const downtimes =
			input.downtimes?.map(d => {
				const ds = new Date(d.startedAt)
				const de = new Date(d.endedAt)

				if (Number.isNaN(ds.getTime()) || Number.isNaN(de.getTime())) {
					throw new Error('Invalid downtime date format')
				}

				return {
					reasonCode: d.reasonCode,
					description: d.description,
					startedAt: ds,
					endedAt: de,
				}
			}) ?? []

		return this.reportService.create({
			orderId: input.orderId,
			productionLineId: input.productionLineId,
			productCode: input.productCode,
			producedOk: input.producedOk,
			producedNok: input.producedNok,
			startedAt,
			endedAt,
			status: input.status,
			downtimes,
		})
	}
}
