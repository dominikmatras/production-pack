import { IProductionService, PauseOptions } from '../../core/service/IProductionService'
import { FinishProduction } from './FinishProduction'

export class ProductionHandler {
	constructor(private readonly service: IProductionService, private readonly finishProduction: FinishProduction) {}

	start(orderId: string): Promise<void> {
		return this.service.startProduction(orderId)
	}

	pause(orderId: string, options?: PauseOptions): Promise<void> {
		return this.service.pauseProduction(orderId, options)
	}

	resume(orderId: string): Promise<void> {
		return this.service.resumeProduction(orderId)
	}

	async stop(orderId: string): Promise<void> {
		const data = await this.service.stopProduction(orderId)

		await this.finishProduction.execute({
			orderId: data.orderId,
			productionLineId: data.productionLineId,
			productCode: data.productCode,
			producedOk: data.producedOk,
			producedNok: data.producedNok,
			startedAt: data.startedAt,
			endedAt: data.endedAt,
			status: data.status,
			downtimes: data.downtimes.map(d => ({
				reasonCode: d.reasonCode,
				description: d.description,
				startedAt: d.startedAt,
				endedAt: d.endedAt,
			})),
		})
	}
}
