import datetime

from sqlalchemy.orm import Session

from models.models import Scenario, DeviceRecording, ScenarioRecording, DeviceMonitoring


class ScenarioRepository:

    def __init__(self, db: Session):
        self.db = db

    def find_all(self) -> list[Scenario]:
        return self.db.query(Scenario).all()

    def find_by_id(self, scenario_id: int) -> Scenario:
        return self.db.query(Scenario).filter(Scenario.id == scenario_id).first()

    def exists_by_name(self, scenario_name: int) -> Scenario:
        return self.db.query(Scenario).filter(Scenario.name == scenario_name).first() is not None

    def save(self, scenario: Scenario) -> Scenario:
        self.db.add(scenario)
        self.db.commit()
        self.db.refresh(scenario)
        return scenario

    def check_if_device_can_send_data_by_mac_address(self, mac_address: str) -> bool:
        return self.db.query(DeviceRecording).filter(DeviceRecording.mac_address == mac_address,
                                                     DeviceRecording.can_send_data == 1).first() is not None



    def delete(self, scenario: Scenario) -> None:
        self.db.delete(scenario)
        self.db.commit()
