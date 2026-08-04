const sequelize = require('../config/db');
const SuperAdmin = require('./SuperAdmin');
const College = require('./College');
const CollegeAdmin = require('./CollegeAdmin');
const Department = require('./Department');
const Position = require('./Position');
const Student = require('./Student');
const Candidate = require('./Candidate');
const Election = require('./Election');
const Vote = require('./Vote');
const VotedStudent = require('./VotedStudent');
const AuditLog = require('./AuditLog');
const Notification = require('./Notification');

// College relationships
College.hasMany(CollegeAdmin, { foreignKey: 'college_id', onDelete: 'CASCADE' });
CollegeAdmin.belongsTo(College, { foreignKey: 'college_id' });

College.hasMany(Department, { foreignKey: 'college_id', onDelete: 'CASCADE' });
Department.belongsTo(College, { foreignKey: 'college_id' });

College.hasMany(Student, { foreignKey: 'college_id', onDelete: 'CASCADE' });
Student.belongsTo(College, { foreignKey: 'college_id' });

College.hasMany(Candidate, { foreignKey: 'college_id', onDelete: 'CASCADE' });
Candidate.belongsTo(College, { foreignKey: 'college_id' });

College.hasMany(Election, { foreignKey: 'college_id', onDelete: 'CASCADE' });
Election.belongsTo(College, { foreignKey: 'college_id' });

College.hasMany(Vote, { foreignKey: 'college_id', onDelete: 'CASCADE' });
Vote.belongsTo(College, { foreignKey: 'college_id' });

College.hasMany(VotedStudent, { foreignKey: 'college_id', onDelete: 'CASCADE' });
VotedStudent.belongsTo(College, { foreignKey: 'college_id' });

College.hasMany(AuditLog, { foreignKey: 'college_id', onDelete: 'CASCADE' });
AuditLog.belongsTo(College, { foreignKey: 'college_id' });

College.hasMany(Notification, { foreignKey: 'college_id', onDelete: 'CASCADE' });
Notification.belongsTo(College, { foreignKey: 'college_id' });

// Election relationships
Election.hasMany(Position, { foreignKey: 'election_id', onDelete: 'CASCADE' });
Position.belongsTo(Election, { foreignKey: 'election_id' });

Election.hasMany(Candidate, { foreignKey: 'election_id', onDelete: 'CASCADE' });
Candidate.belongsTo(Election, { foreignKey: 'election_id' });

Election.hasMany(Vote, { foreignKey: 'election_id', onDelete: 'CASCADE' });
Vote.belongsTo(Election, { foreignKey: 'election_id' });

Election.hasMany(VotedStudent, { foreignKey: 'election_id', onDelete: 'CASCADE' });
VotedStudent.belongsTo(Election, { foreignKey: 'election_id' });

// Department relationships
Department.hasMany(Student, { foreignKey: 'department_id', onDelete: 'CASCADE' });
Student.belongsTo(Department, { foreignKey: 'department_id' });

Department.hasMany(Candidate, { foreignKey: 'department_id', onDelete: 'CASCADE' });
Candidate.belongsTo(Department, { foreignKey: 'department_id' });

// Position relationships
Position.hasMany(Candidate, { foreignKey: 'position_id', onDelete: 'CASCADE' });
Candidate.belongsTo(Position, { foreignKey: 'position_id' });

// Student & VotedStudent relationships
Student.hasMany(VotedStudent, { foreignKey: 'student_id', onDelete: 'CASCADE' });
VotedStudent.belongsTo(Student, { foreignKey: 'student_id' });

module.exports = {
  sequelize,
  SuperAdmin,
  College,
  CollegeAdmin,
  Department,
  Position,
  Student,
  Candidate,
  Election,
  Vote,
  VotedStudent,
  AuditLog,
  Notification
};
