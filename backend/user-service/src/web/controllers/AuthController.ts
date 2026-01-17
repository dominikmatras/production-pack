import type { Request, Response } from 'express'
import { RegisterUser } from '../../application/services/RegisterUser'
import { LoginUser } from '../../application/services/LoginUser'
import { PrismaUserService } from '../../infrastructure/prisma/PrismaUserService'

const userService = new PrismaUserService()
const registerUser = new RegisterUser(userService)
const loginUser = new LoginUser(userService)

export const register = async (req: Request, res: Response) => {
	try {
		const user = await registerUser.execute(req.body)
		console.log(`USER CREATED: email=${user.email}`)
		res.status(201).json({ id: user.id, email: user.email, role: user.role })
	} catch (e: any) {
		res.status(400).json({ error: e.message })
	}
}

export const login = async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body
		const result = await loginUser.execute(email, password)
		console.log(`LOGIN: email=${email}`)
		res.status(200).json(result)
	} catch (e: any) {
		res.status(401).json({ error: e.message })
	}
}
