const router = require('express').Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const upload = require('../middleware/upload');

router.post('/register', authLimiter, upload.single('logo'), authController.registerCollege);
router.post('/college/login', authLimiter, authController.collegeLogin);
router.post('/superadmin/login', authLimiter, authController.superAdminLogin);
router.get('/verify', verifyToken, authController.verifySession);

module.exports = router;
