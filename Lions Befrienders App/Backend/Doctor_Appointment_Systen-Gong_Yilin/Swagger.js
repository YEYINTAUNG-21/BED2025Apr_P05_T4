const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'User API',
    description: 'Simple User CRUD API'
  },
  host: 'localhost:3000',
  schemes: ['http']
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./app.js']; // Your main server file

swaggerAutogen(outputFile, endpointsFiles, doc);