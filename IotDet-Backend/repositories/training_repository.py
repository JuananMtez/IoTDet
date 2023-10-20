from sqlalchemy.orm import Session

from models.models import Training


class TrainingRepository:

    def __init__(self, db: Session):
        self.db = db

    def find_all(self) -> list[Training]:
        return self.db.query(Training).all()

    def find_by_id(self, training_id: int) -> Training:
        return self.db.query(Training).filter(Training.id == training_id).first()

    def find_all_classifications_by_monitoring_script_name(self, monitoring_script_name: str) -> Training:
        return self.db.query(Training).filter(Training.monitoring_script_name == monitoring_script_name, Training.type == "Classifier").all()

    def find_all_anomaly_detectors_by_monitoring_script_name(self, monitoring_script_name: str) -> Training:
        return self.db.query(Training).filter(Training.monitoring_script_name == monitoring_script_name, Training.type == "Anomaly detection").all()

    def exists_training_associated_to_dataset(self, dataset_copy_id: int):
        return self.db.query(Training).filter(Training.dataset_id == dataset_copy_id).first() is not None

    def save(self, training: Training) -> Training:
        self.db.add(training)
        self.db.commit()
        self.db.refresh(training)
        return training

    def delete(self, training: Training) -> None:
        self.db.delete(training)
        self.db.commit()