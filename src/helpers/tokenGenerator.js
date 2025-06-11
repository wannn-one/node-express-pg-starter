const { randomBytes } = require('crypto')
const { sign } = require('jsonwebtoken')
const { jwt: _jwt } = require('../config/config')

const generateJWT = (payload) => {
  return sign(payload, _jwt.secret, {
    expiresIn: _jwt.expiresIn
  })
}

const generateEmailVerificationToken = () => {
  return randomBytes(32).toString('hex')
}

const generatePasswordResetToken = () => {
  return randomBytes(32).toString('hex')
}

const generateRandomToken = (length = 32) => {
  return randomBytes(length).toString('hex')
}

module.exports = {
  generateJWT,
  generateEmailVerificationToken,
  generatePasswordResetToken,
  generateRandomToken
} 