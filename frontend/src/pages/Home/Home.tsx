import { useNavigate } from 'react-router-dom'
import { clearSession, getUser } from '../../helpers/auth'
import { UserBox } from '../../components/UserBox/UserBox'
import './Home.less'

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
				<UserBox role={role} logout={logout} />
			</header>

			<section className="tiles">
				<Tile title="Zamówienia" description="Przegląd, filtrowanie i sterowanie produkcją" onClick={() => navigate('/orders')} icon="📦" />
				<Tile title="Dodaj zamówienie" description="Utwórz nowe zlecenie produkcyjne" onClick={() => navigate('/orders/new')} icon="➕" />
				<Tile title="Monitoring produkcji" description="Podgląd postępu na liniach" onClick={() => navigate('/monitoring')} icon="⌛" />
				<Tile title="Raporty" description="Lista zakończonych zamówień" onClick={() => navigate('/reports')} icon="📊" />
			</section>
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
