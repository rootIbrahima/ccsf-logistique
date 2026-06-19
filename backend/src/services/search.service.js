const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function searchRepertoire(q) {
  const term = q?.trim() || ''
  if (!term) return { chauffeurs: [], vehicules: [] }

  const [chauffeurs, vehicules] = await Promise.all([
    prisma.chauffeur.findMany({
      where: {
        OR: [
          { nom:          { contains: term } },
          { prenom:       { contains: term } },
          { telephone:    { contains: term } },
          { permisNumero: { contains: term } }
        ]
      },
      select: {
        id: true, nom: true, prenom: true, telephone: true,
        permisNumero: true, statut: true,
        vehicule: { select: { id: true, immatriculation: true, typeCamion: true, statut: true } }
      },
      take: 20
    }),
    prisma.vehicule.findMany({
      where: {
        OR: [
          { immatriculation: { contains: term } },
          { marque:          { contains: term } },
          { modele:          { contains: term } }
        ]
      },
      select: {
        id: true, immatriculation: true, typeCamion: true,
        marque: true, modele: true, statut: true,
        chauffeur: { select: { id: true, nom: true, prenom: true } }
      },
      take: 20
    })
  ])

  return { chauffeurs, vehicules }
}

module.exports = { searchRepertoire }
