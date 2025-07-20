import type { UserRole } from './UserRole'

export interface User {
	id: string
	username: string
	email: string
	password: string
	role: UserRole
	createdAt: Date
}
