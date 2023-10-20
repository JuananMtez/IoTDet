import datetime
import json
from typing import Union

import pandas as pd

from exceptions.device_exception import DeviceIsDeployed, DeviceNotFoundInMender, DeviceNotDeployed, DeviceNotFound
from exceptions.file_exception import FileNotFound
from exceptions.scenario_exception import ScenarioIsDeployed, ScenarioNotFound, ScenarioIncorrectType, \
    InvalidName
from exceptions.user_exception import UserNoPermission
from models.models import User, Scenario, RoleEnum, ScenarioRecording, StatusScenarioEnum, DeviceRecording, \
    DeployfileMalwareSelected, DeployfileMonitoringScriptSelected, MenderDeployment, DatasetRecording, \
    StatusDatasetEnum, ScenarioMonitoring, DeviceMonitoring, DatasetMonitoring, LogMonitoring, \
    DeployfileMitigationScriptSelected
from repositories.device_repository import DeviceRepository
from repositories.file_repository import FileRepository
from repositories.scenario_repository import ScenarioRepository
from repositories.training_repository import TrainingRepository
from schemas.scenario_schema import ScenarioRecordingPost, ScenarioModifyNamePatch, ScenarioAllResponse, \
    ScenarioRecordingRedeployPost, ScenarioMonitoringPost
from services.mender_service import MenderService


