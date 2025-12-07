import dotenv from 'dotenv'
import express from 'express'
import reportRoutes from './src/web/routes/reportRoutes'
import { errorHandler } from './src/web/middleware/errorHandler'
import { notFoundHandler } from './src/web/middleware/notFoundHandler'

dotenv.config({ path: '../.env' })

const app = express()
const port = process.env.PORT_REPORTING_SERVICE || 3004

app.use(express.json())

app.get('/health', (_req, res) => {
	res.json({ status: 'ok', service: 'report-service' })
})

app.use('/api/v1/report', reportRoutes)

app.use(notFoundHandler)
app.use(errorHandler)

app.listen(port, () => {
	console.log(`Report Service listening on port ${port}`)
})
