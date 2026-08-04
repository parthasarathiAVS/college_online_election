const router = require('express').Router();
const departmentController = require('../controllers/departmentController');
const { verifyCollegeAdmin } = require('../middleware/auth');

router.get('/', verifyCollegeAdmin, departmentController.getDepartments);
router.post('/', verifyCollegeAdmin, departmentController.addDepartment);
router.put('/:id', verifyCollegeAdmin, departmentController.updateDepartment);
router.delete('/:id', verifyCollegeAdmin, departmentController.deleteDepartment);

module.exports = router;
