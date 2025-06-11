/**
 * Role-based authorization middleware
 * Checks if the authenticated user has the required role
 */
const requireRole = (requiredRole) => {
  return (req, res, next) => {
    // Check if user is authenticated (should be done by auth middleware first)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      })
    }

    // Check if user has the required role
    if (req.user.role !== requiredRole) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      })
    }

    next()
  }
}

/**
 * Admin only middleware
 */
const requireAdmin = requireRole('admin')

/**
 * Check if user is admin or accessing their own resource
 */
const adminOrOwner = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    })
  }

  // Allow if user is admin
  if (req.user.role === 'admin') {
    return next()
  }

  // Allow if user is accessing their own resource
  const userId = req.params.id || req.params.userId || req.user.id
  if (req.user.id === userId) {
    return next()
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied. You can only access your own resources.'
  })
}

module.exports = {
  requireRole,
  requireAdmin,
  adminOrOwner
} 