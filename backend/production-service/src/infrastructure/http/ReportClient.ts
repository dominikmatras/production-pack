export interface ReportPayload {
	orderId: string
	productionLineId: string
	productCode: string
	producedOk: number
	producedNok: number
	startedAt: string
	endedAt: string
	status?: 'COMPLETED' | 'CANCELLED'
	downtimes?: {
		reasonCode: string
		description?: string
		startedAt: string
		endedAt: string
	}[]
}

export class ReportClient {
	private readonly baseUrl: string

	constructor(baseUrl?: string) {
		this.baseUrl = baseUrl ?? process.env.API_GATEWAY_BASE_URL ?? 'http://report-service:8084'
	}

	async sendProductionReport(payload: ReportPayload): Promise<void> {
		const url = `${this.baseUrl}/api/v1/report/production`

		console.log('Sending report to:', url)

		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(payload),
		})

		if (!response.ok) {
			const text = await response.text().catch(() => '')
			console.error(`ReportClient: failed to send report (${response.status} ${response.statusText}): ${text}`)
			return
		}
	}
}
