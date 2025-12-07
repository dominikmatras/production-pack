// src/pages/Monitoring.tsx
import { useEffect, useState } from 'react'
import { api } from '../../api/http'
import type { Order } from '../../types/Order'
import { lines } from '../../data/lines'
import { formatTime, formatDurationFrom } from '../../helpers/formatTime'
import { useNavigate } from 'react-router-dom'
import { clearSession, getUser } from '../../helpers/auth'
import { UserBox } from '../../components/UserBox/UserBox'
import './Monitoring.less'

type ProductionLine = (typeof lines)[number]

type LineStatus = 'RUNNING' | 'PAUSED' | 'IDLE'

interface LineView {
	line: ProductionLine
	status: LineStatus
	order?: Order
}

export default function Monitoring() {
	const [lineViews, setLineViews] = useState<LineView[]>(() => lines.map(line => ({ line, status: 'IDLE' as LineStatus })))
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const navigate = useNavigate()
	const role = getUser()?.role ?? 'WORKER'
	function logout() {
		clearSession()
		navigate('/login', { replace: true })
	}

	useEffect(() => {
		let cancelled = false

		const fetchData = async () => {
			setLoading(true)
			setError(null)

			try {
				const results = await Promise.all(
					lines.map(async line => {
						const res = await api.get<Order[]>(`/api/v1/order/line/${encodeURIComponent(line.dbValue)}`)
						const orders = res.data

						const running = orders.find(o => o.status === 'IN_PROGRESS')
						const paused = orders.find(o => o.status === 'PAUSED')

						let status: LineStatus = 'IDLE'
						let activeOrder: Order | undefined

						if (running) {
							status = 'RUNNING'
							activeOrder = running
						} else if (paused) {
							status = 'PAUSED'
							activeOrder = paused
						}

						return { line, status, order: activeOrder } as LineView
					})
				)

				if (!cancelled) {
					setLineViews(results)
				}
			} catch (e) {
				console.error(e)
				if (!cancelled) setError('Nie udało się pobrać danych monitoringu')
			} finally {
				if (!cancelled) setLoading(false)
			}
		}

		fetchData()

		const interval = setInterval(fetchData, 10000) // odśwież co 10 s

		return () => {
			cancelled = true
			clearInterval(interval)
		}
	}, [])

	function labelForStatus(status: LineStatus): string {
		switch (status) {
			case 'RUNNING':
				return 'W produkcji'
			case 'PAUSED':
				return 'Przestój'
			case 'IDLE':
			default:
				return 'Wolna'
		}
	}

	return (
		<div className="monitoring-wrap">
			<header className="monitoring-header">
				<div>
					<h1>Monitoring produkcji</h1>
					<p>Podgląd aktualnego stanu linii produkcyjnych</p>
				</div>
				{loading && <span className="tag">Odświeżanie…</span>}
				<div>
					<button className="btn ghost" onClick={() => navigate('/home')}>
						← Powrót
					</button>
					<UserBox role={role} logout={logout} />
				</div>
			</header>

			{error && <div className="banner error">{error}</div>}

			<div className="monitoring-grid">
				{lineViews.map(view => {
					const { line, status, order } = view

					return (
						<div key={line.id} className={`monitoring-card status-${status.toLowerCase()}`}>
							<div className="monitoring-card__header">
								<div className="pill">{line.shortName}</div>
								<span className={`chip chip-${status.toLowerCase()}`}>{labelForStatus(status)}</span>
							</div>

							<h2>{line.name}</h2>
							<p className="muted">{line.description}</p>

							{order ? (
								<div className="monitoring-card__body">
									<div className="row">
										<span className="label">Produkt</span>
										<span className="value">
											{order.product} <span className="mono">({order.productNumber})</span>
										</span>
									</div>
									<div className="row">
										<span className="label">Ilość</span>
										<span className="value mono">{order.quantity}</span>
									</div>
									<div className="row">
										<span className="label">Start</span>
										<span className="value mono">{formatTime(order.startedAt)}</span>
									</div>
									<div className="row">
										<span className="label">Czas trwania</span>
										<span className="value mono">{formatDurationFrom(order.startedAt)}</span>
									</div>
								</div>
							) : (
								<div className="monitoring-card__empty">{status === 'IDLE' ? 'Brak aktywnego zlecenia' : 'Brak danych o zleceniu'}</div>
							)}
						</div>
					)
				})}
			</div>
		</div>
	)
}
