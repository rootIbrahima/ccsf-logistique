const { searchRepertoire } = require('../services/search.service')
const logger = require('../utils/logger')

async function search(req, res) {
  try {
    const q = req.query.q || ''
    const result = await searchRepertoire(q)
    return res.json(result)
  } catch (err) {
    logger.error({ err }, 'Erreur recherche répertoire')
    return res.status(500).json({ message: 'Erreur lors de la recherche' })
  }
}

module.exports = { search }
