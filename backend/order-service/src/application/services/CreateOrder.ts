import { Order } from '../../core/entities/Order'
import type { IOrderService } from '../../core/service/IOrderService'

export class CreateOrder {
	constructor(private readonly orderService: IOrderService) {}

	async execute(data: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
		return this.orderService.create(data)
	}
}
