import express from 'express'
import dotenv from 'dotenv'
import productionRouter from './src/web/routers/production.router'
import { prisma } from './src/infrastructure/prisma/client'

dotenv.config({ path: '../.env' })

const app = express()
const port = process.env.PORT || 3003

app.use(express.json())
app.use('/api/v1/production', productionRouter)

app.get('/health', async (_req, res) => {
	const started = Date.now()
	try {
		await prisma.$queryRaw`SELECT 1`
		return res.status(200).json({
			status: 'ok',
			service: 'production-service',
			db: 'up',
			latencyMs: Date.now() - started,
		})
	} catch (e) {
		return res.status(503).json({
			status: 'error',
			service: 'production-service',
			db: 'down',
			error: (e as Error).message,
		})
	}
})

app.listen(port, () => {
	console.log(`Production Service running on port ${port}`)
})
