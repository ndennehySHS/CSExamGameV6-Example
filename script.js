// When hosted on Vercel, the API endpoints are available under /api
const API_BASE = 'https://cs-exam-game-v3.vercel.app';

document.addEventListener('DOMContentLoaded', function() {
  const scoreboardList = document.getElementById('scoreboard');
  const refreshBtn = document.getElementById('refresh');
  // These elements exist only on pages that include the add score form.
  const studentSelect = document.getElementById('student-select');
  const scoreSourceSelect = document.getElementById('score-source-select');
  const scoreInput = document.getElementById('score-input');
  const addScoreBtn = document.getElementById('add-score');

  // Fetch and display aggregated scores (scoreboard)
  async function fetchScores() {
    try {
      const res = await fetch(`${API_BASE}/api/scores`);
      const scores = await res.json();
      scoreboardList.innerHTML = '';
      scores.forEach(entry => {
        const li = document.createElement('li');
        li.textContent = `${entry._id}: ${entry.totalScore} points`;
        scoreboardList.appendChild(li);
      });
    } catch (error) {
      console.error('Error fetching scores:', error);
    }
  }

  // Fetch and populate the student dropdown if it exists
  async function fetchStudents() {
    if (!studentSelect) return;
    try {
      const res = await fetch(`${API_BASE}/api/students`);
      const students = await res.json();
      studentSelect.innerHTML = '<option value="">Select Student</option>';
      students.forEach(student => {
        const option = document.createElement('option');
        option.value = student;
        option.textContent = student;
        studentSelect.appendChild(option);
      });
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  }

  // Attach event listener for adding a new score if those elements exist
  if (addScoreBtn && studentSelect && scoreSourceSelect && scoreInput) {
    addScoreBtn.addEventListener('click', async () => {
      const studentName = studentSelect.value;
      const scoreSource = scoreSourceSelect.value;
      const score = scoreInput.value;
      if (!studentName || !scoreSource || !score) {
        alert('Please select a student, a score source, and enter a score.');
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/api/score`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentName, score, scoreSource })
        });
        if (res.ok) {
          scoreInput.value = '';
          await fetchScores();
          await fetchStudents();
        } else {
          const errorData = await res.json();
          alert('Error adding score: ' + errorData.error);
        }
      } catch (error) {
        console.error('Error adding score:', error);
      }
    });
  }

  refreshBtn.addEventListener('click', async () => {
    await fetchScores();
    if (studentSelect) {
      await fetchStudents();
    }
  });

  // Initial fetch on page load
  fetchScores();
  if (studentSelect) {
    fetchStudents();
  }
});