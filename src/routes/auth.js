const express = require('express')
const router = express.Router()

const authController = require('../controllers/authController')
const { auth } = require('../middlewares/auth')
const { handleValidationErrors } = require('../middlewares/validation')
const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  verifyEmailValidation,
  changePasswordValidation
} = require('./validations/auth')

// Public routes
router.post('/register', registerValidation, handleValidationErrors, authController.register)
router.post('/login', loginValidation, handleValidationErrors, authController.login)
router.post('/verify-email', verifyEmailValidation, handleValidationErrors, authController.verifyEmail)
router.post('/forgot-password', forgotPasswordValidation, handleValidationErrors, authController.forgotPassword)
router.post('/reset-password', resetPasswordValidation, handleValidationErrors, authController.resetPassword)

// Protected routes
router.post('/logout', auth, authController.logout)
router.post('/change-password', auth, changePasswordValidation, handleValidationErrors, authController.changePassword)
router.post('/resend-verification', auth, authController.resendVerification)

module.exports = router 