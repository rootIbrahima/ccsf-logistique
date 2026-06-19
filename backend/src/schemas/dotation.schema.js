const { z } = require('zod')

const dotationSchema = z.object({
  date:        z.string(),
  chauffeurId: z.string().cuid(),
  vehiculeId:  z.string().cuid(),
  itineraire:  z.string().min(2),
  distanceKm:  z.number().positive(),
  moisPeriode: z.string().regex(/^\d{4}-\d{2}$/, 'Format YYYY-MM requis'),
  responsable: z.string().optional(),
  litresReels: z.number().optional(),
  montantReel: z.number().optional()
})

const dotationUpdateSchema = dotationSchema.partial().extend({
  statut: z.enum(['EN_ATTENTE', 'OK', 'DANS_MARGE']).optional(),
  validePar: z.string().optional()
})

module.exports = { dotationSchema, dotationUpdateSchema }
