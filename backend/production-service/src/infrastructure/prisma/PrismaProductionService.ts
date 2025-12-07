import { PrismaClient, OrderStatus } from '@prisma/client'
import { IProductionService, ProductionReportData, DowntimeInfo, PauseOptions } from '../../core/service/IProductionService'

const prisma = new PrismaClient()

export class PrismaProductionService implements IProductionService {
	async startProduction(orderId: string): Promise<void> {
		await prisma.order.update({
			where: { id: orderId },
			data: {
				status: 'IN_PROGRESS',
				startedAt: new Date(),
			},
		})
	}

	async pauseProduction(orderId: string, options?: PauseOptions): Promise<void> {
		const now = new Date()

		await prisma.order.update({
			where: { id: orderId },
			data: {
				status: 'PAUSED' as OrderStatus,
				pausedAt: now,
				pauseReasonCode: options?.reasonCode ?? null,
				pauseReasonDescription: options?.description ?? null,
			},
		})
	}

	async resumeProduction(orderId: string): Promise<void> {
		await prisma.order.update({
			where: { id: orderId },
			data: {
				status: 'IN_PROGRESS',
				resumedAt: new Date(),
			},
		})
	}

	async stopProduction(orderId: string): Promise<ProductionReportData> {
		const now = new Date()

		const order = await prisma.order.update({
			where: { id: orderId },
			data: {
				status: 'COMPLETED' as OrderStatus,
				stoppedAt: now,
			},
		})

		if (!order.startedAt) {
			throw new Error('Production has no startedAt timestamp – cannot build report')
		}

		const downtimes: DowntimeInfo[] = []

		if (order.pausedAt && order.resumedAt) {
			downtimes.push({
				reasonCode: order.pauseReasonCode ?? 'PAUSE',
				description: order.pauseReasonDescription ?? 'Automatic downtime from pause/resume',
				startedAt: order.pausedAt,
				endedAt: order.resumedAt,
			})
		}

		const reportData: ProductionReportData = {
			orderId: order.product,
			productionLineId: order.productionLine,
			productCode: order.productNumber,
			producedOk: order.quantity,
			producedNok: 0,
			startedAt: order.startedAt,
			endedAt: order.stoppedAt ?? now,
			status: order.status,
			downtimes,
		}

		return reportData
	}
}
