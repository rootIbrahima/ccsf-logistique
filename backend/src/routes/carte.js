const router = require('express').Router()
const { getTrajets } = require('../controllers/carte.controller')
const auth = require('../middlewares/auth.middleware')

router.use(auth)
router.get('/trajets', getTrajets)

module.exports = router
