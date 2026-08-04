const { College, Election, Vote, Student, AuditLog, Notification } = require('../models');
const { Op } = require('sequelize');

// Get all colleges
exports.getAllColleges = async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;

    const colleges = await College.findAll({
      where,
      attributes: { exclude: ['password_hash'] },
      order: [['createdAt', 'DESC']]
    });
    res.json({ colleges });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch colleges', error: error.message });
  }
};

// Approve college
exports.approveCollege = async (req, res) => {
  try {
    const college = await College.findByPk(req.params.id);
    if (!college) return res.status(404).json({ message: 'College not found' });

    college.status = 'approved';
    await college.save();

    await AuditLog.create({
      college_id: college.id,
      user_type: 'super_admin',
      user_id: req.user.id,
      action: 'COLLEGE_APPROVED',
      details: `College "${college.name}" approved.`,
      ip_address: req.ip
    });

    await Notification.create({
      college_id: college.id,
      title: 'Registration Approved',
      message: 'Your college registration has been approved. You can now log in.'
    });

    res.json({ message: 'College approved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to approve college', error: error.message });
  }
};

// Reject college
exports.rejectCollege = async (req, res) => {
  try {
    const college = await College.findByPk(req.params.id);
    if (!college) return res.status(404).json({ message: 'College not found' });

    college.status = 'rejected';
    await college.save();

    await AuditLog.create({
      college_id: college.id,
      user_type: 'super_admin',
      user_id: req.user.id,
      action: 'COLLEGE_REJECTED',
      details: `College "${college.name}" rejected.`,
      ip_address: req.ip
    });

    res.json({ message: 'College rejected' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reject college', error: error.message });
  }
};

// Suspend college
exports.suspendCollege = async (req, res) => {
  try {
    const college = await College.findByPk(req.params.id);
    if (!college) return res.status(404).json({ message: 'College not found' });

    college.status = 'suspended';
    await college.save();

    await AuditLog.create({
      college_id: college.id,
      user_type: 'super_admin',
      user_id: req.user.id,
      action: 'COLLEGE_SUSPENDED',
      details: `College "${college.name}" suspended.`,
      ip_address: req.ip
    });

    res.json({ message: 'College suspended' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to suspend college', error: error.message });
  }
};

// Delete college
exports.deleteCollege = async (req, res) => {
  try {
    const college = await College.findByPk(req.params.id);
    if (!college) return res.status(404).json({ message: 'College not found' });

    const collegeName = college.name;
    await college.destroy();

    await AuditLog.create({
      user_type: 'super_admin',
      user_id: req.user.id,
      action: 'COLLEGE_DELETED',
      details: `College "${collegeName}" deleted.`,
      ip_address: req.ip
    });

    res.json({ message: 'College deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete college', error: error.message });
  }
};

// Platform Analytics
exports.getAnalytics = async (req, res) => {
  try {
    const totalColleges = await College.count();
    const approvedColleges = await College.count({ where: { status: 'approved' } });
    const pendingColleges = await College.count({ where: { status: 'pending' } });
    const totalElections = await Election.count();
    const activeElections = await Election.count({ where: { status: 'active' } });
    const totalVotes = await Vote.count();
    const totalStudents = await Student.count();

    res.json({
      analytics: {
        totalColleges,
        approvedColleges,
        pendingColleges,
        totalElections,
        activeElections,
        totalVotes,
        totalStudents
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch analytics', error: error.message });
  }
};
