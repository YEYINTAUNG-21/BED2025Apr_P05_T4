require('dotenv').config();

const sql = require('mssql');


const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('Connected to MSSQL');
    return pool;
  })
  .catch(err => console.log('Database Connection Failed!', err));



module.exports = {
  sql,
  request: () => poolPromise.then(pool => pool.request()),
  query,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  trustServerCertificate: true,
  options: {
    port: parseInt(process.env.DB_PORT),
    encrypt: false,
    connectionTimeout: 60000,
  },
};