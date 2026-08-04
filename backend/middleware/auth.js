const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'voteverse_super_secret_jwt_key_12345';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(403).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(403).json({ message: 'Malformed token' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
    req.user = decoded;
    next();
  });
};

const verifySuperAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Require Super Admin Role!' });
    }
    next();
  });
};

const verifyCollegeAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role !== 'college_admin' && req.user.role !== 'admin' && req.user.role !== 'officer') {
      return res.status(403).json({ message: 'Require College Admin/Officer Role!' });
    }
    next();
  });
};

module.exports = {
  verifyToken,
  verifySuperAdmin,
  verifyCollegeAdmin,
  JWT_SECRET
};
