import { Router } from 'express'
import { startProduction, pauseProduction, resumeProduction, stopProduction } from '../controllers/ProductionController'

const router = Router()

router.post('/start/:id', startProduction)
router.post('/pause/:id', pauseProduction)
router.post('/resume/:id', resumeProduction)
router.post('/stop/:id', stopProduction)

export default router
