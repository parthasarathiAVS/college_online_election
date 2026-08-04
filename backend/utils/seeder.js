require('dotenv').config();
const bcrypt = require('bcryptjs');
const {
  sequelize, SuperAdmin, College, CollegeAdmin, Department,
  Student, Election, Position, Candidate
} = require('../models');

async function seed() {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synced (force).');

    // 1. Super Admin
    const saHash = await bcrypt.hash('admin123', 12);
    await SuperAdmin.create({
      email: 'superadmin@voteverse.ai',
      password_hash: saHash
    });
    console.log('Super Admin created: superadmin@voteverse.ai / admin123');

    // 2. Sample College (pre-approved)
    const collegeHash = await bcrypt.hash('college123', 12);
    const college = await College.create({
      name: 'Madras Institute of Technology',
      college_code: 'MIT-001',
      principal_name: 'Dr. R. Suresh',
      election_officer: 'Prof. Kavitha M',
      email: 'admin@mit.edu.in',
      phone: '044-22516000',
      address: '2nd Main Rd, Chrompet, Chennai - 600044',
      website: 'https://www.mitindia.edu',
      password_hash: collegeHash,
      status: 'approved',
      evm_pin: '123456'
    });

    await CollegeAdmin.create({
      college_id: college.id,
      name: 'Prof. Kavitha M',
      email: 'admin@mit.edu.in',
      password_hash: collegeHash,
      role: 'admin'
    });
    console.log('College created: admin@mit.edu.in / college123');

    // 3. Departments
    const depts = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Information Technology'];
    const deptRecords = [];
    for (const name of depts) {
      const d = await Department.create({ college_id: college.id, name });
      deptRecords.push(d);
    }
    console.log('Departments seeded:', depts.join(', '));

    // 4. Students (10 per department)
    const firstNames = ['Arun', 'Priya', 'Karthik', 'Deepa', 'Rahul', 'Sneha', 'Vikram', 'Divya', 'Suresh', 'Meera'];
    const lastNames = ['Kumar', 'Sharma', 'Patel', 'Nair', 'Reddy', 'Iyer', 'Raj', 'Devi', 'Gupta', 'Singh'];
    let studentCount = 0;
    for (const dept of deptRecords) {
      for (let i = 0; i < 10; i++) {
        const fn = firstNames[i];
        const ln = lastNames[(i + deptRecords.indexOf(dept)) % lastNames.length];
        await Student.create({
          college_id: college.id,
          register_number: `MIT${dept.name.substring(0, 2).toUpperCase()}${String(i + 1).padStart(3, '0')}`,
          name: `${fn} ${ln}`,
          department_id: dept.id,
          year: (i % 4) + 1,
          status: 'active'
        });
        studentCount++;
      }
    }
    console.log(`${studentCount} students seeded.`);

    // 5. Election
    const election = await Election.create({
      college_id: college.id,
      title: 'Student Union Election 2026',
      description: 'Annual student union election for the academic year 2026-27.',
      status: 'draft'
    });
    console.log('Election created:', election.title);

    // 6. Positions
    const posNames = ['President', 'Vice President', 'Secretary', 'Joint Secretary'];
    const posRecords = [];
    for (let i = 0; i < posNames.length; i++) {
      const p = await Position.create({
        college_id: college.id,
        election_id: election.id,
        name: posNames[i],
        display_order: i + 1
      });
      posRecords.push(p);
    }
    console.log('Positions seeded:', posNames.join(', '));

    // 7. Candidates
    const candidateNames = [
      ['Arjun S', 'Lakshmi R'],
      ['Bharath K', 'Swetha P'],
      ['Dinesh M', 'Nithya V'],
      ['Ganesh T', 'Revathi J']
    ];
    for (let i = 0; i < posRecords.length; i++) {
      for (let j = 0; j < candidateNames[i].length; j++) {
        await Candidate.create({
          college_id: college.id,
          election_id: election.id,
          department_id: deptRecords[j % deptRecords.length].id,
          position_id: posRecords[i].id,
          name: candidateNames[i][j],
          manifesto: `Manifesto for ${candidateNames[i][j]} - Committed to student welfare and campus development.`,
          achievements: `Academic excellence, Sports captain, Cultural lead.`,
          display_order: j + 1
        });
      }
    }
    console.log('Candidates seeded.');

    console.log('\n===================================');
    console.log('  SEED COMPLETED SUCCESSFULLY');
    console.log('===================================');
    console.log('Super Admin:  superadmin@voteverse.ai / admin123');
    console.log('College:      admin@mit.edu.in / college123');
    console.log('EVM PIN:      123456');
    console.log('===================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
