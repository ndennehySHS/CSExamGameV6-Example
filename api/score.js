const { connectToDatabase } = require('../lib/mongo');

// Helper to manually parse JSON from the request body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  // Set CORS header
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(200).end();
    return;
  }

  // Ensure we're only handling POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Manually parse the JSON body
  let body;
  try {
    body = await parseBody(req);
  } catch (err) {
    res.status(400).json({ error: 'Invalid JSON body' });
    return;
  }

  try {
    const { studentName, score, scoreSource } = body;
    if (!studentName || score == null || !scoreSource) {
      res.status(400).json({ error: 'Missing studentName, score, or scoreSource' });
      return;
    }
    const newScore = {
      studentName,
      score: Number(score),
      scoreSource,
      class: "Unknown", // Default class value; change if needed
      timetable: new Date() // Use a Date object directly
    };

    const { db } = await connectToDatabase();
    const result = await db.collection('CSExamGame-UserScoreBoard').insertOne(newScore);
    res.status(200).json({ insertedId: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};