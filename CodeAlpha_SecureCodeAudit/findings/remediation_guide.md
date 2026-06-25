# SecureCodeAudit — Remediation Guide

## Purpose

This remediation guide explains how to fix the vulnerabilities discovered in the vulnerable Flask application located in `target_app/`.

Each fix includes the insecure behavior, recommended secure approach, and expected benefit.

---

# Remediation Plan

## R-001 — Fix SQL Injection

### Related Finding
F-001 — SQL Injection

### Problem
The vulnerable app builds SQL queries using string concatenation.

### Secure Fix
Use SQLAlchemy ORM filters or parameterized queries.

### Secure Example

```python
users = User.query.filter(User.username.like(f"%{keyword}%")).all()
Benefit

Prevents attackers from modifying SQL query logic through user input.

R-002 — Move Secret Key to Environment Variable
Related Finding

F-002 — Hardcoded Secret Key

Problem

The Flask secret key is stored directly in source code.

Secure Fix
import os

SECRET_KEY = os.getenv("SECRET_KEY")
Benefit

Secrets are no longer exposed in GitHub or source files.

R-003 — Replace MD5 Password Hashing
Related Finding

F-003 — Weak Password Hashing

Problem

MD5 is not safe for password storage.

Secure Fix
from werkzeug.security import generate_password_hash, check_password_hash

password_hash = generate_password_hash(password)
check_password_hash(password_hash, password)
Benefit

Passwords are stored using stronger adaptive hashing.

R-004 — Disable Debug Mode
Related Finding

F-004 — Debug Mode Enabled

Problem

Debug mode exposes internal application details.

Secure Fix
app.run(debug=False)

or use environment-based configuration:

DEBUG = os.getenv("FLASK_DEBUG", "False") == "True"
Benefit

Prevents sensitive stack traces and debug console exposure.

R-005 — Add Strong Input Validation
Related Finding

F-005 — Missing Input Validation

Problem

User input is accepted without length, type, or format checks.

Secure Fix

Validate:

Required fields
String length
Allowed characters
Expected data type
Password strength
Example
if not username or len(username) > 50:
    return jsonify({"error": "Invalid username"}), 400
Benefit

Reduces injection, malformed data, and unexpected application behavior.

R-006 — Fix IDOR With Ownership Checks
Related Finding

F-006 — Insecure Direct Object Reference

Problem

Users can access notes that do not belong to them.

Secure Fix
note = Note.query.filter_by(id=note_id, user_id=current_user.id).first()
Benefit

Users can only access their own resources.

R-007 — Add Login Rate Limiting
Related Finding

F-007 — No Login Rate Limiting

Problem

Attackers can attempt unlimited login guesses.

Secure Fix

Add request throttling using Flask-Limiter or a custom in-memory limiter.

Example
@limiter.limit("5 per minute")
@app.route("/login", methods=["POST"])
def login():
    ...
Benefit

Reduces brute-force attack risk.

R-008 — Replace Verbose Errors With Generic Errors
Related Finding

F-008 — Verbose Error Messages

Problem

Raw exception details are returned to users.

Secure Fix
return jsonify({"error": "Something went wrong"}), 500

Detailed errors should only be logged server-side.

Benefit

Prevents attackers from learning internal application details.

R-009 — Add Security Logging
Related Finding

F-009 — Missing Security Logging

Problem

The application does not log security-relevant events.

Secure Fix

Log:

Failed login attempts
Suspicious search input
Unauthorized admin access
IDOR attempts
Account creation
Example
logger.warning("Failed login attempt for username=%s", username)
Benefit

Improves detection, investigation, and incident response.

Priority Order
Priority	Fix	Reason
1	SQL Injection	Highest risk of data compromise
2	Weak Password Hashing	Protects user credentials
3	Hardcoded Secret	Protects session security
4	Debug Mode	Prevents internal exposure
5	IDOR	Protects user data
6	Input Validation	Reduces attack surface
7	Rate Limiting	Reduces brute-force risk
8	Error Handling	Prevents information disclosure
9	Security Logging	Improves monitoring
Secure Coding Best Practices
Never trust user input.
Use parameterized queries.
Store secrets in environment variables.
Use strong password hashing.
Disable debug mode in production.
Enforce authentication and authorization.
Validate and sanitize all inputs.
Avoid exposing internal error details.
Add security logging.
Review code regularly with static analysis tools.