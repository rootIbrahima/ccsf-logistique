const { PrismaClient } = require('@prisma/client')
const logger = require('../utils/logger')

const prisma = new PrismaClient()

const DAKAR = { nom: 'DAKAR', latitude: 14.6937, longitude: -17.4441 }

async function getTrajets(req, res) {
  try {
    const { statut, chauffeurId, mois } = req.query

    const where = {}
    if (statut) {
      where.statut = Array.isArray(statut) ? { in: statut } : statut
    }
    if (chauffeurId) where.chauffeurId = chauffeurId
    if (mois) {
      const [year, month] = mois.split('-').map(Number)
      where.date = {
        gte: new Date(year, month - 1, 1),
        lt:  new Date(year, month, 1)
      }
    }

    const trajets = await prisma.feuilleDeRoute.findMany({
      where,
      select: {
        id: true, numero: true, statut: true, date: true,
        produit: true, quantiteTonnes: true,
        chauffeur:   { select: { nom: true, prenom: true, telephone: true } },
        vehicule:    { select: { immatriculation: true, typeCamion: true } },
        destination: { select: { nom: true, latitude: true, longitude: true, distanceDakar: true } }
      },
      orderBy: { date: 'desc' }
    })

    const result = trajets.map(t => ({
      ...t,
      depart: DAKAR
    }))

    return res.json(result)
  } catch (err) {
    logger.error({ err }, 'Erreur récupération trajets carte')
    return res.status(500).json({ message: 'Erreur lors de la récupération des trajets' })
  }
}

module.exports = { getTrajets }
