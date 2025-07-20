import express from 'express'
import dotenv from 'dotenv'
import authRoutes from './src/web/routes/auth.routes'

dotenv.config({ path: '../.env' })

const app = express()
const port = process.env.PORT_USER_SERVICE || 3001

app.use(express.json())
app.use('/api/v1/user', authRoutes)

app.listen(port, () => {
	console.log(`User Service running on port ${port}`)
})
