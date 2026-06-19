const { z } = require('zod')

// Convertit "" ou null → undefined, sinon parse en nombre
const optNum = z.preprocess(
  v => (v === '' || v == null ? undefined : Number(v)),
  z.number().optional()
)
const optInt = z.preprocess(
  v => (v === '' || v == null ? undefined : Number(v)),
  z.number().int().optional()
)

const feuilleDeRouteSchema = z.object({
  date:            z.string(),
  chauffeurId:     z.string().cuid(),
  vehiculeId:      z.string().cuid(),
  lieuChargement:  z.string().min(2),
  produit:         z.string().min(2),
  quantiteTonnes:  z.coerce.number().positive(),
  nombreSacs:      z.coerce.number().int().positive(),
  destinationId:   z.string().cuid(),
  numeroBl:        z.string().optional(),
  carburantLitres: optNum,
  carburantFcfa:   optNum,
  fraisRoute:      optNum,
  autresFrais:     optNum,
  kmDepart:        optInt
})

const feuilleDeRouteUpdateSchema = z.object({
  statut:         z.enum(['EN_ATTENTE', 'EN_ROUTE', 'LIVRE', 'ANNULE']).optional(),
  dateDecharge:   z.string().optional().nullable(),
  lieuDecharge:   z.string().optional(),
  quantiteLivree: optNum,
  sacsLivres:     optInt,
  reserves:       z.string().optional(),
  kmArrivee:      optInt,
  visaLogistique: z.preprocess(v => v === 'true' ? true : v === 'false' ? false : v, z.boolean().optional()),
  visaDirection:  z.preprocess(v => v === 'true' ? true : v === 'false' ? false : v, z.boolean().optional())
})

module.exports = { feuilleDeRouteSchema, feuilleDeRouteUpdateSchema }
