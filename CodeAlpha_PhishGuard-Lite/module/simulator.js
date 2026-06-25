const emailScenarios = [
  {
    title: "Bank Alert",
    sender: "security@bank-alert-login.com",
    subject: "Your account will be blocked in 2 hours",
    body: "Click here to verify your account and avoid suspension.",
    answer: "phishing",
    explanation: "Urgency, suspicious domain, and account threat indicate phishing.",
  },
  {
    title: "Class Update",
    sender: "teacher@college.edu",
    subject: "Tomorrow's lecture notes",
    body: "Please review the attached PDF shared through the college portal.",
    answer: "safe",
    explanation: "Known sender and expected context make this safer, but attachments should still be checked.",
  },
  {
    title: "Prize Winner",
    sender: "reward@free-gift-now.xyz",
    subject: "Congratulations! You won an iPhone",
    body: "Pay a small verification fee to claim your prize.",
    answer: "phishing",
    explanation: "Unexpected prize, payment request, and suspicious domain are phishing signs.",
  },
];

const websiteScenarios = [
  {
    title: "Shopping Login",
    url: "https://arnazon-login-secure.ru",
    visual: "Amazon-style login page asking for password and card number.",
    answer: "fake",
    explanation: "The domain is misspelled and asks for unnecessary card details.",
  },
  {
    title: "GitHub Login",
    url: "https://github.com/login",
    visual: "Normal GitHub login page with correct official domain.",
    answer: "real",
    explanation: "The official domain is correct. Still check certificate and context.",
  },
  {
    title: "Payment Verification",
    url: "https://paypa1-security-check.com",
    visual: "PayPal-style page asking for OTP and password.",
    answer: "fake",
    explanation: "paypa1 uses number 1 and the website is not the official domain.",
  },
];

let emailIndex = 0;
let websiteIndex = 0;
let emailScore = 0;
let websiteScore = 0;

function loadEmailScenario() {
  const scenario = emailScenarios[emailIndex];

  document.getElementById("emailTitle").textContent = scenario.title;
  document.getElementById("emailSender").textContent = scenario.sender;
  document.getElementById("emailSubject").textContent = scenario.subject;
  document.getElementById("emailBody").textContent = scenario.body;
  document.getElementById("emailFeedback").textContent = "";
}

function answerEmail(choice) {
  const scenario = emailScenarios[emailIndex];
  const feedback = document.getElementById("emailFeedback");

  if (choice === scenario.answer) {
    emailScore++;
    feedback.className = "feedback-box success";
    feedback.textContent = `Correct! ${scenario.explanation}`;
  } else {
    feedback.className = "feedback-box danger";
    feedback.textContent = `Wrong. ${scenario.explanation}`;
  }

  emailIndex++;

  setTimeout(() => {
    if (emailIndex < emailScenarios.length) {
      loadEmailScenario();
    } else {
      localStorage.setItem("phishguard_email_score", emailScore);
      markLessonComplete("email-simulator");
      document.getElementById("emailSimulatorArea").innerHTML = `
        <div class="result-card pass-card">
          <i class="fa-solid fa-envelope-circle-check"></i>
          <h2>Email Simulator Completed</h2>
          <p>Your score: ${emailScore}/${emailScenarios.length}</p>
          <a href="09_website_detector.html" class="primary-btn">Continue to Website Detector</a>
        </div>
      `;
    }
  }, 1200);
}

function loadWebsiteScenario() {
  const scenario = websiteScenarios[websiteIndex];

  document.getElementById("websiteTitle").textContent = scenario.title;
  document.getElementById("websiteURL").textContent = scenario.url;
  document.getElementById("websiteVisual").textContent = scenario.visual;
  document.getElementById("websiteFeedback").textContent = "";
}

function answerWebsite(choice) {
  const scenario = websiteScenarios[websiteIndex];
  const feedback = document.getElementById("websiteFeedback");

  if (choice === scenario.answer) {
    websiteScore++;
    feedback.className = "feedback-box success";
    feedback.textContent = `Correct! ${scenario.explanation}`;
  } else {
    feedback.className = "feedback-box danger";
    feedback.textContent = `Wrong. ${scenario.explanation}`;
  }

  websiteIndex++;

  setTimeout(() => {
    if (websiteIndex < websiteScenarios.length) {
      loadWebsiteScenario();
    } else {
      localStorage.setItem("phishguard_website_score", websiteScore);
      markLessonComplete("website-detector");
      document.getElementById("websiteDetectorArea").innerHTML = `
        <div class="result-card pass-card">
          <i class="fa-solid fa-globe"></i>
          <h2>Website Detector Completed</h2>
          <p>Your score: ${websiteScore}/${websiteScenarios.length}</p>
          <a href="07_quiz.html" class="primary-btn">Take Final Quiz</a>
        </div>
      `;
    }
  }, 1200);
}

function showInspectorTip(id) {
  const tips = {
    sender: "The sender domain is suspicious. Attackers often use misspelled domains.",
    subject: "Urgent subject lines are used to create fear and rush your decision.",
    link: "The displayed link may look safe, but the actual destination can be malicious.",
    attachment: "Unexpected attachments can contain malware or credential-stealing macros.",
    greeting: "Generic greetings like 'Dear Customer' are common in mass phishing emails.",
    url: "Always inspect the main domain carefully before entering login details.",
    ssl: "HTTPS protects connection encryption, but it does not prove the site is trustworthy.",
    form: "Fake forms often ask for passwords, OTPs, and card details together.",
  };

  const box = document.getElementById("inspectorTip");
  box.className = "feedback-box success";
  box.textContent = tips[id];
}