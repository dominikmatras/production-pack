import { Response, Request, RequestHandler } from 'express'
import { CreateOrder } from '../../application/services/CreateOrder'
import { PrismaOrderService } from '../../infrastructure/prisma/PrismaOrderService'

const orderService = new PrismaOrderService()
const createOrder = new CreateOrder(orderService)

export const create: RequestHandler = async (req, res) => {
	try {
		const data = req.body
		const order = await createOrder.execute(data)
		console.log(`ORDER CREATED: id=${order.id} status=${order.status}`)
		res.status(201).json(order)
	} catch (e: any) {
		res.status(400).json({ error: e.message })
	}
}

export const getAll: RequestHandler = async (_req, res) => {
	const orders = await orderService.findAll()
	res.status(200).json(orders)
}

export const getByDate: RequestHandler = async (req, res) => {
	const { date } = req.params
	if (!date) {
		res.status(400).json({ error: 'Missing date' })
		return
	}

	const orders = await orderService.findByDate(date)
	res.status(200).json(orders)
}

export const getByProductionLine: RequestHandler = async (req, res) => {
	const { line } = req.params
	if (!line) {
		res.status(400).json({ error: 'Missing production line' })
		return
	}

	const orders = await orderService.findByProductionLine(line)
	res.status(200).json(orders)
}

export const getByStatus: RequestHandler = async (req, res) => {
	const { status } = req.params
	if (!status) {
		res.status(400).json({ error: 'Missing status' })
		return
	}

	const orders = await orderService.findByStatus(status)
	res.status(200).json(orders)
}
