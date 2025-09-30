import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/http'
import { getUser } from '../helpers/auth'
import { templates } from '../data/order-templates'
import './create-order.less'

type Role = 'WORKER' | 'MANAGER' | 'ADMIN'

export default function CreateOrder() {
	const navigate = useNavigate()
	const role = (getUser()?.role ?? 'WORKER') as Role

	type OrderTemplate = {
		id: string
		name: string
		product: string
		productNumber: string
		quantity: number
		productionLine: string
		targetHour: string
	}

	const [product, setProduct] = useState('')
	const [productNumber, setProductNumber] = useState('')
	const [quantity, setQuantity] = useState<number | ''>('')
	const [productionLine, setProductionLine] = useState('')
	const [targetDate, setTargetDate] = useState('') // yyyy-mm-dd
	const [targetHour, setTargetHour] = useState('') // HH:mm

	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const [selectedTplId, setSelectedTplId] = useState<string>('')
	const [tplQuery, setTplQuery] = useState<string>('')

	const filteredTemplates = useMemo(() => {
		const q = tplQuery.trim().toLowerCase()
		if (!q) return templates as OrderTemplate[]
		return (templates as OrderTemplate[]).filter(
			t => t.name.toLowerCase().includes(q) || t.product.toLowerCase().includes(q) || t.productNumber.toLowerCase().includes(q)
		)
	}, [tplQuery])

	function validate() {
		if (!product.trim()) return 'Podaj nazwę produktu'
		if (!productNumber.trim()) return 'Podaj numer produktu'
		if (!quantity || quantity <= 0) return 'Podaj poprawną ilość (> 0)'
		if (!productionLine.trim()) return 'Podaj linię produkcyjną'
		if (!targetDate) return 'Wybierz datę docelową'
		if (!targetHour) return 'Wybierz godzinę docelową (HH:MM)'
		return null
	}

	function applyTemplate(tpl: OrderTemplate) {
		setSelectedTplId(tpl.id)
		setProduct(tpl.product)
		setProductNumber(tpl.productNumber)
		setQuantity(tpl.quantity)
		setProductionLine(tpl.productionLine)
		setTargetHour(tpl.targetHour)
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		setError(null)
		const v = validate()
		if (v) {
			setError(v)
			return
		}

		setLoading(true)
		try {
			const payload = {
				product: product.trim(),
				productNumber: productNumber.trim(),
				quantity: Number(quantity),
				productionLine: productionLine.trim(),
				targetDate: new Date(`${targetDate}T00:00:00.000Z`).toISOString(),
				targetHour: targetHour, // "11:45" / "14:00"
				status: 'CREATED',
			}

			await api.post('/api/v1/order/add', payload)
			navigate('/orders', { replace: true })
		} catch (err: any) {
			setError(err?.response?.data?.error ?? 'Nie udało się dodać zamówienia')
		} finally {
			setLoading(false)
		}
	}

	if (role !== 'ADMIN' && role !== 'MANAGER') {
		return (
			<div className="create-wrap">
				<div className="create-card">
					<h2>Brak uprawnień</h2>
					<p>
						Ta sekcja jest dostępna tylko dla ról <b>ADMIN</b> i <b>MANAGER</b>.
					</p>
					<button className="btn" onClick={() => navigate('/orders')}>
						Wróć do Orders
					</button>
				</div>
			</div>
		)
	}

	return (
		<div className="create-wrap">
			<header className="create-header">
				<div>
					<h1>Dodaj zamówienie</h1>
					<p>Utwórz nowe zlecenie produkcyjne</p>
				</div>
				<button className="btn ghost" onClick={() => navigate('/orders')}>
					← Powrót
				</button>
			</header>

			{error && <div className="banner error">{error}</div>}

			{/* [TEMPLATES] Panel szablonów */}
			<section className="tpl-panel">
				<div className="tpl-head">
					<h3>Szablony</h3>
					<input type="search" placeholder="Szukaj po nazwie/produkcie/num." value={tplQuery} onChange={e => setTplQuery(e.target.value)} />
				</div>
				<div className="tpl-list">
					{filteredTemplates.map(t => (
						<button
							key={t.id}
							type="button"
							className={`tpl-item ${selectedTplId === t.id ? 'active' : ''}`}
							onClick={() => applyTemplate(t)}
							title={`${t.product} — ${t.productNumber}`}>
							<div className="tpl-name">{t.name}</div>
							<div className="tpl-meta">
								<span className="mono">{t.productNumber}</span>
								<span className="dot" />
								<span className="mono">{t.productionLine}</span>
								<span className="dot" />
								<span className="mono">{t.quantity} szt.</span>
								<span className="dot" />
								<span className="mono">{t.targetHour}</span>
							</div>
						</button>
					))}
					{filteredTemplates.length === 0 && <div className="tpl-empty">Brak dopasowanych szablonów</div>}
				</div>
			</section>

			<div className="create-card">
				<form className="form-grid" onSubmit={handleSubmit} noValidate>
					<label className="field">
						<span>Produkt</span>
						<input type="text" placeholder="Sałata lodowa krojona" value={product} onChange={e => setProduct(e.target.value)} required />
					</label>

					<label className="field">
						<span>Numer produktu</span>
						<input type="text" placeholder="SL-100" value={productNumber} onChange={e => setProductNumber(e.target.value)} required />
					</label>

					<label className="field">
						<span>Ilość (szt.)</span>
						<input type="number" min={1} step={1} value={quantity} onChange={e => setQuantity(e.target.value === '' ? '' : Number(e.target.value))} required />
					</label>

					<label className="field">
						<span>Linia produkcyjna</span>
						<input type="text" placeholder="8" value={productionLine} onChange={e => setProductionLine(e.target.value)} required />
					</label>

					<label className="field">
						<span>Data docelowa</span>
						<input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} required />
					</label>

					<label className="field">
						<span>Godzina docelowa</span>
						<input type="time" value={targetHour} onChange={e => setTargetHour(e.target.value)} placeholder="14:00" required />
					</label>

					<div className="form-actions">
						<button
							className="btn ghost"
							type="button"
							onClick={() => {
								setSelectedTplId('')
								setProduct('')
								setProductNumber('')
								setQuantity('')
								setProductionLine('')
								setTargetDate('')
								setTargetHour('')
								setError(null)
							}}>
							Wyczyść
						</button>
						<button className="btn primary" type="submit" disabled={loading}>
							{loading ? 'Zapisywanie…' : 'Dodaj zamówienie'}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}
