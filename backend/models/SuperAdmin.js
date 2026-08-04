const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SuperAdmin = sequelize.define('SuperAdmin', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'super_admin'
  }
}, {
  timestamps: true
});

module.exports = SuperAdmin;
