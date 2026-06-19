const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Destinations
  const destinations = await Promise.all([
    prisma.destination.upsert({ where: { nom: 'DAKAR' },       update: {}, create: { nom: 'DAKAR',       latitude: 14.6937, longitude: -17.4441, distanceDakar: 0   } }),
    prisma.destination.upsert({ where: { nom: 'KENIEBA' },     update: {}, create: { nom: 'KENIEBA',     latitude: 12.8333, longitude: -11.2333, distanceDakar: 750 } }),
    prisma.destination.upsert({ where: { nom: 'KAYES' },       update: {}, create: { nom: 'KAYES',       latitude: 14.4469, longitude: -11.4422, distanceDakar: 490 } }),
    prisma.destination.upsert({ where: { nom: 'TAMBACOUNDA' }, update: {}, create: { nom: 'TAMBACOUNDA', latitude: 13.7707, longitude: -13.6673, distanceDakar: 470 } }),
    prisma.destination.upsert({ where: { nom: 'SAINT-LOUIS' }, update: {}, create: { nom: 'SAINT-LOUIS', latitude: 16.0200, longitude: -16.4900, distanceDakar: 265 } }),
    prisma.destination.upsert({ where: { nom: 'ZIGUINCHOR' }, update: {}, create: { nom: 'ZIGUINCHOR',  latitude: 12.5500, longitude: -16.2667, distanceDakar: 490 } }),
    prisma.destination.upsert({ where: { nom: 'KOLDA' },       update: {}, create: { nom: 'KOLDA',       latitude: 12.8833, longitude: -14.9500, distanceDakar: 510 } }),
  ])

  const destMap = Object.fromEntries(destinations.map(d => [d.nom, d.id]))

  // Véhicules
  const v1 = await prisma.vehicule.upsert({ where: { immatriculation: '4250' },    update: {}, create: { immatriculation: '4250',    typeCamion: 'HOWO_420', consommationRef: 53 } })
  const v2 = await prisma.vehicule.upsert({ where: { immatriculation: 'AA838FF' }, update: {}, create: { immatriculation: 'AA838FF', typeCamion: 'HOWO_380', consommationRef: 48 } })
  const v3 = await prisma.vehicule.upsert({ where: { immatriculation: '5120' },    update: {}, create: { immatriculation: '5120',    typeCamion: 'MAN_TGS',  consommationRef: 42 } })
  const v4 = await prisma.vehicule.upsert({ where: { immatriculation: '2205' },    update: {}, create: { immatriculation: '2205',    typeCamion: 'IVECO',    consommationRef: 35 } })

  // Chauffeurs
  const c1 = await prisma.chauffeur.upsert({ where: { telephone: '+221771234567' }, update: {}, create: { nom: 'DIOUF',  prenom: 'Sakoura',   telephone: '+221771234567', permisNumero: 'DKR-2021-001', vehiculeId: v2.id } })
  const c2 = await prisma.chauffeur.upsert({ where: { telephone: '+221779876543' }, update: {}, create: { nom: 'SALL',   prenom: 'Serigne',   telephone: '+221779876543', permisNumero: 'DKR-2019-042', vehiculeId: v1.id } })
  const c3 = await prisma.chauffeur.upsert({ where: { telephone: '+221785551234' }, update: {}, create: { nom: 'BALDE',  prenom: 'Mamadou',   telephone: '+221785551234', permisNumero: 'DKR-2020-118', vehiculeId: v3.id } })
  const c4 = await prisma.chauffeur.upsert({ where: { telephone: '+221776663344' }, update: {}, create: { nom: 'DIALLO', prenom: 'Abdoulaye', telephone: '+221776663344', permisNumero: 'DKR-2018-207', vehiculeId: v4.id } })

  // Feuilles de route
  const existingFR = await prisma.feuilleDeRoute.findMany({ select: { numero: true } })
  const existingNums = new Set(existingFR.map(f => f.numero))

  const feuilles = [
    {
      numero: 'CCSF-FR-2026-001', date: new Date('2026-05-02'),
      chauffeurId: c1.id, vehiculeId: v2.id,
      lieuChargement: 'Port Môle 1, Dakar', produit: 'Riz SALMA Rouge 50 KGS',
      quantiteTonnes: 50, nombreSacs: 1000, destinationId: destMap['KENIEBA'],
      numeroBl: 'N°20', carburantLitres: 250, carburantFcfa: 544400, fraisRoute: 65000,
      statut: 'EN_ROUTE'
    },
    {
      numero: 'CCSF-FR-2026-002', date: new Date('2026-05-05'),
      chauffeurId: c2.id, vehiculeId: v1.id,
      lieuChargement: 'Port Môle 2, Dakar', produit: 'Riz Brisé 25 KGS',
      quantiteTonnes: 30, nombreSacs: 1200, destinationId: destMap['KAYES'],
      carburantLitres: 200, carburantFcfa: 136000, fraisRoute: 45000,
      statut: 'EN_ATTENTE'
    },
    {
      numero: 'CCSF-FR-2026-003', date: new Date('2026-04-20'),
      chauffeurId: c3.id, vehiculeId: v3.id,
      lieuChargement: 'Entrepôt Thiaroye', produit: 'Farine de Blé 50 KGS',
      quantiteTonnes: 25, nombreSacs: 500, destinationId: destMap['TAMBACOUNDA'],
      carburantLitres: 180, carburantFcfa: 122400, fraisRoute: 40000,
      statut: 'LIVRE', dateDecharge: new Date('2026-04-23'),
      lieuDecharge: 'Dépôt Tambacounda', quantiteLivree: 25, sacsLivres: 500,
      kmDepart: 12500, kmArrivee: 12970, kmParcourus: 470
    },
    {
      numero: 'CCSF-FR-2026-004', date: new Date('2026-05-10'),
      chauffeurId: c4.id, vehiculeId: v4.id,
      lieuChargement: 'Port Môle 1, Dakar', produit: 'Huile végétale 5L',
      quantiteTonnes: 20, nombreSacs: 800, destinationId: destMap['KOLDA'],
      carburantLitres: 160, carburantFcfa: 108800, fraisRoute: 38000,
      statut: 'EN_ROUTE'
    },
    {
      numero: 'CCSF-FR-2026-005', date: new Date('2026-05-01'),
      chauffeurId: c1.id, vehiculeId: v2.id,
      lieuChargement: 'Entrepôt Pikine', produit: 'Sucre 50 KGS',
      quantiteTonnes: 40, nombreSacs: 800, destinationId: destMap['SAINT-LOUIS'],
      carburantLitres: 120, carburantFcfa: 81600, fraisRoute: 28000,
      statut: 'ANNULE'
    }
  ]

  for (const f of feuilles) {
    if (!existingNums.has(f.numero)) {
      await prisma.feuilleDeRoute.create({ data: f })
    }
  }

  // Dotations
  const { CONSUMPTION_REF, MARGIN_PERCENT, PRIX_LITRE_DEFAUT } = require('../src/constants/fuel.js')

  function calcDotation(distanceKm, typeCamion) {
    const conso = CONSUMPTION_REF[typeCamion]
    const litresTheoriques = (distanceKm * conso) / 100
    const dotationBrute = litresTheoriques * PRIX_LITRE_DEFAUT
    const margeFcfa = dotationBrute * MARGIN_PERCENT
    return { litresTheoriques, dotationBrute, margeFcfa, dotationTotale: dotationBrute + margeFcfa }
  }

  const dotations = [
    {
      numeroBon: '001', date: new Date('2026-04-05'),
      chauffeurId: c2.id, vehiculeId: v1.id,
      itineraire: 'KDG/DKR/KAYES', distanceKm: 1455,
      ...calcDotation(1455, 'HOWO_420'),
      litresReels: 800, montantReel: 544000,
      ecartLitres: 800 - calcDotation(1455, 'HOWO_420').litresTheoriques,
      ecartFcfa: (800 - calcDotation(1455, 'HOWO_420').litresTheoriques) * PRIX_LITRE_DEFAUT,
      statut: 'DANS_MARGE', moisPeriode: '2026-04', responsable: 'SALL Serigne'
    },
    {
      numeroBon: '002', date: new Date('2026-04-08'),
      chauffeurId: c1.id, vehiculeId: v2.id,
      itineraire: 'DKR/KENIEBA', distanceKm: 750,
      ...calcDotation(750, 'HOWO_380'),
      litresReels: 350, montantReel: 238000,
      ecartLitres: 350 - calcDotation(750, 'HOWO_380').litresTheoriques,
      ecartFcfa: (350 - calcDotation(750, 'HOWO_380').litresTheoriques) * PRIX_LITRE_DEFAUT,
      statut: 'OK', moisPeriode: '2026-04', responsable: 'DIOUF Sakoura'
    },
    {
      numeroBon: '003', date: new Date('2026-04-15'),
      chauffeurId: c3.id, vehiculeId: v3.id,
      itineraire: 'DKR/TAMBACOUNDA', distanceKm: 470,
      ...calcDotation(470, 'MAN_TGS'),
      litresReels: 260, montantReel: 176800,
      ecartLitres: 260 - calcDotation(470, 'MAN_TGS').litresTheoriques,
      ecartFcfa: (260 - calcDotation(470, 'MAN_TGS').litresTheoriques) * PRIX_LITRE_DEFAUT,
      statut: 'DEPASSEMENT', moisPeriode: '2026-04', responsable: 'BALDE Mamadou'
    },
    {
      numeroBon: '004', date: new Date('2026-05-10'),
      chauffeurId: c4.id, vehiculeId: v4.id,
      itineraire: 'DKR/KOLDA', distanceKm: 510,
      ...calcDotation(510, 'IVECO'),
      statut: 'EN_ATTENTE', moisPeriode: '2026-05', responsable: 'DIALLO Abdoulaye'
    }
  ]

  for (const d of dotations) {
    const existing = await prisma.dotationCarburant.findUnique({ where: { numeroBon: d.numeroBon }, select: { id: true } })
    if (!existing) {
      await prisma.dotationCarburant.create({ data: d })
    }
  }

  // Admin user
  const hashedPwd = await bcrypt.hash('Admin2026!', 10)
  await prisma.user.upsert({
    where: { email: 'admin@ccsf.sn' },
    update: {},
    create: { email: 'admin@ccsf.sn', password: hashedPwd, nom: 'Administrateur', role: 'admin' }
  })

  console.log('Seed terminé avec succès')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
