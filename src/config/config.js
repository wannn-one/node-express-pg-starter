require('dotenv').config()

// Server configuration
const port = process.env.PORT ?? 3000
const host = process.env.HOST ?? 'localhost'
const nodeEnv = process.env.NODE_ENV ?? 'development'

// API configuration
const api = {
  version: process.env.API_VERSION ?? 'v1',
  prefixEnabled: process.env.API_PREFIX_ENABLED === 'true'
}

// JWT configuration
const jwt = {
  secret: process.env.JWT_SECRET ?? 'default_jwt_secret_change_in_production',
  expiresIn: process.env.JWT_EXPIRES_IN ?? '7d'
}

// Email configuration
const email = {
  host: process.env.MAIL_HOST ?? 'smtp.gmail.com',
  port: parseInt(process.env.MAIL_PORT ?? '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USERNAME ?? '',
    pass: process.env.MAIL_PASSWORD ?? ''
  },
  from: process.env.MAIL_FROM ?? 'noreply@yourapp.com'
}

// Rate limiting configuration
const rateLimit = {
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS ?? '100')
}

// Frontend URL
const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000'

module.exports = {
  port,
  host,
  nodeEnv,
  api,
  jwt,
  email,
  rateLimit,
  frontendUrl
}