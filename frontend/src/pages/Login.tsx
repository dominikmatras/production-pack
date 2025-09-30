import { useState } from 'react'
import { api } from '../api/http'
import { useNavigate } from 'react-router-dom'
import './auth.less'

export default function Login() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [showPassword, setShowPassword] = useState(false)
	const [remember, setRemember] = useState(true)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const navigate = useNavigate()

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		setError(null)
		setLoading(true)
		try {
			const res = await api.post('/api/v1/user/login', { email, password })
			const { token, user } = res.data

			localStorage.setItem('access_token', token)
			localStorage.setItem('user', JSON.stringify(user))

			if (user.role === 'worker') {
				navigate('/orders', { replace: true })
			} else {
				navigate('/orders', { replace: true })
			}
		} catch (err: any) {
			setError(err?.response?.data?.error || 'Nie udało się zalogować')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="auth-grid">
			<aside className="auth-aside">
				<div className="auth-brand">
					<Logo />
					<h1>Production&nbsp;Pack</h1>
					<p>Zarządzanie zamówieniami i produkcją w jednym miejscu.</p>
				</div>

				<footer className="auth-footer">
					<small>© {new Date().getFullYear()} Production Pack</small>
				</footer>
			</aside>

			<main className="auth-main">
				<div className="auth-card" role="dialog" aria-labelledby="login-title">
					<h2 id="login-title">Zaloguj się</h2>
					<p className="auth-subtitle">Wprowadź dane dostępowe do panelu</p>

					<form onSubmit={handleSubmit} noValidate>
						<label className="auth-field">
							<span>E-mail</span>
							<input type="email" inputMode="email" autoComplete="email" placeholder="jan@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
						</label>

						<label className="auth-field">
							<span>Hasło</span>
							<div className="auth-password">
								<input
									type={showPassword ? 'text' : 'password'}
									autoComplete="current-password"
									placeholder="••••••••"
									required
									minLength={6}
									value={password}
									onChange={e => setPassword(e.target.value)}
								/>
								<button type="button" className="ghost" aria-label={showPassword ? 'Ukryj hasło' : 'Pokaż hasło'} onClick={() => setShowPassword(v => !v)}>
									{showPassword ? 'Ukryj' : 'Pokaż'}
								</button>
							</div>
						</label>

						<div className="auth-row">
							<label className="auth-check">
								<input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
								<span>Zapamiętaj mnie</span>
							</label>
							<a className="auth-link" href="#" onClick={e => e.preventDefault()}>
								Nie pamiętasz hasła?
							</a>
						</div>

						{error && (
							<div className="auth-error" role="alert">
								{error}
							</div>
						)}

						<button className="auth-submit" disabled={loading}>
							{loading ? 'Logowanie…' : 'Zaloguj się'}
						</button>
					</form>

					{/* <div className="auth-divider">
						<span>lub</span>
					</div>

					<div className="auth-actions">
						<button className="outline" type="button" onClick={() => alert('SSO wkrótce 😉')}>
							Zaloguj przez SSO
						</button>
					</div> */}
				</div>
			</main>
		</div>
	)
}

function Logo() {
	return (
		<svg width="40" height="40" viewBox="0 0 48 48" aria-hidden="true">
			<defs>
				<linearGradient id="g" x1="0" x2="1">
					<stop offset="0" stopColor="#618C7C" />
					<stop offset="1" stopColor="#011640" />
				</linearGradient>
			</defs>
			<rect x="4" y="4" width="40" height="40" rx="10" fill="url(#g)" />
			<path d="M14 30l7-11 5 8 3-4 5 7" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
		</svg>
	)
}
