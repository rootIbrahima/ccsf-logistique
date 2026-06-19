const { z } = require('zod')

const chauffeurSchema = z.object({
  nom:          z.string().min(2, 'Nom requis (min 2 caractères)'),
  prenom:       z.string().min(2, 'Prénom requis (min 2 caractères)'),
  telephone:    z.string()
    .transform(v => v.replace(/[\s\-\.]/g, ''))
    .refine(v => /^\+2217\d{8}$/.test(v), 'Format téléphone invalide (+221 7X XXX XX XX)'),
  permisNumero: z.string().optional(),
  statut:       z.enum(['ACTIF', 'INACTIF']).default('ACTIF'),
  vehiculeId:   z.string().cuid().optional().nullable()
})

const chauffeurUpdateSchema = chauffeurSchema.partial()

module.exports = { chauffeurSchema, chauffeurUpdateSchema }
