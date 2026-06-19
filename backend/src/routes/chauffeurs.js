const router = require('express').Router()
const ctrl = require('../controllers/chauffeurs.controller')
const auth = require('../middlewares/auth.middleware')
const validate = require('../middlewares/validate.middleware')
const { chauffeurSchema, chauffeurUpdateSchema } = require('../schemas/chauffeur.schema')

router.use(auth)

router.post('/',     validate(chauffeurSchema),       ctrl.create)
router.get('/',                                       ctrl.getAll)
router.get('/:id',                                    ctrl.getById)
router.put('/:id',   validate(chauffeurUpdateSchema), ctrl.update)
router.delete('/:id',                                 ctrl.remove)

module.exports = router
