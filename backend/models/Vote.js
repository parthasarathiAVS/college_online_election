const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Vote = sequelize.define('Vote', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  college_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  election_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  encrypted_ballot: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'AES-256 encrypted string containing JSON of position_id and candidate_id'
  },
  voted_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  }
}, {
  timestamps: false
});

module.exports = Vote;
