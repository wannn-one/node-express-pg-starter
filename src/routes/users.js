const express = require('express')
const router = express.Router()

const userController = require('../controllers/userController').default
const { auth } = require('../middlewares/auth')
const { requireAdmin, adminOrOwner } = require('../middlewares/roleAuth')
const { handleValidationErrors } = require('../middlewares/validation')
const { updateProfileValidation, createUserValidation } = require('./validations/users')

// Admin only routes
router.get('/', auth, requireAdmin, userController.getUsers)
router.post('/', auth, requireAdmin, createUserValidation, handleValidationErrors, userController.createUser)

// Protected routes - admin or owner (specific routes first)
router.get('/profile', auth, userController.getProfile)
router.put('/profile', auth, updateProfileValidation, handleValidationErrors, userController.updateProfile)
router.delete('/account', auth, userController.deleteAccount)

// Admin can access any user, users can only access their own (parameterized routes last)
router.get('/:id', auth, adminOrOwner, userController.getUserById)
router.put('/:id', auth, adminOrOwner, updateProfileValidation, handleValidationErrors, userController.updateUser)
router.delete('/:id', auth, requireAdmin, userController.deleteUser)

module.exports = router 