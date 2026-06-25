const questions = [
  {
    question: "Which email is most likely phishing?",
    options: [
      "An email from your teacher with your name and class details",
      "An urgent email from support@paypa1-security.com asking for your password",
      "A newsletter you subscribed to",
      "A verified bank statement notification from the official app",
    ],
    correct: 1,
    explanation: "The sender uses paypa1 instead of paypal and asks for a password urgently.",
  },
  {
    question: "Which URL shows typosquatting?",
    options: ["google.com", "github.com", "paypa1.com", "microsoft.com"],
    correct: 2,
    explanation: "paypa1.com uses the number 1 instead of the letter l.",
  },
  {
    question: "What is spear phishing?",
    options: [
      "Random phishing sent to millions",
      "Phishing through phone calls",
      "A personalized attack targeting a specific person or organization",
      "A safe marketing email",
    ],
    correct: 2,
    explanation: "Spear phishing is targeted and personalized.",
  },
  {
    question: "An email says: 'Act now or your account will be closed.' Which tactic is used?",
    options: ["Urgency", "Kindness", "Patience", "Transparency"],
    correct: 0,
    explanation: "Urgency forces victims to act without thinking.",
  },
  {
    question: "What is the safest action when you receive a suspicious link?",
    options: [
      "Click quickly",
      "Forward to friends",
      "Type the official website manually or verify from trusted source",
      "Download the attachment first",
    ],
    correct: 2,
    explanation: "Always verify from the official source instead of clicking unknown links.",
  },
  {
    question: "A padlock icon in browser means:",
    options: [
      "The website is always safe",
      "The connection is encrypted",
      "The website is owned by the government",
      "The website cannot be fake",
    ],
    correct: 1,
    explanation: "HTTPS only means encryption. A phishing site can also have HTTPS.",
  },
  {
    question: "Which is NOT usually a phishing red flag?",
    options: [
      "Poor grammar",
      "Suspicious attachment",
      "Correct official domain",
      "Generic greeting",
    ],
    correct: 2,
    explanation: "A correct official domain is generally safer than a fake or misspelled one.",
  },
  {
    question: "A fake CEO asks urgently for a wire transfer. What is this?",
    options: ["Whaling / authority phishing", "Normal HR update", "Newsletter", "Browser update"],
    correct: 0,
    explanation: "Whaling targets high-level people or uses authority to pressure employees.",
  },
  {
    question: "Best defense against credential theft?",
    options: ["Use same password everywhere", "Disable updates", "Enable MFA", "Share OTP quickly"],
    correct: 2,
    explanation: "MFA adds a second protection layer even if password is stolen.",
  },
  {
    question: "What helped the 2020 Twitter Bitcoin scam happen?",
    options: [
      "Social engineering of internal employees",
      "Strong MFA everywhere",
      "No internet connection",
      "Normal password reset",
    ],
    correct: 0,
    explanation: "Attackers used social engineering to manipulate internal access.",
  },
];

let currentQuestion = 0;
let score = 0;
let answered = false;

const questionBox = document.getElementById("questionBox");
const optionsBox = document.getElementById("optionsBox");
const explanationBox = document.getElementById("explanationBox");
const progressLabel = document.getElementById("quizProgress");
const scoreLabel = document.getElementById("liveScore");
const nextBtn = document.getElementById("nextQuestionBtn");
const resultBox = document.getElementById("resultBox");

function showQuestion() {
  answered = false;
  const current = questions[currentQuestion];

  questionBox.textContent = current.question;
  progressLabel.textContent = `Question ${currentQuestion + 1} of ${questions.length}`;
  scoreLabel.textContent = `Score: ${score}`;
  explanationBox.textContent = "";
  explanationBox.className = "feedback-box hidden";
  nextBtn.classList.add("hidden");

  optionsBox.innerHTML = "";

  current.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.className = "answer-btn";
    button.textContent = option;
    button.onclick = () => handleAnswer(index, button);
    optionsBox.appendChild(button);
  });
}

function handleAnswer(selectedIndex, selectedButton) {
  if (answered) return;

  answered = true;
  const current = questions[currentQuestion];
  const allButtons = document.querySelectorAll(".answer-btn");

  allButtons.forEach((button, index) => {
    button.disabled = true;

    if (index === current.correct) {
      button.classList.add("correct-answer");
    }

    if (index === selectedIndex && selectedIndex !== current.correct) {
      button.classList.add("wrong-answer");
    }
  });

  if (selectedIndex === current.correct) {
    score++;
    explanationBox.textContent = `Correct! ${current.explanation}`;
    explanationBox.className = "feedback-box success";
  } else {
    explanationBox.textContent = `Wrong. ${current.explanation}`;
    explanationBox.className = "feedback-box danger";
  }

  scoreLabel.textContent = `Score: ${score}`;
  nextBtn.classList.remove("hidden");
}

function nextQuestion() {
  currentQuestion++;

  if (currentQuestion < questions.length) {
    showQuestion();
  } else {
    showResult();
  }
}

function showResult() {
  document.getElementById("quizArea").classList.add("hidden");
  resultBox.classList.remove("hidden");

  const passed = score >= 7;
  localStorage.setItem("phishguard_quiz_score", score);

  if (passed) {
    localStorage.setItem("phishguard_certificate", "Unlocked");
    markLessonComplete("quiz");
  }

  resultBox.innerHTML = `
    <div class="result-card ${passed ? "pass-card" : "fail-card"}">
      <i class="fa-solid ${passed ? "fa-award" : "fa-rotate-right"}"></i>
      <h2>${passed ? "Certificate Unlocked!" : "Keep Learning!"}</h2>
      <p>You scored <strong>${score}/10</strong>.</p>
      <p>${passed ? "Great job! You are ready to download your completion certificate." : "You need 7/10 to pass. Review the lessons and try again."}</p>
      <div class="hero-actions">
        <button class="primary-btn" onclick="retakeQuiz()">Retake Quiz</button>
        ${passed ? '<a href="10_certificate.html" class="secondary-btn">View Certificate</a>' : '<a href="../index.html" class="secondary-btn">Back to Lessons</a>'}
      </div>
    </div>
  `;
}

function retakeQuiz() {
  currentQuestion = 0;
  score = 0;
  resultBox.classList.add("hidden");
  document.getElementById("quizArea").classList.remove("hidden");
  showQuestion();
}

nextBtn.addEventListener("click", nextQuestion);
showQuestion();