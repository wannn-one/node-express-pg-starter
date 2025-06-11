import { readdirSync } from 'fs'
import { basename as _basename, join } from 'path'
import { Sequelize } from 'sequelize'
import config from '../../config/database'

const basename = _basename(__filename)
const env = process.env.NODE_ENV || 'development'
const dbConfig = config[env]

const db = {}

let sequelize

if (dbConfig.use_env_variable) {
  sequelize = new Sequelize(process.env[dbConfig.use_env_variable], dbConfig)
} else {
  sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig)
}

// Load all model files
readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js')
  })
  .forEach(file => {
    const model = require(join(__dirname, file))(sequelize, Sequelize.DataTypes)
    db[model.name] = model
  })

// Set up associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db)
  }
})

db.sequelize = sequelize
db.Sequelize = Sequelize

export default db