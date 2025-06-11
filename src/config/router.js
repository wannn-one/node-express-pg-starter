const config = require('./config')

// Import routes
const authRoutes = require('../routes/auth')
const userRoutes = require('../routes/users')

// Import middlewares
const { validateApiVersion, addVersionHeaders } = require('../middlewares/apiVersion')
const notFound = require('../middlewares/notFound')
const errorHandler = require('../middlewares/errorHandler')

// Import API utilities
const { getApiPrefix } = require('../utils/apiVersion')

/**
 * Configure API versioning middleware
 * @param {Express} app - Express application instance
 */
const setupVersioningMiddleware = (app) => {
  // API versioning middleware
  app.use(validateApiVersion(['v1'])) // Add more versions as needed
  app.use(addVersionHeaders())
}

/**
 * Configure health and utility endpoints
 * @param {Express} app - Express application instance
 */
const setupUtilityRoutes = (app) => {
  const prefix = getApiPrefix()
  
  // Health check endpoint (always at root, no prefix)
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      apiVersion: req.apiVersion || config.api.version,
      supportedVersions: getSupportedVersions(),
      apiPrefix: prefix || 'none'
    })
  })

  // API version info endpoint (always at root, no prefix)
  app.get('/version', (req, res) => {
    res.status(200).json({
      currentVersion: config.api.version,
      requestedVersion: req.apiVersion,
      supportedVersions: getSupportedVersions(),
      apiPrefix: prefix || 'none',
      timestamp: new Date().toISOString()
    })
  })
}

/**
 * Configure versioned API routes
 * @param {Express} app - Express application instance
 */
const setupVersionedRoutes = (app) => {
  const apiVersion = config.api.version
  const prefix = getApiPrefix()
  
  // Versioned routes (recommended)
  app.use(`${prefix}/${apiVersion}/auth`, authRoutes)
  app.use(`${prefix}/${apiVersion}/users`, userRoutes)
}

/**
 * Configure backward compatibility routes (without version)
 * @param {Express} app - Express application instance
 */
const setupBackwardCompatibilityRoutes = (app) => {
  const prefix = getApiPrefix()
  
  // Backward compatibility routes
  app.use(`${prefix}/auth`, authRoutes)
  app.use(`${prefix}/users`, userRoutes)
}

/**
 * Configure error handling middleware
 * @param {Express} app - Express application instance
 */
const setupErrorHandling = (app) => {
  // 404 handler
  app.use(notFound)
  
  // Error handling middleware (should be last)
  app.use(errorHandler)
}

/**
 * Configure development-only routes
 * @param {Express} app - Express application instance
 */
const setupDevelopmentRoutes = (app) => {
  if (config.nodeEnv === 'development') {
    const prefix = getApiPrefix()
    
    // Development test endpoint (always at root)
    app.get('/dev/test', (req, res) => {
      res.json({ 
        message: 'Development test endpoint - working!',
        environment: config.nodeEnv,
        apiPrefix: prefix || 'none',
        apiVersion: config.api.version,
        timestamp: new Date().toISOString(),
        note: 'This endpoint is always at root level'
      })
    })
    
    // Development info endpoint (respects prefix setting)
    let devInfoPath
    if (prefix) {
      devInfoPath = `${prefix}/dev/info`
    } else {
      devInfoPath = '/dev/info'
    }
    
    app.get(devInfoPath, (req, res) => {
      res.json({
        message: 'Development info endpoint - working!',
        environment: config.nodeEnv,
        currentPrefix: prefix || 'none',
        fullPath: devInfoPath,
        apiVersion: config.api.version,
        serverConfig: {
          prefixEnabled: config.api.prefixEnabled,
          nodeEnv: config.nodeEnv,
          port: process.env.PORT || 3000
        },
        timestamp: new Date().toISOString()
      })
    })
    
    console.log('🧪 Development routes registered:')
    console.log(`   ✅ GET /dev/test`)
    console.log(`   ✅ GET ${devInfoPath}`)
  }
}

/**
 * Setup all routes and middleware in the correct order
 * @param {Express} app - Express application instance
 */
const setupRoutes = (app) => {
  // 1. API versioning middleware (should be early, after body parsing)
  setupVersioningMiddleware(app)
  
  // 2. Utility endpoints (health, version info)
  setupUtilityRoutes(app)
  
  // 3. Development routes (only in development)
  setupDevelopmentRoutes(app)
  
  // 4. Versioned API routes
  setupVersionedRoutes(app)
  
  // 5. Backward compatibility routes
  setupBackwardCompatibilityRoutes(app)
  
  // 6. Error handling (should be last)
  setupErrorHandling(app)
}

/**
 * Get supported API versions
 * @returns {Array} Array of supported versions
 */
const getSupportedVersions = () => {
  return ['v1'] // Update this when adding more versions, example: ['v1', 'v2']
}

/**
 * Add a new API version
 * @param {string} version - New version to add (e.g., 'v2')
 * @param {Object} routes - Routes object containing auth and user routes for the new version
 * @param {Express} app - Express application instance
 */
const addNewVersion = (version, routes, app) => {
  const prefix = getApiPrefix()
  
  // Add versioned routes for new version
  if (routes.auth) {
    app.use(`${prefix}/${version}/auth`, routes.auth)
  }
  if (routes.users) {
    app.use(`${prefix}/${version}/users`, routes.users)
  }
  
  console.log(`✅ Added API version: ${version} with prefix: ${prefix || 'none'}`)
}

module.exports = {
  setupRoutes,
  setupVersioningMiddleware,
  setupUtilityRoutes,
  setupVersionedRoutes,
  setupBackwardCompatibilityRoutes,
  setupErrorHandling,
  setupDevelopmentRoutes,
  getSupportedVersions,
  addNewVersion
} 