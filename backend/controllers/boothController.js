const { Student, Election, Candidate, Vote, VotedStudent, College, Position, AuditLog, Notification } = require('../models');
const { encrypt } = require('../utils/crypto');

// Get active election and its candidates for the EVM booth screen
exports.getBoothData = async (req, res) => {
  try {
    const college_id = req.user.college_id;
    const election = await Election.findOne({
      where: { college_id, status: 'active' }
    });

    if (!election) {
      return res.json({ active: false, message: 'No active election' });
    }

    const positions = await Position.findAll({
      where: { college_id, election_id: election.id },
      order: [['display_order', 'ASC']]
    });

    const candidates = await Candidate.findAll({
      where: { college_id, election_id: election.id },
      order: [['display_order', 'ASC']]
    });

    const voteCount = await VotedStudent.count({ where: { college_id, election_id: election.id } });
    const totalStudents = await Student.count({ where: { college_id, status: 'active' } });

    res.json({
      active: true,
      election: {
        id: election.id,
        title: election.title,
        status: election.status
      },
      positions,
      candidates,
      stats: { voteCount, totalStudents }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch booth data', error: error.message });
  }
};

// Verify student eligibility (Election Officer verifies before unlocking)
exports.verifyStudent = async (req, res) => {
  try {
    const college_id = req.user.college_id;
    const { register_number } = req.body;

    if (!register_number) {
      return res.status(400).json({ message: 'Register number is required' });
    }

    const election = await Election.findOne({
      where: { college_id, status: 'active' }
    });
    if (!election) {
      return res.status(400).json({ message: 'No active election' });
    }

    const student = await Student.findOne({
      where: { college_id, register_number: register_number.trim() }
    });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    if (student.status !== 'active') {
      return res.status(403).json({ message: 'Student account is inactive' });
    }

    const alreadyVoted = await VotedStudent.findOne({
      where: { student_id: student.id, election_id: election.id }
    });
    if (alreadyVoted) {
      return res.status(409).json({
        message: 'Already Voted',
        already_voted: true,
        student_name: student.name
      });
    }

    await AuditLog.create({
      college_id,
      user_type: 'college_admin',
      user_id: req.user.id,
      action: 'STUDENT_VERIFIED',
      details: `Student "${student.name}" (${register_number}) verified for voting.`,
      ip_address: req.ip
    });

    res.json({
      eligible: true,
      student: {
        id: student.id,
        name: student.name,
        register_number: student.register_number
      },
      election_id: election.id
    });
  } catch (error) {
    res.status(500).json({ message: 'Verification failed', error: error.message });
  }
};

// Cast vote (from EVM screen)
exports.castVote = async (req, res) => {
  try {
    const college_id = req.user.college_id;
    const { student_id, election_id, votes } = req.body;
    // votes is an array: [{ position_id, candidate_id }]

    if (!student_id || !election_id || !votes || !Array.isArray(votes) || votes.length === 0) {
      return res.status(400).json({ message: 'Invalid vote data' });
    }

    const election = await Election.findOne({
      where: { id: election_id, college_id, status: 'active' }
    });
    if (!election) {
      return res.status(400).json({ message: 'Election not active or not found' });
    }

    const student = await Student.findOne({
      where: { id: student_id, college_id, status: 'active' }
    });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Double-check one-student-one-vote
    const alreadyVoted = await VotedStudent.findOne({
      where: { student_id, election_id }
    });
    if (alreadyVoted) {
      return res.status(409).json({ message: 'Student has already voted' });
    }

    // Encrypt and store each position vote
    for (const v of votes) {
      const ballot = JSON.stringify({
        position_id: v.position_id,
        candidate_id: v.candidate_id,
        timestamp: new Date().toISOString()
      });
      const encrypted_ballot = encrypt(ballot);

      await Vote.create({
        college_id,
        election_id,
        encrypted_ballot,
        voted_at: new Date()
      });
    }

    // Mark student as voted
    await VotedStudent.create({
      college_id,
      student_id,
      election_id,
      voted_at: new Date()
    });

    await AuditLog.create({
      college_id,
      user_type: 'system',
      action: 'VOTE_CAST',
      details: `Vote recorded for election "${election.title}". Student ID masked for privacy.`,
      ip_address: req.ip
    });

    res.json({ message: 'Vote recorded successfully', success: true });
  } catch (error) {
    console.error('Vote casting error:', error);
    res.status(500).json({ message: 'Failed to cast vote', error: error.message });
  }
};

// Verify Admin PIN for kiosk exit
exports.verifyPin = async (req, res) => {
  try {
    const college_id = req.user.college_id;
    const { pin } = req.body;

    const college = await College.findByPk(college_id);
    if (!college) return res.status(404).json({ message: 'College not found' });

    if (college.is_exit_locked) {
      return res.status(423).json({
        message: 'Exit is locked due to too many failed attempts. Contact admin.',
        locked: true
      });
    }

    if (pin === college.evm_pin) {
      // Reset failed attempts on success
      await college.update({ failed_exit_attempts: 0 });

      await AuditLog.create({
        college_id,
        user_type: 'college_admin',
        user_id: req.user.id,
        action: 'KIOSK_EXIT_SUCCESS',
        details: 'EVM Kiosk exited successfully via PIN.',
        ip_address: req.ip
      });

      return res.json({ valid: true, message: 'PIN verified' });
    }

    // Wrong PIN
    const attempts = college.failed_exit_attempts + 1;
    const updateData = { failed_exit_attempts: attempts };

    if (attempts >= 5) {
      updateData.is_exit_locked = true;
      await Notification.create({
        college_id,
        title: '🚨 EVM Exit Locked',
        message: `EVM kiosk exit has been locked after ${attempts} failed PIN attempts. Possible unauthorized access attempt.`
      });
    }

    await college.update(updateData);

    await AuditLog.create({
      college_id,
      user_type: 'college_admin',
      action: 'KIOSK_EXIT_FAILED',
      details: `Failed PIN attempt #${attempts}.`,
      ip_address: req.ip
    });

    return res.status(401).json({
      valid: false,
      message: 'Invalid PIN',
      attempts_remaining: Math.max(0, 5 - attempts),
      locked: attempts >= 5
    });
  } catch (error) {
    res.status(500).json({ message: 'PIN verification failed', error: error.message });
  }
};

// Get booth status
exports.getBoothStatus = async (req, res) => {
  try {
    const college_id = req.user.college_id;
    const election = await Election.findOne({
      where: { college_id, status: 'active' }
    });

    const college = await College.findByPk(college_id);
    const voteCount = election
      ? await VotedStudent.count({ where: { college_id, election_id: election.id } })
      : 0;
    const totalStudents = await Student.count({ where: { college_id, status: 'active' } });

    res.json({
      booth_active: !!election,
      election: election ? { id: election.id, title: election.title } : null,
      stats: { voteCount, totalStudents },
      is_exit_locked: college ? college.is_exit_locked : false,
      failed_exit_attempts: college ? college.failed_exit_attempts : 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch booth status', error: error.message });
  }
};

// Reset exit lock (admin action from dashboard)
exports.resetExitLock = async (req, res) => {
  try {
    const college_id = req.user.college_id;
    const college = await College.findByPk(college_id);
    if (!college) return res.status(404).json({ message: 'College not found' });

    await college.update({ failed_exit_attempts: 0, is_exit_locked: false });

    await AuditLog.create({
      college_id,
      user_type: 'college_admin',
      user_id: req.user.id,
      action: 'KIOSK_EXIT_LOCK_RESET',
      details: 'EVM kiosk exit lock was reset by admin.',
      ip_address: req.ip
    });

    res.json({ message: 'Exit lock reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reset lock', error: error.message });
  }
};
