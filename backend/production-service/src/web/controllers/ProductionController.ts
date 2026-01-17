import { Request, Response } from 'express'
import { PrismaProductionService } from '../../infrastructure/prisma/PrismaProductionService'
import { ProductionHandler } from '../../application/services/ProductionHandler'
import { FinishProduction } from '../../application/services/FinishProduction'

const productionService = new PrismaProductionService()
const finishProduction = new FinishProduction()
const productionHandler = new ProductionHandler(productionService, finishProduction)

export const startProduction = async (req: Request, res: Response): Promise<void> => {
	const { id } = req.params
	if (!id) {
		res.status(400).json({ error: 'Production ID is required' })
		return
	}

	await productionHandler.start(id)
	console.log(`PRODUCTION STARTED: id=${id}`)
	res.status(200).json({ message: 'Production started' })
}

export const pauseProduction = async (req: Request, res: Response): Promise<void> => {
	const { id } = req.params
	if (!id) {
		res.status(400).json({ error: 'Production ID is required' })
		return
	}

	const { reasonCode, description } = req.body as {
		reasonCode?: string
		description?: string
	}

	await productionHandler.pause(id, { reasonCode, description })

	console.log(`PRODUCTION PAUSED: id=${id}`)
	res.status(200).json({ message: 'Production paused' })
}

export const resumeProduction = async (req: Request, res: Response): Promise<void> => {
	const { id } = req.params
	if (!id) {
		res.status(400).json({ error: 'Production ID is required' })
		return
	}

	await productionHandler.resume(id)
	console.log(`PRODUCTION RESUMED: id=${id}`)
	res.status(200).json({ message: 'Production resumed' })
}

export const stopProduction = async (req: Request, res: Response): Promise<void> => {
	const { id } = req.params
	if (!id) {
		res.status(400).json({ error: 'Production ID is required' })
		return
	}

	await productionHandler.stop(id)
	console.log(`PRODUCTION STOPPED: id=${id}`)
	res.status(200).json({ message: 'Production stopped' })
}
