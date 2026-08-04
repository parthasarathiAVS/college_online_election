const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CollegeAdmin = sequelize.define('CollegeAdmin', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  college_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
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
    type: DataTypes.ENUM('admin', 'officer'),
    defaultValue: 'admin',
    allowNull: false
  }
}, {
  timestamps: true
});

module.exports = CollegeAdmin;
