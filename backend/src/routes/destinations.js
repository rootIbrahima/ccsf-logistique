const router = require('express').Router()
const { PrismaClient } = require('@prisma/client')
const auth = require('../middlewares/auth.middleware')
const logger = require('../utils/logger')

const prisma = new PrismaClient()

router.use(auth)

router.get('/', async (req, res) => {
  try {
    const destinations = await prisma.destination.findMany({
      select: { id: true, nom: true, latitude: true, longitude: true, distanceDakar: true },
      orderBy: { nom: 'asc' }
    })
    return res.json(destinations)
  } catch (err) {
    logger.error({ err }, 'Erreur liste destinations')
    return res.status(500).json({ message: 'Erreur lors de la récupération des destinations' })
  }
})

module.exports = router
