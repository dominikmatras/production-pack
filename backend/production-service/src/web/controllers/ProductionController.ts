import { Request, Response } from 'express'
import { PrismaProductionService } from '../../infrastructure/prisma/PrismaProductionService'
import { ProductionHandler } from '../../application/services/ProductionHandler'

const productionService = new PrismaProductionService()
const productionHandler = new ProductionHandler(productionService)

export const startProduction = async (req: Request, res: Response): Promise<void> => {
	const { id } = req.params
	if (!id) {
		res.status(400).json({ error: 'Production ID is required' })
		return
	}

	await productionHandler.start(id)
	res.status(200).json({ message: 'Production started' })
}

export const pauseProduction = async (req: Request, res: Response): Promise<void> => {
	const { id } = req.params
	if (!id) {
		res.status(400).json({ error: 'Production ID is required' })
		return
	}

	await productionHandler.pause(id)
	res.status(200).json({ message: 'Production paused' })
}

export const resumeProduction = async (req: Request, res: Response): Promise<void> => {
	const { id } = req.params
	if (!id) {
		res.status(400).json({ error: 'Production ID is required' })
		return
	}

	await productionHandler.resume(id)
	res.status(200).json({ message: 'Production resumed' })
}

export const stopProduction = async (req: Request, res: Response): Promise<void> => {
	const { id } = req.params
	if (!id) {
		res.status(400).json({ error: 'Production ID is required' })
		return
	}

	await productionHandler.stop(id)
	res.status(200).json({ message: 'Production stopped' })
}
