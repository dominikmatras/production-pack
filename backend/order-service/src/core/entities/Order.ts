import type { OrderStatus } from './OrderStatus'

export interface Order {
	id: string
	product: string
	productNumber: string
	quantity: number
	productionLine: string
	targetDate: Date
	targetHour: string
	status: OrderStatus
	createdAt: Date
}
