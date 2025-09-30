import { useEffect, useMemo, useState } from 'react'
import { api } from '../api/http'
import { useNavigate } from 'react-router-dom'
import { clearSession, getUser } from '../helpers/auth'
import { type Order, type OrderStatus } from '../types/Order'
import './orders.less'

export default function Orders() {
	const [orders, setOrders] = useState<Order[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const navigate = useNavigate()

	const [date, setDate] = useState<string>('') // yyyy-mm-dd
	const [line, setLine] = useState<string>('')

	const role = getUser()?.role

	const hasFilters = useMemo(() => !!date || !!line, [date, line])

	const logout = () => {
		clearSession()
		navigate('/login', { replace: true })
	}

	useEffect(() => {
		fetchOrders()
	}, [])

	async function fetchOrders() {
		setLoading(true)
		setError(null)
		try {
			let url = '/api/v1/order'
			if (date) url = `/api/v1/order/date/${date}`
			else if (line) url = `/api/v1/order/line/${encodeURIComponent(line)}`
			const res = await api.get<Order[]>(url)
			setOrders(res.data)
		} catch (e: any) {
			setError(e?.response?.data?.error || 'Nie udało się pobrać zamówień')
		} finally {
			setLoading(false)
		}
	}

	async function applyFilters(e?: React.FormEvent) {
		e?.preventDefault()
		await fetchOrders()
	}

	function formatDateHuman(iso: string) {
		try {
			const d = new Date(iso)
			return d.toLocaleDateString('pl-PL')
		} catch {
			return iso
		}
	}

	async function updateStatusOptimistic(id: string, next: OrderStatus, doCall: () => Promise<any>) {
		const prev = [...orders]
		setOrders(curr => curr.map(order => (order.id === id ? { ...order, status: next } : order)))
		try {
			await doCall()
		} catch (e) {
			console.error(e)
			setOrders(prev)
			setError('Nie udało się zmienić statusu')
			setTimeout(() => setError(null), 3000)
		}
	}

	const start = (id: string) => updateStatusOptimistic(id, 'IN_PROGRESS', () => api.post(`/api/v1/production/start/${id}`))
	const pause = (id: string) => updateStatusOptimistic(id, 'PAUSED', () => api.post(`/api/v1/production/pause/${id}`))
	const resume = (id: string) => updateStatusOptimistic(id, 'IN_PROGRESS', () => api.post(`/api/v1/production/resume/${id}`))
	const stop = (id: string) => updateStatusOptimistic(id, 'COMPLETED', () => api.post(`/api/v1/production/stop/${id}`))

	return (
		<div className="orders-wrap">
			<header className="orders-header">
				<div className="title">
					<h1>Zamówienia</h1>
					<p>Przegląd i zarządzanie produkcją</p>
				</div>
				<div className="userbox">
					<span className="dot" />
					<span>{role}</span>
					<button className="btn tiny ghost" onClick={logout} title="Wyloguj">
						Wyloguj
					</button>
				</div>
			</header>

			<form className="orders-filters" onSubmit={applyFilters}>
				<label className="field">
					<span>Data</span>
					<input type="date" value={date} onChange={e => setDate(e.target.value)} aria-label="Data docelowa" />
				</label>

				<label className="field">
					<span>Linia</span>
					<input type="text" placeholder="np. 8, 9, LINE-01" value={line} onChange={e => setLine(e.target.value)} aria-label="Linia produkcyjna" />
				</label>

				<div className="actions">
					<button className="btn primary" type="submit" disabled={loading}>
						{loading ? 'Ładowanie…' : hasFilters ? 'Zastosuj filtry' : 'Odśwież'}
					</button>
					{hasFilters && (
						<button
							type="button"
							className="btn ghost"
							onClick={() => {
								setDate('')
								setLine('')
								fetchOrders()
							}}>
							Wyczyść
						</button>
					)}
				</div>
			</form>

			{error && <div className="banner error">{error}</div>}

			<div className="orders-card">
				<div className="table-scroll">
					<table className="orders-table">
						<thead>
							<tr>
								<th>Produkt</th>
								<th>Nr</th>
								<th>Ilość</th>
								<th>Linia</th>
								<th>Data</th>
								<th>Godzina</th>
								<th>Status</th>
								<th style={{ width: 280 }}>Akcje</th>
							</tr>
						</thead>
						<tbody>
							{orders.length === 0 && (
								<tr>
									<td colSpan={9} className="empty">
										{loading ? 'Ładowanie…' : 'Brak zamówień dla wybranych filtrów'}
									</td>
								</tr>
							)}

							{orders.map(order => (
								<tr key={order.id}>
									<td>{order.product}</td>
									<td className="mono">{order.productNumber}</td>
									<td className="mono">{order.quantity}</td>
									<td className="mono">{order.productionLine}</td>
									<td className="mono">{formatDateHuman(order.targetDate)}</td>
									<td className="mono">{order.targetHour}</td>
									<td>
										<StatusChip status={order.status} />
									</td>
									<td>
										<div className="row-actions">
											<button className="btn tiny" disabled={order.status !== 'CREATED'} onClick={() => start(order.id)} title="Start">
												Start
											</button>
											<button className="btn tiny" disabled={order.status !== 'IN_PROGRESS'} onClick={() => pause(order.id)} title="Pause">
												Pause
											</button>
											<button className="btn tiny" disabled={order.status !== 'PAUSED'} onClick={() => resume(order.id)} title="Resume">
												Resume
											</button>
											<button
												className="btn tiny danger"
												disabled={order.status === 'COMPLETED' || order.status === 'CANCELLED'}
												onClick={() => stop(order.id)}
												title="Stop">
												Stop
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	)
}

function StatusChip({ status }: { status: OrderStatus }) {
	return <span className={`chip ${status.toLowerCase()}`}>{status.replace('_', ' ')}</span>
}
