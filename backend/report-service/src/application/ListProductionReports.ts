import type { IReportService } from '../core/service/IReportService'
import { PrismaReportService } from '../infrastructure/prisma/PrismaReportService'

export interface ListProductionReportsInput {
	from?: string
	to?: string
	productionLineId?: string
	productCode?: string
}

export class ListProductionReports {
	constructor(private readonly reportService: IReportService = new PrismaReportService()) {}

	async execute(input: ListProductionReportsInput) {
		const from = input.from ? new Date(input.from) : undefined
		const to = input.to ? new Date(input.to) : undefined

		if (from && Number.isNaN(from.getTime())) {
			throw new Error('Invalid "from" date format')
		}
		if (to && Number.isNaN(to.getTime())) {
			throw new Error('Invalid "to" date format')
		}

		return this.reportService.findByFilter({
			from,
			to,
			productionLineId: input.productionLineId,
			productCode: input.productCode,
		})
	}
}
