const router = require('express').Router();
const superAdminController = require('../controllers/superAdminController');
const { verifySuperAdmin } = require('../middleware/auth');

router.get('/colleges', verifySuperAdmin, superAdminController.getAllColleges);
router.put('/colleges/:id/approve', verifySuperAdmin, superAdminController.approveCollege);
router.put('/colleges/:id/reject', verifySuperAdmin, superAdminController.rejectCollege);
router.put('/colleges/:id/suspend', verifySuperAdmin, superAdminController.suspendCollege);
router.delete('/colleges/:id', verifySuperAdmin, superAdminController.deleteCollege);
router.get('/analytics', verifySuperAdmin, superAdminController.getAnalytics);

module.exports = router;
