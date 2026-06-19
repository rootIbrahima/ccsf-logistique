const { PrismaClient } = require('@prisma/client')
const logger = require('../utils/logger')

const prisma = new PrismaClient()

async function getStats(req, res) {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    const moisPeriode = now.toISOString().slice(0, 7)

    const [
      trajetsMois,
      trajetsEnRoute,
      enAttenteCount,
      dotationsMois,
      derniersTrajets,
      destinationsFreq
    ] = await Promise.all([
      prisma.feuilleDeRoute.count({
        where: { date: { gte: startOfMonth, lt: endOfMonth }, statut: { not: 'ANNULE' } }
      }),
      prisma.feuilleDeRoute.count({ where: { statut: 'EN_ROUTE' } }),
      prisma.feuilleDeRoute.count({ where: { statut: 'EN_ATTENTE' } }),
      prisma.dotationCarburant.findMany({
        where: { moisPeriode },
        select: {
          litresReels: true, litresTheoriques: true, dotationTotale: true, statut: true,
          vehicule: { select: { immatriculation: true, typeCamion: true } }
        }
      }),
      prisma.feuilleDeRoute.findMany({
        where: { statut: { not: 'ANNULE' } },
        select: {
          id: true, numero: true, date: true, statut: true, produit: true,
          chauffeur:   { select: { nom: true, prenom: true } },
          destination: { select: { nom: true, distanceDakar: true } }
        },
        orderBy: { date: 'desc' },
        take: 5
      }),
      prisma.feuilleDeRoute.groupBy({
        by: ['destinationId'],
        _count: { destinationId: true },
        where: { statut: { not: 'ANNULE' } },
        orderBy: { _count: { destinationId: 'desc' } },
        take: 5
      })
    ])

    // Résoudre les noms de destinations
    const destIds = destinationsFreq.map(d => d.destinationId)
    const destNames = await prisma.destination.findMany({
      where: { id: { in: destIds } },
      select: { id: true, nom: true }
    })
    const destMap = Object.fromEntries(destNames.map(d => [d.id, d.nom]))

    // KMs parcourus ce mois
    const kmAgg = await prisma.feuilleDeRoute.aggregate({
      where: { date: { gte: startOfMonth, lt: endOfMonth }, kmParcourus: { not: null } },
      _sum: { kmParcourus: true }
    })

    // Stats carburant par véhicule
    const vehuMap = {}
    for (const d of dotationsMois) {
      const key = d.vehicule.immatriculation
      if (!vehuMap[key]) {
        vehuMap[key] = { immatriculation: key, typeCamion: d.vehicule.typeCamion, litresReels: 0, litresTheo: 0 }
      }
      vehuMap[key].litresReels += d.litresReels || 0
      vehuMap[key].litresTheo  += d.litresTheoriques || 0
    }

    return res.json({
      trajetsMois,
      trajetsEnRoute,
      carburantConsommeL:  dotationsMois.reduce((s, d) => s + (d.litresReels || 0), 0),
      carburantBudgetL:    dotationsMois.reduce((s, d) => s + (d.litresTheoriques || 0), 0),
      dotationFcfaTotal:   dotationsMois.reduce((s, d) => s + (d.dotationTotale || 0), 0),
      enAttenteCount,
      kmParcourusMois:     kmAgg._sum.kmParcourus || 0,
      derniersTrajets,
      consoParVehicule:    Object.values(vehuMap),
      destinationsFreq:    destinationsFreq.map(d => ({
        nom:   destMap[d.destinationId] || d.destinationId,
        count: d._count.destinationId
      }))
    })
  } catch (err) {
    logger.error({ err }, 'Erreur stats dashboard')
    return res.status(500).json({ message: 'Erreur lors du calcul des statistiques' })
  }
}

module.exports = { getStats }
