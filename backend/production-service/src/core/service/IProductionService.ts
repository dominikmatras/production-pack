export interface IProductionService {
	startProduction(orderId: string): Promise<void>
	pauseProduction(orderId: string): Promise<void>
	resumeProduction(orderId: string): Promise<void>
	stopProduction(orderId: string): Promise<void>
}
