const config = require('../config/config')

/**
 * Get API prefix based on configuration
 * @returns {string} API prefix (e.g., '/api' or '')
 */
const getApiPrefix = () => {
  if (config.api.prefixEnabled) {
    return '/api'
  }
  return ''
}

/**
 * Get current API version
 * @returns {string} API version (e.g., 'v1')
 */
const getCurrentVersion = () => {
  return config.api.version
}

/**
 * Create versioned route path
 * @param {string} path - Route path
 * @param {string} version - API version (optional, defaults to current version)
 * @param {boolean} includePrefix - Whether to include API prefix (optional, defaults to config)
 * @returns {string} Versioned route path
 */
const createVersionedPath = (path, version = null, includePrefix = null) => {
  let apiVersion
  if (version) {
    apiVersion = version
  } else {
    apiVersion = getCurrentVersion()
  }
  
  let prefix
  if (includePrefix !== null) {
    if (includePrefix) {
      prefix = '/api'
    } else {
      prefix = ''
    }
  } else {
    prefix = getApiPrefix()
  }
  
  let cleanPath
  if (path.startsWith('/')) {
    cleanPath = path
  } else {
    cleanPath = `/${path}`
  }
  
  return `${prefix}/${apiVersion}${cleanPath}`
}

/**
 * Check if request is for a specific version
 * @param {object} req - Express request object
 * @param {string} version - Version to check
 * @returns {boolean} True if request is for specified version
 */
const isVersion = (req, version) => {
  const requestPath = req.path
  const prefix = getApiPrefix()
  
  // Check both with and without prefix for compatibility
  const withPrefix = requestPath.startsWith(`${prefix}/${version}/`)
  const withoutPrefix = !prefix && requestPath.startsWith(`/${version}/`)
  
  return withPrefix || withoutPrefix
}

/**
 * Extract version from request path
 * @param {object} req - Express request object
 * @returns {string|null} Version if found, null otherwise
 */
const extractVersionFromRequest = (req) => {
  const pathParts = req.path.split('/')
  const prefix = getApiPrefix()
  
  // If prefix is enabled, version should be after /api
  let versionIndex
  if (prefix) {
    versionIndex = 2  // /api/v1/...
  } else {
    versionIndex = 1  // /v1/...
  }
  
  const versionPart = pathParts[versionIndex]
  
  // Check if the part matches version pattern (v1, v2, etc.)
  const versionPattern = /^v\d+$/
  
  if (versionPattern.test(versionPart)) {
    return versionPart
  }
  return null
}

/**
 * Get complete API base URL
 * @param {string} version - API version (optional, defaults to current version)
 * @returns {string} Complete API base URL
 */
const getApiBaseUrl = (version = null) => {
  let apiVersion
  if (version) {
    apiVersion = version
  } else {
    apiVersion = getCurrentVersion()
  }
  
  const prefix = getApiPrefix()
  return `${prefix}/${apiVersion}`
}

module.exports = {
  getCurrentVersion,
  createVersionedPath,
  isVersion,
  extractVersionFromRequest,
  getApiPrefix,
  getApiBaseUrl
} 