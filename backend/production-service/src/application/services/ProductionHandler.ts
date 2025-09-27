import { IProductionService } from '../../core/service/IProductionService'

export class ProductionHandler {
	constructor(private readonly service: IProductionService) {}

	start(orderId: string): Promise<void> {
		return this.service.startProduction(orderId)
	}

	pause(orderId: string): Promise<void> {
		return this.service.pauseProduction(orderId)
	}

	resume(orderId: string): Promise<void> {
		return this.service.resumeProduction(orderId)
	}

	stop(orderId: string): Promise<void> {
		return this.service.stopProduction(orderId)
	}
}
