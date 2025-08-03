const sql = require('mssql');
require('dotenv').config();


const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE.replace(/"/g, ''), // remove quotes from DB name
  port: parseInt(process.env.DB_PORT, 10),
  options: {
    trustServerCertificate: true,
    connectionTimeout: 60000,
  },
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('Connected to MSSQL');
    return pool;
  })
  .catch(err => {
    console.log('Database Connection Failed!', err);
    throw err;
  });

module.exports = {
  sql,
  config,
  poolPromise,
};