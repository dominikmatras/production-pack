import { prisma } from './client'
import type { ProductionReport as DomainProductionReport, CreateProductionReport, CreateDowntimeEvent } from '../../core/entities/ProductionReport'
import type { IReportService, ReportFilter } from '../../core/service/IReportService'
import type { ProductionReport as PrismaProductionReport, DowntimeEvent as PrismaDowntimeEvent } from '@prisma/client'

export class PrismaReportService implements IReportService {
	async create(report: CreateProductionReport): Promise<DomainProductionReport> {
		const { startedAt, endedAt } = report

		const durationSeconds = this.calculateDuration(startedAt, endedAt)

		const downtimesData = (report.downtimes ?? []).map((d: CreateDowntimeEvent) => {
			const ds = d.startedAt
			const de = d.endedAt

			return {
				reasonCode: d.reasonCode,
				description: d.description,
				startedAt: ds,
				endedAt: de,
				durationSeconds: this.calculateDuration(ds, de),
			}
		})

		const created = await prisma.productionReport.create({
			data: {
				orderId: report.orderId,
				productionLineId: report.productionLineId,
				productCode: report.productCode,
				producedOk: report.producedOk,
				producedNok: report.producedNok,
				startedAt,
				endedAt,
				durationSeconds,
				status: report.status ?? 'COMPLETED',
				downtimes: downtimesData.length
					? {
							create: downtimesData,
					  }
					: undefined,
			},
			include: {
				downtimes: true,
			},
		})

		return this.mapPrismaToDomain(created)
	}

	async findByOrderId(orderId: string): Promise<DomainProductionReport[]> {
		const reports = await prisma.productionReport.findMany({
			where: { orderId },
			include: { downtimes: true },
			orderBy: { startedAt: 'asc' },
		})

		return reports.map(r => this.mapPrismaToDomain(r))
	}

	async findByFilter(filter: ReportFilter): Promise<DomainProductionReport[]> {
		const where: any = {}

		if (filter.from || filter.to) {
			where.startedAt = {}
			if (filter.from) {
				where.startedAt.gte = filter.from
			}
			if (filter.to) {
				where.startedAt.lte = filter.to
			}
		}

		if (filter.productionLineId) {
			where.productionLineId = filter.productionLineId
		}

		if (filter.productCode) {
			where.productCode = filter.productCode
		}

		const reports = await prisma.productionReport.findMany({
			where,
			include: { downtimes: true },
			orderBy: { startedAt: 'desc' },
		})

		return reports.map(r => this.mapPrismaToDomain(r))
	}

	private calculateDuration(start: Date, end: Date): number {
		const diffMs = end.getTime() - start.getTime()
		return Math.max(0, Math.floor(diffMs / 1000))
	}

	private mapPrismaToDomain(report: PrismaProductionReport & { downtimes: PrismaDowntimeEvent[] }): DomainProductionReport {
		return {
			id: report.id,
			orderId: report.orderId,
			productionLineId: report.productionLineId,
			productCode: report.productCode,
			producedOk: report.producedOk,
			producedNok: report.producedNok,
			startedAt: report.startedAt,
			endedAt: report.endedAt,
			durationSeconds: report.durationSeconds,
			status: report.status as DomainProductionReport['status'],
			downtimes: report.downtimes.map(d => ({
				id: d.id,
				reportId: d.reportId,
				reasonCode: d.reasonCode,
				description: d.description ?? undefined,
				startedAt: d.startedAt,
				endedAt: d.endedAt,
				durationSeconds: d.durationSeconds,
				createdAt: d.createdAt,
			})),
			createdAt: report.createdAt,
			updatedAt: report.updatedAt,
		}
	}
}
