const score = Number(localStorage.getItem("phishguard_quiz_score")) || 0;
const certificate = localStorage.getItem("phishguard_certificate") || "Locked";

const certificateBox = document.getElementById("certificateBox");

if (certificate === "Unlocked" && score >= 7) {
  certificateBox.innerHTML = `
    <div class="certificate-card">
      <div class="certificate-border">
        <i class="fa-solid fa-award"></i>
        <p class="eyebrow">Certificate of Completion</p>
        <h1>PhishGuard-Lite</h1>
        <p>This certifies that</p>
        <h2>Saraswati Panigrahi</h2>
        <p>has successfully completed the phishing awareness training module.</p>
        <h3>Score: ${score}/10</h3>
        <p class="certificate-note">Think Before You Click.</p>
      </div>
    </div>
  `;
} else {
  certificateBox.innerHTML = `
    <div class="result-card fail-card">
      <i class="fa-solid fa-lock"></i>
      <h2>Certificate Locked</h2>
      <p>You need to score at least 7/10 in the quiz to unlock your certificate.</p>
      <a href="07_quiz.html" class="primary-btn">Take Quiz</a>
    </div>
  `;
}