const { Department } = require('../models');

exports.getDepartments = async (req, res) => {
  try {
    const college_id = req.user.college_id;
    const departments = await Department.findAll({
      where: { college_id },
      order: [['name', 'ASC']]
    });
    res.json({ departments });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch departments', error: error.message });
  }
};

exports.addDepartment = async (req, res) => {
  try {
    const college_id = req.user.college_id;
    const { name } = req.body;

    const existing = await Department.findOne({ where: { college_id, name } });
    if (existing) return res.status(400).json({ message: 'Department already exists' });

    const department = await Department.create({ college_id, name });
    res.status(201).json({ message: 'Department added', department });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add department', error: error.message });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const college_id = req.user.college_id;
    const department = await Department.findOne({ where: { id: req.params.id, college_id } });
    if (!department) return res.status(404).json({ message: 'Department not found' });

    await department.update({ name: req.body.name });
    res.json({ message: 'Department updated', department });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update department', error: error.message });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    const college_id = req.user.college_id;
    const department = await Department.findOne({ where: { id: req.params.id, college_id } });
    if (!department) return res.status(404).json({ message: 'Department not found' });

    await department.destroy();
    res.json({ message: 'Department deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete department', error: error.message });
  }
};
