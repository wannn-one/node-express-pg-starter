const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const config = require('./config/config')

// Import router configuration
const { setupRoutes } = require('./config/router')

const app = express()

// Trust proxy (important for rate limiting behind reverse proxy)
app.set('trust proxy', 1)

// Security middleware
app.use(helmet())

// Enable CORS
app.use(cors({
  origin: config.frontendUrl,
  credentials: true
}))

// Compression middleware
app.use(compression())

// Request logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'))
} else {
  app.use(morgan('combined'))
}

// Rate limiting
const limiter = rateLimit(config.rateLimit)
app.use('/', limiter)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Setup all routes (versioning, API routes, error handling)
setupRoutes(app)

module.exports = app