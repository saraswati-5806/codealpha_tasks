# SecureCodeAudit — OWASP Top 10 Checklist

## Target
`target_app/` — Vulnerable Python Flask REST API

## Method
Manual OWASP Top 10 2021 review with Bandit static analysis support.

---

| OWASP ID | Category | Status | Evidence |
|---|---|---|---|
| A01:2021 | Broken Access Control | Fail | `/notes/<note_id>` allows IDOR because ownership is not checked |
| A02:2021 | Cryptographic Failures | Fail | Hardcoded secret key and MD5 password hashing |
| A03:2021 | Injection | Fail | Raw SQL query built using string concatenation in `db.py` |
| A04:2021 | Insecure Design | Fail | No rate limiting, weak access control design, insecure error strategy |
| A05:2021 | Security Misconfiguration | Fail | Debug mode enabled and verbose errors exposed |
| A06:2021 | Vulnerable and Outdated Components | N/A | Dependency CVE scanning is out of scope for this audit |
| A07:2021 | Identification and Authentication Failures | Fail | No login throttling, weak password hashing |
| A08:2021 | Software and Data Integrity Failures | Partial | No direct integrity pipeline reviewed; configuration integrity is weak |
| A09:2021 | Security Logging and Monitoring Failures | Fail | No failed login, suspicious action, or admin access logging |
| A10:2021 | Server-Side Request Forgery | N/A | No outbound HTTP request functionality exists in target app |

---

## Detailed Notes

### A01: Broken Access Control
The notes API allows users to request a note by changing the note ID. The application does not verify whether the note belongs to the logged-in user.

### A02: Cryptographic Failures
The app hardcodes a secret key and stores passwords using MD5. Both practices are insecure and must be replaced.

### A03: Injection
The user search function creates SQL using direct string concatenation with user input.

### A04: Insecure Design
The application design lacks rate limiting, strong validation, and proper authorization checks.

### A05: Security Misconfiguration
Debug mode is enabled. Verbose exceptions are returned directly to the client.

### A06: Vulnerable Components
Not tested. Dependency vulnerability scanning is outside this phase.

### A07: Identification and Authentication Failures
The login endpoint allows unlimited attempts and uses weak password hashing.

### A08: Software and Data Integrity Failures
No package integrity or deployment pipeline was reviewed. Configuration handling is weak.

### A09: Security Logging and Monitoring Failures
No meaningful security logs are generated for authentication failures, suspicious input, or access control failures.

### A10: SSRF
Not applicable because the app does not make outbound HTTP requests.