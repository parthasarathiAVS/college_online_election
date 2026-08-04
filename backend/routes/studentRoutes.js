const router = require('express').Router();
const studentController = require('../controllers/studentController');
const { verifyCollegeAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', verifyCollegeAdmin, studentController.getStudents);
router.post('/', verifyCollegeAdmin, studentController.addStudent);
router.put('/:id', verifyCollegeAdmin, studentController.updateStudent);
router.delete('/:id', verifyCollegeAdmin, studentController.deleteStudent);
router.post('/import', verifyCollegeAdmin, upload.single('file'), studentController.importStudents);
router.get('/export', verifyCollegeAdmin, studentController.exportStudents);

module.exports = router;
