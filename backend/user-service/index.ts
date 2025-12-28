import express, { Request, Response } from 'express'
import dotenv from 'dotenv'
import authRoutes from './src/web/routes/auth.routes'
import { prisma } from './src/infrastructure/prisma/client'

dotenv.config({ path: '../.env' })

const app = express()
const port = process.env.PORT || 3001

app.use(express.json())
app.use('/api/v1/user', authRoutes)

app.get('/health', async (_req, res) => {
	const started = Date.now()
	try {
		await prisma.$queryRaw`SELECT 1`
		res.status(200).json({
			status: 'ok',
			service: 'user-service',
			db: 'up',
			latencyMs: Date.now() - started,
		})
	} catch (e) {
		res.status(503).json({
			status: 'error',
			service: 'user-service',
			db: 'down',
			error: (e as Error).message,
		})
	}
})

app.listen(port, () => {
	console.log(`User Service running on port ${port}`)
})
