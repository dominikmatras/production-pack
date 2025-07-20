import { IUserService } from '../../core/service/IUserService'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { User } from '../../core/entities/User'

export class LoginUser {
	constructor(private readonly userService: IUserService) {}

	async execute(email: string, password: string): Promise<{ token: string; user: Pick<User, 'id' | 'email' | 'role'> }> {
		const user = await this.userService.findByEmail(email)
		if (!user) throw new Error('Invalid credentials')

		const isPasswordValid = await bcrypt.compare(password, user.password)
		if (!isPasswordValid) throw new Error('Invalid credentials')

		const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '1h' })

		return {
			token,
			user: {
				id: user.id,
				email: user.email,
				role: user.role,
			},
		}
	}
}
