const router = require('express').Router()
const ctrl = require('../controllers/vehicules.controller')
const auth = require('../middlewares/auth.middleware')
const validate = require('../middlewares/validate.middleware')
const { vehiculeSchema, vehiculeUpdateSchema } = require('../schemas/vehicule.schema')

router.use(auth)

router.post('/',     validate(vehiculeSchema),       ctrl.create)
router.get('/',                                      ctrl.getAll)
router.get('/:id',                                   ctrl.getById)
router.put('/:id',   validate(vehiculeUpdateSchema), ctrl.update)
router.delete('/:id',                                ctrl.remove)

module.exports = router
