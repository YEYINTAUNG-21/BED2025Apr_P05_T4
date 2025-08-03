console.log("ENV:", process.env);

const sql = require('mssql');
require('dotenv').config();

<<<<<<< HEAD

const config = {
=======
const sqlConfig = {
>>>>>>> 1642c86497f0dd860219acb36293843e16cb7895
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT),
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

const poolPromise = new sql.ConnectionPool(sqlConfig)
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
