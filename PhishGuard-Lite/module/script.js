const totalItems = 10;

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

  alert("Progress saved successfully!");
  updateProgressUI();
}

function getQuizScore() {
  return Number(localStorage.getItem("phishguard_quiz_score")) || 0;
}

function getCertificateStatus() {
  return localStorage.getItem("phishguard_certificate") || "Locked";
}

function updateProgressUI() {
  const completed = getCompletedLessons();
  const percent = Math.round((completed.length / totalItems) * 100);

  const progressFill = document.getElementById("progressFill");
  const progressText = document.getElementById("progressText");
  const awarenessScore = document.getElementById("awarenessScore");
  const completedCount = document.getElementById("completedCount");
  const quizScoreBox = document.getElementById("quizScoreBox");
  const certificateStatus = document.getElementById("certificateStatus");

  if (progressFill) progressFill.style.width = `${percent}%`;
  if (progressText) progressText.textContent = `${completed.length}/${totalItems}`;
  if (awarenessScore) awarenessScore.textContent = `${percent}%`;
  if (completedCount) completedCount.textContent = completed.length;
  if (quizScoreBox) quizScoreBox.textContent = `${getQuizScore()}/10`;
  if (certificateStatus) certificateStatus.textContent = getCertificateStatus();
}

updateProgressUI();