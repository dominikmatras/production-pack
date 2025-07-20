import { Order } from '../entities/Order'

export interface IOrderService {
	create(order: Omit<Order, 'id' | 'createdAt'>): Promise<Order>
	findByProductionLine(productionLine: string): Promise<Order[]>
	findByStatus(status: string): Promise<Order[]>
	findAll(): Promise<Order[]>
	findByDate(date: string): Promise<Order[]>
}
