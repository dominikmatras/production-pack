import { PrismaClient, OrderStatus } from '@prisma/client'
import type { IOrderService } from '../../core/service/IOrderService'
import type { Order } from '../../core/entities/Order'

const prisma = new PrismaClient()

export class PrismaOrderService implements IOrderService {
	async create(order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
		const result = await prisma.order.create({ data: order })

		return {
			id: result.id,
			productionLine: result.productionLine,
			status: result.status,
			createdAt: result.createdAt,
			quantity: result.quantity,
			product: result.product,
			productNumber: result.productNumber,
			targetDate: result.targetDate,
			targetHour: result.targetHour,
		}
	}

	async findAll(): Promise<Order[]> {
		return prisma.order.findMany()
	}

	async findByDate(date: string): Promise<Order[]> {
		return prisma.order.findMany({
			where: {
				targetDate: new Date(date),
			},
		})
	}

	async findByProductionLine(productionLine: string): Promise<Order[]> {
		return prisma.order.findMany({
			where: { productionLine },
		})
	}

	async findByStatus(status: string): Promise<Order[]> {
		return prisma.order.findMany({
			where: { status: status as OrderStatus },
		})
	}
}
