import type { IReportService } from '../core/service/IReportService'
import { PrismaReportService } from '../infrastructure/prisma/PrismaReportService'

export class GetReportsByOrderId {
	constructor(private readonly reportService: IReportService = new PrismaReportService()) {}

	async execute(orderId: string) {
		return this.reportService.findByOrderId(orderId)
	}
}
