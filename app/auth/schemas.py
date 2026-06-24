from pydantic import BaseModel


# User login request
class LoginRequest(BaseModel):

    email: str
    password: str

class CreateUserRequest(BaseModel):

    full_name: str

    email: str

    password: str

    role: str