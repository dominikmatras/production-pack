import { useNavigate } from 'react-router-dom'
import { clearSession, getUser } from '../helpers/auth'
import './home.less'

export default function Home() {
	const navigate = useNavigate()
	const role = getUser()?.role ?? 'GUEST'

	function logout() {
		clearSession()
		navigate('/login', { replace: true })
	}

	return (
		<div className="home-wrap">
			<header className="home-header">
				<div className="title">
					<h1>Production Pack</h1>
					<p>Szybki dostęp do modułów systemu</p>
				</div>
				<div className="userbox">
					<span className="dot" />
					<span>{role}</span>
					<button className="logout" onClick={logout}>
						Wyloguj
					</button>
				</div>
			</header>

			<section className="tiles">
				<Tile title="Zamówienia" description="Przegląd, filtrowanie i sterowanie produkcją" onClick={() => navigate('/orders')} icon="📦" />
				<Tile title="Dodaj zamówienie" description="Utwórz nowe zlecenie produkcyjne" onClick={() => navigate('/orders/new')} icon="➕" />
				<Tile title="Monitoring produkcji" description="Podgląd postępu na liniach (wkrótce)" icon="⌛" disabled />
				<Tile title="Raporty" description="Czasy realizacji, KPI (wkrótce)" icon="📊" disabled />
			</section>

			<div className="quick-actions">
				<button className="btn primary" onClick={() => navigate('/orders')}>
					Przejdź do Orders
				</button>
				<button className="btn" onClick={() => navigate('/orders/new')}>
					Dodaj zamówienie
				</button>
			</div>
		</div>
	)
}

function Tile({ title, description, onClick, disabled, icon }: { title: string; description: string; onClick?: () => void; disabled?: boolean; icon?: string }) {
	return (
		<div
			className={`tile ${disabled ? 'disabled' : ''}`}
			role="button"
			tabIndex={0}
			aria-disabled={!!disabled}
			onClick={() => !disabled && onClick?.()}
			onKeyDown={e => {
				if (!disabled && (e.key === 'Enter' || e.key === ' ')) onClick?.()
			}}>
			<div className="tile-icon" aria-hidden="true">
				{icon ?? '•'}
			</div>
			<h3>{title}</h3>
			<p>{description}</p>
		</div>
	)
}
