#!/usr/bin/env node

/**
 * Module dependencies.
 */

const app = require('../app')
const config = require('../config/config')
const debug = require('debug')('node-express-pg-starter:server')
const http = require('http')
const { sequelize } = require('../database/models').default

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(config.port)
app.set('port', port)

/**
 * Create HTTP server.
 */

const server = http.createServer(app)

/**
 * Listen on provided port, on all network interfaces.
 */

async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate()
    console.log('✅ Database connection has been established successfully.')
    
    // Sync database (only in development)
    if (config.nodeEnv === 'development') {
      await sequelize.sync({ alter: true })
      console.log('✅ Database synced successfully.')
    }
    
    server.listen(port)
    server.on('error', onError)
    server.on('listening', onListening)
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error)
    process.exit(1)
  }
}

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const port = parseInt(val, 10)

  if (isNaN(port)) {
    // named pipe
    return val
  }

  if (port >= 0) {
    // port number
    return port
  }

  return false
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error
  }

  let bind
  if (typeof port === 'string') {
    bind = 'Pipe ' + port
  } else {
    bind = 'Port ' + port
  }

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges')
      process.exit(1)
      break
    case 'EADDRINUSE':
      console.error(bind + ' is already in use')
      process.exit(1)
      break
    default:
      throw error
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address()
  let bind
  if (typeof addr === 'string') {
    bind = 'pipe ' + addr
  } else {
    bind = 'port ' + addr.port
  }
  
  const baseUrl = `http://${config.host}:${port}`
  
  let apiPrefix
  if (config.api.prefixEnabled) {
    apiPrefix = '/api'
  } else {
    apiPrefix = ''
  }
  
  const apiVersion = config.api.version
  
  console.log('\n🚀 ===== SERVER STARTED SUCCESSFULLY ===== 🚀')
  console.log(`📍 Server URL: ${baseUrl}`)
  console.log(`📝 Environment: ${config.nodeEnv}`)
  console.log(`✌️  API Version: ${apiVersion}`)
  
  let prefixStatus
  if (config.api.prefixEnabled) {
    prefixStatus = 'ENABLED (/api)'
  } else {
    prefixStatus = 'DISABLED (no prefix)'
  }
  console.log(`💪 API Prefix: ${prefixStatus}`)
  
  console.log('\n⚙️  ===== CONFIGURATION SUMMARY ===== ⚙️')
  console.log(`   Port: ${port}`)
  console.log(`   Host: ${config.host}`)
  console.log(`   Node Environment: ${config.nodeEnv}`)
  console.log(`   API Version: ${apiVersion}`)
  console.log(`   API Prefix Enabled: ${config.api.prefixEnabled}`)
  if (config.frontendUrl) {
    console.log(`   Frontend URL: ${config.frontendUrl}`)
  }
  
  console.log('\n📋 ===== AVAILABLE ENDPOINTS ===== 📋')
  
  // Health endpoints (always available at root)
  console.log('\n🏥 Health & Info:')
  console.log(`   GET ${baseUrl}/health`)
  console.log(`   GET ${baseUrl}/version`)
  
  if (config.api.prefixEnabled) {
    console.log('\n🔗 API Endpoints (with /api prefix):')
    console.log(`   📌 Versioned Routes (Recommended):`)
    console.log(`      POST ${baseUrl}${apiPrefix}/${apiVersion}/auth/login`)
    console.log(`      POST ${baseUrl}${apiPrefix}/${apiVersion}/auth/register`)
    console.log(`      GET  ${baseUrl}${apiPrefix}/${apiVersion}/users/profile`)
    console.log(`   📌 Backward Compatibility:`)
    console.log(`      POST ${baseUrl}${apiPrefix}/auth/login`)
    console.log(`      POST ${baseUrl}${apiPrefix}/auth/register`)
    console.log(`      GET  ${baseUrl}${apiPrefix}/users/profile`)
    
    console.log('\n💡 TIP: Your API is configured for path-based routing.')
    console.log('   Perfect for monolith apps or when subdomain is not available.')
    
  } else {
    console.log('\n🔗 API Endpoints (no prefix):')
    console.log(`   📌 Versioned Routes (Recommended):`)
    console.log(`      POST ${baseUrl}/${apiVersion}/auth/login`)
    console.log(`      POST ${baseUrl}/${apiVersion}/auth/register`)
    console.log(`      GET  ${baseUrl}/${apiVersion}/users/profile`)
    console.log(`   📌 Backward Compatibility:`)
    console.log(`      POST ${baseUrl}/auth/login`)
    console.log(`      POST ${baseUrl}/auth/register`)
    console.log(`      GET  ${baseUrl}/users/profile`)
    
    console.log('\n💡 TIP: Your API is configured for subdomain-style routing.')
    console.log('   In production, use: api.yourapp.com instead of yourapp.com/api')
  }
  
  console.log('\n🎯 ===== QUICK TEST COMMANDS ===== 🎯')
  console.log(`curl ${baseUrl}/health`)
  console.log(`curl ${baseUrl}/version`)
  
  if (config.nodeEnv === 'development') {
    console.log('\n🛠️  ===== DEVELOPMENT MODE ===== 🛠️')
    console.log('   Auto-restart: ✅ Enabled')
    console.log('   File watching: src/**/*.js')
    console.log('\n🧪 Development Endpoints:')
    console.log(`   GET ${baseUrl}/dev/test`)
    if (config.api.prefixEnabled) {
      console.log(`   GET ${baseUrl}${apiPrefix}/dev/info`)
    } else {
      console.log(`   GET ${baseUrl}/dev/info`)
    }
  }
  
  console.log('\n' + '='.repeat(50))
  debug('Listening on ' + bind)
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log('❌ Unhandled Promise Rejection at:', promise, 'reason:', err)
  // Close server & exit process
  server.close(() => {
    process.exit(1)
  })
})

// Start the server
startServer() 