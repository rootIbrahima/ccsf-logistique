const { PrismaClient } = require('@prisma/client')
const logger = require('../utils/logger')
const { getPagination, paginate } = require('../utils/pagination')

const prisma = new PrismaClient()

const chauffeurSelect = {
  id: true, nom: true, prenom: true, telephone: true,
  permisNumero: true, photoUrl: true, statut: true, createdAt: true,
  vehicule: { select: { id: true, immatriculation: true, typeCamion: true, statut: true } }
}

async function create(req, res) {
  try {
    const data = req.validatedData
    if (data.vehiculeId) {
      await prisma.chauffeur.updateMany({ where: { vehiculeId: data.vehiculeId }, data: { vehiculeId: null } })
    }
    const chauffeur = await prisma.chauffeur.create({ data, select: chauffeurSelect })
    logger.info({ id: chauffeur.id }, 'Chauffeur créé')
    return res.status(201).json(chauffeur)
  } catch (err) {
    if (err.code === 'P2002') {
      const target = err.meta?.target ?? ''
      if (target.includes('vehiculeId')) {
        return res.status(409).json({ message: 'Ce véhicule est déjà assigné à un autre chauffeur' })
      }
      return res.status(409).json({ message: 'Ce numéro de téléphone est déjà utilisé' })
    }
    logger.error({ err }, 'Erreur création chauffeur')
    return res.status(500).json({ message: 'Erreur lors de la création du chauffeur' })
  }
}

async function getAll(req, res) {
  try {
    const { page, limit, skip } = getPagination(req.query)
    const { search, statut } = req.query

    const where = {}
    if (statut) where.statut = statut
    if (search) {
      const term = search.trim()
      where.OR = [
        { nom:          { contains: term } },
        { prenom:       { contains: term } },
        { telephone:    { contains: term } },
        { permisNumero: { contains: term } }
      ]
    }

    const [total, chauffeurs] = await Promise.all([
      prisma.chauffeur.count({ where }),
      prisma.chauffeur.findMany({ where, select: chauffeurSelect, skip, take: limit, orderBy: { nom: 'asc' } })
    ])

    return res.json(paginate(chauffeurs, total, page, limit))
  } catch (err) {
    logger.error({ err }, 'Erreur liste chauffeurs')
    return res.status(500).json({ message: 'Erreur lors de la récupération des chauffeurs' })
  }
}

async function getById(req, res) {
  try {
    const chauffeur = await prisma.chauffeur.findUnique({
      where: { id: req.params.id },
      select: {
        ...chauffeurSelect,
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
    if (!chauffeur) return res.status(404).json({ message: 'Chauffeur introuvable' })
    return res.json(chauffeur)
  } catch (err) {
    logger.error({ err }, 'Erreur récupération chauffeur')
    return res.status(500).json({ message: 'Erreur lors de la récupération du chauffeur' })
  }
}

async function update(req, res) {
  try {
    const data = req.validatedData
    const chauffeur = await prisma.chauffeur.update({
      where: { id: req.params.id },
      data,
      select: chauffeurSelect
    })
    return res.json(chauffeur)
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Chauffeur introuvable' })
    if (err.code === 'P2002') return res.status(409).json({ message: 'Ce numéro de téléphone est déjà utilisé' })
    logger.error({ err }, 'Erreur mise à jour chauffeur')
    return res.status(500).json({ message: 'Erreur lors de la mise à jour du chauffeur' })
  }
}

async function remove(req, res) {
  try {
    // Soft delete
    await prisma.chauffeur.update({
      where: { id: req.params.id },
      data: { statut: 'INACTIF' }
    })
    return res.json({ message: 'Chauffeur désactivé' })
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Chauffeur introuvable' })
    logger.error({ err }, 'Erreur suppression chauffeur')
    return res.status(500).json({ message: 'Erreur lors de la suppression du chauffeur' })
  }
}

module.exports = { create, getAll, getById, update, remove }
