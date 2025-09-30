export type Order = {
	id: string
	product: string
	productNumber: string
	quantity: number
	productionLine: string
	targetDate: string
	targetHour: string
	status: OrderStatus
}
export type OrderStatus = 'CREATED' | 'PENDING' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'
