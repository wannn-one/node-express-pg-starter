import db from '../database/models/index.js'

const { User } = db

const getProfile = async (req, res, next) => {
  try {
    const user = req.user

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user
      }
    })
  } catch (error) {
    next(error)
  }
}

const updateProfile = async (req, res, next) => {
  try {
    const user = req.user
    const { firstName, lastName } = req.body

    // Update user profile
    await user.update({
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName
    })

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user
      }
    })
  } catch (error) {
    next(error)
  }
}

const deleteAccount = async (req, res, next) => {
  try {
    const user = req.user

    // Soft delete - set isActive to false
    await user.update({ isActive: false })

    res.status(200).json({
      success: true,
      message: 'Account deactivated successfully'
    })
  } catch (error) {
    next(error)
  }
}

const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit

    const { count, rows: users } = await User.findAndCountAll({
      where: { isActive: true },
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    })

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalUsers: count,
          hasNext: offset + limit < count,
          hasPrev: page > 1
        }
      }
    })
  } catch (error) {
    next(error)
  }
}

const createUser = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, role } = req.body

    // Check if user already exists
    const existingUser = await User.findByEmail(email)
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      })
    }

    // Create new user
    const newUser = await User.create({
      email,
      password,
      firstName,
      lastName,
      role: role || 'user'
    })

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: newUser
      }
    })
  } catch (error) {
    next(error)
  }
}

const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params

    const user = await User.findByPk(id)
    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: {
        user
      }
    })
  } catch (error) {
    next(error)
  }
}

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params
    const { firstName, lastName, role } = req.body

    const user = await User.findByPk(id)
    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Only admin can change roles
    const updateData = {
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName
    }

    // Only allow role update if current user is admin
    if (role && req.user.role === 'admin') {
      updateData.role = role
    }

    await user.update(updateData)

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        user
      }
    })
  } catch (error) {
    next(error)
  }
}

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params

    const user = await User.findByPk(id)
    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Prevent self-deletion
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      })
    }

    // Soft delete - set isActive to false
    await user.update({ isActive: false })

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}

export default {
  getProfile,
  updateProfile,
  deleteAccount,
  getUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser
} 