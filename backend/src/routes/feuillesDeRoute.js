const router = require('express').Router()
const ctrl = require('../controllers/feuillesDeRoute.controller')
const auth = require('../middlewares/auth.middleware')
const validate = require('../middlewares/validate.middleware')
const { feuilleDeRouteSchema, feuilleDeRouteUpdateSchema } = require('../schemas/feuilleDeRoute.schema')

router.use(auth)

router.post('/',         validate(feuilleDeRouteSchema),       ctrl.create)
router.get('/',                                                ctrl.getAll)
router.get('/:id',                                             ctrl.getById)
router.put('/:id',       validate(feuilleDeRouteUpdateSchema), ctrl.update)
router.delete('/:id',                                          ctrl.remove)
router.get('/:id/pdf',                                         ctrl.getPDF)

module.exports = router
