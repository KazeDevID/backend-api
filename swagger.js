const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  swaggerDefinition: {
    info: {
      title: 'Your API Title',
      version: '1.0.0',
      description: 'Your API Description',
    },
    basePath: '/',
  },
  apis: ['./routes/authRoute.js', './routes/productRoute.js'],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
