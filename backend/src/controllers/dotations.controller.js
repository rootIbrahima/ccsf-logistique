const { PrismaClient } = require('@prisma/client')
const logger = require('../utils/logger')
const { getPagination, paginate } = require('../utils/pagination')
const { calculerDotation, calculerStatut } = require('../services/carburant.service')
const { PRIX_LITRE_DEFAUT } = require('../constants/fuel')

const prisma = new PrismaClient()

const dotationSelect = {
  id: true, numeroBon: true, date: true, itineraire: true, distanceKm: true,
  litresTheoriques: true, dotationBrute: true, margeFcfa: true, dotationTotale: true,
  litresReels: true, montantReel: true, ecartLitres: true, ecartFcfa: true, fraisRoute: true,
  statut: true, moisPeriode: true, responsable: true, validePar: true, createdAt: true,
  chauffeur: { select: { id: true, nom: true, prenom: true, telephone: true } },
  vehicule:  { select: { id: true, immatriculation: true, typeCamion: true } }
}

async function create(req, res) {
  try {
    const { chauffeurId, vehiculeId, distanceKm, date, itineraire, moisPeriode, responsable, litresReels, montantReel, fraisRoute } = req.validatedData

    const { litresTheo, dotationBrute, margeFcfa, dotationTotale } = calculerDotation(distanceKm)

    // Numéro auto
    const count = await prisma.dotationCarburant.count()
    const numeroBon = String(count + 1).padStart(3, '0')

    let ecartLitres = null
    let ecartFcfa = null
    let statut = 'EN_ATTENTE'

    if (litresReels != null) {
      ecartLitres = litresReels - litresTheo
      ecartFcfa = ecartLitres * PRIX_LITRE_DEFAUT
      statut = calculerStatut(ecartLitres, litresTheo)
    }

    const dotation = await prisma.dotationCarburant.create({
      data: {
        numeroBon, date: new Date(date),
        chauffeurId, vehiculeId, itineraire, distanceKm,
        litresTheoriques: litresTheo, dotationBrute, margeFcfa, dotationTotale,
        litresReels, montantReel, ecartLitres, ecartFcfa, fraisRoute, statut,
        moisPeriode, responsable
      },
      select: dotationSelect
    })

    logger.info({ id: dotation.id }, 'Dotation créée')
    return res.status(201).json(dotation)
  } catch (err) {
    logger.error({ err }, 'Erreur création dotation')
    return res.status(500).json({ message: 'Erreur lors de la création de la dotation' })
  }
}

async function getAll(req, res) {
  try {
    const { page, limit, skip } = getPagination(req.query)
    const { mois, statut, vehiculeId } = req.query

    const where = {}
    if (statut) where.statut = statut
    if (vehiculeId) where.vehiculeId = vehiculeId
    if (mois) where.moisPeriode = mois

    const [total, dotations] = await Promise.all([
      prisma.dotationCarburant.count({ where }),
      prisma.dotationCarburant.findMany({
        where, select: dotationSelect, skip, take: limit, orderBy: { date: 'desc' }
      })
    ])

    return res.json(paginate(dotations, total, page, limit))
  } catch (err) {
    logger.error({ err }, 'Erreur liste dotations')
    return res.status(500).json({ message: 'Erreur lors de la récupération des dotations' })
  }
}

async function getById(req, res) {
  try {
    const dotation = await prisma.dotationCarburant.findUnique({
      where: { id: req.params.id },
      select: dotationSelect
    })
    if (!dotation) return res.status(404).json({ message: 'Dotation introuvable' })
    return res.json(dotation)
  } catch (err) {
    logger.error({ err }, 'Erreur récupération dotation')
    return res.status(500).json({ message: 'Erreur lors de la récupération de la dotation' })
  }
}

async function update(req, res) {
  try {
    const data = req.validatedData
    if (data.date) data.date = new Date(data.date)

    // Recalculer écarts si litresReels fournis
    if (data.litresReels != null) {
      const existing = await prisma.dotationCarburant.findUnique({
        where: { id: req.params.id },
        select: { litresTheoriques: true }
      })
      if (existing) {
        data.ecartLitres = data.litresReels - existing.litresTheoriques
        data.ecartFcfa = data.ecartLitres * PRIX_LITRE_DEFAUT
        if (!data.statut) {
          data.statut = calculerStatut(data.ecartLitres, existing.litresTheoriques)
        }
      }
    }

    const dotation = await prisma.dotationCarburant.update({
      where: { id: req.params.id },
      data,
      select: dotationSelect
    })
    return res.json(dotation)
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Dotation introuvable' })
    logger.error({ err }, 'Erreur mise à jour dotation')
    return res.status(500).json({ message: 'Erreur lors de la mise à jour de la dotation' })
  }
}

async function getStatsMensuel(req, res) {
  try {
    const mois = req.query.mois || new Date().toISOString().slice(0, 7)

    const dotations = await prisma.dotationCarburant.findMany({
      where: { moisPeriode: mois },
      select: {
        litresTheoriques: true, litresReels: true, dotationTotale: true,
        ecartLitres: true, fraisRoute: true, statut: true,
        vehicule: { select: { immatriculation: true, typeCamion: true } }
      }
    })

    const stats = {
      totalDotationFcfa: dotations.reduce((s, d) => s + (d.dotationTotale || 0), 0),
      totalLitresTheo:   dotations.reduce((s, d) => s + (d.litresTheoriques || 0), 0),
      totalLitresReels:  dotations.reduce((s, d) => s + (d.litresReels || 0), 0),
      totalFraisRoute:   dotations.reduce((s, d) => s + (d.fraisRoute || 0), 0),
      dansMargeCount:    dotations.filter(d => d.statut === 'DANS_MARGE').length,
      okCount:           dotations.filter(d => d.statut === 'OK').length,
      total:             dotations.length
    }

    return res.json({ mois, ...stats })
  } catch (err) {
    logger.error({ err }, 'Erreur stats mensuel dotations')
    return res.status(500).json({ message: 'Erreur lors du calcul des statistiques' })
  }
}

async function remove(req, res) {
  try {
    await prisma.dotationCarburant.delete({ where: { id: req.params.id } })
    return res.json({ message: 'Dotation supprimée' })
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Dotation introuvable' })
    logger.error({ err }, 'Erreur suppression dotation')
    return res.status(500).json({ message: 'Erreur lors de la suppression' })
  }
}

module.exports = { create, getAll, getById, update, remove, getStatsMensuel }
