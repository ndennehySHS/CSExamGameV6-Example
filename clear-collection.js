// clear-collection.js
const { MongoClient } = require('mongodb');
const config = require('./config');

async function clearCollection() {
  const client = await MongoClient.connect(config.mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  const db = client.db(config.dbName);
  const collection = db.collection('CSExamGame-UserScoreBoard');
  
  const result = await collection.deleteMany({});
  console.log(`Deleted ${result.deletedCount} documents from CSExamGame-UserScoreBoard`);
  client.close();
}

clearCollection().catch(err => {
  console.error("Error clearing collection:", err);
}); 