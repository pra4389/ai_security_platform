"""
Guardion — Admin account utility.

Signup always creates users with role "client"; nothing else ever sets
role "admin". Use this script to promote an existing account to admin
(or create a fresh admin user) so the /admin dashboard becomes reachable.

Runs against the SAME database the backend uses (app.config settings), so
whatever MONGO_URI the server reads, this script writes to the same place.

Usage (from the backend/ directory):

    # List all users and their roles
    python create_admin.py --list

    # Promote an existing account to admin (no password needed)
    python create_admin.py pranav@gmail.com

    # Create a brand-new admin account
    python create_admin.py boss@guardion.io --name "Boss" --password "secret123"

    # Demote an admin back to client
    python create_admin.py pranav@gmail.com --role client
"""

import argparse
from datetime import datetime, timezone

from app.config import settings
from app.db.mongodb import users_collection
from app.services.auth_service import hash_password


def list_users() -> None:
    users = list(users_collection().find({}, {"password_hash": 0}))
    print(f"DB: {settings.MONGO_URI}  (db={settings.MONGO_DB_NAME})")
    print(f"{len(users)} user(s):")
    for u in users:
        print(f"  - {u.get('email'):30}  role={u.get('role')!r:10}  name={u.get('name')}")


def set_role(email: str, role: str, name: str | None, password: str | None) -> None:
    col = users_collection()
    user = col.find_one({"email": email})

    if user:
        col.update_one(
            {"_id": user["_id"]},
            {"$set": {"role": role, "updated_at": datetime.now(timezone.utc)}},
        )
        print(f"[OK] Updated {email}: role -> {role!r}")
        print("     Log out and log back in for the change to take effect.")
        return

    # User doesn't exist — create it (admin creation path).
    if not password:
        raise SystemExit(
            f"[ERROR] No user found with email {email!r}. "
            f"To create a new account, pass --password (and optionally --name)."
        )

    now = datetime.now(timezone.utc)
    col.insert_one({
        "name": name or email.split("@")[0],
        "email": email,
        "password_hash": hash_password(password),
        "role": role,
        "created_at": now,
        "updated_at": now,
    })
    print(f"[OK] Created new user {email!r} with role {role!r}.")


def main() -> None:
    parser = argparse.ArgumentParser(description="Promote/create a Guardion admin user.")
    parser.add_argument("email", nargs="?", help="Email of the account to promote or create.")
    parser.add_argument("--role", default="admin", choices=["admin", "client"],
                        help="Role to assign (default: admin).")
    parser.add_argument("--name", help="Name to use when creating a new account.")
    parser.add_argument("--password", help="Password to use when creating a new account.")
    parser.add_argument("--list", action="store_true", help="List all users and exit.")
    args = parser.parse_args()

    if args.list:
        list_users()
        return

    if not args.email:
        parser.error("provide an email, or use --list")

    set_role(args.email, args.role, args.name, args.password)


if __name__ == "__main__":
    main()
