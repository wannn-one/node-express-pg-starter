const nodemailer = require('nodemailer')
const config = require('../config/config')

// Skip email sending in test environment
const isTestEnv = process.env.NODE_ENV === 'test'

// Create transporter only if not in test environment
let transporter = null
if (!isTestEnv) {
  transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    auth: config.email.auth
  })

  // Verify connection configuration
  transporter.verify(function(error, success) {
    if (error) {
      console.log('❌ Email configuration error:', error)
    } else {
      console.log('✅ Email server is ready to take our messages')
    }
  })
}

const sendEmail = async (options) => {
  // In test environment, mock email sending
  if (isTestEnv) {
    console.log('📧 Mock email sent:', {
      to: options.to,
      subject: options.subject
    })
    return { messageId: 'mock-message-id' }
  }

  const mailOptions = {
    from: config.email.from,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Email sent successfully:', info.messageId)
    return info
  } catch (error) {
    console.error('❌ Error sending email:', error)
    throw error
  }
}

const sendVerificationEmail = async (user, token) => {
  const verificationUrl = `${config.frontendUrl}/verify-email?token=${token}`
  
  const html = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <h2 style="color: #333; text-align: center;">Email Verification</h2>
      <p>Hello ${user.firstName},</p>
      <p>Thank you for registering! Please click the link below to verify your email address:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" 
           style="background-color: #007bff; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          Verify Email Address
        </a>
      </div>
      <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create an account, please ignore this email.</p>
    </div>
  `

  const text = `
    Hello ${user.firstName},
    
    Thank you for registering! Please click the link below to verify your email address:
    ${verificationUrl}
    
    This link will expire in 24 hours.
    
    If you didn't create an account, please ignore this email.
  `

  await sendEmail({
    to: user.email,
    subject: 'Verify Your Email Address',
    html,
    text
  })
}

const sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${config.frontendUrl}/reset-password?token=${token}`
  
  const html = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <h2 style="color: #333; text-align: center;">Password Reset</h2>
      <p>Hello ${user.firstName},</p>
      <p>You requested a password reset. Please click the link below to reset your password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background-color: #dc3545; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${resetUrl}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request a password reset, please ignore this email.</p>
    </div>
  `

  const text = `
    Hello ${user.firstName},
    
    You requested a password reset. Please click the link below to reset your password:
    ${resetUrl}
    
    This link will expire in 1 hour.
    
    If you didn't request a password reset, please ignore this email.
  `

  await sendEmail({
    to: user.email,
    subject: 'Password Reset Request',
    html,
    text
  })
}

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail
} 