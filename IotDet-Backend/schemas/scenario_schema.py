from datetime import datetime
from pydantic import BaseModel
from typing import Union
from models.models import StatusScenarioEnum
from schemas.dataset_schema import DatasetResponse, DatasetMonitoringResponse
from schemas.file_schema import DeployfileMonitoringScriptResponse, DeployfileMalwareResponse, \
    DeployfileMitigationScriptResponse
from schemas.training_schema import TrainingResponseReduced


class MenderDeploymentResponse(BaseModel):
    status: str
    log_error: str

    class Config:
        orm_mode = True


class DeployfileMonitoringScriptSelectedResponse(BaseModel):
    deployfile_monitoring_script: DeployfileMonitoringScriptResponse
    mender_deployment: MenderDeploymentResponse
    dataset: DatasetResponse

    class Config:
        orm_mode = True


class DeployfileMalwareSelectedResponse(BaseModel):
    deployfile_malware: DeployfileMalwareResponse
    duration: float
    timestamp_finished: Union[datetime, None]
    order: int
    mender_deployment: Union[MenderDeploymentResponse, None]

    class Config:
        orm_mode = True


class DeviceScenarioResponse(BaseModel):
    id: int
    id_mender: str
    mac_address: str
    is_active: bool
    device_type: str

    class Config:
        orm_mode = True


class DeviceScenarioRecordingResponse(DeviceScenarioResponse):
    deployfiles_malware_selected: list[DeployfileMalwareSelectedResponse]
    deployfiles_monitoring_script_selected: list[DeployfileMonitoringScriptSelectedResponse]

    current_malware: int

    class Config:
        orm_mode = True


class DeployfileMitigationScriptSelectedResponse(BaseModel):
    deployfile_mitigation_script: DeployfileMitigationScriptResponse
    mender_deployment: Union[None, MenderDeploymentResponse]
    malware_name: str
    status: str
    parameters: Union[dict, None]

    class Config:
        orm_mode = True


class DeviceScenarioMonitoringResponse(DeviceScenarioResponse):
    deployfile_monitoring_script_selected: DeployfileMonitoringScriptResponse
    deployfile_malware_selected: Union[DeployfileMalwareResponse, None]
    mender_deployments: list[MenderDeploymentResponse]
    classification_model: Union[TrainingResponseReduced, None]
    anomaly_detection_model: Union[TrainingResponseReduced, None]
    dataset_monitoring: DatasetMonitoringResponse
    dataset_prediction: DatasetMonitoringResponse
    remove_malware: bool
    tick_classification_classes: Union[None, dict]
    is_activated_mitigation: bool
    is_activated_increment_classifier_anomaly: bool
    is_activated_modify_ticks: bool

    deployfiles_mitigation_script_selected: list[DeployfileMitigationScriptSelectedResponse]

    class Config:
        orm_mode = True


class ScenarioResponse(BaseModel):
    id: int
    name: str
    status: StatusScenarioEnum
    type: str

    class Config:
        orm_mode = True


class ScenarioModifyNamePatch(BaseModel):
    name: str

    class Config:
        orm_mode = True


class ScenarioRecordingResponse(ScenarioResponse):
    devices: list[DeviceScenarioRecordingResponse]

    class Config:
        orm_mode = True


class ScenarioMonitoringResponse(ScenarioResponse):
    devices: list[DeviceScenarioMonitoringResponse]

    class Config:
        orm_mode = True


class DeployfileMonitoringScriptRecordingSelectedPost(BaseModel):
    deployfile_monitoring_script_id: int


class DeployfileMalwareSelectedPost(BaseModel):
    deployfile_malware_id: int
    duration: float


class DeviceRecordingPost(BaseModel):
    mender_id: str
    mac_address: str
    device_type: str

    deployfiles_monitoring_script_selected: list[DeployfileMonitoringScriptRecordingSelectedPost]
    deployfiles_malware_selected: list[DeployfileMalwareSelectedPost]


class ScenarioRecordingPost(BaseModel):
    name: str
    devices: list[DeviceRecordingPost]


class MitigationMechanism(BaseModel):
    deployfile_mitigation_script_selected: int
    parameters: str


class MalwareClassificationPost(BaseModel):
    malware: str
    cont: int
    mitigation_mechanisms: list[MitigationMechanism]


class DeviceMonitoringPost(BaseModel):
    mender_id: str
    mac_address: str
    device_type: str

    deployfile_monitoring_script_selected: int
    classification_training: Union[int, str]
    anomaly_detection_training: Union[int, str]
    malware_classification: list[MalwareClassificationPost]
    is_activated_mitigation: bool
    is_activated_increment_classifier_anomaly: bool
    is_activated_modify_ticks: bool


class ScenarioMonitoringPost(BaseModel):
    name: str
    devices: list[DeviceMonitoringPost]


class ScenarioAllResponse(BaseModel):
    id: int
    name: str
    type: str
    status: StatusScenarioEnum
    deployable: bool


class ScenarioRecordingRedeployPost(BaseModel):
    name: str


class LogMonitoringResponse(BaseModel):
    date: str
    model: str
    description: str

    class Config:
        orm_mode = True
