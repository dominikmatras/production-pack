import type { ProductionReport, CreateProductionReport } from '../entities/ProductionReport'

export interface ReportFilter {
	from?: Date
	to?: Date
	productionLineId?: string
	productCode?: string
}

export interface IReportService {
	create(report: CreateProductionReport): Promise<ProductionReport>

	findByOrderId(orderId: string): Promise<ProductionReport[]>

	findByFilter(filter: ReportFilter): Promise<ProductionReport[]>
}
