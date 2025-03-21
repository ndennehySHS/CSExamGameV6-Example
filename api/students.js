// api/students.js
const { connectToDatabase } = require('../lib/mongo');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const { db } = await connectToDatabase();
    const students = await db.collection('CSExamGame-UserScoreBoard').distinct("studentName");
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};