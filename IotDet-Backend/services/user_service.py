from typing import Union

import bcrypt
from sqlalchemy.orm import Session

from exceptions.user_exception import UserNotFound, UserAlreadyCreated, UserNoPermission
from models.models import User, RoleEnum
from repositories.user_repository import UserRepository
from schemas.user_schema import UserPost, UserPassword, UserRole


class UserService:

    def __init__(self, db: Session):
        self.user_repository = UserRepository(db)

    def login(self, username: str, password: str) -> User:

        user = self.user_repository.find_by_user(user=username)
        if user is not None and bcrypt.checkpw(password.encode('utf-8'), bytes(user.password, 'utf-8')):
            return user

        raise UserNotFound

    def create_user(self, user_post: UserPost, user: Union[User, None]) -> User:

        if user is not None and user.role != RoleEnum.root and user.role != RoleEnum.admin:
            raise UserNoPermission

        if self.user_repository.exists_by_user(user=user_post.user):
            raise UserAlreadyCreated

        password = user_post.password.encode('utf-8')
        hashed = bcrypt.hashpw(password, bcrypt.gensalt(10))

        role = None
        match user_post.role:
            case 0:
                role = RoleEnum.root
            case 1:
                role = RoleEnum.admin
            case 2:
                role = RoleEnum.standard
            case 3:
                role = RoleEnum.read_only

        user_db = User(name=user_post.name,
                       user=user_post.user,
                       password=hashed.decode('utf-8'),
                       role=role)

        return self.user_repository.save(user_db)

    def get_all_users(self) -> list[User]:
        return self.user_repository.find_all_users()

    def change_password(self, password: UserPassword, user: User) -> None:
        password = password.password.encode('utf-8')
        hashed = bcrypt.hashpw(password, bcrypt.gensalt(10))
        user.password = hashed
        self.user_repository.save(user)

    def exists_root_user(self) -> bool:
        return self.user_repository.exists_root_user()

    def remove_user(self, user_id: int, current_user: User):

        if current_user is not None and current_user.role != RoleEnum.root and current_user.role != RoleEnum.admin:
            raise UserNoPermission

        user = self.user_repository.find_by_id(user_id)

        if user is None:
            raise UserNotFound

        self.user_repository.delete(user)

    def change_role(self, user_id: int, role: UserRole, current_user: User) -> None:

        if current_user is not None and current_user.role != RoleEnum.root and current_user.role != RoleEnum.admin:
            raise UserNoPermission

        user = self.user_repository.find_by_id(user_id)

        if user is None:
            raise UserNotFound

        match role.role:
            case 1:
                user.role = RoleEnum.admin
            case 2:
                user.role = RoleEnum.standard
            case 3:
                user.role = RoleEnum.read_only

        return self.user_repository.save(user)
