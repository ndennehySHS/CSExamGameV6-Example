// populate.js
const { MongoClient } = require('mongodb');
const config = require('./config');

async function populateData() {
  const client = await MongoClient.connect(config.mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  const db = client.db(config.dbName);
  const collection = db.collection('CSExamGame-UserScoreBoard');
  
  // Optional: clear any existing data
  await collection.deleteMany({});
  
  const scoreEntries = [];
  const students = [
    { studentName: "student1", class: "Y12" },
    { studentName: "student2", class: "Y12" },
    { studentName: "student3", class: "Y11" },
    { studentName: "student4", class: "Y11" },
    { studentName: "student5", class: "Y10" }
  ];
  const scoreSources = ["Space Invaders", "Snake"];
  
  // Generate 20 entries (4 per student)
  for (const student of students) {
    for (let i = 0; i < 4; i++) {
      const score = Math.floor(Math.random() * 16) + 5; // Random score between 5 and 20
      const scoreSource = scoreSources[Math.floor(Math.random() * scoreSources.length)];
      const timetable = new Date().toISOString();
      scoreEntries.push({
        studentName: student.studentName,
        class: student.class,
        score,
        scoreSource,
        timetable
      });
    }
  }
  
  const result = await collection.insertMany(scoreEntries);
  console.log(`Inserted ${result.insertedCount} documents`);
  client.close();
}

populateData().catch(err => {
  console.error("Error populating data:", err);
});