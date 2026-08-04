const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const College = sequelize.define('College', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  college_code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  principal_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  election_officer: {
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
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  website: {
    type: DataTypes.STRING,
    allowNull: true
  },
  logo_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'suspended'),
    defaultValue: 'pending',
    allowNull: false
  },
  evm_pin: {
    type: DataTypes.STRING,
    defaultValue: '123456',
    allowNull: false
  },
  failed_exit_attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  is_exit_locked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  }
}, {
  timestamps: true
});

module.exports = College;
