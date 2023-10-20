from sqlalchemy.orm import Session
from models.models import Device, DeviceRecording, MenderDeployment, DeviceMonitoring


class DeviceRepository:

    def __init__(self, db: Session):
        self.db = db

    def save(self, device: Device) -> Device:
        self.db.add(device)
        self.db.commit()
        self.db.refresh(device)
        return device

    def exists_by_id_mender(self, id: str) -> bool:
        return self.db.query(Device).filter(Device.id_mender == id).first() is not None

    def find_by_id(self, id: str) -> Device:
        return self.db.query(Device).filter(Device.id == id).first()

    def find_by_id_mender(self, id_mender: str) -> Device:
        return self.db.query(Device).filter(Device.id_mender == id_mender).first()

    def exists_by_id(self, id: int) -> bool:
        return self.db.query(Device).filter(Device.id == id).first() is not None

    def is_device_deployed(self, mender_id: str) -> bool:
        return self.db.query(Device).filter(Device.id_mender == mender_id, Device.is_active == 1).first() is not None

    def exists_device_monitoring_deployed_using_model(self, model_id: int) -> bool:
        classifiers = len(self.db.query(DeviceMonitoring).filter(DeviceMonitoring.is_active == 1, DeviceMonitoring.classification_model_id == model_id).all())
        detectors = len(self.db.query(DeviceMonitoring).filter(DeviceMonitoring.is_active == 1, DeviceMonitoring.anomaly_detection_model_id == model_id).all())
        return classifiers > 0 or detectors > 0

    def find_device_deployed_by_mac(self, mac_address: str) -> Device:
        return self.db.query(Device).filter(Device.mac_address == mac_address, Device.is_active == 1).first()

    def find_device_by_mac(self, mac_address: str) -> Device:
        return self.db.query(Device).filter(Device.mac_address == mac_address).first()

    def find_device_deployed_by_mender_id(self, mender_id: str) -> Device:
        return self.db.query(Device).filter(Device.id_mender == mender_id, Device.is_active == 1).first()

    def delete(self, device: Device) -> None:
        self.db.delete(device)
        self.db.commit()

    def delete_mender_deployment(self, mender_deployment: MenderDeployment) -> bool:
        self.db.delete(mender_deployment)
        self.db.commit()

    def amount_devices_pending_malware_by_scenario_recording(self, scenario_recording:int) -> int:
        return len(self.db.query(DeviceRecording).filter(DeviceRecording.recording_id == scenario_recording, DeviceRecording.current_malware != -1).all())
