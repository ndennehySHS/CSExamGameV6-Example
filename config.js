// config.js
require('dotenv').config();

module.exports = {
  mongoUrl: process.env.MONGO_URL,
  dbName: process.env.DB_NAME,
  port: process.env.PORT || 3000
};