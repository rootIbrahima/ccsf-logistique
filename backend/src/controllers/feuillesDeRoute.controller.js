const { PrismaClient } = require('@prisma/client')
const logger = require('../utils/logger')
const { getPagination, paginate } = require('../utils/pagination')
const { generateFeuilleDeRoutePDF } = require('../services/pdf.service')

const prisma = new PrismaClient()

const fdrSelect = {
  id: true, numero: true, date: true, statut: true,
  lieuChargement: true, produit: true, quantiteTonnes: true, nombreSacs: true,
  numeroBl: true, carburantLitres: true, carburantFcfa: true,
  fraisRoute: true, autresFrais: true, kmDepart: true, kmArrivee: true, kmParcourus: true,
  dateDecharge: true, lieuDecharge: true, quantiteLivree: true, sacsLivres: true,
  reserves: true, visaLogistique: true, visaDirection: true, createdAt: true,
  chauffeur:    { select: { id: true, nom: true, prenom: true, telephone: true } },
  vehicule:     { select: { id: true, immatriculation: true, typeCamion: true } },
  destination:  { select: { id: true, nom: true, latitude: true, longitude: true, distanceDakar: true } }
}

async function create(req, res) {
  try {
    const data = req.validatedData

    const year = new Date().getFullYear()
    const count = await prisma.feuilleDeRoute.count()
    const numero = `CCSF-FR-${year}-${String(count + 1).padStart(3, '0')}`

    // Calcul kmParcourus si kmDepart et kmArrivee fournis
    if (data.kmDepart && data.kmArrivee) {
      data.kmParcourus = data.kmArrivee - data.kmDepart
    }

    const fdr = await prisma.feuilleDeRoute.create({
      data: { ...data, numero, date: new Date(data.date) },
      select: fdrSelect
    })

    logger.info({ id: fdr.id, numero }, 'Feuille de route créée')
    return res.status(201).json(fdr)
  } catch (err) {
    logger.error({ err }, 'Erreur création feuille de route')
    return res.status(500).json({ message: 'Erreur lors de la création de la feuille de route' })
  }
}

async function getAll(req, res) {
  try {
    const { page, limit, skip } = getPagination(req.query)
    const { statut, chauffeurId, mois } = req.query

    const where = {}
    if (statut) where.statut = statut
    if (chauffeurId) where.chauffeurId = chauffeurId
    if (mois) {
      const [year, month] = mois.split('-').map(Number)
      where.date = {
        gte: new Date(year, month - 1, 1),
        lt:  new Date(year, month, 1)
      }
    }

    const [total, feuilles] = await Promise.all([
      prisma.feuilleDeRoute.count({ where }),
      prisma.feuilleDeRoute.findMany({
        where, select: fdrSelect, skip, take: limit, orderBy: { date: 'desc' }
      })
    ])

    return res.json(paginate(feuilles, total, page, limit))
  } catch (err) {
    logger.error({ err }, 'Erreur liste feuilles de route')
    return res.status(500).json({ message: 'Erreur lors de la récupération des feuilles de route' })
  }
}

async function getById(req, res) {
  try {
    const fdr = await prisma.feuilleDeRoute.findUnique({
      where: { id: req.params.id },
      select: fdrSelect
    })
    if (!fdr) return res.status(404).json({ message: 'Feuille de route introuvable' })
    return res.json(fdr)
  } catch (err) {
    logger.error({ err }, 'Erreur récupération feuille de route')
    return res.status(500).json({ message: 'Erreur lors de la récupération de la feuille de route' })
  }
}

async function update(req, res) {
  try {
    const data = req.validatedData

    if (data.kmDepart != null && data.kmArrivee != null) {
      data.kmParcourus = data.kmArrivee - data.kmDepart
    }
    if (data.date) data.date = new Date(data.date)

    const fdr = await prisma.feuilleDeRoute.update({
      where: { id: req.params.id },
      data,
      select: fdrSelect
    })
    return res.json(fdr)
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Feuille de route introuvable' })
    logger.error({ err }, 'Erreur mise à jour feuille de route')
    return res.status(500).json({ message: 'Erreur lors de la mise à jour de la feuille de route' })
  }
}

async function remove(req, res) {
  try {
    await prisma.feuilleDeRoute.update({
      where: { id: req.params.id },
      data: { statut: 'ANNULE' }
    })
    return res.json({ message: 'Feuille de route annulée' })
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Feuille de route introuvable' })
    logger.error({ err }, 'Erreur annulation feuille de route')
    return res.status(500).json({ message: 'Erreur lors de l\'annulation' })
  }
}

async function getPDF(req, res) {
  try {
    const fdr = await prisma.feuilleDeRoute.findUnique({
      where: { id: req.params.id },
      select: fdrSelect
    })
    if (!fdr) return res.status(404).json({ message: 'Feuille de route introuvable' })
    generateFeuilleDeRoutePDF(fdr, res)
  } catch (err) {
    logger.error({ err }, 'Erreur génération PDF')
    return res.status(500).json({ message: 'Erreur lors de la génération du PDF' })
  }
}

module.exports = { create, getAll, getById, update, remove, getPDF }
