import type { IUserService } from '../../core/service/IUserService'
import bcrypt from 'bcrypt'
import type { User } from '../../core/entities/User'

export class RegisterUser {
	constructor(private readonly userService: IUserService) {}

	async execute(data: { username: string; email: string; password: string; role: User['role'] }): Promise<User> {
		const existing = await this.userService.findByEmail(data.email)
		if (existing) throw new Error('Email already in use')

		const hashedPassword = await bcrypt.hash(data.password, 10)

		const user = await this.userService.create({
			username: data.username,
			email: data.email,
			password: hashedPassword,
			role: data.role,
		})

		return user
	}
}
