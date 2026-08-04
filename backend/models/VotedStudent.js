const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const VotedStudent = sequelize.define('VotedStudent', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  college_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  election_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  voted_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  }
}, {
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['student_id', 'election_id']
    }
  ]
});

module.exports = VotedStudent;
