import express from 'express'
import dotenv from 'dotenv'
import orderRoutes from './src/web/routes/order.router'

dotenv.config({ path: '../.env' })

const app = express()
const port = process.env.PORT_ORDER_SERVICE || 3002

app.use(express.json())
app.use('/api/v1/order', orderRoutes)

import { prisma } from './src/infrastructure/prisma/client'

app.get('/health', async (_req, res) => {
	const started = Date.now()
	try {
		await prisma.$queryRaw`SELECT 1`
		res.status(200).json({
			status: 'ok',
			service: 'order-service',
			db: 'up',
			latencyMs: Date.now() - started,
		})
	} catch (e) {
		res.status(503).json({
			status: 'error',
			service: 'order-service',
			db: 'down',
			error: (e as Error).message,
		})
	}
})

app.listen(port, () => {
	console.log(`Order Service running on port ${port}`)
})
