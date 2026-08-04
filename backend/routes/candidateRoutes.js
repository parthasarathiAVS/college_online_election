const router = require('express').Router();
const candidateController = require('../controllers/candidateController');
const { verifyCollegeAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

const candidateUpload = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'symbol', maxCount: 1 }
]);

router.get('/', verifyCollegeAdmin, candidateController.getCandidates);
router.post('/', verifyCollegeAdmin, candidateUpload, candidateController.addCandidate);
router.put('/:id', verifyCollegeAdmin, candidateUpload, candidateController.updateCandidate);
router.delete('/:id', verifyCollegeAdmin, candidateController.deleteCandidate);

module.exports = router;
