const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const BlacklistedToken = sequelize.define('BlacklistedToken', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    token: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'USER',
        key: 'id'
      }
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'logout'
    }
  }, {
    tableName: 'BLACKLISTED_TOKEN',
    timestamps: true,
    indexes: [
      {
        fields: ['token']
      },
      {
        fields: ['userId']
      },
      {
        fields: ['expiresAt']
      }
    ]
  })

  // Class method to check if token is blacklisted
  BlacklistedToken.isBlacklisted = async function(token) {
    const blacklistedToken = await this.findOne({
      where: {
        token,
        expiresAt: {
          [sequelize.Sequelize.Op.gt]: new Date()
        }
      }
    })
    return !!blacklistedToken
  }

  // Class method to clean up expired tokens
  BlacklistedToken.cleanupExpired = async function() {
    return await this.destroy({
      where: {
        expiresAt: {
          [sequelize.Sequelize.Op.lt]: new Date()
        }
      }
    })
  }

  // Associations
  BlacklistedToken.associate = function(models) {
    BlacklistedToken.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    })
  }

  return BlacklistedToken
} 