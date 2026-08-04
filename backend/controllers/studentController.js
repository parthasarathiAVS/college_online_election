const { Student, Department, VotedStudent, Election } = require('../models');
const { Op } = require('sequelize');
const XLSX = require('xlsx');
const path = require('path');

// Get all students for a college
exports.getStudents = async (req, res) => {
  try {
    const college_id = req.user.college_id;
    const { search, department, year, status, page = 1, limit = 50 } = req.query;

    const where = { college_id };
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { register_number: { [Op.like]: `%${search}%` } }
      ];
    }
    if (department) where.department_id = department;
    if (year) where.year = year;
    if (status) where.status = status;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Student.findAndCountAll({
      where,
      include: [{ model: Department, attributes: ['name'] }],
      order: [['name', 'ASC']],
      limit: parseInt(limit),
      offset
    });

    // Determine has_voted status for active election
    const activeElection = await Election.findOne({
      where: { college_id, status: 'active' }
    });

    let studentsWithVoteStatus = rows.map(s => s.toJSON());
    if (activeElection) {
      const votedStudentIds = await VotedStudent.findAll({
        where: { college_id, election_id: activeElection.id },
        attributes: ['student_id']
      });
      const votedSet = new Set(votedStudentIds.map(v => v.student_id));
      studentsWithVoteStatus = studentsWithVoteStatus.map(s => ({
        ...s,
        has_voted: votedSet.has(s.id)
      }));
    } else {
      studentsWithVoteStatus = studentsWithVoteStatus.map(s => ({
        ...s,
        has_voted: false
      }));
    }

    res.json({
      students: studentsWithVoteStatus,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch students', error: error.message });
  }
};

// Add student
exports.addStudent = async (req, res) => {
  try {
    const college_id = req.user.college_id;
    const { register_number, name, department_id, year, status } = req.body;

    const existing = await Student.findOne({ where: { college_id, register_number } });
    if (existing) {
      return res.status(400).json({ message: 'Register number already exists in this college' });
    }

    const student = await Student.create({
      college_id, register_number, name, department_id,
      year: parseInt(year), status: status || 'active'
    });

    res.status(201).json({ message: 'Student added successfully', student });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add student', error: error.message });
  }
};

// Update student
exports.updateStudent = async (req, res) => {
  try {
    const college_id = req.user.college_id;
    const student = await Student.findOne({ where: { id: req.params.id, college_id } });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const { register_number, name, department_id, year, status } = req.body;
    if (register_number && register_number !== student.register_number) {
      const dup = await Student.findOne({ where: { college_id, register_number } });
      if (dup) return res.status(400).json({ message: 'Register number already exists' });
    }

    await student.update({
      register_number: register_number || student.register_number,
      name: name || student.name,
      department_id: department_id || student.department_id,
      year: year ? parseInt(year) : student.year,
      status: status || student.status
    });

    res.json({ message: 'Student updated', student });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update student', error: error.message });
  }
};

// Delete student
exports.deleteStudent = async (req, res) => {
  try {
    const college_id = req.user.college_id;
    const student = await Student.findOne({ where: { id: req.params.id, college_id } });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    await student.destroy();
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete student', error: error.message });
  }
};

// Import students from Excel
exports.importStudents = async (req, res) => {
  try {
    const college_id = req.user.college_id;
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    const departments = await Department.findAll({ where: { college_id } });
    const deptMap = {};
    departments.forEach(d => { deptMap[d.name.toLowerCase()] = d.id; });

    let imported = 0;
    let skipped = 0;
    const errors = [];

    for (const row of data) {
      try {
        const regNo = String(row['Register Number'] || row['register_number'] || '').trim();
        const name = String(row['Student Name'] || row['name'] || '').trim();
        const deptName = String(row['Department'] || row['department'] || '').trim();
        const year = parseInt(row['Year'] || row['year'] || 1);

        if (!regNo || !name || !deptName) {
          skipped++;
          continue;
        }

        const dept_id = deptMap[deptName.toLowerCase()];
        if (!dept_id) {
          errors.push(`Department "${deptName}" not found for student ${regNo}`);
          skipped++;
          continue;
        }

        const existing = await Student.findOne({ where: { college_id, register_number: regNo } });
        if (existing) {
          skipped++;
          continue;
        }

        await Student.create({
          college_id, register_number: regNo, name,
          department_id: dept_id, year, status: 'active'
        });
        imported++;
      } catch (err) {
        skipped++;
      }
    }

    res.json({ message: `Import complete: ${imported} added, ${skipped} skipped`, imported, skipped, errors });
  } catch (error) {
    res.status(500).json({ message: 'Import failed', error: error.message });
  }
};

// Export students to Excel
exports.exportStudents = async (req, res) => {
  try {
    const college_id = req.user.college_id;
    const students = await Student.findAll({
      where: { college_id },
      include: [{ model: Department, attributes: ['name'] }],
      order: [['name', 'ASC']]
    });

    const data = students.map(s => ({
      'Register Number': s.register_number,
      'Student Name': s.name,
      'Department': s.Department ? s.Department.name : '',
      'Year': s.year,
      'Status': s.status
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Students');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename=students.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: 'Export failed', error: error.message });
  }
};
