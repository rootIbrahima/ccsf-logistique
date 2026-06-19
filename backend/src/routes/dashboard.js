const router = require('express').Router()
const { getStats } = require('../controllers/dashboard.controller')
const auth = require('../middlewares/auth.middleware')

router.use(auth)
router.get('/stats', getStats)

module.exports = router
