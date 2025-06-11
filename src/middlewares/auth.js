const jwt = require('jsonwebtoken')
const db = require('../database/models').default
const config = require('../config/config')

const { User, BlacklistedToken } = db

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      })
    }

    // Check if token is blacklisted
    const isBlacklisted = await BlacklistedToken.isBlacklisted(token)
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: 'Token has been invalidated. Please login again.'
      })
    }

    const decoded = jwt.verify(token, config.jwt.secret)
    const user = await User.findByPk(decoded.id)
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or user not found.'
      })
    }

    req.user = user
    req.token = token // Store token for potential logout
    next()
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token.'
    })
  }
}

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (token) {
      // Check if token is blacklisted
      const isBlacklisted = await BlacklistedToken.isBlacklisted(token)
      if (!isBlacklisted) {
        const decoded = jwt.verify(token, config.jwt.secret)
        const user = await User.findByPk(decoded.id)
        
        if (user && user.isActive) {
          req.user = user
          req.token = token
        }
      }
    }
    
    next()
  } catch (error) {
    // Continue without authentication
    next()
  }
}

module.exports = {
  auth,
  optionalAuth
} 