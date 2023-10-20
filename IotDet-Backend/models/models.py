import enum

from sqlalchemy import Column, Integer, String, Enum, Boolean, ForeignKey, DateTime, Float, Text, JSON
from sqlalchemy.orm import relationship

from config.database import Base


class RoleEnum(enum.Enum):
    root = 0
    admin = 1
    standard = 2
    read_only = 3


class DatasetTypeEnum(enum.Enum):
    recording = 0
    monitoring = 1


class TrainingTypeEnum(enum.Enum):
    classifier = 0
    anomaly_detection = 1


class TrainingMethodEnum(enum.Enum):
    machine_learning = 0
    deep_learning = 1


class TrainingStatusEnum(enum.Enum):
    training = 0
    trained = 1
    error = 2


class TrainingType(enum.Enum):
    centralized = 0
    federated_centralized = 1
    federated_decentralized = 2


class MalwareExecutableType(enum.Enum):
    executable = 0
    cleaner = 1


class StatusScenarioEnum(enum.Enum):
    deployed = 0
    finished = 1


class StatusDatasetEnum(enum.Enum):
    original = 0
    unprocessed = 1
    preprocessing = 2
    preprocessed = 3
    extracting_features = 4
    extracted_features = 5


class User(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True, unique=True, index=True, nullable=False)
    name = Column(String(50), nullable=False)
    user = Column(String(20), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column('role', Enum(RoleEnum), nullable=False)


class File(Base):
    __tablename__ = "file"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True, unique=True)
    description = Column(String(255))
    is_validated = Column(Boolean)
    uploaded_by = Column(String(255), index=True)

    type = Column(String(50))

    __mapper_args__ = {
        'polymorphic_identity': 'file',
        'polymorphic_on': type
    }


class MonitoringScript(File):
    __tablename__ = "monitoring_script"

    id = Column(Integer, ForeignKey('file.id'), primary_key=True, index=True)
    columns = relationship("ColumnMonitoring", cascade='save-update, delete')
    path = Column(String(500), index=True, nullable=False, unique=True)
    filename = Column(String(500), index=True, nullable=False)

    __mapper_args__ = {
        'polymorphic_identity': 'monitoring_script',
    }


class ColumnMonitoring(Base):
    __tablename__ = "column_monitoring"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True, nullable=False)
    datatype = Column(String(255), nullable=False)
    monitoring_script_id = Column(Integer, ForeignKey('monitoring_script.id'), nullable=False)


class Malware(File):
    __tablename__ = "malware"

    id = Column(Integer, ForeignKey('file.id'), primary_key=True, index=True)

    malware_executable_id = Column(Integer, ForeignKey("malware_executable.id"), )
    malware_executable = relationship("MalwareExecutable", foreign_keys=[malware_executable_id])

    malware_executable_cleaner_id = Column(Integer, ForeignKey("malware_executable.id"))
    malware_executable_cleaner = relationship("MalwareExecutable", foreign_keys=[malware_executable_cleaner_id])

    __mapper_args__ = {
        'polymorphic_identity': 'malware',
    }


class MalwareExecutable(Base):
    __tablename__ = "malware_executable"

    id = Column(Integer, primary_key=True, index=True)
    type = Column('type', Enum(MalwareExecutableType), nullable=False)
    path = Column(String(500), index=True, nullable=False, unique=True)
    filename = Column(String(500), index=True, nullable=False)


class MitigationScript(File):
    __tablename__ = "mitigation_script"

    id = Column(Integer, ForeignKey('file.id'), primary_key=True, index=True)
    path = Column(String(500), index=True, nullable=False, unique=True)
    filename = Column(String(500), index=True, nullable=False)

    parameters = relationship("ParameterMitigationScript", cascade="save-update, delete")

    __mapper_args__ = {
        'polymorphic_identity': 'mitigation_script',
    }


class ParameterMitigationScript(Base):
    __tablename__ = "parameter_mitigation_script"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(String(255), nullable=False)
    datatype = Column(String(20), nullable=False)

    mitigation_script_id = Column(Integer, ForeignKey("mitigation_script.id"))


class Deployfile(File):
    __tablename__ = "deployfile"

    id = Column(Integer, ForeignKey('file.id'), primary_key=True, index=True)
    path = Column(String(500), index=True, nullable=False, unique=True)
    filename = Column(String(500), index=True, nullable=False)

    __mapper_args__ = {
        'polymorphic_identity': 'deployfile',

    }


