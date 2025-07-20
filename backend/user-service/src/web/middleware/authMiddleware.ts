import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { UserRole } from '../../core/entities/UserRole'

export interface AuthRequest extends Request {
	user?: {
		userId: string
		email: string
		role: UserRole
	}
}

export const authToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
	const authHeader = req.headers.authorization
	const token = authHeader && authHeader.split(' ')[1]

	if (!token) {
		res.status(401).json({ error: 'No token provided' })
		return
	}

	try {
		const secret = process.env.JWT_SECRET as string
		const decoded = jwt.verify(token, secret) as AuthRequest['user']
		req.user = decoded
		next()
	} catch (err) {
		res.status(403).json({ error: 'Invalid token' })
	}
}
