const { z } = require('zod')

const vehiculeSchema = z.object({
  immatriculation: z.string().min(2, 'Immatriculation requise'),
  typeCamion:      z.enum(['HOWO_420', 'HOWO_380', 'MAN_TGS', 'IVECO', 'AUTRE']),
  marque:          z.string().optional(),
  modele:          z.string().optional(),
  consommationRef: z.number().positive('Consommation doit être positive'),
  statut:          z.enum(['DISPONIBLE', 'EN_MISSION', 'MAINTENANCE']).default('DISPONIBLE'),
  chauffeurId:     z.string().cuid().optional().nullable()
})

const vehiculeUpdateSchema = vehiculeSchema.partial()

module.exports = { vehiculeSchema, vehiculeUpdateSchema }
