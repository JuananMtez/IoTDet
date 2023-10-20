from sqlalchemy.orm import Session
from models.models import User, RoleEnum


class UserRepository:

    def __init__(self, db: Session):
        self.db = db

    def find_by_id(self, id: int) -> User:
        return self.db.query(User).filter(User.id == id).first()

    def find_all_users(self) -> list[User]:
        return self.db.query(User).all()

    def find_by_user(self, user: str) -> User:
        return self.db.query(User).filter(User.user == user).first()

    def find_by_user_password(self, user: str, password: str) -> User:
        return self.db.query(User).filter(User.user == user, User.password == password).first()

    def find_by_id_and_user(self, user_id: str, user: str) -> User:
        return self.db.query(User).filter(User.id == user_id, User.user == user).first()

    def exists_by_user(self, user: str) -> bool:
        return self.db.query(User).filter(
            User.user == user).first() is not None

    def get_number_of_users(self) -> int:
        return len(self.db.query(User).all())

    def exists_by_user_mender(self, user_mender: str) -> bool:
        return self.db.query(User).filter(
            User.user_mender == user_mender).first() is not None

    def save(self, user: User) -> User:
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def exists_root_user(self):
        return self.db.query(User).filter(
            User.role == RoleEnum.root).first() is not None


    def delete(self, user: User) -> None:
        self.db.delete(user)
        self.db.commit()