class DeployfileMonitoringScript(Deployfile):
    __tablename__ = "deployfile_monitoring_script"

    id = Column(Integer, ForeignKey('deployfile.id'), primary_key=True, index=True)

    monitoring_script_id = Column(Integer, ForeignKey("monitoring_script.id"), nullable=True)
    monitoring_script = relationship("MonitoringScript", foreign_keys=[monitoring_script_id])

    __mapper_args__ = {
        'polymorphic_identity': 'deployfile_monitoring_script',
    }


class DeployfileMalware(Deployfile):
    __tablename__ = "deployfile_malware"

    id = Column(Integer, ForeignKey('deployfile.id'), primary_key=True, index=True)

    malware_id = Column(Integer, ForeignKey("malware.id"), nullable=True)
    malware = relationship("Malware", foreign_keys=[malware_id])

    __mapper_args__ = {
        'polymorphic_identity': 'deployfile_malware',
    }




class DeployfileMitigationScript(Deployfile):
    __tablename__ = "deployfile_mitigation_script"

    id = Column(Integer, ForeignKey('deployfile.id'), primary_key=True, index=True)

    mitigation_script_id = Column(Integer, ForeignKey("mitigation_script.id"), nullable=True)
    mitigation_script = relationship("MitigationScript", foreign_keys=[mitigation_script_id])

    __mapper_args__ = {
        'polymorphic_identity': 'deployfile_mitigation_script',
    }



class Device(Base):
    __tablename__ = "device"

    id = Column(Integer, primary_key=True, index=True)
    id_mender = Column(String(255), index=True, nullable=False)
    mac_address = Column(String(255), index=True, nullable=False)
    device_type = Column(String(255), index=True, nullable=False)
    is_active = Column(Boolean)

    mender_deployments = relationship("MenderDeployment", cascade="save-update, delete")

    type = Column(String(50))

    __mapper_args__ = {
        'polymorphic_identity': 'device',
        'polymorphic_on': type
    }


class DeviceRecording(Device):
    __tablename__ = 'device_recording'

    id = Column(Integer, ForeignKey('device.id'), primary_key=True, index=True)
    current_malware = Column(Integer, nullable=False)
    recording_id = Column(Integer, ForeignKey("scenario_recording.id"))
    recording = relationship("ScenarioRecording", back_populates="devices")

    deployfiles_malware_selected = relationship("DeployfileMalwareSelected", cascade="save-update, delete")
    deployfiles_monitoring_script_selected = relationship("DeployfileMonitoringScriptSelected",
                                                          cascade="save-update, delete")
    __mapper_args__ = {
        'polymorphic_identity': 'device_recording',
    }


class DeviceMonitoring(Device):
    __tablename__ = 'device_monitoring'

    id = Column(Integer, ForeignKey('device.id'), primary_key=True, index=True)
    monitoring_id = Column(Integer, ForeignKey("scenario_monitoring.id"))
    monitoring = relationship("ScenarioMonitoring", back_populates="devices")

    deployfile_monitoring_script_selected_id = Column(Integer, ForeignKey("deployfile_monitoring_script.id"),
                                                      nullable=True)
    deployfile_monitoring_script_selected = relationship("DeployfileMonitoringScript")

    deployfile_malware_selected_id = Column(Integer, ForeignKey("deployfile_malware.id"), nullable=True)

    deployfile_malware_selected = relationship("DeployfileMalware")

    remove_malware = Column(Boolean, nullable=False)

    anomaly_detection_model_id = Column(Integer, ForeignKey("model.id"), nullable=True)
    anomaly_detection_model = relationship("Training", foreign_keys=[anomaly_detection_model_id])

    classification_model_id = Column(Integer, ForeignKey("model.id"), nullable=True)
    classification_model = relationship("Training", foreign_keys=[classification_model_id])

    dataset_monitoring_id = Column(Integer, ForeignKey("dataset_monitoring.id"))
    dataset_monitoring = relationship("DatasetMonitoring", foreign_keys=[dataset_monitoring_id],
                                      cascade="save-update, delete")

    dataset_prediction_id = Column(Integer, ForeignKey("dataset_monitoring.id"))
    dataset_prediction = relationship("DatasetMonitoring", foreign_keys=[dataset_prediction_id],
                                      cascade="save-update, delete")

    tick_classification_classes = Column(JSON, nullable=True)

    cont_predictions = Column(JSON, nullable=False)
    is_mitigating = Column(Boolean, nullable=False)
    is_activated_mitigation = Column(Boolean, nullable=False)
    is_activated_increment_classifier_anomaly = Column(Boolean, nullable=False)
    is_activated_modify_ticks = Column(Boolean, nullable=False)


    current_malware_mitigation = Column(String(255), nullable=True)
    logs = relationship("LogMonitoring", cascade="save-update, delete")



    deployfiles_mitigation_script_selected = relationship("DeployfileMitigationScriptSelected", cascade="save-update, delete")

    __mapper_args__ = {
        'polymorphic_identity': 'device_monitoring',
    }


