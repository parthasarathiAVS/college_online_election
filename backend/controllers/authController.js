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

    if (!name || !college_code || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all required fields.' });
    }

    const existingCollege = await College.findOne({ where: { email: email.trim().toLowerCase() } });
    const existingAdmin = await CollegeAdmin.findOne({ where: { email: email.trim().toLowerCase() } });
    if (existingCollege || existingAdmin) {
      return res.status(400).json({ message: 'Email address is already registered.' });
    }

    const existingCode = await College.findOne({ where: { college_code: college_code.trim() } });
    if (existingCode) {
      return res.status(400).json({ message: 'College Code is already in use. Please choose a unique code.' });
    }

    const password_hash = await bcrypt.hash(password, 12);

    let logo_url = null;
    if (req.file) {
      logo_url = `/uploads/logos/${req.file.filename}`;
    }

    const college = await College.create({
      name: name.trim(),
      college_code: college_code.trim(),
      principal_name: principal_name ? principal_name.trim() : '',
      election_officer: election_officer ? election_officer.trim() : '',
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '',
      address: address ? address.trim() : '',
      website: website ? website.trim() : null,
      logo_url,
      password_hash,
      status: 'pending'
    });

    // Create or update college admin entry automatically
    const adminHash = await bcrypt.hash(password, 12);
    const [adminRecord] = await CollegeAdmin.findOrCreate({
      where: { email: email.trim().toLowerCase() },
      defaults: {
        college_id: college.id,
        name: election_officer ? election_officer.trim() : name.trim(),
        email: email.trim().toLowerCase(),
        password_hash: adminHash,
        role: 'admin'
      }
    });

    if (adminRecord.college_id !== college.id) {
      await adminRecord.update({
        college_id: college.id,
        name: election_officer ? election_officer.trim() : name.trim(),
        password_hash: adminHash
      });
    }

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

    if (error.name === 'SequelizeUniqueConstraintError') {
      const field = error.errors?.[0]?.path || 'field';
      return res.status(400).json({ message: `The ${field} is already in use.` });
    }

    if (error.name === 'SequelizeValidationError') {
      const valMsg = error.errors?.[0]?.message || 'Validation error';
      return res.status(400).json({ message: valMsg });
    }

    res.status(500).json({ message: error.message || 'Registration failed' });
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
