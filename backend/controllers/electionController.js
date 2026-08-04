const { Election, Candidate, Vote, VotedStudent, Student, Position, AuditLog } = require('../models');

exports.getElections = async (req, res) => {
  try {
    const college_id = req.user.college_id;
    const elections = await Election.findAll({
      where: { college_id },
      order: [['createdAt', 'DESC']]
    });

    // Enrich with vote counts
    const enriched = await Promise.all(elections.map(async (e) => {
      const voteCount = await VotedStudent.count({ where: { college_id, election_id: e.id } });
      const totalStudents = await Student.count({ where: { college_id, status: 'active' } });
      return {
        ...e.toJSON(),
        vote_count: voteCount,
        total_students: totalStudents,
        turnout: totalStudents > 0 ? ((voteCount / totalStudents) * 100).toFixed(1) : '0.0'
      };
    }));

    res.json({ elections: enriched });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch elections', error: error.message });
  }
};

exports.getElection = async (req, res) => {
  try {
    const college_id = req.user.college_id;
    const election = await Election.findOne({
      where: { id: req.params.id, college_id },
      include: [
        { model: Position, order: [['display_order', 'ASC']] },
        { model: Candidate }
      ]
    });
    if (!election) return res.status(404).json({ message: 'Election not found' });

    const voteCount = await VotedStudent.count({ where: { college_id, election_id: election.id } });
    const totalStudents = await Student.count({ where: { college_id, status: 'active' } });

    res.json({
      election: {
        ...election.toJSON(),
        vote_count: voteCount,
        total_students: totalStudents,
        turnout: totalStudents > 0 ? ((voteCount / totalStudents) * 100).toFixed(1) : '0.0'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch election', error: error.message });
  }
};

exports.createElection = async (req, res) => {
  try {
    const college_id = req.user.college_id;
    const { title, description, start_date, end_date } = req.body;

    const election = await Election.create({
      college_id, title, description, start_date, end_date,
      status: 'draft'
    });

    await AuditLog.create({
      college_id,
      user_type: 'college_admin',
      user_id: req.user.id,
      action: 'ELECTION_CREATED',
      details: `Election "${title}" created.`,
      ip_address: req.ip
    });

    res.status(201).json({ message: 'Election created', election });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create election', error: error.message });
  }
};

exports.updateElection = async (req, res) => {
  try {
    const college_id = req.user.college_id;
    const election = await Election.findOne({ where: { id: req.params.id, college_id } });
    if (!election) return res.status(404).json({ message: 'Election not found' });

    await election.update(req.body);
    res.json({ message: 'Election updated', election });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update election', error: error.message });
  }
};

exports.deleteElection = async (req, res) => {
  try {
    const college_id = req.user.college_id;
    const election = await Election.findOne({ where: { id: req.params.id, college_id } });
    if (!election) return res.status(404).json({ message: 'Election not found' });
    if (election.status === 'active') {
      return res.status(400).json({ message: 'Cannot delete an active election. End it first.' });
    }

    await election.destroy();
    res.json({ message: 'Election deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete election', error: error.message });
  }
};

// Start / Pause / End / Publish / Archive
exports.changeElectionStatus = async (req, res) => {
  try {
    const college_id = req.user.college_id;
    const { action } = req.body; // start, pause, end, publish, archive
    const election = await Election.findOne({ where: { id: req.params.id, college_id } });
    if (!election) return res.status(404).json({ message: 'Election not found' });

    const transitions = {
      start: { from: ['draft', 'scheduled', 'paused'], to: 'active' },
      pause: { from: ['active'], to: 'paused' },
      end: { from: ['active', 'paused'], to: 'completed' },
      publish: { from: ['completed'], to: 'completed', extra: { result_published: true } },
      archive: { from: ['completed'], to: 'archived' }
    };

    const transition = transitions[action];
    if (!transition) return res.status(400).json({ message: 'Invalid action' });
    if (!transition.from.includes(election.status)) {
      return res.status(400).json({
        message: `Cannot ${action} an election with status "${election.status}"`
      });
    }

    // Only one active election per college
    if (action === 'start') {
      const activeElection = await Election.findOne({
        where: { college_id, status: 'active' }
      });
      if (activeElection && activeElection.id !== election.id) {
        return res.status(400).json({
          message: 'Another election is already active. End it before starting a new one.'
        });
      }
    }

    const updateData = { status: transition.to, ...transition.extra };
    if (action === 'start' && !election.start_date) {
      updateData.start_date = new Date();
    }
    if (action === 'end' && !election.end_date) {
      updateData.end_date = new Date();
    }

    await election.update(updateData);

    await AuditLog.create({
      college_id,
      user_type: 'college_admin',
      user_id: req.user.id,
      action: `ELECTION_${action.toUpperCase()}`,
      details: `Election "${election.title}" status changed to "${transition.to}".`,
      ip_address: req.ip
    });

    res.json({ message: `Election ${action} successful`, election });
  } catch (error) {
    res.status(500).json({ message: 'Failed to change status', error: error.message });
  }
};
