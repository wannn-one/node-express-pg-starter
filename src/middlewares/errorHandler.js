const config = require('../config/config')

const errorHandler = (err, req, res, next) => {
  let error = { ...err }
  error.message = err.message

  // Log error
  console.error(err)

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map(error => error.message)
    error.message = messages.join(', ')
    return res.status(400).json({
      success: false,
      message: error.message
    })
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0].path
    error.message = `${field} already exists`
    return res.status(400).json({
      success: false,
      message: error.message
    })
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token'
    return res.status(401).json({
      success: false,
      message: error.message
    })
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired'
    return res.status(401).json({
      success: false,
      message: error.message
    })
  }

  // Default error
  const responseData = {
    success: false,
    message: error.message || 'Server Error'
  }
  
  // Add stack trace in development mode
  if (config.nodeEnv === 'development') {
    responseData.stack = err.stack
  }
  
  res.status(err.statusCode || 500).json(responseData)
}

module.exports = errorHandler 