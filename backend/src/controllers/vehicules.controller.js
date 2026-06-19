const { PrismaClient } = require('@prisma/client')
const logger = require('../utils/logger')
const { getPagination, paginate } = require('../utils/pagination')

const prisma = new PrismaClient()

const vehiculeSelect = {
  id: true, immatriculation: true, typeCamion: true, marque: true,
  modele: true, consommationRef: true, statut: true, createdAt: true,
  chauffeur: { select: { id: true, nom: true, prenom: true, telephone: true } }
}

async function create(req, res) {
  try {
    const { chauffeurId, ...rest } = req.validatedData
    const data = { ...rest }
    if (chauffeurId) data.chauffeur = { connect: { id: chauffeurId } }

    const vehicule = await prisma.vehicule.create({ data, select: vehiculeSelect })
    logger.info({ id: vehicule.id }, 'Véhicule créé')
    return res.status(201).json(vehicule)
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ message: 'Cette immatriculation est déjà utilisée' })
    }
    logger.error({ err }, 'Erreur création véhicule')
    return res.status(500).json({ message: 'Erreur lors de la création du véhicule' })
  }
}

async function getAll(req, res) {
  try {
    const { page, limit, skip } = getPagination(req.query)
    const { search, statut, type } = req.query

    const where = {}
    if (statut) where.statut = statut
    if (type) where.typeCamion = type
    if (search) {
      const term = search.trim()
      where.OR = [
        { immatriculation: { contains: term } },
        { marque:          { contains: term } },
        { modele:          { contains: term } }
      ]
    }

    const [total, vehicules] = await Promise.all([
      prisma.vehicule.count({ where }),
      prisma.vehicule.findMany({ where, select: vehiculeSelect, skip, take: limit, orderBy: { immatriculation: 'asc' } })
    ])

    return res.json(paginate(vehicules, total, page, limit))
  } catch (err) {
    logger.error({ err }, 'Erreur liste véhicules')
    return res.status(500).json({ message: 'Erreur lors de la récupération des véhicules' })
  }
}

async function getById(req, res) {
  try {
    const vehicule = await prisma.vehicule.findUnique({
      where: { id: req.params.id },
      select: {
        ...vehiculeSelect,
        missions: {
          select: {
            id: true, numero: true, date: true, statut: true, produit: true,
            destination: { select: { nom: true } }
          },
          orderBy: { date: 'desc' },
          take: 10
        }
      }
    })
    if (!vehicule) return res.status(404).json({ message: 'Véhicule introuvable' })
    return res.json(vehicule)
  } catch (err) {
    logger.error({ err }, 'Erreur récupération véhicule')
    return res.status(500).json({ message: 'Erreur lors de la récupération du véhicule' })
  }
}

async function update(req, res) {
  try {
    const { chauffeurId, ...rest } = req.validatedData
    const data = { ...rest }
    if (chauffeurId !== undefined) {
      data.chauffeur = chauffeurId
        ? { connect: { id: chauffeurId } }
        : { disconnect: true }
    }

    const vehicule = await prisma.vehicule.update({
      where: { id: req.params.id },
      data,
      select: vehiculeSelect
    })
    return res.json(vehicule)
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Véhicule introuvable' })
    if (err.code === 'P2002') return res.status(409).json({ message: 'Cette immatriculation est déjà utilisée' })
    logger.error({ err }, 'Erreur mise à jour véhicule')
    return res.status(500).json({ message: 'Erreur lors de la mise à jour du véhicule' })
  }
}

async function remove(req, res) {
  try {
    const id = req.params.id

    // Vérifier les enregistrements liés
    const [missionCount, dotationCount] = await Promise.all([
      prisma.feuilleDeRoute.count({ where: { vehiculeId: id } }),
      prisma.dotationCarburant.count({ where: { vehiculeId: id } })
    ])

    if (missionCount > 0 || dotationCount > 0) {
      return res.status(409).json({
        message: `Impossible de supprimer : ce véhicule possède ${missionCount} mission(s) et ${dotationCount} dotation(s). Supprimez-les d'abord.`
      })
    }

    // Déconnecter le chauffeur assigné si besoin
    await prisma.chauffeur.updateMany({
      where: { vehiculeId: id },
      data: { vehiculeId: null }
    })

    await prisma.vehicule.delete({ where: { id } })
    return res.json({ message: 'Véhicule supprimé' })
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Véhicule introuvable' })
    logger.error({ err }, 'Erreur suppression véhicule')
    return res.status(500).json({ message: 'Erreur lors de la suppression du véhicule' })
  }
}

module.exports = { create, getAll, getById, update, remove }
