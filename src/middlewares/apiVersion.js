const config = require('../config/config')
const { extractVersionFromRequest, getCurrentVersion } = require('../utils/apiVersion')

/**
 * Middleware to validate API version
 * @param {Array} supportedVersions - Array of supported versions (e.g., ['v1', 'v2'])
 * @returns {Function} Express middleware
 */
const validateApiVersion = (supportedVersions = ['v1']) => {
  return (req, res, next) => {
    const requestedVersion = extractVersionFromRequest(req)
    
    // If no version in path, use current default version
    if (!requestedVersion) {
      req.apiVersion = getCurrentVersion()
      return next()
    }
    
    // Check if requested version is supported
    if (!supportedVersions.includes(requestedVersion)) {
      return res.status(400).json({
        error: 'Unsupported API version',
        requestedVersion,
        supportedVersions,
        message: `API version '${requestedVersion}' is not supported. Supported versions: ${supportedVersions.join(', ')}`
      })
    }
    
    req.apiVersion = requestedVersion
    next()
  }
}

/**
 * Middleware to add API version info to response headers
 * @returns {Function} Express middleware
 */
const addVersionHeaders = () => {
  return (req, res, next) => {
    let apiVersion
    if (req.apiVersion) {
      apiVersion = req.apiVersion
    } else {
      apiVersion = getCurrentVersion()
    }
    
    res.set({
      'X-API-Version': apiVersion,
      'X-API-Supported-Versions': 'v1', // Update this when you add more versions
    })
    next()
  }
}

/**
 * Middleware for API deprecation warnings
 * @param {string} version - Version to mark as deprecated
 * @param {string} sunset - Sunset date (ISO string)
 * @param {string} message - Deprecation message
 * @returns {Function} Express middleware
 */
const deprecationWarning = (version, sunset, message) => {
  return (req, res, next) => {
    let requestedVersion
    if (req.apiVersion) {
      requestedVersion = req.apiVersion
    } else {
      requestedVersion = extractVersionFromRequest(req)
    }
    
    if (requestedVersion === version) {
      let deprecationMessage
      if (message) {
        deprecationMessage = message
      } else {
        deprecationMessage = `API version ${version} is deprecated and will be removed on ${sunset}`
      }
      
      res.set({
        'Deprecation': 'true',
        'Sunset': sunset,
        'X-Deprecation-Warning': deprecationMessage
      })
    }
    
    next()
  }
}

module.exports = {
  validateApiVersion,
  addVersionHeaders,
  deprecationWarning
} 