class LogMonitoring(Base):
    __tablename__ = "log_monitoring"

    id = Column(Integer, primary_key=True, index=True)
    device_monitoring_id = Column(Integer, ForeignKey("device_monitoring.id"))
    date = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    model = Column(String(100), nullable=False)


class Dataset(Base):
    __tablename__ = "dataset"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True, nullable=False, unique=True)
    status = Column('status', Enum(StatusDatasetEnum), nullable=False)

    path = Column(String(255), index=True, nullable=False)

    device_mender_id = Column(String(255), nullable=False)
    scenario_name = Column(String(255), nullable=False)
    monitoring_script_name = Column(String(255), nullable=False)

    type = Column(String(50))

    __mapper_args__ = {
        'polymorphic_identity': 'dataset',
        'polymorphic_on': type
    }


class DatasetCopy(Dataset):
    __tablename__ = "dataset_copy"

    id = Column(Integer, ForeignKey('dataset.id'), primary_key=True, index=True)
    dataset_recording_id = Column(Integer, ForeignKey("dataset_recording.id"))
    processings = relationship("Processing", cascade="save-update, delete")
    plots = relationship("Plot", cascade="save-update, delete")
    training_path = Column(String(255), index=True, nullable=False)
    testing_path = Column(String(255), index=True, nullable=False)

    train_size = Column(String(5), nullable=False)
    is_shuffled = Column(String(3), nullable=False)
    used_for = Column(String(50), nullable=False)
    seed = Column(String(255), nullable=False)

    __mapper_args__ = {
        'polymorphic_identity': 'dataset_copy',
    }


class DatasetRecording(Dataset):
    __tablename__ = "dataset_recording"

    id = Column(Integer, ForeignKey('dataset.id'), primary_key=True, index=True)
    datasets_copy = relationship("DatasetCopy", cascade="save-update, delete",
                                 foreign_keys=[DatasetCopy.dataset_recording_id])

    __mapper_args__ = {
        'polymorphic_identity': 'dataset_recording',
    }


class DatasetMonitoring(Dataset):
    __tablename__ = "dataset_monitoring"

    id = Column(Integer, ForeignKey('dataset.id'), primary_key=True, index=True)
    all_labels = Column(JSON, nullable=False)

    __mapper_args__ = {
        'polymorphic_identity': 'dataset_monitoring',
    }


class Processing(Base):
    __tablename__ = "processing"

    id = Column(Integer, primary_key=True, index=True)
    index = Column(Integer, nullable=False)
    algorithm_description = Column(Text, nullable=False)
    type = Column(String(255), nullable=False)
    dataset_copy_id = Column(Integer, ForeignKey("dataset_copy.id"))
    date = Column(String(255), nullable=False)

    algorithm = Column(String(255), nullable=False)
    parameters = Column(JSON, nullable=False)
    status = Column(String(255), nullable=False)
    log_error = Column(Text, nullable=False)


class Plot(Base):
    __tablename__ = "plot"

    id = Column(Integer, primary_key=True, index=True)
    dataset_copy_id = Column(Integer, ForeignKey("dataset_copy.id"))
    path = Column(String(255), nullable=False)


class Scenario(Base):
    __tablename__ = "scenario"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True, nullable=False)
    status = Column('status', Enum(StatusScenarioEnum), nullable=False)

    type = Column(String(50))

    __mapper_args__ = {
        'polymorphic_identity': 'scenario',
        'polymorphic_on': type
    }


