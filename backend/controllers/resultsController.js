const { Vote, VotedStudent, Candidate, Position, Student, Department, Election } = require('../models');
const { decrypt } = require('../utils/crypto');
const { Op } = require('sequelize');
const sequelize = require('../config/db');
const XLSX = require('xlsx');

// Get results for a completed election
exports.getResults = async (req, res) => {
  try {
    const college_id = req.user.college_id;
    const { election_id } = req.params;

    const election = await Election.findOne({
      where: { id: election_id, college_id }
    });
    if (!election) return res.status(404).json({ message: 'Election not found' });
    if (!election.result_published && election.status !== 'completed' && election.status !== 'archived') {
      return res.status(403).json({ message: 'Results are not yet available' });
    }

    // Decrypt all votes for this election
    const votes = await Vote.findAll({ where: { college_id, election_id } });
    const tallies = {};

    for (const vote of votes) {
      try {
        const ballotJson = decrypt(vote.encrypted_ballot);
        const ballot = JSON.parse(ballotJson);
        const key = `${ballot.position_id}_${ballot.candidate_id}`;
        tallies[key] = (tallies[key] || 0) + 1;
      } catch (e) {
        console.error('Failed to decrypt vote:', e);
      }
    }

    // Fetch positions and candidates
    const positions = await Position.findAll({
      where: { college_id, election_id },
      order: [['display_order', 'ASC']]
    });

    const candidates = await Candidate.findAll({
      where: { college_id, election_id },
      include: [
        { model: Department, attributes: ['name'] },
        { model: Position, attributes: ['name'] }
      ],
      order: [['display_order', 'ASC']]
    });

    // Build results per position
    const results = positions.map(pos => {
      const posCandidates = candidates
        .filter(c => c.position_id === pos.id)
        .map(c => {
          const key = `${pos.id}_${c.id}`;
          return {
            id: c.id,
            name: c.name,
            photo_url: c.photo_url,
            symbol_url: c.symbol_url,
            department: c.Department ? c.Department.name : '',
            votes: tallies[key] || 0
          };
        })
        .sort((a, b) => b.votes - a.votes);

      const totalVotesForPosition = posCandidates.reduce((sum, c) => sum + c.votes, 0);

      return {
        position: { id: pos.id, name: pos.name },
        candidates: posCandidates.map(c => ({
          ...c,
          percentage: totalVotesForPosition > 0
            ? ((c.votes / totalVotesForPosition) * 100).toFixed(1)
            : '0.0'
        })),
        winner: posCandidates.length > 0 ? posCandidates[0] : null,
        total_votes: totalVotesForPosition
      };
    });

    // Overall stats
    const totalVotesCast = await VotedStudent.count({ where: { college_id, election_id } });
    const totalStudents = await Student.count({ where: { college_id, status: 'active' } });

    // Department breakdown
    const departments = await Department.findAll({ where: { college_id } });
    const deptAnalytics = await Promise.all(departments.map(async (dept) => {
      const deptStudents = await Student.count({ where: { college_id, department_id: dept.id, status: 'active' } });
      const deptStudentIds = await Student.findAll({
        where: { college_id, department_id: dept.id },
        attributes: ['id']
      });
      const deptVoted = await VotedStudent.count({
        where: {
          election_id,
          student_id: { [Op.in]: deptStudentIds.map(s => s.id) }
        }
      });

      return {
        department: dept.name,
        total_students: deptStudents,
        voted: deptVoted,
        turnout: deptStudents > 0 ? ((deptVoted / deptStudents) * 100).toFixed(1) : '0.0'
      };
    }));

    res.json({
      election: {
        id: election.id,
        title: election.title,
        start_date: election.start_date,
        end_date: election.end_date,
        result_published: election.result_published
      },
      results,
      stats: {
        totalVotesCast,
        totalStudents,
        turnout: totalStudents > 0 ? ((totalVotesCast / totalStudents) * 100).toFixed(1) : '0.0'
      },
      departmentAnalytics: deptAnalytics
    });
  } catch (error) {
    console.error('Results error:', error);
    res.status(500).json({ message: 'Failed to fetch results', error: error.message });
  }
};

// Export results to Excel
exports.exportResultsExcel = async (req, res) => {
  try {
    const college_id = req.user.college_id;
    const { election_id } = req.params;

    // Reuse getResults logic
    const election = await Election.findOne({ where: { id: election_id, college_id } });
    if (!election) return res.status(404).json({ message: 'Election not found' });

    const votes = await Vote.findAll({ where: { college_id, election_id } });
    const tallies = {};
    for (const vote of votes) {
      try {
        const ballot = JSON.parse(decrypt(vote.encrypted_ballot));
        const key = `${ballot.position_id}_${ballot.candidate_id}`;
        tallies[key] = (tallies[key] || 0) + 1;
      } catch (e) { /* skip corrupt */ }
    }

    const positions = await Position.findAll({ where: { college_id, election_id } });
    const candidates = await Candidate.findAll({
      where: { college_id, election_id },
      include: [
        { model: Department, attributes: ['name'] },
        { model: Position, attributes: ['name'] }
      ]
    });

    const data = [];
    for (const pos of positions) {
      const posCands = candidates.filter(c => c.position_id === pos.id);
      for (const c of posCands) {
        const key = `${pos.id}_${c.id}`;
        data.push({
          'Position': pos.name,
          'Candidate': c.name,
          'Department': c.Department ? c.Department.name : '',
          'Votes': tallies[key] || 0
        });
      }
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Results');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', `attachment; filename=results_${election_id}.xlsx`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: 'Export failed', error: error.message });
  }
};
