/* ==========================================================
   SecureCodeAudit Pro
   Dashboard Script
   Phase 4.1
========================================================== */

document.addEventListener("DOMContentLoaded", () => {
    initializeDashboard();
});

/* -----------------------------
   Dashboard Initialization
------------------------------ */

function initializeDashboard() {
    animateCounters();
    populateFindingsTable();
    populateRecommendations();
    updateAuditSummary();
}

/* -----------------------------
   Animated Counters
------------------------------ */

function animateCounters() {

    animateValue("audit-score", 0, 42, 1200);

    animateValue("critical-count", 0, 0, 1000);

    animateValue("high-count", 0, 3, 1000);

    animateValue("medium-count", 0, 4, 1000);

    animateValue("low-count", 0, 2, 1000);

}

function animateValue(id, start, end, duration) {

    const obj = document.getElementById(id);

    if (!obj) return;

    let startTime = null;

    function step(timestamp) {

        if (!startTime) startTime = timestamp;

        const progress = Math.min((timestamp - startTime) / duration, 1);

        obj.innerText = Math.floor(progress * (end - start) + start);

        if (progress < 1) {
            window.requestAnimationFrame(step);
        }

    }

    window.requestAnimationFrame(step);

}

/* -----------------------------
   Findings
------------------------------ */

const findings = [

    {
        id: "F-001",
        title: "SQL Injection",
        severity: "High",
        owasp: "A03:2021 Injection",
        status: "Open"
    },

    {
        id: "F-002",
        title: "Hardcoded Secret",
        severity: "High",
        owasp: "A02:2021 Cryptographic Failures",
        status: "Open"
    },

    {
        id: "F-003",
        title: "Weak MD5 Hashing",
        severity: "High",
        owasp: "A02:2021 Cryptographic Failures",
        status: "Open"
    },

    {
        id: "F-004",
        title: "Debug Mode Enabled",
        severity: "Medium",
        owasp: "A05:2021 Security Misconfiguration",
        status: "Open"
    },

    {
        id: "F-005",
        title: "Missing Input Validation",
        severity: "Medium",
        owasp: "A03:2021 Injection",
        status: "Open"
    },

    {
        id: "F-006",
        title: "IDOR",
        severity: "Medium",
        owasp: "A01:2021 Broken Access Control",
        status: "Open"
    },

    {
        id: "F-007",
        title: "No Rate Limiting",
        severity: "Medium",
        owasp: "A07:2021 Authentication Failures",
        status: "Open"
    },

    {
        id: "F-008",
        title: "Verbose Error Messages",
        severity: "Low",
        owasp: "A05:2021 Security Misconfiguration",
        status: "Open"
    },

    {
        id: "F-009",
        title: "Missing Security Logging",
        severity: "Low",
        owasp: "A09:2021 Logging & Monitoring",
        status: "Open"
    }

];

/* -----------------------------
   Populate Findings Table
------------------------------ */

function populateFindingsTable() {

    const table = document.getElementById("findings-table");

    if (!table) return;

    findings.forEach(item => {

        const row = document.createElement("tr");

        row.innerHTML = `

        <td>${item.id}</td>

        <td>${item.title}</td>

        <td>${severityBadge(item.severity)}</td>

        <td>${item.owasp}</td>

        <td>${item.status}</td>

        `;

        table.appendChild(row);

    });

}

/* -----------------------------
   Severity Badge
------------------------------ */

function severityBadge(level) {

    switch(level){

        case "High":
            return `<span class="badge high">HIGH</span>`;

        case "Medium":
            return `<span class="badge medium">MEDIUM</span>`;

        case "Low":
            return `<span class="badge low">LOW</span>`;

        default:
            return `<span class="badge">UNKNOWN</span>`;

    }

}

/* -----------------------------
   Recommendations
------------------------------ */

function populateRecommendations(){

    const list=document.getElementById("recommendation-list");

    if(!list) return;

    const recommendations=[

        "Use parameterized SQL queries.",

        "Store secrets inside environment variables.",

        "Replace MD5 with bcrypt.",

        "Disable Flask debug mode in production.",

        "Validate every user input.",

        "Implement proper authorization.",

        "Apply API rate limiting.",

        "Hide verbose application errors.",

        "Enable centralized security logging."

    ];

    recommendations.forEach(item=>{

        const li=document.createElement("li");

        li.innerText=item;

        list.appendChild(li);

    });

}

/* -----------------------------
   Audit Summary
------------------------------ */

function updateAuditSummary(){

    const total=document.getElementById("total-findings");

    if(total){

        total.innerText=findings.length;

    }

}

/* -----------------------------
   Console Banner
------------------------------ */

console.log("======================================");

console.log(" SecureCodeAudit Pro Dashboard Loaded ");

console.log("======================================");