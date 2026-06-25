from flask import Flask, request, jsonify
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from models import db, User, Note
from auth import AppUser, verify_password, get_user_by_id, get_user_by_username, hash_password
from db import seed_database, unsafe_search_users, get_note_by_id_unsafe
from utils import format_error, validate_required_fields
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)

login_manager = LoginManager()
login_manager.init_app(app)


@login_manager.user_loader
def load_user(user_id):
    user = get_user_by_id(user_id)
    if user:
        return AppUser(user)
    return None


@app.route("/")
def home():
    return jsonify({
        "project": "SecureCodeAudit",
        "mode": "Vulnerable Target Application",
        "warning": "This app intentionally contains security vulnerabilities for audit practice."
    })


@app.route("/init-db", methods=["GET"])
def init_db():
    try:
        db.create_all()
        seed_database()

        return jsonify({
            "message": "Database initialized with demo users.",
            "demo_users": [
                {"username": "admin", "password": "admin123"},
                {"username": "student", "password": "student123"}
            ]
        })

    except Exception as error:
        # F-008: Verbose errors exposed.
        return jsonify(format_error(error)), 500


@app.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json() or {}

        # F-005: Missing strong input validation.
        missing = validate_required_fields(data, ["username", "password"])
        if missing:
            return jsonify({"error": "Missing fields", "fields": missing}), 400

        user = User(
            username=data["username"],
            password_hash=hash_password(data["password"]),
            role=data.get("role", "user")
        )

        db.session.add(user)
        db.session.commit()

        return jsonify({
            "message": "User registered successfully.",
            "user_id": user.id
        })

    except Exception as error:
        # F-008: Verbose errors exposed.
        return jsonify(format_error(error)), 500


@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json() or {}

        # F-005: Missing strong validation.
        username = data.get("username")
        password = data.get("password")

        user = get_user_by_username(username)

        # F-007: No login rate limiting or lockout.
        if user and verify_password(password, user.password_hash):
            login_user(AppUser(user))
            return jsonify({
                "message": "Login successful.",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "role": user.role
                }
            })

        return jsonify({"error": "Invalid username or password"}), 401

    except Exception as error:
        # F-008: Verbose errors exposed.
        return jsonify(format_error(error)), 500


@app.route("/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logged out successfully."})


@app.route("/users/search", methods=["GET"])
@login_required
def search_users():
    try:
        keyword = request.args.get("q", "")

        # F-001: SQL injection vulnerable search.
        users = unsafe_search_users(keyword)

        return jsonify({
            "query": keyword,
            "results": users
        })

    except Exception as error:
        # F-008: Verbose errors exposed.
        return jsonify(format_error(error)), 500


@app.route("/notes", methods=["POST"])
@login_required
def create_note():
    try:
        data = request.get_json() or {}

        # F-005: Missing strong validation/sanitization.
        title = data.get("title")
        content = data.get("content")

        note = Note(
            user_id=int(current_user.id),
            title=title,
            content=content
        )

        db.session.add(note)
        db.session.commit()

        return jsonify({
            "message": "Note created.",
            "note_id": note.id
        })

    except Exception as error:
        # F-008: Verbose errors exposed.
        return jsonify(format_error(error)), 500


@app.route("/notes/<int:note_id>", methods=["GET"])
@login_required
def get_note(note_id):
    try:
        # F-006: IDOR vulnerability.
        # Any logged-in user can access any note by changing note_id.
        note = get_note_by_id_unsafe(note_id)

        if not note:
            return jsonify({"error": "Note not found"}), 404

        return jsonify({
            "id": note.id,
            "user_id": note.user_id,
            "title": note.title,
            "content": note.content
        })

    except Exception as error:
        # F-008: Verbose errors exposed.
        return jsonify(format_error(error)), 500


@app.route("/admin/users", methods=["GET"])
@login_required
def list_all_users():
    try:
        # F-006 / A01: Weak access control style.
        # This exposes user list based only on a simple role string.
        if current_user.role != "admin":
            return jsonify({"error": "Admin access required"}), 403

        users = User.query.all()

        return jsonify([
            {
                "id": user.id,
                "username": user.username,
                "role": user.role
            }
            for user in users
        ])

    except Exception as error:
        # F-008: Verbose errors exposed.
        return jsonify(format_error(error)), 500


# F-009: No security logging configured.
# There are no logs for failed logins, suspicious searches, IDOR attempts, or admin access.


if __name__ == "__main__":
    # F-004: Debug mode enabled.
    app.run(debug=True)