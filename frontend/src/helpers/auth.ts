export type Role = 'WORKER' | 'MANAGER' | 'ADMIN'
export type UserDTO = { id: string; email: string; role: Role }

const TOKEN_KEY = 'access_token'
const USER_KEY = 'user'

export function saveSession(token: string, user: UserDTO) {
	localStorage.setItem(TOKEN_KEY, token)
	localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession() {
	localStorage.removeItem(TOKEN_KEY)
	localStorage.removeItem(USER_KEY)
}

export function getToken() {
	return localStorage.getItem(TOKEN_KEY)
}

export function getUser(): UserDTO | null {
	const raw = localStorage.getItem(USER_KEY)
	try {
		return raw ? JSON.parse(raw) : null
	} catch {
		return null
	}
}
