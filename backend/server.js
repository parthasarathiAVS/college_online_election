require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const { sequelize } = require('./models');
const { apiLimiter } = require('./middleware/rateLimiter');

// Routes
const authRoutes = require('./routes/authRoutes');
const superAdminRoutes = require('./routes/superAdminRoutes');
const studentRoutes = require('./routes/studentRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const positionRoutes = require('./routes/positionRoutes');
const electionRoutes = require('./routes/electionRoutes');
const boothRoutes = require('./routes/boothRoutes');
const reportsRoutes = require('./routes/reportsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ======================
// Middleware
// ======================
const cors = require('cors');

const allowedOrigins = [
  'http://localhost:5173',
  'https://college-online-election-8b9vnosge-online-election.vercel.app',
  'https://college-online-election.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
// ======================
// Static Folder
// ======================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ======================
// API Routes
// ======================
app.use('/api/auth', authRoutes);
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/positions', positionRoutes);
app.use('/api/elections', electionRoutes);
app.use('/api/booth', boothRoutes);
app.use('/api/reports', reportsRoutes);

// ======================
// Health Check
// ======================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    database: process.env.DB_DIALECT || 'sqlite',
    message: 'VoteVerse AI Backend is running',
    timestamp: new Date(),
  });
});

// ======================
// Error Handler
// ======================
app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ======================
// Start Server
// ======================
async function startServer() {
  try {
    console.log("======================================");
    console.log(" VoteVerse AI Backend Starting...");
    console.log("======================================");

    console.log("Database Dialect:", process.env.DB_DIALECT);
    console.log("Database Host:", process.env.DB_HOST);
    console.log("Database Name:", process.env.DB_NAME);

    // Test Database Connection
    await sequelize.authenticate();
    console.log("✅ Database Connected Successfully");

    // Sync models without deleting data
    await sequelize.sync({ alter: true });

    console.log("✅ Database Tables Synced Successfully");

    app.listen(PORT, () => {
      console.log("======================================");
      console.log(`🚀 Server Running on Port ${PORT}`);
      console.log(`🌐 API : http://localhost:${PORT}`);
      console.log(`❤️ Health : http://localhost:${PORT}/api/health`);
      console.log("======================================");
    });

  } catch (error) {
    console.error("❌ Failed to start backend");
    console.error(error);
    process.exit(1);
  }
}

startServer();