from passlib.context import CryptContext

# ==========================
# PASSWORD HASHING
# ==========================
pwd_context = CryptContext(
    schemes=["pbkdf2_sha256"],
    deprecated="auto"
)


# ==========================
# HASH PASSWORD
# ==========================
def hash_password(password: str):

    return pwd_context.hash(password)


# ==========================
# VERIFY PASSWORD
# ==========================
def verify_password(
    plain_password,
    hashed_password
):

    return pwd_context.verify(
        plain_password,
        hashed_password
    )