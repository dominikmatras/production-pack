export type Order = {
	id: string
	product: string
	productNumber: string
	quantity: number
	productionLine: string
	targetDate: string
	targetHour: string
	status: OrderStatus
	startedAt?: string
}
export type OrderStatus = 'CREATED' | 'PENDING' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'
