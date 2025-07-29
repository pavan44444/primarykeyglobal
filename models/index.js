const Sequelize = require('sequelize');
const sequelize = require('../config/db.config');

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.College = require('./College')(sequelize, Sequelize.DataTypes);
db.User = require('./User')(sequelize, Sequelize.DataTypes);
db.Company = require('./Company')(sequelize, Sequelize.DataTypes);


module.exports = db;
