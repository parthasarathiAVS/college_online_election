const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { College, CollegeAdmin, SuperAdmin, AuditLog } = require('../models');
const { JWT_SECRET } = require('../middleware/auth');

// College Registration
exports.registerCollege = async (req, res) => {
  try {
    const {
      name, college_code, principal_name, election_officer,
      email, phone, address, website, password
    } = req.body;

    const existing = await College.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const existingCode = await College.findOne({ where: { college_code } });
    if (existingCode) {
      return res.status(400).json({ message: 'College code already in use' });
    }

    const password_hash = await bcrypt.hash(password, 12);

    let logo_url = null;
    if (req.file) {
      logo_url = `/uploads/logos/${req.file.filename}`;
    }

    const college = await College.create({
      name, college_code, principal_name, election_officer,
      email, phone, address, website, logo_url, password_hash,
      status: 'pending'
    });

    // Create college admin entry automatically
    const adminHash = await bcrypt.hash(password, 12);
    await CollegeAdmin.create({
      college_id: college.id,
      name: election_officer,
      email,
      password_hash: adminHash,
      role: 'admin'
    });

    await AuditLog.create({
      college_id: college.id,
      user_type: 'system',
      action: 'COLLEGE_REGISTERED',
      details: `College "${name}" registered with code "${college_code}". Pending approval.`,
      ip_address: req.ip
    });

    res.status(201).json({
      message: 'College registered successfully. Awaiting Super Admin approval.',
      college: {
        id: college.id,
        name: college.name,
        college_code: college.college_code,
        status: college.status
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

// College Login
exports.collegeLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const college = await College.findOne({ where: { email } });
    if (!college) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (college.status !== 'approved') {
      const statusMessages = {
        pending: 'Your college registration is pending approval.',
        rejected: 'Your college registration has been rejected.',
        suspended: 'Your college account has been suspended.'
      };
      return res.status(403).json({
        message: statusMessages[college.status] || 'Account not approved.'
      });
    }

    const isMatch = await bcrypt.compare(password, college.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      {
        id: college.id,
        college_id: college.id,
        email: college.email,
        role: 'college_admin',
        college_name: college.name
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    await AuditLog.create({
      college_id: college.id,
      user_type: 'college_admin',
      user_id: college.id,
      action: 'COLLEGE_LOGIN',
      details: `College "${college.name}" logged in.`,
      ip_address: req.ip
    });

    res.json({
      message: 'Login successful',
      token,
      college: {
        id: college.id,
        name: college.name,
        college_code: college.college_code,
        email: college.email,
        logo_url: college.logo_url,
        election_officer: college.election_officer
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

// Super Admin Login
exports.superAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await SuperAdmin.findOne({ where: { email } });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: 'super_admin' },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    await AuditLog.create({
      user_type: 'super_admin',
      user_id: admin.id,
      action: 'SUPER_ADMIN_LOGIN',
      details: 'Super Admin logged in.',
      ip_address: req.ip
    });

    res.json({ message: 'Login successful', token, admin: { id: admin.id, email: admin.email } });
  } catch (error) {
    console.error('Super admin login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

// Verify Token (used by frontend to validate session)
exports.verifySession = async (req, res) => {
  try {
    if (req.user.role === 'super_admin') {
      const admin = await SuperAdmin.findByPk(req.user.id);
      if (!admin) return res.status(401).json({ message: 'User not found' });
      return res.json({ user: { id: admin.id, email: admin.email, role: 'super_admin' } });
    }

    const college = await College.findByPk(req.user.college_id);
    if (!college) return res.status(401).json({ message: 'College not found' });
    return res.json({
      user: {
        id: college.id,
        college_id: college.id,
        name: college.name,
        email: college.email,
        role: 'college_admin',
        college_name: college.name,
        logo_url: college.logo_url
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Session verification failed' });
  }
};
