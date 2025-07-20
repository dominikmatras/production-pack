import { Router } from 'express'
import { create, getAll, getByDate, getByProductionLine, getByStatus } from '../controllers/OrderController'

const router = Router()

router.post('/add', create)
router.get('/', getAll)
router.get('/date/:date', getByDate)
router.get('/line/:line', getByProductionLine)
router.get('/status/:status', getByStatus)

export default router
