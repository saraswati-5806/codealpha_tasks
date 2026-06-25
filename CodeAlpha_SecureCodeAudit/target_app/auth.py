import hashlib
from flask_login import UserMixin
from models import User


class AppUser(UserMixin):
    def __init__(self, user):
        self.id = str(user.id)
        self.username = user.username
        self.role = user.role


def hash_password(password):
    # F-003: Weak password hashing using MD5.
    return hashlib.md5(password.encode()).hexdigest()


def verify_password(password, stored_hash):
    # F-003: Compares MD5 hashes directly.
    return hashlib.md5(password.encode()).hexdigest() == stored_hash


def get_user_by_id(user_id):
    return User.query.get(int(user_id))


def get_user_by_username(username):
    return User.query.filter_by(username=username).first()