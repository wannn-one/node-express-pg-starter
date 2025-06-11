/**
 * Example: How to add a new API version
 * 
 * This file shows how to use the router configuration to add new API versions
 * without modifying the main app.js file.
 */

const { addNewVersion, getSupportedVersions } = require('./router')
const { getApiPrefix } = require('../utils/apiVersion')

// Example: Adding API v2
const setupV2Routes = (app) => {
  // Import v2 routes (you would create these)
  // const authV2Routes = require('../routes/v2/auth')
  // const userV2Routes = require('../routes/v2/users')
  
  // Add the new version
  /*
  addNewVersion('v2', {
    auth: authV2Routes,
    users: userV2Routes
  }, app)
  */
  
  console.log('Current supported versions:', getSupportedVersions())
  
  let prefixDisplay
  if (getApiPrefix()) {
    prefixDisplay = getApiPrefix()
  } else {
    prefixDisplay = 'none'
  }
  console.log('API prefix:', prefixDisplay)
}

// Example: Custom route setup for specific environments
const setupCustomRoutes = (app) => {
  const config = require('./config')
  const prefix = getApiPrefix()
  
  // Add development-only routes
  if (config.nodeEnv === 'development') {
    console.log('🧪 Setting up development routes...')
    
    app.get('/dev/test', (req, res) => {
      let prefixDisplay
      if (prefix) {
        prefixDisplay = prefix
      } else {
        prefixDisplay = 'none'
      }
      
      res.json({ 
        message: 'Development test endpoint',
        apiPrefix: prefixDisplay,
        note: 'This endpoint is always at root level'
      })
    })
    
    // Example: Prefixed development route
    let devInfoPath
    if (prefix) {
      devInfoPath = `${prefix}/dev/info`
    } else {
      devInfoPath = '/dev/info'
    }
    
    app.get(devInfoPath, (req, res) => {
      let prefixDisplay
      if (prefix) {
        prefixDisplay = prefix
      } else {
        prefixDisplay = 'none'
      }
      
      res.json({
        message: 'Prefixed development endpoint',
        currentPrefix: prefixDisplay,
        fullPath: devInfoPath,
        timestamp: new Date().toISOString()
      })
    })
    
    console.log(`✅ Development routes added:`)
    console.log(`   GET /dev/test`)
    console.log(`   GET ${devInfoPath}`)
  }
  
  // Add admin routes (example)
  // const adminRoutes = require('../routes/admin')
  // app.use(`${prefix}/admin`, adminRoutes)
}

// Example: Environment-based prefix configuration
const demonstratePrefixUsage = () => {
  const config = require('./config')
  
  console.log('=== API Prefix Configuration ===')
  console.log('Prefix Enabled:', config.api.prefixEnabled)
  
  let prefixDisplay
  if (getApiPrefix()) {
    prefixDisplay = getApiPrefix()
  } else {
    prefixDisplay = 'none'
  }
  console.log('Current Prefix:', prefixDisplay)
  console.log('API Version:', config.api.version)
  
  if (config.api.prefixEnabled) {
    console.log('Routes will be: /api/v1/auth, /api/v1/users')
  } else {
    console.log('Routes will be: /v1/auth, /v1/users')
  }
}

module.exports = {
  setupV2Routes,
  setupCustomRoutes,
  demonstratePrefixUsage
}

/*
Usage in app.js:

const { setupRoutes } = require('./config/router')
const { setupV2Routes, setupCustomRoutes, demonstratePrefixUsage } = require('./config/router.example')

// Setup main routes
setupRoutes(app)

// Setup additional versions or custom routes
setupV2Routes(app)
setupCustomRoutes(app)

// Show prefix configuration
demonstratePrefixUsage()

=== Environment Examples ===

1. Subdomain API (recommended):
   API_PREFIX_ENABLED=false
   Routes: api.yourapp.com/v1/auth, api.yourapp.com/v1/users

2. Path-based API:
   API_PREFIX_ENABLED=true  
   Routes: yourapp.com/api/v1/auth, yourapp.com/api/v1/users

3. Development without subdomain:
   API_PREFIX_ENABLED=false
   Routes: localhost:3000/v1/auth, localhost:3000/v1/users
*/ 