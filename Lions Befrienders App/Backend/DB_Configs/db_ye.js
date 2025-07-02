module.exports = {
  user: process.env.YE_DB_USER,
  password: process.env.YE_DB_PASSWORD,
  server: process.env.YE_DB_SERVER,
  database: process.env.YE_DB_DATABASE,
  trustServerCertificate: true,
  options: {
    port: parseInt(process.env.YE_DB_PORT),
    connectionTimeout: 60000,
  },
};