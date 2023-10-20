from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException, status
from jose import JWTError, jwt
import os
import configparser
from datetime import datetime, timedelta
from .database import get_db
from sqlalchemy.orm import Session
from repositories.user_repository import UserRepository
from models.models import User

thisfolder = os.path.dirname(os.path.abspath(__file__))
initfile = os.path.join(thisfolder, 'properties.ini')
config = configparser.ConfigParser()
config.read(initfile)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, config.get("SECURITY", "secret_key"),
                             algorithms=config.get("SECURITY", "algorithm"))
        id: str = payload.get("id")
        user: str = payload.get("user")
        expires = payload.get("exp")
        if id is None or user is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    if expires is None:
        raise credentials_exception

    return UserRepository(db).find_by_id_and_user(user_id=id, user=user)


def create_access_token(user: User):

    data = {"id": user.id, "user": user.user}
    to_encode = data.copy()
    expires_delta = timedelta(minutes=float(config.get("SECURITY", "access_token_expire_minute")))


    expire = datetime.utcnow() + expires_delta

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, config.get("SECURITY", "secret_key"), algorithm=config.get("SECURITY", "algorithm"))
    return encoded_jwt


def get_fernet():

    from cryptography.fernet import Fernet

    thisfolder = os.path.dirname(os.path.abspath(__file__))
    initfile = os.path.join(thisfolder, '../config/properties.ini')
    config = configparser.ConfigParser()
    config.read(initfile)
    return Fernet(config.get("SECURITY", "private_key").encode())


def encrypt_password_mender(password: str):
    fernet = get_fernet()
    return fernet.encrypt(password.encode())

def decrypt_password_mender(encrypted_password: bytes):
    fernet = get_fernet()
    return fernet.decrypt(encrypted_password).decode()


