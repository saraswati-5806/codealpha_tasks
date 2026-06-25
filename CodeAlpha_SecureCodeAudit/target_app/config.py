# Intentionally vulnerable configuration for SecureCodeAudit Task 3.
# DO NOT use this file in production.

class Config:
    SECRET_KEY = "super_secret_codealpha_key_12345"  # F-002: Hardcoded secret
    SQLALCHEMY_DATABASE_URI = "sqlite:///securecodeaudit.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    DEBUG = True  # F-004: Debug mode enabled
    TESTING = False