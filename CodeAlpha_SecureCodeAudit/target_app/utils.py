def format_error(error):
    # F-008: Verbose error message exposed to client.
    return {
        "error": str(error),
        "type": error.__class__.__name__
    }


def is_admin(user):
    return getattr(user, "role", "") == "admin"


def validate_required_fields(data, fields):
    # F-005: Weak validation helper.
    # It only checks presence, not type, length, format, or allowed characters.
    missing = []

    for field in fields:
        if field not in data:
            missing.append(field)

    return missing