class ScenarioRecording(Scenario):
    __tablename__ = "scenario_recording"

    id = Column(Integer, ForeignKey('scenario.id'), primary_key=True, index=True)
    devices = relationship("DeviceRecording", back_populates="recording", cascade="save-update, delete")

    __mapper_args__ = {
        'polymorphic_identity': 'scenario_recording',

    }


class ScenarioMonitoring(Scenario):
    __tablename__ = "scenario_monitoring"

    id = Column(Integer, ForeignKey('scenario.id'), primary_key=True, index=True)
    devices = relationship("DeviceMonitoring", back_populates="monitoring", cascade="save-update, delete")

    __mapper_args__ = {
        'polymorphic_identity': 'scenario_monitoring',
    }


class DeployfileMalwareSelected(Base):
    __tablename__ = "deployfile_malware_selected"

    id = Column(Integer, primary_key=True, index=True)
    order = Column(Integer, index=True, nullable=True)
    timestamp_finished = Column(DateTime, nullable=True)
    duration = Column(Float, nullable=False)
    deployfile_malware_id = Column(Integer, ForeignKey("deployfile_malware.id"))
    deployfile_malware = relationship("DeployfileMalware")
    device_recording_id = Column(Integer, ForeignKey("device_recording.id"))
    mender_deployment_id = Column(Integer, ForeignKey("mender_deployment.id"))
    mender_deployment = relationship("MenderDeployment")


class DeployfileMonitoringScriptSelected(Base):
    __tablename__ = "deployfile_monitoring_script_selected"

    id = Column(Integer, primary_key=True, index=True)
    deployfile_monitoring_script_id = Column(Integer, ForeignKey("deployfile_monitoring_script.id"))
    deployfile_monitoring_script = relationship("DeployfileMonitoringScript")
    mender_deployment_id = Column(Integer, ForeignKey("mender_deployment.id"))
    mender_deployment = relationship("MenderDeployment")
    dataset_id = Column(Integer, ForeignKey("dataset.id"))
    dataset = relationship("Dataset", cascade="save-update, delete")
    device_id = Column(Integer, ForeignKey("device.id"))




class DeployfileMitigationScriptSelected(Base):
    __tablename__ = "deployfile_mitigation_script_selected"

    id = Column(Integer, primary_key=True, index=True)

    malware_name = Column(String(255), nullable=False)
    deployfile_mitigation_script_id = Column(Integer, ForeignKey("deployfile_mitigation_script.id"))
    deployfile_mitigation_script = relationship("DeployfileMitigationScript")

    mender_deployment_id = Column(Integer, ForeignKey("mender_deployment.id"))
    mender_deployment = relationship("MenderDeployment")

    device_monitoring_id = Column(Integer, ForeignKey("device_monitoring.id"))

    parameters = Column(JSON, nullable=True)

    status = Column(String(255), nullable=False)



class MenderDeployment(Base):
    __tablename__ = "mender_deployment"

    id = Column(Integer, primary_key=True, index=True)
    mender_deployment_id = Column(String(255), nullable=True)
    mender_artifact_id = Column(String(255), nullable=True)
    status = Column(String(255), nullable=False)
    log_error = Column(Text, nullable=True)

    device_id = Column(Integer, ForeignKey("device.id"))

    # device_monitoring_id = Column(Integer, ForeignKey("device_monitoring.id"))


class Training(Base):
    __tablename__ = 'model'
    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(255), unique=True, nullable=False)
    device_mender_id = Column(String(255), nullable=False)
    monitoring_script_name = Column(String(255), nullable=False)
    dataset_id = Column(Integer, ForeignKey("dataset.id"))
    dataset = relationship("Dataset")
    path = Column(String(500), index=True, nullable=False)
    algorithm_description = Column(Text, nullable=False)
    confusion_matrix_path = Column(String(255), nullable=False)

    accuracy_path = Column(String(255), nullable=False)
    loss_path = Column(String(255), nullable=False)

    log_error = Column(Text, nullable=False)
    validation_output = Column(Text, nullable=False)

    type = Column(String(255), nullable=False)
    status = Column(String(255), nullable=False)
    method = Column(String(255), nullable=False)

    threshold = Column(Float, nullable=False)
