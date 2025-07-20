import express from 'express'
import { register, login } from '../controllers/AuthController'
import { AuthRequest, authToken } from '../middleware/authMiddleware'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.get('/me', authToken, (req: AuthRequest, res) => {
	res.status(200).json(req.user)
})

export default router
