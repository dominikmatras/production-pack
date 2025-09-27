import { PrismaClient, OrderStatus } from '@prisma/client'
import { IProductionService } from '../../core/service/IProductionService'

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

	async pauseProduction(orderId: string): Promise<void> {
		await prisma.order.update({
			where: { id: orderId },
			data: {
				status: 'PAUSED',
				pausedAt: new Date(),
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

	async stopProduction(orderId: string): Promise<void> {
		await prisma.order.update({
			where: { id: orderId },
			data: {
				status: 'COMPLETED',
				stoppedAt: new Date(),
			},
		})
	}
}
