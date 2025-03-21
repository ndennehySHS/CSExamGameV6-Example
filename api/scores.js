// api/scores.js
const { connectToDatabase } = require('../lib/mongo');

module.exports = async (req, res) => {
  // Allow CORS from any origin
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const { db } = await connectToDatabase();
    const scores = await db.collection('CSExamGame-UserScoreBoard').aggregate([
      {
        $group: {
          _id: "$studentName",
          totalScore: { $sum: "$score" }
        }
      },
      {
        $sort: { totalScore: -1 } // Order highest to lowest
      }
    ]).toArray();

    res.status(200).json(scores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};