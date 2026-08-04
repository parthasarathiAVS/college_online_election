const { AuditLog, Student, Candidate, Election, VotedStudent, Vote, College } = require('../models');
const { Op } = require('sequelize');

// Audit Logs
exports.getAuditLogs = async (req, res) => {
  try {
    const college_id = req.user.college_id;
    const { page = 1, limit = 50, action } = req.query;
    const where = { college_id };
    if (action) where.action = { [Op.like]: `%${action}%` };

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await AuditLog.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      logs: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch logs', error: error.message });
  }
};

// Student Report
exports.getStudentReport = async (req, res) => {
  try {
    const college_id = req.user.college_id;
    const totalStudents = await Student.count({ where: { college_id } });
    const activeStudents = await Student.count({ where: { college_id, status: 'active' } });
    const inactiveStudents = await Student.count({ where: { college_id, status: 'inactive' } });

    res.json({
      report: {
        totalStudents,
        activeStudents,
        inactiveStudents
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch report', error: error.message });
  }
};

// Candidate Report
exports.getCandidateReport = async (req, res) => {
  try {
    const college_id = req.user.college_id;
    const totalCandidates = await Candidate.count({ where: { college_id } });
    const elections = await Election.findAll({ where: { college_id } });

    const perElection = await Promise.all(elections.map(async (e) => {
      const count = await Candidate.count({ where: { college_id, election_id: e.id } });
      return { election: e.title, candidates: count };
    }));

    res.json({ report: { totalCandidates, perElection } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch report', error: error.message });
  }
};

// Election Report
exports.getElectionReport = async (req, res) => {
  try {
    const college_id = req.user.college_id;
    const elections = await Election.findAll({
      where: { college_id },
      order: [['createdAt', 'DESC']]
    });

    const report = await Promise.all(elections.map(async (e) => {
      const voted = await VotedStudent.count({ where: { college_id, election_id: e.id } });
      const totalStudents = await Student.count({ where: { college_id, status: 'active' } });
      return {
        id: e.id,
        title: e.title,
        status: e.status,
        voted,
        totalStudents,
        turnout: totalStudents > 0 ? ((voted / totalStudents) * 100).toFixed(1) : '0.0'
      };
    }));

    res.json({ report });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch report', error: error.message });
  }
};

// Vote Summary
exports.getVoteSummary = async (req, res) => {
  try {
    const college_id = req.user.college_id;
    const totalVotes = await Vote.count({ where: { college_id } });
    const elections = await Election.findAll({ where: { college_id } });

    const perElection = await Promise.all(elections.map(async (e) => {
      const votes = await Vote.count({ where: { college_id, election_id: e.id } });
      return { election: e.title, votes };
    }));

    res.json({ summary: { totalVotes, perElection } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch summary', error: error.message });
  }
};

// Dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const college_id = req.user.college_id;

    const totalStudents = await Student.count({ where: { college_id, status: 'active' } });
    const totalCandidates = await Candidate.count({ where: { college_id } });

    const activeElection = await Election.findOne({
      where: { college_id, status: 'active' }
    });

    let votesCast = 0;
    let turnout = '0.0';
    if (activeElection) {
      votesCast = await VotedStudent.count({
        where: { college_id, election_id: activeElection.id }
      });
      turnout = totalStudents > 0 ? ((votesCast / totalStudents) * 100).toFixed(1) : '0.0';
    }

    const college = await College.findByPk(college_id);

    res.json({
      stats: {
        totalStudents,
        totalCandidates,
        activeElection: activeElection ? activeElection.title : 'None',
        activeElectionId: activeElection ? activeElection.id : null,
        votesCast,
        turnout,
        boothStatus: activeElection ? 'Active' : 'Inactive',
        is_exit_locked: college ? college.is_exit_locked : false
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
  }
};
