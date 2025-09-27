import express from 'express'
import dotenv from 'dotenv'
import productionRouter from './src/web/routers/production.router'

dotenv.config({ path: '../.env' })

const app = express()
const port = process.env.PORT_PRODUCTION_SERVICE || 3003

app.use(express.json())
app.use('/api/v1/production', productionRouter)

app.listen(port, () => {
	console.log(`Production Service running on port ${port}`)
})
