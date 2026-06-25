const totalItems = 7;

function getCompletedLessons() {
  return JSON.parse(localStorage.getItem("phishguard_completed")) || [];
}

function saveCompletedLessons(completed) {
  localStorage.setItem("phishguard_completed", JSON.stringify(completed));
}

function markLessonComplete(lessonId) {
  const completed = getCompletedLessons();

  if (!completed.includes(lessonId)) {
    completed.push(lessonId);
    saveCompletedLessons(completed);
  }

  alert("Lesson marked as complete!");
  updateProgressUI();
}

function updateProgressUI() {
  const completed = getCompletedLessons();
  const percent = Math.round((completed.length / totalItems) * 100);

  const progressFill = document.getElementById("progressFill");
  const progressText = document.getElementById("progressText");
  const awarenessScore = document.getElementById("awarenessScore");

  if (progressFill) progressFill.style.width = `${percent}%`;
  if (progressText) progressText.textContent = `${completed.length}/${totalItems}`;
  if (awarenessScore) awarenessScore.textContent = `${percent}%`;
}

updateProgressUI();