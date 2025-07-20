import { PrismaClient } from '@prisma/client'
import type { IUserService } from '../../core/service/IUserService'
import type { User } from '../../core/entities/User'
type UserRole = 'WORKER' | 'MANAGER' | 'ADMIN'

const prisma = new PrismaClient()

export class PrismaUserService implements IUserService {
	async findByEmail(email: string): Promise<User | null> {
		const result = await prisma.user.findUnique({ where: { email } })
		if (!result) return null

		const { id, email: emailValue, username, password, role, createdAt } = result

		return {
			id,
			email: emailValue,
			username,
			password,
			role: role as UserRole,
			createdAt,
		}
	}

	async create(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
		const result = await prisma.user.create({ data: user })

		const { id, email, username, password, role, createdAt } = result

		return {
			id,
			email,
			username,
			password,
			role: role as UserRole,
			createdAt,
		}
	}
}
