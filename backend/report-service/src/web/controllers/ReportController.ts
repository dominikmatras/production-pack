import type { Request, Response, NextFunction } from 'express'
import { CreateProductionReport } from '../../application/CreateProductionReport'
import { GetReportsByOrderId } from '../../application/GetReportsByOrderId'
import { ListProductionReports } from '../../application/ListProductionReports'

const createProductionReportUseCase = new CreateProductionReport()
const getReportsByOrderIdUseCase = new GetReportsByOrderId()
const listProductionReportsUseCase = new ListProductionReports()

export class ReportController {
	async create(req: Request, res: Response, next: NextFunction) {
		try {
			const result = await createProductionReportUseCase.execute(req.body)
			console.log(`RAPORT CREATED: id=${result.id}`)
			res.status(201).json(result)
		} catch (error) {
			next(error)
		}
	}

	async getByOrderId(req: Request, res: Response, next: NextFunction) {
		try {
			const { orderId } = req.params

			if (!orderId) {
				return res.status(400).json({ error: { message: 'orderId is required' } })
			}

			const reports = await getReportsByOrderIdUseCase.execute(orderId)
			res.json(reports)
		} catch (error) {
			next(error)
		}
	}

	async list(req: Request, res: Response, next: NextFunction) {
		try {
			const { from, to, productionLineId, productCode } = req.query

			const reports = await listProductionReportsUseCase.execute({
				from: from ? String(from) : undefined,
				to: to ? String(to) : undefined,
				productionLineId: productionLineId ? String(productionLineId) : undefined,
				productCode: productCode ? String(productCode) : undefined,
			})

			res.json(reports)
		} catch (error) {
			next(error)
		}
	}
}
