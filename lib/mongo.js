// lib/mongo.js
const { MongoClient } = require('mongodb');
const config = require('../config');

const dbName = config.dbName;

let cachedClient = global.mongoClient;
let cachedDb = global.mongoDb;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }
  const client = await MongoClient.connect(config.mongoUrl);
  const db = client.db(dbName);
  global.mongoClient = client;
  global.mongoDb = db;
  return { client, db };
}

module.exports = { connectToDatabase };