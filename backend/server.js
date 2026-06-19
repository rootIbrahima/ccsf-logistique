require('dotenv').config()

// Valider les variables d'environnement critiques au démarrage
const required = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET']
for (const key of required) {
  if (!process.env[key]) {
    console.error(`Variable d'environnement manquante : ${key}`)
    process.exit(1)
  }
}

const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const logger = require('./src/utils/logger')

const app = express()

const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL || 'http://localhost:5173'
]

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true)
    cb(new Error(`Origine non autorisée : ${origin}`))
  },
  credentials: true
}))

app.use(express.json())
app.use(cookieParser())

// Routes
app.use('/api/auth',             require('./src/routes/auth'))
app.use('/api/chauffeurs',       require('./src/routes/chauffeurs'))
app.use('/api/vehicules',        require('./src/routes/vehicules'))
app.use('/api/feuilles-de-route', require('./src/routes/feuillesDeRoute'))
app.use('/api/dotations',        require('./src/routes/dotations'))
app.use('/api/destinations',     require('./src/routes/destinations'))
app.use('/api/carte',            require('./src/routes/carte'))
app.use('/api/dashboard',        require('./src/routes/dashboard'))
app.use('/api/repertoire',       require('./src/routes/repertoire'))

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

// Gestion d'erreur globale
app.use((err, req, res, next) => {
  logger.error({ err, url: req.url, method: req.method }, 'Erreur non gérée')
  res.status(500).json({ message: 'Erreur serveur interne' })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  logger.info(`Serveur CCSF démarré sur http://localhost:${PORT}`)
})
