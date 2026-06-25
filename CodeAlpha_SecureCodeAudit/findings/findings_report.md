# SecureCodeAudit — Findings Report

## Project Overview

SecureCodeAudit is a secure coding review project created for CodeAlpha Cyber Security Task 3.  
The target application is a deliberately vulnerable Python Flask REST API located in `target_app/`.

The purpose of this audit is to identify insecure coding practices, map them to OWASP/CWE categories, and recommend safer remediation steps.

---

## Audit Scope

### Target Application

```text
target_app/
├── app.py
├── auth.py
├── config.py
├── db.py
├── models.py
└── utils.py

Review Methods
Bandit static analysis
Manual code review
OWASP Top 10 mapping
CWE mapping
Secure coding best-practice review
Bandit Summary

Bandit detected the following issue counts:

Severity	Count
High	3
Medium	1
Low	3

Bandit confirmed issues such as:

Flask debug mode enabled
Weak MD5 hashing
Hardcoded secret/password strings
Possible SQL injection through string-based query construction
Confirmed Findings
F-001 — SQL Injection Through Raw Query Construction
Severity

Critical

Location

target_app/db.py

Vulnerable Code Pattern
query = "SELECT id, username, role FROM user WHERE username LIKE '%" + keyword + "%'"
Description

The application directly concatenates user input into a SQL query. An attacker can manipulate the q parameter in /users/search?q= to change query behavior.

Impact
Unauthorized data access
Data leakage
Potential database manipulation
Authentication or authorization bypass in more complex cases
OWASP/CWE Mapping
OWASP A03:2021 — Injection
CWE-89 — SQL Injection
Recommendation

Use parameterized queries or ORM query filters instead of raw string concatenation.

F-002 — Hardcoded Secret Key
Severity

High

Location

target_app/config.py

Description

The Flask SECRET_KEY is hardcoded in source code.

Impact

If exposed, attackers may forge sessions, tamper with cookies, or compromise application security.

OWASP/CWE Mapping
OWASP A02:2021 — Cryptographic Failures
CWE-798 — Use of Hard-coded Credentials
Recommendation

Load secrets from environment variables and never commit them to GitHub.

F-003 — Weak Password Hashing Using MD5
Severity

High

Location

target_app/auth.py

Description

The application hashes passwords using MD5.

Impact

MD5 is fast and weak. Password hashes can be cracked using brute force or rainbow tables.

OWASP/CWE Mapping
OWASP A02:2021 — Cryptographic Failures
CWE-327 — Use of a Broken or Risky Cryptographic Algorithm
CWE-916 — Use of Password Hash With Insufficient Computational Effort
Recommendation

Use Werkzeug password hashing, bcrypt, Argon2, or PBKDF2.

F-004 — Flask Debug Mode Enabled
Severity

High

Location

target_app/app.py

Bandit Finding

B201: flask_debug_true

Description

The application runs with:

app.run(debug=True)
Impact

Debug mode may expose sensitive stack traces and, in unsafe deployments, allow remote code execution through the Werkzeug debugger.

OWASP/CWE Mapping
OWASP A05:2021 — Security Misconfiguration
CWE-94 — Improper Control of Generation of Code
Recommendation

Disable debug mode in production and use environment-based configuration.

F-005 — Missing Input Validation
Severity

Medium

Location

target_app/app.py, target_app/utils.py

Description

Several endpoints accept user input without checking type, length, format, or allowed characters.

Affected Routes
/register
/login
/users/search
/notes
Impact
Malformed data
Injection attempts
Application errors
Unexpected behavior
OWASP/CWE Mapping
OWASP A03:2021 — Injection
CWE-20 — Improper Input Validation
Recommendation

Validate input before processing. Enforce length limits, required fields, allowed characters, and expected data types.

F-006 — Insecure Direct Object Reference
Severity

Medium

Location

target_app/app.py

Vulnerable Route
GET /notes/<note_id>
Description

A logged-in user can access another user’s note by changing the note_id.

Impact
Unauthorized data disclosure
Broken access control
Privacy violation
OWASP/CWE Mapping
OWASP A01:2021 — Broken Access Control
CWE-639 — Authorization Bypass Through User-Controlled Key
Recommendation

Verify resource ownership before returning data.

F-007 — No Login Rate Limiting
Severity

Medium

Location

target_app/app.py

Description

The login route allows unlimited password attempts.

Impact

Attackers can attempt brute-force attacks without being slowed down.

OWASP/CWE Mapping
OWASP A07:2021 — Identification and Authentication Failures
CWE-307 — Improper Restriction of Excessive Authentication Attempts
Recommendation

Add rate limiting, account lockout, CAPTCHA, or throttling.

F-008 — Verbose Error Messages Exposed
Severity

Low

Location

target_app/utils.py, target_app/app.py

Description

The app returns raw exception details to users.

Impact

Attackers can learn internal class names, database errors, file paths, and implementation details.

OWASP/CWE Mapping
OWASP A05:2021 — Security Misconfiguration
CWE-209 — Information Exposure Through an Error Message
Recommendation

Return generic user-facing errors and log detailed errors server-side.

F-009 — Missing Security Logging
Severity

Low

Location

target_app/app.py

Description

The app does not log failed login attempts, suspicious searches, IDOR attempts, or unauthorized admin access.

Impact

Attacks may go undetected, making investigation and incident response difficult.

OWASP/CWE Mapping
OWASP A09:2021 — Security Logging and Monitoring Failures
CWE-778 — Insufficient Logging
Recommendation

Add structured security logging for authentication failures, access control violations, and suspicious input.

Findings Summary Table
ID	Finding	Severity	OWASP	Status
F-001	SQL Injection	Critical	A03	Confirmed
F-002	Hardcoded Secret	High	A02	Confirmed
F-003	Weak MD5 Hashing	High	A02	Confirmed
F-004	Debug Mode Enabled	High	A05	Confirmed
F-005	Missing Input Validation	Medium	A03	Confirmed
F-006	IDOR	Medium	A01	Confirmed
F-007	No Rate Limiting	Medium	A07	Confirmed
F-008	Verbose Errors	Low	A05	Confirmed
F-009	Missing Security Logging	Low	A09	Confirmed
Final Audit Conclusion

The target Flask application contains multiple insecure coding practices that could expose sensitive data, weaken authentication, and allow injection or access-control attacks.

The most critical fixes are:

Replace raw SQL queries with parameterized queries.
Remove hardcoded secrets.
Replace MD5 password hashing.
Disable debug mode.
Enforce authorization checks.
Add input validation and security logging.