import { useEffect, useMemo, useState } from 'react'
import { api } from '../../api/http'
import type { ProductionReport } from '../../types/Report'
import { useNavigate } from 'react-router-dom'
import { clearSession, getUser } from '../../helpers/auth'
import { UserBox } from '../../components/UserBox/UserBox'
import './Report.less'

export default function Reports() {
	const [reports, setReports] = useState<ProductionReport[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [expandedId, setExpandedId] = useState<string | null>(null)

	const navigate = useNavigate()
	const role = getUser()?.role ?? 'WORKER'
	function logout() {
		clearSession()
		navigate('/login', { replace: true })
	}

	useEffect(() => {
		let cancelled = false

		const fetchReports = async () => {
			setLoading(true)
			setError(null)

			try {
				const res = await api.get<ProductionReport[]>('/api/v1/report/production')
				if (!cancelled) {
					setReports(res.data)
				}
			} catch (e) {
				console.error(e)
				if (!cancelled) setError('Nie udało się pobrać raportów produkcyjnych')
			} finally {
				if (!cancelled) setLoading(false)
			}
		}

		fetchReports()
		return () => {
			cancelled = true
		}
	}, [])

	const sortedReports = useMemo(
		() =>
			[...reports].sort((a, b) => {
				const da = new Date(a.startedAt).getTime()
				const db = new Date(b.startedAt).getTime()
				return db - da // najnowsze na górze
			}),
		[reports]
	)

	const toggleExpand = (id: string) => {
		setExpandedId(prev => (prev === id ? null : id))
	}

	return (
		<div className="reports-wrap">
			<header className="reports-header">
				<div>
					<h1>Raporty produkcyjne</h1>
					<p>Lista zakończonych zleceń z czasami, scrapem i przestojami</p>
				</div>
				{loading && <span className="tag">Ładowanie…</span>}
				<div>
					<button className="btn ghost" onClick={() => navigate('/home')}>
						← Powrót
					</button>
					<UserBox role={role} logout={logout} />
				</div>
			</header>

			{error && <div className="banner error">{error}</div>}

			{sortedReports.length === 0 && <div className="reports-empty">{loading ? 'Ładowanie…' : 'Brak raportów produkcyjnych'}</div>}

			<div className="reports-list">
				{sortedReports.map(report => {
					const scrapRate = calcScrapRate(report.producedOk, report.producedNok)
					const downtimeSummary = summarizeDowntimes(report)
					const isOpen = expandedId === report.id

					return (
						<div key={report.id} className={`report-card ${isOpen ? 'open' : ''}`}>
							<button type="button" className="report-card__header" onClick={() => toggleExpand(report.id)}>
								<div className="report-card__main">
									<div className="report-card__title-row">
										<span className="mono small">{formatDate(report.startedAt)}</span>
										<span className="mono small">Linia {report.productionLineId}</span>
										<span className="mono small">Order: {report.orderId}</span>
										<span className="mono small">Produkt: {report.productCode}</span>
									</div>
									<div className="report-card__meta-row">
										<span className="mono">Czas: {formatDuration(report.durationSeconds)}</span>
										<span className="mono">Scrap: {scrapRate}</span>
										<span className="mono">
											Przestoje: {downtimeSummary.count > 0 ? `${downtimeSummary.count} × (${formatDuration(downtimeSummary.totalSeconds)})` : 'brak'}
										</span>
									</div>
								</div>

								<div className="report-card__status">
									<StatusChip status={report.status} />
									<span className={`chevron ${isOpen ? 'up' : 'down'}`} />
								</div>
							</button>

							{isOpen && (
								<div className="report-card__body">
									<div className="report-body__section">
										<h3>Szczegóły produkcji</h3>
										<div className="details-grid">
											<Detail label="Produkt">{report.productCode}</Detail>
											<Detail label="Linia">{report.productionLineId}</Detail>
											<Detail label="Order ID">{report.orderId}</Detail>
											<Detail label="Wyprodukowano OK">{report.producedOk}</Detail>
											<Detail label="Wyprodukowano NOK">{report.producedNok}</Detail>
											<Detail label="Scrap">{scrapRate}</Detail>
											<Detail label="Start">{formatDateTime(report.startedAt)}</Detail>
											<Detail label="Koniec">{formatDateTime(report.endedAt)}</Detail>
											<Detail label="Czas trwania">{formatDuration(report.durationSeconds)}</Detail>
										</div>
									</div>

									<div className="report-body__section">
										<h3>Przestoje</h3>
										{downtimeSummary.count === 0 && <p className="muted">Brak zarejestrowanych przestojów.</p>}
										{(report.downtimes ?? []).map(d => (
											<div key={d.id} className="downtime-row">
												<div className="downtime-main">
													<span className="downtime-code mono">{d.reasonCode}</span>
													<span className="downtime-desc">{d.description || 'Brak opisu'}</span>
												</div>
												<div className="downtime-meta mono">
													<span>{formatDateTime(d.startedAt)}</span>
													<span>→</span>
													<span>{formatDateTime(d.endedAt)}</span>
													<span>{formatDuration(d.durationSeconds)}</span>
												</div>
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					)
				})}
			</div>
		</div>
	)
}

function calcScrapRate(ok: number, nok: number): string {
	const total = ok + nok
	if (!total) return '0 %'
	const rate = (nok / total) * 100
	return `${rate.toFixed(1)} %`
}

function summarizeDowntimes(report: ProductionReport) {
	const list = report.downtimes ?? []
	const totalSeconds = list.reduce((acc, d) => acc + (d.durationSeconds ?? 0), 0)
	return {
		count: list.length,
		totalSeconds,
	}
}

function formatDate(iso: string) {
	const d = new Date(iso)
	if (Number.isNaN(d.getTime())) return iso
	return d.toLocaleDateString('pl-PL')
}

function formatTime(iso: string) {
	const d = new Date(iso)
	if (Number.isNaN(d.getTime())) return '-'
	return d.toLocaleTimeString('pl-PL', {
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
	})
}

function formatDateTime(iso: string) {
	return `${formatDate(iso)} ${formatTime(iso)}`
}

function formatDuration(totalSeconds?: number) {
	if (!totalSeconds || totalSeconds < 0) return '00:00:00'
	const h = Math.floor(totalSeconds / 3600)
	const m = Math.floor((totalSeconds % 3600) / 60)
	const s = Math.floor(totalSeconds % 60)
	return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function StatusChip({ status }: { status: ProductionReport['status'] }) {
	const labelMap: Record<ProductionReport['status'], string> = {
		COMPLETED: 'Zakończone',
		PARTIAL: 'Częściowe',
		CANCELLED: 'Anulowane',
		ERROR: 'Błąd',
	}

	return <span className={`chip chip-${status.toLowerCase()}`}>{labelMap[status]}</span>
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div className="detail">
			<div className="detail-label">{label}</div>
			<div className="detail-value">{children}</div>
		</div>
	)
}
