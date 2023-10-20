from sqlalchemy.orm import Session

from models.models import Dataset, Plot, DatasetCopy, StatusDatasetEnum


class DatasetRepository:

    def __init__(self, db: Session):
        self.db = db

    def find_all(self) -> list[Dataset]:
        return self.db.query(Dataset).all()

    def find_by_id(self, dataset_id: int):
        return self.db.query(Dataset).filter(Dataset.id == dataset_id).first()

    def find_all_extracted_features(self) -> list[DatasetCopy]:
        return self.db.query(Dataset).filter(Dataset.status == StatusDatasetEnum.extracted_features).all()

    def exists_dataset_by_path(self, path: str) -> bool:
        return self.db.query(Dataset).filter(Dataset.path == path).first() is not None

    def save(self, dataset: Dataset) -> Dataset:
        self.db.add(dataset)
        self.db.commit()
        self.db.refresh(dataset)
        return dataset

    def delete(self, dataset: Dataset) -> None:
        self.db.delete(dataset)
        self.db.commit()

    def delete_plot(self, plot: Plot) -> None:
        self.db.delete(plot)
        self.db.commit()
