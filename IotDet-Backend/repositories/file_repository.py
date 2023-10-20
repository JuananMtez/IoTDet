from sqlalchemy.orm import Session

from models.models import File, Malware, MitigationScript, DeployfileMitigationScript
from models.models import MonitoringScript, Deployfile, DeployfileMonitoringScript, DeployfileMalware
from typing import Union


class FileRepository:

    def __init__(self, db: Session):
        self.db = db

    def find_by_id(self, file_id: int) -> File:
        return self.db.query(File).filter(File.id == file_id).first()
    def find_by_name(self, name: str) -> File:
        return self.db.query(File).filter(File.name == name).first()

    def find_all_by_type(self, file_type: str) -> list[File]:
        return self.db.query(File).filter(File.type == file_type).all()

    def exists_monitoring_script_by_path(self, monitoring_script_path: str) -> bool:
        return self.db.query(MonitoringScript).filter(
            MonitoringScript.path == monitoring_script_path).first() is not None


    def exists_mitigation_script_by_path(self, mitigation_script_path: str) -> bool:
        return self.db.query(MitigationScript).filter(
            MitigationScript.path == mitigation_script_path).first() is not None

    def exists_deployfile_by_path(self, deployfile_path: str) -> bool:
        return self.db.query(Deployfile).filter(Deployfile.path == deployfile_path).first() is not None

    def find_all_validated(self) -> list[File]:
        return self.db.query(File).filter(File.is_validated == 1).all()

    def find_validated_monitoring_scripts(self) -> list[MonitoringScript]:
        return self.db.query(MonitoringScript).filter(MonitoringScript.is_validated == 1).all()

    def find_validated_mitigation_scripts(self) -> list[MitigationScript]:
        return self.db.query(MitigationScript).filter(MitigationScript.is_validated == 1).all()

    def find_validated_deployfiles_monitoring_script(self) -> list[DeployfileMonitoringScript]:
        return self.db.query(DeployfileMonitoringScript).filter(DeployfileMonitoringScript.is_validated == 1).all()

    def find_validated_deployfiles_mitigation_script(self) -> list[DeployfileMitigationScript]:
        return self.db.query(DeployfileMitigationScript).filter(DeployfileMitigationScript.is_validated == 1).all()

    def find_validated_malware(self) -> list[Malware]:
        return self.db.query(Malware).filter(Malware.is_validated == 1).all()

    def find_validated_deployfiles_malware(self) -> list[DeployfileMalware]:
        return self.db.query(DeployfileMalware).filter(DeployfileMalware.is_validated == 1).all()

    def save(self, file: File) -> File:
        self.db.add(file)
        self.db.commit()
        self.db.refresh(file)
        return file

    def delete_file(self, file: File) -> None:
        self.db.delete(file)
        self.db.commit()

    def delete_file_by_id(self, file_id: int) -> None:
        self.db.query(File).filter(File.id == file_id).delete()
        self.db.commit()

    def find_all_deployfiles_by_type(self, type: str) -> list[Deployfile]:
        return self.db.query(Deployfile).filter(Deployfile.type == type).all()

    def find_all_deployfiles_by_type_and_validated(self, type: str) -> list[Deployfile]:
        return self.db.query(Deployfile).filter(Deployfile.type == type, Deployfile.is_validated is True).all()

    def exists_by_label_id(self, label_id) -> bool:
        return self.db.query(Malware).filter(Malware.label_id == label_id).first() is not None

    def find_all_by_ids(self, ids: list[int]) -> list[File]:
        return self.db.query(File).filter(File.id.in_(ids)).all()
