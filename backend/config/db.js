const { Sequelize } = require('sequelize');
const path = require('path');

let sequelize;

const isMySQL =
  process.env.DB_DIALECT === 'mysql' ||
  (process.env.DB_HOST &&
    process.env.DB_USER &&
    process.env.DB_NAME);

if (isMySQL) {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      dialect: 'mysql',

      logging: false,

      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
        connectTimeout: 60000,
      },

      pool: {
        max: 10,
        min: 0,
        acquire: 60000,
        idle: 10000,
      },
    }
  );

  console.log('✅ Railway MySQL Selected');
} else {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage:
      process.env.DB_STORAGE ||
      path.join(__dirname, '../database.sqlite'),
    logging: false,
  });

  console.log('✅ SQLite Selected');
}

module.exports = sequelize;