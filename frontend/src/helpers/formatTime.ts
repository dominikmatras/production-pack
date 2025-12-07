export function formatTime(iso?: string | Date | null): string {
	if (!iso) return '-'
	const d = typeof iso === 'string' ? new Date(iso) : iso
	if (Number.isNaN(d.getTime())) return '-'
	return d.toLocaleTimeString('pl-PL', {
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
	})
}

export function formatDurationFrom(iso?: string | Date | null): string {
	if (!iso) return '-'
	const start = typeof iso === 'string' ? new Date(iso) : iso
	if (Number.isNaN(start.getTime())) return '-'
	const diff = Date.now() - start.getTime()
	if (diff < 0) return '00:00:00'
	const totalSec = Math.floor(diff / 1000)
	const h = Math.floor(totalSec / 3600)
	const m = Math.floor((totalSec % 3600) / 60)
	const s = totalSec % 60
	return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
