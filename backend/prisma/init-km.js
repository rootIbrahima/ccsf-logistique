const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()
const SEUIL = 5000

async function main() {
  const vehicules = await prisma.vehicule.findMany({ select: { id: true, immatriculation: true } })

  for (const v of vehicules) {
    const feuilles = await prisma.feuilleDeRoute.findMany({
      where: { vehiculeId: v.id, statut: 'LIVRE', kmParcourus: { not: null } },
      select: { kmParcourus: true }
    })

    const totalKm = feuilles.reduce((s, f) => s + (f.kmParcourus || 0), 0)
    const enMaintenance = totalKm >= SEUIL

    await prisma.vehicule.update({
      where: { id: v.id },
      data: {
        kmDepuisMaintenance: totalKm,
        ...(enMaintenance ? { statut: 'MAINTENANCE' } : {})
      }
    })

    console.log(`${v.immatriculation} : ${totalKm} km${enMaintenance ? ' → MAINTENANCE' : ''}`)
  }

  console.log('Initialisation des km terminée.')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
