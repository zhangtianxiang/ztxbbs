const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')
const basename = path.basename(__filename)

const env = process.env.NODE_ENV || 'development'
const config = require('../config/config.js')[env]
const log = require('../tools')

let db = {}

let logger = function(...argv) {
  if (process.env.NODE_ENV == 'production') {
    log.sql(argv[0])
  } else {
    // console.log(argv[0])
    log.sql(argv[0]) // develop
  }
}

let sequelize = new Sequelize(config.db_database, config.db_username, config.db_password, {
  logging: logger,
  host: config.db_hostname,
  port: config.db_hostport,
  dialect : config.dialect,
  define: {
    underscored: true,
    // freezeTableName: false,
    charset: 'utf8',
    dialectOptions: {
      collate: 'utf8_general_ci'
    },
    timestamps: false // 禁用时间戳
  },
})

fs.readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js')
  })
  .forEach(file => {
    let model = sequelize['import'](path.join(__dirname, file))
    db[model.name] = model
  })

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db)
  }
})

// console.log(sequelize)

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db