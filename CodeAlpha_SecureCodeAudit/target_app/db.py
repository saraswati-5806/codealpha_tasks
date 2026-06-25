from models import db, User, Note
from auth import hash_password


def seed_database():
    if User.query.count() == 0:
        admin = User(
            username="admin",
            password_hash=hash_password("admin123"),
            role="admin"
        )

        user = User(
            username="student",
            password_hash=hash_password("student123"),
            role="user"
        )

        db.session.add(admin)
        db.session.add(user)
        db.session.commit()

    if Note.query.count() == 0:
        notes = [
            Note(user_id=1, title="Admin Note", content="Confidential admin note."),
            Note(user_id=2, title="Student Note", content="Private student note."),
        ]

        db.session.add_all(notes)
        db.session.commit()


def unsafe_search_users(keyword):
    # F-001: SQL Injection via raw string concatenation.
    query = "SELECT id, username, role FROM user WHERE username LIKE '%" + keyword + "%'"
    result = db.session.execute(query)
    return [dict(row) for row in result]


def get_note_by_id_unsafe(note_id):
    # F-006: IDOR support - no ownership check.
    return Note.query.get(note_id)