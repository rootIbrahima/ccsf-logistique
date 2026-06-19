const router = require('express').Router()
const ctrl = require('../controllers/dotations.controller')
const auth = require('../middlewares/auth.middleware')
const validate = require('../middlewares/validate.middleware')
const { dotationSchema, dotationUpdateSchema } = require('../schemas/dotation.schema')

router.use(auth)

router.get('/stats/mensuel', ctrl.getStatsMensuel)
router.post('/',             validate(dotationSchema),       ctrl.create)
router.get('/',                                              ctrl.getAll)
router.get('/:id',                                           ctrl.getById)
router.put('/:id',           validate(dotationUpdateSchema), ctrl.update)
router.delete('/:id',                                        ctrl.remove)

module.exports = router
