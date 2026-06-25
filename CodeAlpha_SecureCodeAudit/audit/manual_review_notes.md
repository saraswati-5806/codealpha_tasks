# SecureCodeAudit — Manual Review Notes

## Project
SecureCodeAudit

## Target
Python Flask REST API located in `target_app/`

## Review Method
Manual line-by-line secure coding review using:
- OWASP Top 10 2021
- CWE mapping
- Static code inspection
- Bandit output cross-check

---

## File: `target_app/config.py`

### Observation
The application contains a hardcoded `SECRET_KEY`.

### Risk
Hardcoded secrets can be leaked through GitHub, logs, screenshots, or shared code.

### Related Finding
F-002 — Hardcoded secret key

### OWASP/CWE
- OWASP A02:2021 Cryptographic Failures
- CWE-798 Use of Hard-coded Credentials

---

### Observation
`DEBUG = True` is enabled.

### Risk
Debug mode can expose stack traces, internal paths, environment details, and sensitive error information.

### Related Finding
F-004 — Debug mode enabled

### OWASP/CWE
- OWASP A05:2021 Security Misconfiguration
- CWE-94 Improper Control of Generation of Code

---

## File: `target_app/auth.py`

### Observation
Passwords are hashed using MD5.

### Risk
MD5 is fast, outdated, and unsuitable for password storage. Attackers can crack MD5 hashes quickly using rainbow tables or brute force.

### Related Finding
F-003 — Weak password hashing

### OWASP/CWE
- OWASP A02:2021 Cryptographic Failures
- CWE-916 Use of Password Hash With Insufficient Computational Effort

---

## File: `target_app/db.py`

### Observation
The function `unsafe_search_users()` builds SQL queries using string concatenation.

### Risk
User-controlled input is directly inserted into a SQL query, creating SQL Injection risk.

### Related Finding
F-001 — SQL Injection

### OWASP/CWE
- OWASP A03:2021 Injection
- CWE-89 SQL Injection

---

### Observation
The function `get_note_by_id_unsafe()` retrieves notes by ID without checking ownership.

### Risk
Any authenticated user can access another user’s note if they guess or change the note ID.

### Related Finding
F-006 — Insecure Direct Object Reference

### OWASP/CWE
- OWASP A01:2021 Broken Access Control
- CWE-639 Authorization Bypass Through User-Controlled Key

---

## File: `target_app/app.py`

### Observation
Multiple routes accept user input without strict validation.

Affected routes:
- `/register`
- `/login`
- `/users/search`
- `/notes`

### Risk
Missing validation can allow malformed input, injection payloads, oversized data, and unexpected data types.

### Related Finding
F-005 — Missing input validation

### OWASP/CWE
- OWASP A03:2021 Injection
- CWE-20 Improper Input Validation

---

### Observation
The `/notes/<note_id>` route returns notes by ID without verifying note ownership.

### Risk
This is an IDOR vulnerability because users can access resources belonging to other users.

### Related Finding
F-006 — IDOR

### OWASP/CWE
- OWASP A01:2021 Broken Access Control
- CWE-639 Authorization Bypass Through User-Controlled Key

---

### Observation
The `/login` route has no rate limiting or lockout mechanism.

### Risk
Attackers can repeatedly try passwords without being slowed down or blocked.

### Related Finding
F-007 — No rate limiting on login

### OWASP/CWE
- OWASP A07:2021 Identification and Authentication Failures
- CWE-307 Improper Restriction of Excessive Authentication Attempts

---

### Observation
Exception messages are returned directly to users through `format_error(error)`.

### Risk
Verbose errors can expose stack traces, class names, database errors, and internal implementation details.

### Related Finding
F-008 — Verbose error messages

### OWASP/CWE
- OWASP A05:2021 Security Misconfiguration
- CWE-209 Information Exposure Through an Error Message

---

### Observation
No security logging is configured.

Missing logs:
- Failed login attempts
- Suspicious search queries
- Unauthorized admin access
- IDOR attempts
- Account creation events

### Risk
Without security logging, attacks may go undetected and incident response becomes difficult.

### Related Finding
F-009 — Absence of security logging

### OWASP/CWE
- OWASP A09:2021 Security Logging and Monitoring Failures
- CWE-778 Insufficient Logging

---

## Review Summary

| Finding ID | Title | Severity | Status |
|---|---|---|---|
| F-001 | SQL Injection via raw string concatenation | Critical | Confirmed |
| F-002 | Hardcoded secret key | High | Confirmed |
| F-003 | Weak password hashing using MD5 | High | Confirmed |
| F-004 | Debug mode enabled | High | Confirmed |
| F-005 | Missing input validation | Medium | Confirmed |
| F-006 | Insecure Direct Object Reference | Medium | Confirmed |
| F-007 | No rate limiting on login | Medium | Confirmed |
| F-008 | Verbose error messages exposed | Low | Confirmed |
| F-009 | Absence of security logging | Low | Confirmed |