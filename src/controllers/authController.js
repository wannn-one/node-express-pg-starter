const db = require('../database/models').default
const { Op } = require('sequelize')
const tokenGenerator = require('../helpers/tokenGenerator')
const { sendVerificationEmail, sendPasswordResetEmail } = require('../helpers/emailService')
const jwt = require('jsonwebtoken')
const config = require('../config/config')

const { User, BlacklistedToken } = db
const { generateJWT, generateEmailVerificationToken, generatePasswordResetToken } = tokenGenerator

const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body

    // Check if user already exists
    const existingUser = await User.findByEmail(email)
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      })
    }

    // Generate email verification token
    const emailVerificationToken = generateEmailVerificationToken()
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      emailVerificationToken,
      emailVerificationExpires
    })

    // Send verification email
    try {
      await sendVerificationEmail(user, emailVerificationToken)
    } catch (emailError) {
      console.error('Error sending verification email:', emailError)
      // Don't fail registration if email fails
    }

    // Generate JWT token
    const token = generateJWT({ id: user.id })

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email to verify your account.',
      data: {
        user,
        token
      }
    })
  } catch (error) {
    next(error)
  }
}

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    // Find user by email
    const user = await User.findByEmail(email)
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    // Update last login
    await user.update({ lastLoginAt: new Date() })

    // Generate JWT token
    const token = generateJWT({ id: user.id })

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token
      }
    })
  } catch (error) {
    next(error)
  }
}

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body

    // Find user by verification token
    const user = await User.findOne({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: {
          [Op.gt]: new Date()
        }
      }
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      })
    }

    // Update user
    await user.update({
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null
    })

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    })
  } catch (error) {
    next(error)
  }
}

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body

    const user = await User.findByEmail(email)
    if (!user || !user.isActive) {
      // Return success even if user doesn't exist (security)
      return res.status(200).json({
        success: true,
        message: 'If the email exists, a password reset link has been sent'
      })
    }

    // Generate reset token
    const resetToken = generatePasswordResetToken()
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Update user with reset token
    await user.update({
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires
    })

    // Send reset email
    try {
      await sendPasswordResetEmail(user, resetToken)
    } catch (emailError) {
      console.error('Error sending reset email:', emailError)
      return res.status(500).json({
        success: false,
        message: 'Error sending password reset email'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email'
    })
  } catch (error) {
    next(error)
  }
}

const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body

    // Find user by reset token
    const user = await User.findOne({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          [Op.gt]: new Date()
        }
      }
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      })
    }

    // Update password and clear reset token
    await user.update({
      password,
      passwordResetToken: null,
      passwordResetExpires: null
    })

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    })
  } catch (error) {
    next(error)
  }
}

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body
    const user = req.user

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword)
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      })
    }

    // Update password
    await user.update({ password: newPassword })

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    })
  } catch (error) {
    next(error)
  }
}

const resendVerification = async (req, res, next) => {
  try {
    const user = req.user

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      })
    }

    // Generate new verification token
    const emailVerificationToken = generateEmailVerificationToken()
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Update user
    await user.update({
      emailVerificationToken,
      emailVerificationExpires
    })

    // Send verification email
    try {
      await sendVerificationEmail(user, emailVerificationToken)
    } catch (emailError) {
      console.error('Error sending verification email:', emailError)
      return res.status(500).json({
        success: false,
        message: 'Error sending verification email'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully'
    })
  } catch (error) {
    next(error)
  }
}

const logout = async (req, res, next) => {
  try {
    const token = req.token
    const user = req.user

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'No token provided'
      })
    }

    // Decode token to get expiration date
    const decoded = jwt.decode(token)
    const expiresAt = new Date(decoded.exp * 1000) // Convert from seconds to milliseconds

    // Add token to blacklist
    await BlacklistedToken.create({
      token,
      userId: user.id,
      expiresAt,
      reason: 'logout'
    })

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  register,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  resendVerification
} 