import express from 'express'
import dotenv from 'dotenv'
import orderRoutes from './src/web/routes/order.router'

dotenv.config({ path: '../.env' })

const app = express()
const port = process.env.PORT_ORDER_SERVICE || 3002

app.use(express.json())
app.use('/api/v1/order', orderRoutes)

app.listen(port, () => {
	console.log(`Order Service running on port ${port}`)
})
