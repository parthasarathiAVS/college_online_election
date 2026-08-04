const router = require('express').Router();
const boothController = require('../controllers/boothController');
const { verifyCollegeAdmin } = require('../middleware/auth');
const { boothLimiter } = require('../middleware/rateLimiter');

router.get('/data', verifyCollegeAdmin, boothController.getBoothData);
router.post('/verify', verifyCollegeAdmin, boothLimiter, boothController.verifyStudent);
router.post('/vote', verifyCollegeAdmin, boothLimiter, boothController.castVote);
router.post('/verify-pin', verifyCollegeAdmin, boothController.verifyPin);
router.get('/status', verifyCollegeAdmin, boothController.getBoothStatus);
router.post('/reset-lock', verifyCollegeAdmin, boothController.resetExitLock);

module.exports = router;
