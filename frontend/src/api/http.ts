import axios from 'axios'

const runtimeBase = ((window as any).__APP_CONFIG__?.API_BASE_URL as string | undefined) ?? ((window as any).__ENV__?.API_BASE_URL as string | undefined)
const buildBase = import.meta.env.VITE_API_BASE_URL as string | undefined

export const api = axios.create({
	baseURL: runtimeBase ?? buildBase ?? 'https://api.production-pack.dm-tech.pl/',
	withCredentials: false,
})

api.interceptors.request.use(config => {
	const token = localStorage.getItem('access_token')
	const url = config.url || ''

	const isLogin = url.includes('/api/v1/user/login')

	if (token && !isLogin) {
		config.headers = config.headers ?? {}
		;(config.headers as any).Authorization = `Bearer ${token}`
	}

	return config
})
