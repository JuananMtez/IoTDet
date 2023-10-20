from typing import Union
from fastapi import BackgroundTasks
import pandas as pd
import uuid
from exceptions.device_exception import DeviceNotDeployed
from exceptions.file_exception import FileNotFound
from exceptions.mender_exception import MenderException
from models.models import User, Processing, DeviceMonitoring, MenderDeployment, LogMonitoring
from repositories.device_repository import DeviceRepository
from schemas.device_schema import DeviceResponseTable, DeviceGatherDataPost
from services.mender_service import MenderService
from repositories.file_repository import FileRepository
import numpy as np
from joblib import load
from tensorflow.keras.models import load_model
from sklearn.preprocessing import LabelEncoder


class DeviceService:

    def __init__(self, db, user: Union[User, None]):
        self.device_repository = DeviceRepository(db)
        self.user = user
        self.db = db

    def _create_mender_deployment(self, device: DeviceMonitoring, path_file: str):
        import subprocess
        import platform
        import os

        operative_system = platform.system()
        current_dir = os.path.dirname(os.path.abspath(__file__))
        if operative_system == "Windows":
            executable = os.path.join(current_dir, "..", "utils", "mender-artifact-mac-windows")
        elif operative_system == "Darwin":
            executable = os.path.join(current_dir, "..", "utils", "mender-artifact-mac")

        mender_service = MenderService()

        aux_name = f"{uuid.uuid4()}"
        artifact_path = f"tmp_artifacts/{aux_name}.mender"
        artifact_name = f"artifact_{aux_name}"

        cmd = f"{executable} write module-image -T script -o {artifact_path} -n {artifact_name}" \
              f" -t {device.device_type}"

        cmd = cmd + f" -f {path_file}"

        subprocess.run(cmd.split(" "), capture_output=True)

        response_artifact = mender_service.upload_artifact(artifact_path)

        location_header_artifact = response_artifact.headers.get('Location')
        mender_artifact_id = location_header_artifact.split('/')[-1]
        os.remove(artifact_path)

        response_deployment = mender_service.init_deployment(device.id_mender, artifact_name)

        location_header_deployment = response_deployment.headers.get('Location')
        mender_deployment_id = location_header_deployment.split('/')[-1]

        for deployfile in device.deployfiles_mitigation_script_selected:
            if deployfile.deployfile_mitigation_script.path == path_file:
                deployfile.mender_deployment = MenderDeployment(mender_deployment_id=mender_deployment_id,
                                                                mender_artifact_id=mender_artifact_id,
                                                                status="Pending to install the software",
                                                                log_error="")
                break

        return self.device_repository.save(device)

    @staticmethod
    def _apply_transformations(df, processings: list[Processing]):
        for processing in processings:
            match processing.algorithm:

                case 'drop_features':
                    features = processing.parameters["features"]
                    df = df.drop(columns=features, axis=1)

                case 'min-max_normalization':

                    for feature, values in processing.parameters.items():
                        df[feature] = (df[feature] - values['min']) / (
                                values['max'] - values['min'] + 1e-7)

                case 'one-hot_encoding':
                    pass
                case 'standard_scaler_normalization':
                    for feature, values in processing.parameters.items():
                        df[feature] = (df[feature] - values["mean"]) / np.sqrt(values["var"] + 1e-8)

                case 'skip':
                    if "timestamp" in df.columns:
                        df = df.drop("timestamp", axis=1)
                    return df

                case 'pca':
                    if "timestamp" in df.columns:
                        df = df.drop("timestamp", axis=1)

                    X_test = df.drop('label', axis=1)
                    y_test = df['label']
                    pca_loaded = load(processing.parameters["path"])
                    X_test_transformed = pca_loaded.transform(X_test)
                    df = pd.DataFrame(X_test_transformed, columns=[f"Component {i + 1}" for i in
                                                                   range(X_test_transformed.shape[1])])

                    df = pd.concat([df, y_test], axis=1)
                    return df

                case 'lda':
                    if "timestamp" in df.columns:
                        df = df.drop("timestamp", axis=1)

                    X_test = df.drop('label', axis=1)
                    y_test = df['label']
                    lda_loaded = load(processing.parameters["path"])
                    X_lda_transformed = lda_loaded.transform(X_test)

                    df = pd.DataFrame(X_lda_transformed, columns=[f"Component {i + 1}" for i in
                                                                  range(lda_loaded.n_components)])

                    df = pd.concat([df, y_test], axis=1)
                    return df

                case 'autoencoder':
                    if "timestamp" in df.columns:
                        df = df.drop("timestamp", axis=1)

                    X_test = df.drop('label', axis=1)
                    y_test = df['label']

                    autoencoder_loaded = load_model(processing.parameters["path"])
                    X_autoencoder_transformed = autoencoder_loaded.predict(X_test)
                    df = pd.DataFrame(X_autoencoder_transformed,
                                      columns=[f'Component {i + 1}' for i in
                                               range(X_autoencoder_transformed.shape[1])])
                    df = pd.concat([df, y_test], axis=1)
                    return df

                case 'svd':
                    if "timestamp" in df.columns:
                        df = df.drop("timestamp", axis=1)

                    X_test = df.drop('label', axis=1)
                    y_test = df['label']
                    svd_loaded = load(processing.parameters["path"])
                    X_svd_transformed = svd_loaded.transform(X_test)

                    df = pd.DataFrame(X_svd_transformed,
                                      columns=[f"Component {i + 1}" for i in range(X_svd_transformed.shape[1])])

                    df = pd.concat([df, y_test], axis=1)

                    return df

        return df

    @staticmethod
    def _regroup_attributes_response(devices) -> list[DeviceResponseTable]:
        list_devices_response = []
        for device in devices:

            devices_response = DeviceResponseTable(id_device=device['id'])

            for attribute in device['attributes']:
                match attribute['name']:
                    case 'mac':
                        if attribute['value'] != "":
                            devices_response.mac = attribute['value']
                    case 'name':
                        if attribute['value'] != "":
                            devices_response.name = attribute['value']
                    case 'hostname':
                        if attribute['value'] != "":
                            devices_response.hostname = attribute['value']
                    case 'device_type':
                        if attribute['value'] != "":
                            devices_response.device_type = attribute['value']
                    case 'geo-city':
                        if attribute['value'] != "":
                            devices_response.geo_city = attribute['value']
                    case 'geo-country':
                        if attribute['value'] != "":
                            devices_response.geo_country = attribute['value']
                    case 'kernel':
                        if attribute['value'] != "":
                            devices_response.kernel = attribute['value']
                    case 'os':
                        if attribute['value'] != "":
                            devices_response.os = attribute['value']
                    case 'group':
                        if attribute['value'] != "":
                            devices_response.group = attribute['value']
                    case 'cpu_model':
                        if attribute['value'] != "":
                            devices_response.cpu_model = attribute['value']

            list_devices_response.append(devices_response)
        return list_devices_response

    def find_devices_in_mender_per_page(self, page: int, amount: int) -> list[DeviceResponseTable]:

        mender_service = MenderService()
        response = mender_service.get_all_devices_per_page(page, amount)

        if response.status_code == 200:
            devices = response.json()

            return self._regroup_attributes_response(devices)
        raise MenderException

    def find_devices_available_to_deploy(self) -> list[DeviceResponseTable]:
        mender_service = MenderService()
        response = mender_service.get_all_devices_per_page(1, 99999)
        if response.status_code == 200:

            all_devices = response.json()
            devices_available = []
            for device in all_devices:
                a = self.device_repository.is_device_deployed(device["id"])
                if not a:
                    devices_available.append(device)
            return self._regroup_attributes_response(devices_available)
        raise MenderException

    def get_device_attributes(self, id_mender: str):

        mender_service = MenderService()
        response = mender_service.get_device_attributes(id_mender)

        if response.status_code == 200:
            data = response.json()
            attributes = list(filter(lambda el: (el['name'] != 'created_ts' and
                                                 el['name'] != 'updated_ts' and
                                                 el['name'] != 'status' and
                                                 el['name'] != 'artifact_name' and
                                                 el['name'] != 'mender_bootloader_integration' and
                                                 el['name'] != 'mender_client_version' and
                                                 el['name'] != 'update_modules'),
                                     data['attributes']))
            data['attributes'] = attributes

            return data
        raise MenderException

    def get_devices_available_to_add(self) -> list[DeviceResponseTable]:
        mender_service = MenderService()
        response = mender_service.get_all_devices_per_page(1, 999999)

        if response.status_code == 200:
            devices_added = self.device_repository.get_all_already_in_scenarios()
            devices = response.json()

            list_devices_available = []
            for device in devices:
                found = False
                i = 0

                while i < len(devices_added) and not found:
                    if device['id'] == devices_added[i].id_mender:
                        found = True
                    i = i + 1

                if not found:
                    list_devices_available.append(device)

            return self._regroup_attributes_response(list_devices_available)

        raise MenderException

    def store_data(self, data_post: DeviceGatherDataPost, background_tasks: BackgroundTasks):
        import datetime
        device = DeviceRepository(self.db).find_device_deployed_by_mac(mac_address=data_post.mac_address)

        if device is None:
            raise DeviceNotDeployed

        if device.type == "device_recording":

            for deployfile_monitoring_script_selected in device.deployfiles_monitoring_script_selected:
                if deployfile_monitoring_script_selected.deployfile_monitoring_script.monitoring_script.name == data_post.name:

                    if device.current_malware >= 0 and device.deployfiles_malware_selected[
                        device.current_malware].mender_deployment.status == "Installed":
                        label = device.deployfiles_malware_selected[
                            device.current_malware].deployfile_malware.malware.name

                        if deployfile_monitoring_script_selected.deployfile_monitoring_script.monitoring_script.columns[
                            0].datatype == 'Unknown':
                            file_repository = FileRepository(self.db)
                            i = 0
                            for value in data_post.values:
                                deployfile_monitoring_script_selected.deployfile_monitoring_script.monitoring_script.columns[
                                    i].datatype = str(type(value).__name__)
                                i = i + 1
                            file_repository.save(
                                deployfile_monitoring_script_selected.deployfile_monitoring_script.monitoring_script)

                        df = pd.read_csv(deployfile_monitoring_script_selected.dataset.path)

                        df = pd.concat(
                            [df, pd.DataFrame([[datetime.datetime.now().timestamp()] + data_post.values + [label]],
                                              columns=df.columns.tolist())], ignore_index=True)
                        df.to_csv(deployfile_monitoring_script_selected.dataset.path, index=False)
        else:

            predictions = device.cont_predictions.copy()
            df_monitoring = pd.read_csv(device.dataset_monitoring.path)

            timestamp = datetime.datetime.now().timestamp()
            df_new_values = pd.DataFrame([[timestamp] + data_post.values],
                                         columns=df_monitoring.columns.tolist())
            df_monitoring = pd.concat([df_monitoring, df_new_values], ignore_index=True)
            df_monitoring.to_csv(device.dataset_monitoring.path, index=False)

            if not device.is_mitigating:
                y_pred_classifier = ""
                y_pred_detector = ""
                y_values = []

                if device.classification_model is not None:
                    df_new_values_classification = self._apply_transformations(df_new_values.copy(),
                                                                               device.classification_model.dataset.processings)
                    if device.classification_model.method == "Machine learning":
                        model = load(device.classification_model.path)
                        y_pred_classifier = model.predict(df_new_values_classification)
                        y_pred_classifier = y_pred_classifier[0]
                        y_values.append(y_pred_classifier)
                    else:
                        model = load_model(device.classification_model.path)

                        df_training = pd.read_csv(device.classification_model.dataset.training_path)
                        df_testing = pd.read_csv(device.classification_model.dataset.testing_path)
                        combined_data = pd.concat([df_training, df_testing], axis=0)
                        le = LabelEncoder()
                        le.fit(combined_data['label'])
                        del combined_data
                        del df_training
                        del df_testing

                        y_pred_classifier = np.argmax(model.predict(df_new_values_classification), axis=-1)
                        y_pred_classifier = le.inverse_transform([y_pred_classifier[0]])[0]

                        y_values.append(y_pred_classifier)

                    if y_pred_classifier != "Normal":
                        device.logs.append(LogMonitoring(date=datetime.datetime.now().strftime("%d-%m-%Y %H:%M:%S"),
                                                         model="Classification",
                                                         description=f"{y_pred_classifier} predicted.")
                                           )

                    del df_new_values_classification

                if device.anomaly_detection_model is not None:
                    df_new_values_anomaly_detection = self._apply_transformations(df_new_values.copy(),
                                                                                  device.anomaly_detection_model.dataset.processings)

                    if device.anomaly_detection_model.method == "Machine learning":
                        model = load(device.anomaly_detection_model.path)
                        y_pred_detector = model.predict(df_new_values_anomaly_detection)
                        y_pred_detector = "Normal" if y_pred_detector[0] == 1 else "Abnormal"

                        y_values.append(y_pred_detector)

                    else:
                        model = load_model(device.anomaly_detection_model.path)

                        prediction = model.predict(df_new_values_anomaly_detection)
                        mse = np.mean(np.power(df_new_values_anomaly_detection - prediction, 2), axis=1)
                        threshold = np.percentile(mse, device.anomaly_detection_model.threshold)
                        y_pred_detector = np.where(mse > threshold, "Abnormal", "Normal")
                        y_pred_detector = y_pred_detector[0]
                        y_values.append(y_pred_detector)

                    if y_pred_detector != "Normal":
                        device.logs.append(LogMonitoring(date=datetime.datetime.now().strftime("%d-%m-%Y %H:%M:%S"),
                                                         model="Anomaly detection",
                                                         description=f"Abnormal predicted."))

                    del df_new_values_anomaly_detection

                df_prediction = pd.read_csv(device.dataset_prediction.path)
                df_prediction = pd.concat(
                    [df_prediction, pd.DataFrame([[datetime.datetime.now().timestamp()] + y_values],
                                                 columns=df_prediction.columns.tolist())], ignore_index=True)

                df_prediction.to_csv(device.dataset_prediction.path, index=False)

                if device.is_activated_mitigation:
                    if ((not device.is_activated_increment_classifier_anomaly and y_pred_classifier != "Normal") or
                            (
                                    device.is_activated_increment_classifier_anomaly and y_pred_classifier != "Normal" and y_pred_detector != "Normal")):

                        if device.is_activated_modify_ticks:
                            if predictions["malware"] == y_pred_classifier:
                                predictions["cont"] = predictions["cont"] + 1
                            else:
                                predictions["cont"] = 1
                                predictions["malware"] = y_pred_classifier

                            device.logs.append(LogMonitoring(date=datetime.datetime.now().strftime("%d-%m-%Y %H:%M:%S"),
                                                             model="",
                                                             description=f"Malware: {predictions['malware']}\nCount {predictions['cont']}"))

                        else:
                            predictions["cont"] = 1
                            predictions["malware"] = y_pred_classifier

                        deployfile_selected = None
                        for deployfile in device.deployfiles_mitigation_script_selected:
                            if deployfile.malware_name == y_pred_classifier and deployfile.mender_deployment is None:
                                deployfile_selected = deployfile
                                deployfile_selected.status = "Installing"
                                break

                        if deployfile_selected is not None and (
                                (not device.is_activated_modify_ticks and predictions["cont"] == 1) or (
                                device.is_activated_modify_ticks and predictions["cont"] ==
                                device.tick_classification_classes[predictions["malware"]])):
                            device.is_mitigating = True
                            device.current_malware_mitigation = y_pred_classifier

                            device.logs.append(LogMonitoring(date=datetime.datetime.now().strftime("%d-%m-%Y %H:%M:%S"),
                                                             model="",
                                                             description=f"Mitigation script {deployfile_selected.deployfile_mitigation_script.name} has been executed"))

                            background_tasks.add_task(self._create_mender_deployment, device,
                                                      deployfile_selected.deployfile_mitigation_script.path)
                    device.cont_predictions = predictions

            return self.device_repository.save(device)

    def install_malware(self, device_mender_id: str, deployfile_malware_id: int) -> DeviceMonitoring:
        device = self.device_repository.find_device_deployed_by_mender_id(device_mender_id)
        if device is None:
            raise DeviceNotDeployed

        deployfile_malware = FileRepository(self.db).find_by_id(deployfile_malware_id)
        if deployfile_malware is None or deployfile_malware.type != "deployfile_malware":
            raise FileNotFound

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

        aux_name = f"{uuid.uuid4()}"
        artifact_path = f"tmp_artifacts/{aux_name}.mender"
        artifact_name = f"artifact_{aux_name}"

        cmd = f"{executable} write module-image -T script -o {artifact_path} -n {artifact_name}" \
              f" -t {device.device_type} -f {deployfile_malware.path}"

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
        device.deployfile_malware_selected = deployfile_malware

        return self.device_repository.save(device)

    def device_clean_malware(self, device_mender_id: str) -> DeviceMonitoring:

        device = self.device_repository.find_device_deployed_by_mender_id(device_mender_id)
        if device is None:
            raise DeviceNotDeployed

        if device.mender_deployments[1].status == "Installation aborted" or device.mender_deployments[
            1].status == "Installation failed":
            device.deployfile_malware_selected = None
            mender_service = MenderService()

            mender_service.abort_deployment(device.mender_deployments[1].mender_deployment_id)
            mender_service.remove_artifact(device.mender_deployments[1].mender_artifact_id)
            self.device_repository.delete_mender_deployment(device.mender_deployments[1])
        else:
            device.remove_malware = True

        return self.device_repository.save(device)
