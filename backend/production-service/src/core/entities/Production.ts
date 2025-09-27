export interface ProductionEvent {
	orderId: string
	startedAt?: Date
	pauseAt?: Date
	resumeAt?: Date
	stoppedAt?: Date
}
