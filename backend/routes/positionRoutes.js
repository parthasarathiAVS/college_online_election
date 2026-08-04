const router = require('express').Router();
const positionController = require('../controllers/positionController');
const { verifyCollegeAdmin } = require('../middleware/auth');

router.get('/', verifyCollegeAdmin, positionController.getPositions);
router.post('/', verifyCollegeAdmin, positionController.addPosition);
router.put('/:id', verifyCollegeAdmin, positionController.updatePosition);
router.delete('/:id', verifyCollegeAdmin, positionController.deletePosition);

module.exports = router;
