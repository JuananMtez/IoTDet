from fastapi import APIRouter, Depends, HTTPException, Response
from schemas.user_schema import UserResponse, UserPost, UserPassword, UserRole
from config.database import get_db
from sqlalchemy.orm import Session
from services.user_service import UserService
from exceptions.user_exception import UserAlreadyCreated, UserNoPermission, UserNotFound
from config.security import get_current_user

user_controller = APIRouter(
    prefix="/user",
    tags=["users"])


@user_controller.post("/", response_model=UserResponse)
def create_user(user: UserPost, db: Session = Depends(get_db), exists_current_user=Depends(get_current_user)):
    try:
        return UserService(db=db).create_user(user_post=user, user=exists_current_user)
    except UserAlreadyCreated:
        raise HTTPException(status_code=409, detail="User already registered")
    except UserNoPermission:
        raise HTTPException(status_code=403, detail="Only root user can create new users")


@user_controller.delete("/{user_id}", response_model=UserResponse)
def create_user(user_id: int, db: Session = Depends(get_db), exists_current_user=Depends(get_current_user)):
    try:
        UserService(db=db).remove_user(user_id=user_id, current_user=exists_current_user)
        return Response(status_code=204)
    except UserNotFound:
        raise HTTPException(status_code=409, detail="User not found")
    except UserNoPermission:
        raise HTTPException(status_code=403, detail="Only root user can create new users")


@user_controller.get("/current", response_model=UserResponse)
def get_current_user(exists_current_user=Depends(get_current_user)):
    return exists_current_user


@user_controller.get("/", response_model=list[UserResponse])
def get_all_users(db: Session = Depends(get_db), exists_current_user=Depends(get_current_user)):
    return UserService(db).get_all_users()


@user_controller.patch("/password/change")
def change_password(password: UserPassword, db: Session = Depends(get_db),
                    exists_current_user=Depends(get_current_user)):
    UserService(db).change_password(password=password, user=exists_current_user)
    return Response(status_code=204)


@user_controller.patch("/{user_id}/role/change", response_model=UserResponse)
def change_role(user_id: int, role: UserRole, db: Session = Depends(get_db),
                    exists_current_user=Depends(get_current_user)):
    try:
        return UserService(db).change_role(user_id=user_id, role=role, current_user=exists_current_user)

    except UserNotFound:
        raise HTTPException(status_code=409, detail="User not found")
    except UserNoPermission:
        raise HTTPException(status_code=403, detail="Only root user can create new users")
