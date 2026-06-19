const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const logger = require('../utils/logger')

const prisma = new PrismaClient()

function signAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, nom: user.nom },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  )
}

function signRefreshToken(user) {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  )
}

async function login(req, res) {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' })
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, password: true, role: true, nom: true }
    })
    if (!user) {
      return res.status(401).json({ message: 'Identifiants incorrects' })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(401).json({ message: 'Identifiants incorrects' })
    }

    const accessToken = signAccessToken(user)
    const refreshToken = signRefreshToken(user)

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    logger.info({ userId: user.id }, 'Connexion réussie')
    return res.json({
      accessToken,
      user: { id: user.id, email: user.email, role: user.role, nom: user.nom }
    })
  } catch (err) {
    logger.error({ err }, 'Erreur lors de la connexion')
    return res.status(500).json({ message: 'Erreur serveur lors de la connexion' })
  }
}

async function refresh(req, res) {
  try {
    const token = req.cookies?.refreshToken
    if (!token) {
      return res.status(401).json({ message: 'Refresh token manquant' })
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, nom: true }
    })
    if (!user) {
      return res.status(401).json({ message: 'Utilisateur introuvable' })
    }

    const accessToken = signAccessToken(user)
    return res.json({ accessToken })
  } catch (err) {
    return res.status(401).json({ message: 'Refresh token invalide ou expiré' })
  }
}

function logout(req, res) {
  res.clearCookie('refreshToken')
  return res.json({ message: 'Déconnexion réussie' })
}

module.exports = { login, refresh, logout }