class ScenarioService:

    def __init__(self, db, user: Union[User, None]):
        self.scenario_repository = ScenarioRepository(db)
        self.user = user
        self.db = db

    def _generate_dataset_path(self) -> dict:
        import uuid
        uuid = uuid.uuid4()
        name = f"{uuid}.csv"
        path_file = f"datasets/{name}"

        return {"name": name, "path_file": path_file}

    def _create_mender_monitoring_deployment(self, monitoring: ScenarioMonitoring) -> Scenario:
        import subprocess
        import platform
        import os
        executable = ""

        operative_system = platform.system()
        current_dir = os.path.dirname(os.path.abspath(__file__))
        if operative_system == "Windows":
            executable = os.path.join(current_dir, "..", "utils", "mender-artifact-mac-windows")
        elif operative_system == "Darwin":
            executable = os.path.join(current_dir, "..", "utils", "mender-artifact-mac")

        mender_service = MenderService()

        for device in monitoring.devices:
            import uuid
            uuid = uuid.uuid4()
            aux_name = f"{uuid}"
            artifact_path = f"tmp_artifacts/{aux_name}.mender"
            artifact_name = f"artifact_{aux_name}"

            cmd = f"{executable} write module-image -T script -o {artifact_path} -n {artifact_name}" \
                  f" -t {device.device_type}"

            cmd = cmd + f" -f {device.deployfile_monitoring_script_selected.path}"
            subprocess.run(cmd.split(" "), capture_output=True)

            response_artifact = mender_service.upload_artifact(artifact_path)

            location_header_artifact = response_artifact.headers.get('Location')
            mender_artifact_id = location_header_artifact.split('/')[-1]
            os.remove(artifact_path)

            response_deployment = mender_service.init_deployment(device.id_mender, artifact_name)

            location_header_deployment = response_deployment.headers.get('Location')
            mender_deployment_id = location_header_deployment.split('/')[-1]

            mender_deployment = MenderDeployment(mender_deployment_id=mender_deployment_id,
                                                 mender_artifact_id=mender_artifact_id,
                                                 status="Pending to install the software",
                                                 log_error="")

            device.mender_deployments.append(mender_deployment)

        return monitoring

    def _create_mender_recording_deployment(self, recording: ScenarioRecording) -> Scenario:
        import subprocess
        import platform
        import os
        executable = ""

        operative_system = platform.system()
        current_dir = os.path.dirname(os.path.abspath(__file__))
        if operative_system == "Windows":
            executable = os.path.join(current_dir, "..", "utils", "mender-artifact-mac-windows")
        elif operative_system == "Darwin":
            executable = os.path.join(current_dir, "..", "utils", "mender-artifact-mac")

        mender_service = MenderService()

        for device in recording.devices:
            import uuid
            uuid = uuid.uuid4()
            aux_name = f"{uuid}"
            artifact_path = f"tmp_artifacts/{aux_name}.mender"
            artifact_name = f"artifact_{aux_name}"

            cmd = f"{executable} write module-image -T script -o {artifact_path} -n {artifact_name}" \
                  f" -t {device.device_type}"

            for deployfile_monitoring_script_selected in device.deployfiles_monitoring_script_selected:
                cmd = cmd + f" -f {deployfile_monitoring_script_selected.deployfile_monitoring_script.path}"

            if len(device.deployfiles_malware_selected) > 0:
                cmd = cmd + f" -f {device.deployfiles_malware_selected[0].deployfile_malware.path}"

            subprocess.run(cmd.split(" "), capture_output=True)

            response_artifact = mender_service.upload_artifact(artifact_path)

            location_header_artifact = response_artifact.headers.get('Location')
            mender_artifact_id = location_header_artifact.split('/')[-1]
            os.remove(artifact_path)

            response_deployment = mender_service.init_deployment(device.id_mender, artifact_name)

            location_header_deployment = response_deployment.headers.get('Location')
            mender_deployment_id = location_header_deployment.split('/')[-1]

            mender_deployment = MenderDeployment(mender_deployment_id=mender_deployment_id,
                                                 mender_artifact_id=mender_artifact_id,
                                                 status="Pending to install the software",
                                                 log_error="")

            for deployfile_monitoring_script_selected in device.deployfiles_monitoring_script_selected:
                deployfile_monitoring_script_selected.mender_deployment = mender_deployment

            if len(device.deployfiles_malware_selected) > 0:
                device.deployfiles_malware_selected[0].mender_deployment = mender_deployment

            device.mender_deployments.append(mender_deployment)

        return recording

    def find_all_scenarios(self) -> list[Scenario]:
        return self.scenario_repository.find_all()

    def find_all_scenario_check_deployable(self) -> list[ScenarioAllResponse]:
        scenarios = self.scenario_repository.find_all()

        response = []
        for scenario in scenarios:
            scenario_response = ScenarioAllResponse(
                id=scenario.id,
                name=scenario.name,
                type=scenario.type,
                status=scenario.status,
                deployable=True
            )
            if scenario.status == StatusScenarioEnum.finished:
                device_repository = DeviceRepository(self.db)
                for device in scenario.devices:
                    if device_repository.is_device_deployed(device.id_mender):
                        scenario_response.deployable = False
                        break
            else:
                scenario_response.deployable = False

            response.append(scenario_response)
        return response

    def find_scenario_by_id(self, scenario_id: int) -> Scenario:
        scenario = self.scenario_repository.find_by_id(scenario_id)
        if scenario is None:
            raise ScenarioNotFound

        if scenario.status == StatusScenarioEnum.deployed:
            mender_service = MenderService()

            for device in scenario.devices:
                for mender_deployment in device.mender_deployments:
                    if not mender_deployment.status == "Installed" and not mender_deployment.status == "Installation aborted" and not mender_deployment.status == "Installation failed":
                        response = mender_service.get_status_deployment_by_device(
                            mender_deployment.mender_deployment_id)
                        devices_list = response.json()

                        if len(devices_list) == 1:
                            match devices_list[0]["status"]:
                                case 'failure':
                                    mender_deployment.status = 'Installation failed'
                                    response = mender_service.get_log_deployment(mender_deployment.mender_deployment_id,
                                                                                 device.id_mender)
                                    mender_deployment.log_error = response.text

                                case 'aborted':
                                    mender_deployment.status = "Installation aborted"
                                case 'pause_before_installing':
                                    mender_deployment.status = "Installation paused before installing the software"
                                case 'pause_before_committing':
                                    mender_deployment.status = "Installation paused before committing the software"
                                case 'pause_before_rebooting':
                                    mender_deployment.status = "Installation paused before rebooting the device"
                                case 'downloading':
                                    mender_deployment.status = "Downloading the software"
                                case 'installing':
                                    mender_deployment.status = "Installing the software"
                                case 'rebooting':
                                    mender_deployment.status = "Rebooting the device"
                                case 'pending':
                                    mender_deployment.status = "Pending to install the software"
                                case 'success':
                                    mender_deployment.status = "Installed"
                                case 'pause':
                                    mender_deployment.status = "Installation paused"
                                case 'active':
                                    mender_deployment.status = "Installation actived"
                                case 'finished':
                                    mender_deployment.status = "Installation finished"
                        else:
                            mender_deployment.status = "Pending to install the software"
                if scenario.type == 'scenario_monitoring':
                    for deployfile_mitigation_script_selected in device.deployfiles_mitigation_script_selected:
                        if deployfile_mitigation_script_selected.mender_deployment is not None and not deployfile_mitigation_script_selected.mender_deployment.status == "Installed" and not deployfile_mitigation_script_selected.mender_deployment.status == "Installation aborted" and not deployfile_mitigation_script_selected.mender_deployment.status == "Installation failed":
                            response = mender_service.get_status_deployment_by_device(
                                deployfile_mitigation_script_selected.mender_deployment.mender_deployment_id)
                            devices_list = response.json()

                            if len(devices_list) == 1:
                                match devices_list[0]["status"]:
                                    case 'failure':
                                        deployfile_mitigation_script_selected.mender_deployment.status = 'Installation failed'
                                        response = mender_service.get_log_deployment(
                                            deployfile_mitigation_script_selected.mender_deployment.mender_deployment_id,
                                            device.id_mender)
                                        deployfile_mitigation_script_selected.mender_deployment.log_error = response.text

                                    case 'aborted':
                                        deployfile_mitigation_script_selected.mender_deployment.status = "Installation aborted"
                                    case 'pause_before_installing':
                                        deployfile_mitigation_script_selected.mender_deployment.status = "Installation paused before installing the software"
                                    case 'pause_before_committing':
                                        deployfile_mitigation_script_selected.mender_deployment.status = "Installation paused before committing the software"
                                    case 'pause_before_rebooting':
                                        deployfile_mitigation_script_selected.mender_deployment.status = "Installation paused before rebooting the device"
                                    case 'downloading':
                                        deployfile_mitigation_script_selected.mender_deployment.status = "Downloading the software"
                                    case 'installing':
                                        deployfile_mitigation_script_selected.mender_deployment.status = "Installing the software"
                                    case 'rebooting':
                                        deployfile_mitigation_script_selected.mender_deployment.status = "Rebooting the device"
                                    case 'pending':
                                        deployfile_mitigation_script_selected.mender_deployment.status = "Pending to install the software"
                                    case 'success':
                                        deployfile_mitigation_script_selected.mender_deployment.status = "Installed"

                                    case 'pause':
                                        deployfile_mitigation_script_selected.mender_deployment.status = "Installation paused"
                                    case 'active':
                                        deployfile_mitigation_script_selected.mender_deployment.status = "Installation actived"
                                    case 'finished':
                                        deployfile_mitigation_script_selected.mender_deployment.status = "Installation finished"

            a = self.scenario_repository.save(scenario)
            return a

        return scenario

    def modify_name_scenario(self, scenario_id: int, modify_name_patch: ScenarioModifyNamePatch) -> Scenario:
        scenario = self.scenario_repository.find_by_id(scenario_id)

        if self.user.role is RoleEnum.read_only:
            raise UserNoPermission

        if scenario is None:
            raise ScenarioNotFound

        scenario.name = modify_name_patch.name

        return self.scenario_repository.save(scenario)

    def finish_recording(self, scenario_id: int) -> ScenarioRecording:
        recording = self.scenario_repository.find_by_id(scenario_id)

        if self.user.role is RoleEnum.read_only:
            raise UserNoPermission

        if recording is None:
            raise ScenarioNotFound

        recording.status = StatusScenarioEnum.finished

        mender_service = MenderService()

        for device in recording.devices:

            for mender_deployment in device.mender_deployments:
                mender_deployment.status = ""
                mender_service.abort_deployment(mender_deployment.mender_deployment_id)
                mender_service.remove_artifact(mender_deployment.mender_artifact_id)

            device.is_active = False
            device.current_malware = -1

            for deployfile_malware_selected in device.deployfiles_malware_selected:
                deployfile_malware_selected.timestamp_finished = None

        recording = self.scenario_repository.save(recording)
        return recording

    def finish_monitoring(self, scenario_id: int) -> ScenarioMonitoring:
        recording = self.scenario_repository.find_by_id(scenario_id)

        if self.user.role is RoleEnum.read_only:
            raise UserNoPermission

        if recording is None:
            raise ScenarioNotFound

        recording.status = StatusScenarioEnum.finished

        mender_service = MenderService()

        for device in recording.devices:

            device.mender_deployments[0].status = ""
            mender_service.abort_deployment(device.mender_deployments[0].mender_deployment_id)
            mender_service.remove_artifact(device.mender_deployments[0].mender_artifact_id)

            if len(device.mender_deployments) > 1:
                mender_service.abort_deployment(device.mender_deployments[1].mender_deployment_id)
                mender_service.remove_artifact(device.mender_deployments[1].mender_artifact_id)

                DeviceRepository(self.db).delete_mender_deployment(device.mender_deployments[1])

            device.is_active = False

        return self.scenario_repository.save(recording)

    def delete_scenario(self, scenario_id: int):
        import os
        if self.user.role == RoleEnum.read_only:
            raise UserNoPermission

        scenario = self.scenario_repository.find_by_id(scenario_id)

        if scenario is None:
            raise ScenarioNotFound

        if scenario.status == StatusScenarioEnum.deployed:
            raise ScenarioIsDeployed

        self.scenario_repository.delete(scenario)

        if scenario.type == "scenario_recording":
            for device in scenario.devices:
                for deployfile_monitoring_script_selected in device.deployfiles_monitoring_script_selected:
                    if os.path.exists(deployfile_monitoring_script_selected.dataset.path):
                        os.remove(deployfile_monitoring_script_selected.dataset.path)
                    for dataset_copy in deployfile_monitoring_script_selected.dataset.datasets_copy:
                        if os.path.exists(dataset_copy.training_path):
                            os.remove(dataset_copy.training_path)
                        if os.path.exists(dataset_copy.testing_path):
                            os.remove(dataset_copy.testing_path)
                        for plot in dataset_copy.plots:
                            if os.path.exists(plot.path):
                                os.remove(plot.path)
        else:
            for device in scenario.devices:
                if os.path.exists(device.dataset_monitoring.path):
                    os.remove(device.dataset_monitoring.path)
                if os.path.exists(device.dataset_prediction.path):
                    os.remove(device.dataset_prediction.path)

    def create_scenario_recording(self, scenario_recording_post: ScenarioRecordingPost) -> Scenario:
        if self.user.role == RoleEnum.read_only:
            raise UserNoPermission

        if self.scenario_repository.exists_by_name(scenario_recording_post.name):
            raise InvalidName

        device_repository = DeviceRepository(self.db)

        for device_post in scenario_recording_post.devices:

            if device_repository.is_device_deployed(device_post.mender_id):
                raise DeviceIsDeployed(
                    f"Scenario recording deployment aborted. Device with Mender ID: {device_post.mender_id} is already deployed")

            if not MenderService().is_device_connected(device_post.mender_id):
                raise DeviceNotFoundInMender(
                    f"Scenario recording deployment aborted. Device with Mender ID: {device_post.mender_id} is disconnected")

        file_repository = FileRepository(self.db)

        recording = ScenarioRecording(name=scenario_recording_post.name,
                                      status=StatusScenarioEnum.deployed,
                                      devices=[])

        device_dataframes = []

        for device_post in scenario_recording_post.devices:

            device_recording = DeviceRecording(id_mender=device_post.mender_id,
                                               mac_address=device_post.mac_address,
                                               device_type=device_post.device_type,
                                               current_malware=-1,
                                               is_active=True,
                                               deployfiles_malware_selected=[],
                                               deployfiles_monitoring_script_selected=[])

            for deployfiles_monitoring_script_selected in device_post.deployfiles_monitoring_script_selected:
                deployfile_monitoring_script_db = file_repository.find_by_id(
                    deployfiles_monitoring_script_selected.deployfile_monitoring_script_id)
                if deployfile_monitoring_script_db is None:
                    raise FileNotFound

                dataset_attribute = self._generate_dataset_path()

                dataset = DatasetRecording(name=dataset_attribute["name"],
                                           path=dataset_attribute["path_file"],
                                           datasets_copy=[],
                                           status=StatusDatasetEnum.original,
                                           device_mender_id=device_post.mender_id,
                                           scenario_name=scenario_recording_post.name,
                                           monitoring_script_name=deployfile_monitoring_script_db.monitoring_script.name)

                device_recording.deployfiles_monitoring_script_selected.append(
                    DeployfileMonitoringScriptSelected(
                        deployfile_monitoring_script=deployfile_monitoring_script_db,
                        dataset=dataset))

                columns = ["timestamp"]
                for column in deployfile_monitoring_script_db.monitoring_script.columns:
                    columns.append(column.name)
                columns.append('label')
                df = pd.DataFrame(columns=columns)
                device_dataframes.append({"df": df, "attributes": dataset_attribute})

            if len(device_post.deployfiles_malware_selected) > 0:
                device_recording.current_malware = 0

            cont = 1
            for deployfile_malware_selected in device_post.deployfiles_malware_selected:

                deployfile_malware_db = file_repository.find_by_id(
                    deployfile_malware_selected.deployfile_malware_id)
                if deployfile_malware_selected is None:
                    raise FileNotFound

                device_recording.deployfiles_malware_selected.append(
                    DeployfileMalwareSelected(order=cont,
                                              deployfile_malware=deployfile_malware_db,
                                              duration=deployfile_malware_selected.duration,
                                              timestamp_finished=None))

                cont = cont + 1

            recording.devices.append(device_recording)

        for df in device_dataframes:
            df["df"].to_csv(df["attributes"]["path_file"], index=False)

        recording = self._create_mender_recording_deployment(recording)

        self.scenario_repository.save(recording)
        return recording

    def create_scenario_monitoring(self, scenario_monitoring_post: ScenarioMonitoringPost) -> Scenario:

        if self.user.role == RoleEnum.read_only:
            raise UserNoPermission

        if self.scenario_repository.exists_by_name(scenario_monitoring_post.name):
            raise InvalidName

        device_repository = DeviceRepository(self.db)

        for device_post in scenario_monitoring_post.devices:
            if device_repository.is_device_deployed(device_post.mender_id):
                raise DeviceIsDeployed(
                    f"Scenario recording deployment aborted. Device with Mender ID: {device_post.mender_id} is already deployed")

            if not MenderService().is_device_connected(device_post.mender_id):
                raise DeviceNotFoundInMender(
                    f"Scenario recording deployment aborted. Device with Mender ID: {device_post.mender_id} is disconnected")

        file_repository = FileRepository(self.db)
        monitoring = ScenarioMonitoring(
            name=scenario_monitoring_post.name,
            status=StatusScenarioEnum.deployed,
            devices=[],
        )

        device_dataframes = []
        for device_post in scenario_monitoring_post.devices:

            deployfile_monitoring_script = file_repository.find_by_id(device_post.deployfile_monitoring_script_selected)
            columns_monitoring = ["timestamp"]
            for column in deployfile_monitoring_script.monitoring_script.columns:
                columns_monitoring.append(column.name)
            df_monitoring = pd.DataFrame(columns=columns_monitoring)
            attributes_df_monitoring = self._generate_dataset_path()
            device_dataframes.append({"df": df_monitoring, "attributes": attributes_df_monitoring})

            classification_training = None
            anomaly_detection_training = None
            training_repository = TrainingRepository(self.db)
            columns_prediction = ["timestamp"]
            all_labels = []

            tick_classification_classes = {}

            deployfiles_mitigation_script_selected = []

            if not isinstance(device_post.classification_training, str):
                classification_training = training_repository.find_by_id(device_post.classification_training)
                df_training = pd.read_csv(classification_training.dataset.training_path)
                all_labels = df_training['label'].unique().tolist()
                del df_training
                columns_prediction.append("classification")

                for malware in device_post.malware_classification:

                    tick_classification_classes[
                        malware.malware] = malware.cont if device_post.is_activated_mitigation else -1

                    if device_post.is_activated_mitigation:
                        for mitigation_mechanism in malware.mitigation_mechanisms:
                            deployfile_mitigation_script_selected = file_repository.find_by_id(
                                mitigation_mechanism.deployfile_mitigation_script_selected)

                            deployfiles_mitigation_script_selected.append(
                                DeployfileMitigationScriptSelected(
                                    malware_name=malware.malware,
                                    deployfile_mitigation_script=deployfile_mitigation_script_selected,
                                    status="Not installed",
                                    parameters=json.loads(
                                        mitigation_mechanism.parameters) if mitigation_mechanism.parameters != "" else None
                                )
                            )

            if not isinstance(device_post.anomaly_detection_training, str):
                anomaly_detection_training = training_repository.find_by_id(device_post.anomaly_detection_training)
                columns_prediction.append("anomaly_detection")

            df_prediction = pd.DataFrame(columns=columns_prediction)
            attributes_df_prediction = self._generate_dataset_path()

            device_dataframes.append({"df": df_prediction, "attributes": attributes_df_prediction})

            monitoring.devices.append(DeviceMonitoring(
                id_mender=device_post.mender_id,
                remove_malware=False,
                mac_address=device_post.mac_address,
                is_active=True,
                device_type=device_post.device_type,
                is_mitigating=False,
                is_activated_modify_ticks=device_post.is_activated_modify_ticks,
                is_activated_increment_classifier_anomaly=device_post.is_activated_increment_classifier_anomaly,
                is_activated_mitigation=device_post.is_activated_mitigation,
                cont_predictions={"malware": "", "cont": 0},
                tick_classification_classes=tick_classification_classes,
                deployfiles_mitigation_script_selected=deployfiles_mitigation_script_selected,
                dataset_monitoring=DatasetMonitoring(
                    name=attributes_df_monitoring["name"],
                    path=attributes_df_monitoring["path_file"],
                    status=StatusDatasetEnum.original,
                    device_mender_id=device_post.mender_id,
                    scenario_name=scenario_monitoring_post.name,
                    all_labels={"labels": all_labels},
                    monitoring_script_name=deployfile_monitoring_script.monitoring_script.name),
                dataset_prediction=DatasetMonitoring(
                    name=attributes_df_prediction["name"],
                    path=attributes_df_prediction["path_file"],
                    status=StatusDatasetEnum.original,
                    device_mender_id=device_post.mender_id,
                    all_labels={"labels": all_labels},
                    scenario_name=scenario_monitoring_post.name,
                    monitoring_script_name=deployfile_monitoring_script.monitoring_script.name),
                deployfile_monitoring_script_selected=deployfile_monitoring_script,
                deployfile_malware_selected=None,
                classification_model=classification_training,
                anomaly_detection_model=anomaly_detection_training

            ))

        for df in device_dataframes:
            df["df"].to_csv(df["attributes"]["path_file"], index=False)

        monitoring = self._create_mender_monitoring_deployment(monitoring)

        self.scenario_repository.save(monitoring)

        return monitoring

    def check_if_device_can_send_data_by_mac_address(self, mac_address: str) -> bool:
        device_repository = DeviceRepository(self.db)
        device = device_repository.find_device_deployed_by_mac(mac_address=mac_address)

        if device is None:
            return False

        if device.type == "device_recording":

            if device.recording.status == StatusScenarioEnum.deployed:
                if device.current_malware != -1:
                    return True

                else:
                    mender_service = MenderService()

                    for mender_deployment in device.mender_deployments:
                        mender_service.abort_deployment(mender_deployment.mender_deployment_id)
                        mender_service.remove_artifact(mender_deployment.mender_artifact_id)
                    for deployfile_malware_selected in device.deployfiles_malware_selected:
                        deployfile_malware_selected.deployfile_malware.timestamp_finished = None
                    device_repository.save(device)

                    number_devices_active = device_repository.amount_devices_pending_malware_by_scenario_recording(
                        device.recording_id)
                    if number_devices_active == 0:
                        recording = device.recording

                        recording.status = StatusScenarioEnum.finished
                        for device_rec in recording.devices:
                            device_rec.is_active = False
                        self.scenario_repository.save(recording)
                        return False
                    return False
            return False

        elif device.type == "device_monitoring":
            return device.monitoring.status == StatusScenarioEnum.deployed

    def check_malware_timestamp_finished(self, mac_address: str) -> bool:

        device = DeviceRepository(self.db).find_device_deployed_by_mac(mac_address=mac_address)

        if device is None:
            return True

        if device.type == "device_recording":
            if not device.deployfiles_malware_selected[
                       device.current_malware].mender_deployment.status == "Installed" and not \
                    device.deployfiles_malware_selected[
                        device.current_malware].mender_deployment.status == "Installation aborted" and not \
                    device.deployfiles_malware_selected[
                        device.current_malware].mender_deployment.status == "Installation failed":

                mender_service = MenderService()

                response = mender_service.get_status_deployment_by_device(
                    device.deployfiles_malware_selected[device.current_malware].mender_deployment.mender_deployment_id)
                devices_list = response.json()
                if len(devices_list) == 1:
                    match devices_list[0]["status"]:
                        case 'failure':
                            device.deployfiles_malware_selected[
                                device.current_malware].mender_deployment.status = 'Installation failed'
                            response = mender_service.get_log_deployment(device.deployfiles_malware_selected[
                                                                             device.current_malware].mender_deployment.mender_deployment_id,
                                                                         device.id_mender)
                            device.deployfiles_malware_selected[
                                device.current_malware].mender_deployment.log_error = response.text

                        case 'aborted':
                            device.deployfiles_malware_selected[
                                device.current_malware].mender_deployment.status = "Installation aborted"
                        case 'pause_before_installing':
                            device.deployfiles_malware_selected[
                                device.current_malware].mender_deployment.status = "Installation paused before installing the software"
                        case 'pause_before_committing':
                            device.deployfiles_malware_selected[
                                device.current_malware].mender_deployment.status = "Installation paused before committing the software"
                        case 'pause_before_rebooting':
                            device.deployfiles_malware_selected[
                                device.current_malware].mender_deployment.status = "Installation paused before rebooting the device"
                        case 'downloading':
                            device.deployfiles_malware_selected[
                                device.current_malware].mender_deployment.status = "Downloading the software"
                        case 'installing':
                            device.deployfiles_malware_selected[
                                device.current_malware].mender_deployment.status = "Installing the software"
                        case 'rebooting':
                            device.deployfiles_malware_selected[
                                device.current_malware].mender_deployment.status = "Rebooting the device"
                        case 'pending':
                            device.deployfiles_malware_selected[
                                device.current_malware].mender_deployment.status = "Pending to install the software"
                        case 'success':
                            device.deployfiles_malware_selected[
                                device.current_malware].mender_deployment.status = "Installed"
                        case 'pause':
                            device.deployfiles_malware_selected[
                                device.current_malware].mender_deployment.status = "Installation paused"
                        case 'active':
                            device.deployfiles_malware_selected[
                                device.current_malware].mender_deployment.status = "Installation actived"
                        case 'finished':
                            device.deployfiles_malware_selected[
                                device.current_malware].mender_deployment.status = "Installation finished"
                else:
                    device.deployfiles_malware_selected[
                        device.current_malware].mender_deployment.status = "Pending to install the software"
                DeviceRepository(self.db).save(device)
            if device.deployfiles_malware_selected[device.current_malware].timestamp_finished is not None:
                return device.deployfiles_malware_selected[
                    device.current_malware].timestamp_finished.timestamp() < datetime.datetime.now().timestamp()

            else:
                device.deployfiles_malware_selected[
                    device.current_malware].timestamp_finished = (
                        datetime.datetime.now() + datetime.timedelta(seconds=device.deployfiles_malware_selected[
                    device.current_malware].duration))
                DeviceRepository(self.db).save(device)
                return False

        elif device.type == "device_monitoring":

            if device.monitoring.status == StatusScenarioEnum.deployed and not device.remove_malware:
                return False
            device.remove_malware = False
            DeviceRepository(self.db).save(device)
            return True

    def finish_malware_deployment(self, mac_address: str):
        device_repository = DeviceRepository(self.db)
        device = device_repository.find_device_deployed_by_mac(mac_address=mac_address)
        if device is None:
            raise DeviceNotDeployed

        if device.type == "device_recording":
            recording = device.recording

            del device

            for device in recording.devices:
                if device.mac_address == mac_address:

                    device.deployfiles_malware_selected[
                        device.current_malware].timestamp_finished = None

                    device.current_malware = device.current_malware + 1
                    if device.current_malware < len(device.deployfiles_malware_selected):

                        import subprocess
                        import platform
                        import os
                        import uuid

                        executable = ""

                        operative_system = platform.system()
                        current_dir = os.path.dirname(os.path.abspath(__file__))
                        if operative_system == "Windows":
                            executable = os.path.join(current_dir, "..", "utils", "mender-artifact-mac-windows")
                        elif operative_system == "Darwin":
                            executable = os.path.join(current_dir, "..", "utils", "mender-artifact-mac")

                        mender_service = MenderService()
                        uuid = uuid.uuid4()
                        aux_name = f"{uuid}"
                        artifact_path = f"tmp_artifacts/{aux_name}.mender"
                        artifact_name = f"artifact_{aux_name}"

                        cmd = f"{executable} write module-image -T script -o {artifact_path} -n {artifact_name}" \
                              f" -t {device.device_type} -f {device.deployfiles_malware_selected[device.current_malware].deployfile_malware.path}"

                        subprocess.run(cmd.split(" "))

                        response_artifact = mender_service.upload_artifact(artifact_path)

                        location_header_artifact = response_artifact.headers.get('Location')
                        os.remove(artifact_path)
                        response_deployment = mender_service.init_deployment(device.id_mender, artifact_name)
                        location_header_deployment = response_deployment.headers.get('Location')

                        mender_deployment = MenderDeployment(
                            mender_deployment_id=location_header_deployment.split('/')[-1],
                            mender_artifact_id=location_header_artifact.split('/')[-1],
                            status="Pending to install the software",
                            log_error=""
                        )

                        device.deployfiles_malware_selected[
                            device.current_malware].mender_deployment = mender_deployment
                        device.mender_deployments.append(mender_deployment)


                    else:
                        device.current_malware = -1
                    break

            self.scenario_repository.save(recording)
        elif device.type == "device_monitoring":
            monitoring = device.monitoring
            del device
            for device in monitoring.devices:
                if device.mac_address == mac_address:
                    device.deployfile_malware_selected = None
                    mender_service = MenderService()

                    mender_service.abort_deployment(device.mender_deployments[1].mender_deployment_id)
                    mender_service.remove_artifact(device.mender_deployments[1].mender_artifact_id)
                    device_repository.delete_mender_deployment(device.mender_deployments[1])

            self.scenario_repository.save(monitoring)

    def get_info_scenario_filtered_by_mac_address(self, scenario_id: int, mac_address: str) -> Scenario:
        scenario = self.scenario_repository.find_by_id(scenario_id)

        if scenario is None:
            raise ScenarioNotFound

        device_list = list(filter(lambda device: (device.mac_address == mac_address), scenario.devices))

        if len(device_list) == 0:
            raise DeviceNotFound

        scenario.devices = device_list
        return scenario

    def redeploy_scenario_recording(self, scenario_id: int,
                                    scenario_redeploy_post: ScenarioRecordingRedeployPost) -> Scenario:
        scenario_original = self.scenario_repository.find_by_id(scenario_id)

        if scenario_original is None:
            raise ScenarioNotFound

        if scenario_original.type != "scenario_recording":
            raise ScenarioIncorrectType

        if self.user.role == RoleEnum.read_only:
            raise UserNoPermission

        device_repository = DeviceRepository(self.db)
        for device in scenario_original.devices:
            if device_repository.is_device_deployed(device.id_mender):
                raise DeviceIsDeployed(f"Device {device.id_mender} is already deployed")

        recording_copy = ScenarioRecording(name=scenario_redeploy_post.name,
                                           status=StatusScenarioEnum.deployed,
                                           devices=[])

        device_dataframes = []
        for device in scenario_original.devices:
            device_recording = DeviceRecording(id_mender=device.id_mender,
                                               mac_address=device.mac_address,
                                               device_type=device.device_type,
                                               current_malware=-1,
                                               is_active=True,
                                               deployfiles_malware_selected=[],
                                               deployfiles_monitoring_script_selected=[])

            for deployfiles_monitoring_script_selected in device.deployfiles_monitoring_script_selected:
                deployfile_monitoring_script_db = deployfiles_monitoring_script_selected.deployfile_monitoring_script

                dataset_attribute = self._generate_dataset_path()

                dataset = DatasetRecording(name=dataset_attribute["name"],
                                           path=dataset_attribute["path_file"],
                                           datasets_copy=[],
                                           status=StatusDatasetEnum.original,
                                           device_mender_id=device.id_mender,
                                           scenario_name=scenario_redeploy_post.name,
                                           monitoring_script_name=deployfile_monitoring_script_db.monitoring_script.name,
                                           )

                device_recording.deployfiles_monitoring_script_selected.append(
                    DeployfileMonitoringScriptSelected(
                        deployfile_monitoring_script=deployfile_monitoring_script_db,
                        dataset=dataset))
                columns = ["timestamp"]
                for column in deployfile_monitoring_script_db.monitoring_script.columns:
                    columns.append(column.name)
                columns.append('label')
                df = pd.DataFrame(columns=columns)
                device_dataframes.append({"df": df, "attributes": dataset_attribute})

            if len(device.deployfiles_malware_selected) > 0:
                device_recording.current_malware = 0

            cont = 1
            for deployfile_malware_selected in device.deployfiles_malware_selected:
                deployfile_malware_db = deployfile_malware_selected.deployfile_malware

                device_recording.deployfiles_malware_selected.append(
                    DeployfileMalwareSelected(order=cont,
                                              deployfile_malware=deployfile_malware_db,
                                              duration=deployfile_malware_selected.duration,
                                              timestamp_finished=None))
                cont = cont + 1
            recording_copy.devices.append(device_recording)
        for df in device_dataframes:
            df["df"].to_csv(df["attributes"]["path_file"], index=False)
        recording_copy = self._create_mender_recording_deployment(recording_copy)
        self.scenario_repository.save(recording_copy)
        return recording_copy

    def get_logs_from_device_monitoring(self, device_id: int) -> list[LogMonitoring]:

        device_repository = DeviceRepository(self.db)
        device = device_repository.find_by_id(device_id)

        if device is None:
            raise DeviceNotFound

        return device.logs

    def finish_mitigation_deployment(self, mac_address: str):

        device_repository = DeviceRepository(self.db)
        device = device_repository.find_device_deployed_by_mac(mac_address=mac_address)
        if device is None:
            raise DeviceNotDeployed

        monitoring = device.monitoring
        del device
        for device in monitoring.devices:
            if device.mac_address == mac_address:
                found = False

                for deployfile_mitigation_script_selected in device.deployfiles_mitigation_script_selected:
                    if device.current_malware_mitigation == deployfile_mitigation_script_selected.malware_name:

                        if deployfile_mitigation_script_selected.mender_deployment is None:
                            found = True

                            import subprocess
                            import platform
                            import os
                            import uuid

                            executable = ""

                            operative_system = platform.system()
                            current_dir = os.path.dirname(os.path.abspath(__file__))
                            if operative_system == "Windows":
                                executable = os.path.join(current_dir, "..", "utils", "mender-artifact-mac-windows")
                            elif operative_system == "Darwin":
                                executable = os.path.join(current_dir, "..", "utils", "mender-artifact-mac")

                            mender_service = MenderService()
                            uuid = uuid.uuid4()
                            aux_name = f"{uuid}"
                            artifact_path = f"tmp_artifacts/{aux_name}.mender"
                            artifact_name = f"artifact_{aux_name}"

                            cmd = f"{executable} write module-image -T script -o {artifact_path} -n {artifact_name}" \
                                  f" -t {device.device_type} -f {deployfile_mitigation_script_selected.deployfile_mitigation_script.path}"

                            subprocess.run(cmd.split(" "))

                            response_artifact = mender_service.upload_artifact(artifact_path)

                            location_header_artifact = response_artifact.headers.get('Location')
                            os.remove(artifact_path)
                            response_deployment = mender_service.init_deployment(device.id_mender, artifact_name)
                            location_header_deployment = response_deployment.headers.get('Location')

                            mender_deployment = MenderDeployment(
                                mender_deployment_id=location_header_deployment.split('/')[-1],
                                mender_artifact_id=location_header_artifact.split('/')[-1],
                                status="Pending to install the software",
                                log_error=""
                            )

                            deployfile_mitigation_script_selected.mender_deployment = mender_deployment
                            deployfile_mitigation_script_selected.status = "Installing"

                            device.logs.append(LogMonitoring(date=datetime.datetime.now().strftime("%d-%m-%Y %H:%M:%S"),
                                                             model="",
                                                             description=f"Mitigation script {deployfile_mitigation_script_selected.deployfile_mitigation_script.name} has been executed"))

                        elif deployfile_mitigation_script_selected.status == "Installing":
                            deployfile_mitigation_script_selected.status = "Installed"

                if device.is_mitigating and not found:
                    device.is_mitigating = False
                    device.current_malware_mitigation = None
                break

        self.scenario_repository.save(monitoring)

    def get_args_from_mitigation_script(self, mac_address: str) -> dict:
        device_repository = DeviceRepository(self.db)
        device = device_repository.find_device_deployed_by_mac(mac_address=mac_address)
        if device is None:
            raise DeviceNotDeployed

        for deployfile_mitigation_script_selected in device.deployfiles_mitigation_script_selected:
            if deployfile_mitigation_script_selected.status == "Installing":
                return deployfile_mitigation_script_selected.parameters

        return ""
