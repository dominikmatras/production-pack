import { Router } from 'express'
import { ReportController } from '../controllers/ReportController'

const router = Router()
const controller = new ReportController()

router.post('/production', controller.create.bind(controller))
router.get('/production/order/:orderId', controller.getByOrderId.bind(controller))
router.get('/production', controller.list.bind(controller))

export default router
