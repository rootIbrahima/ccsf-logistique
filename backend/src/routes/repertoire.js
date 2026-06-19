const router = require('express').Router()
const { search } = require('../controllers/repertoire.controller')
const auth = require('../middlewares/auth.middleware')

router.use(auth)
router.get('/search', search)

module.exports = router
