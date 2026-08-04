const router = require('express').Router();
const electionController = require('../controllers/electionController');
const { verifyCollegeAdmin } = require('../middleware/auth');

router.get('/', verifyCollegeAdmin, electionController.getElections);
router.get('/:id', verifyCollegeAdmin, electionController.getElection);
router.post('/', verifyCollegeAdmin, electionController.createElection);
router.put('/:id', verifyCollegeAdmin, electionController.updateElection);
router.delete('/:id', verifyCollegeAdmin, electionController.deleteElection);
router.put('/:id/status', verifyCollegeAdmin, electionController.changeElectionStatus);

module.exports = router;
