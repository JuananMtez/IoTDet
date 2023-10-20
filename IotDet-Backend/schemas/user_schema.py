from pydantic import BaseModel
from typing import Optional
from models.models import RoleEnum


class Token(BaseModel):
    access_token: str
    token_type: str


class UserPassword(BaseModel):
    password: str

class UserRole(BaseModel):
    role: int


class UserPost(BaseModel):
    name: str
    user: str
    password: str
    role: int


class UserLogin(BaseModel):
    user: str
    password: str


class UsernameResponse(BaseModel):
    id: int
    label: str

class UserResponse(BaseModel):
    id: int
    name: str
    user: str
    role: RoleEnum

    class Config:
        orm_mode = True


class UserResponseToken(BaseModel):
    token: Token
    user: UserResponse
