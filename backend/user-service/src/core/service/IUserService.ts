import type { User } from '../entities/User'

export interface IUserService {
	findByEmail(email: string): Promise<User | null>
	create(user: Omit<User, 'id' | 'createdAt'>): Promise<User>
}
