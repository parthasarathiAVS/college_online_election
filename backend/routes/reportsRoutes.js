const router = require('express').Router();
const resultsController = require('../controllers/resultsController');
const reportsController = require('../controllers/reportsController');
const { verifyCollegeAdmin } = require('../middleware/auth');

// Results
router.get('/results/:election_id', verifyCollegeAdmin, resultsController.getResults);
router.get('/results/:election_id/export', verifyCollegeAdmin, resultsController.exportResultsExcel);

// Reports
router.get('/audit-logs', verifyCollegeAdmin, reportsController.getAuditLogs);
router.get('/student-report', verifyCollegeAdmin, reportsController.getStudentReport);
router.get('/candidate-report', verifyCollegeAdmin, reportsController.getCandidateReport);
router.get('/election-report', verifyCollegeAdmin, reportsController.getElectionReport);
router.get('/vote-summary', verifyCollegeAdmin, reportsController.getVoteSummary);
router.get('/dashboard-stats', verifyCollegeAdmin, reportsController.getDashboardStats);

module.exports = router;
