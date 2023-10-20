import os
from typing import Union
import random

from exceptions.dataset_exception import DatasetNotFound
from exceptions.training_exception import TrainingNotFound, TrainingNotRemovable, DatasetNotEvaluable
from models.models import User, Training, RoleEnum, Processing
from repositories.dataset_repository import DatasetRepository
from repositories.device_repository import DeviceRepository
from repositories.training_repository import TrainingRepository
from schemas.training_schema import TrainingResponse, TrainingPost, GNBPost, KNNManualPost, SVMManualPost, \
    SGDManualPost, DTManualPost, RFManualPost, \
    LOFManualPost, OCSVMManualPost, IFManualPost, TrainingModifyName, KNNSearchPost, SVMSearchPost, SGDSearchPost, \
    DTSearchPost, RFSearchPost, LOFSearchPost, OCSVMSearchPost, IFSearchPost, NNPost, NNSearchPost
import base64
import uuid
import pandas as pd
from joblib import dump, load
from sklearn.metrics import confusion_matrix
import seaborn as sns
import matplotlib.pyplot as plt
from exceptions.user_exception import UserNoPermission
from sklearn.metrics import classification_report, roc_auc_score
import numpy as np
from tensorflow.keras.models import load_model
from sklearn.model_selection import GridSearchCV, RandomizedSearchCV
from sklearn.preprocessing import LabelEncoder


class TrainingService:
    def __init__(self, db, user: Union[User, None]):
        self.user = user,
        self.db = db
        self.training_repository = TrainingRepository(db)

    def find_all(self) -> list[TrainingResponse]:
        models = self.training_repository.find_all()

        response = []
        for model in models:
            confusion_matrix_path = ""
            accuracy_path = ""
            loss_path = ""
            if model.confusion_matrix_path != "":
                with open(model.confusion_matrix_path, 'rb') as f:
                    confusion_matrix_path = base64.b64encode(f.read())
            if model.accuracy_path != "":
                with open(model.accuracy_path, 'rb') as f:
                    accuracy_path = base64.b64encode(f.read())
            if model.loss_path != "":
                with open(model.loss_path, 'rb') as f:
                    loss_path = base64.b64encode(f.read())

            classes = None
            if model.type == "Classifier":
                df_training = pd.read_csv(model.dataset.training_path)
                df_testing = pd.read_csv(model.dataset.testing_path)
                combined_data = pd.concat([df_training, df_testing], axis=0)
                del df_training
                del df_testing

                classes = combined_data['label'].unique().tolist()
                del combined_data

            response.append(TrainingResponse(
                id=model.id,
                name=model.name,
                device_mender_id=model.device_mender_id,
                dataset_name=model.dataset.name,
                algorithm_description=model.algorithm_description,
                confusion_matrix_img=confusion_matrix_path,
                monitoring_script_name=model.monitoring_script_name,
                type=model.type,
                status=model.status,
                method=model.method,
                log_error=model.log_error,
                output_validation=model.validation_output,
                loss_path=loss_path,
                accuracy_path=accuracy_path,
                classification_classes=classes
            ))

        return response

    def find_by_id(self, training_id: int):
        model = self.training_repository.find_by_id(training_id)

        if model is None:
            raise TrainingNotFound

        confusion_matrix_path = ""
        accuracy_path = ""
        loss_path = ""
        if model.confusion_matrix_path != "":
            with open(model.confusion_matrix_path, 'rb') as f:
                confusion_matrix_path = base64.b64encode(f.read())
        if model.accuracy_path != "":
            with open(model.accuracy_path, 'rb') as f:
                accuracy_path = base64.b64encode(f.read())
        if model.loss_path != "":
            with open(model.loss_path, 'rb') as f:
                loss_path = base64.b64encode(f.read())

        classes = None
        if model.type == "Classifier":
            df_training = pd.read_csv(model.dataset.training_path)
            df_testing = pd.read_csv(model.dataset.testing_path)
            combined_data = pd.concat([df_training, df_testing], axis=0)
            del df_training
            del df_testing

            classes = combined_data['label'].unique().tolist()
            del combined_data

        return TrainingResponse(
            id=model.id,
            name=model.name,
            device_mender_id=model.device_mender_id,
            dataset_name=model.dataset.name,
            algorithm_description=model.algorithm_description,
            confusion_matrix_img=confusion_matrix_path,
            monitoring_script_name=model.monitoring_script_name,
            type=model.type,
            status=model.status,
            method=model.method,
            log_error=model.log_error,
            output_validation=model.validation_output,
            loss_path=loss_path,
            accuracy_path=accuracy_path,
            classification_classes=classes
        )

    def modify_name(self, training_id: int, name_patch: TrainingModifyName) -> TrainingResponse:

        if self.user == RoleEnum.read_only:
            raise UserNoPermission

        model = self.training_repository.find_by_id(training_id)

        if model is None:
            raise TrainingNotFound
        accuracy_path = ""
        loss_path = ""
        model.name = name_patch.name
        self.training_repository.save(model)
        confusion_matrix_path = ""
        if model.confusion_matrix_path != "":
            with open(model.confusion_matrix_path, 'rb') as f:
                confusion_matrix_path = base64.b64encode(f.read())
        if model.accuracy_path != "":
            with open(model.accuracy_path, 'rb') as f:
                accuracy_path = base64.b64encode(f.read())
        if model.loss_path != "":
            with open(model.loss_path, 'rb') as f:
                loss_path = base64.b64encode(f.read())
        classes = None
        if model.type == "Classifier":
            df_training = pd.read_csv(model.dataset.training_path)
            df_testing = pd.read_csv(model.dataset.testing_path)
            combined_data = pd.concat([df_training, df_testing], axis=0)
            del df_training
            del df_testing

            classes = combined_data['label'].unique().tolist()
            del combined_data
        return TrainingResponse(
            id=model.id,
            name=model.name,
            device_mender_id=model.device_mender_id,
            dataset_name=model.dataset.name,
            algorithm_description=model.algorithm_description,
            confusion_matrix_img=confusion_matrix_path,
            monitoring_script_name=model.monitoring_script_name,
            type=model.type,
            status=model.status,
            method=model.method,
            log_error=model.log_error,
            output_validation=model.validation_output,
            loss_path=loss_path,
            accuracy_path=accuracy_path,
            classification_classes=classes
        )

    def download_training(self, training_id: int):
        import os
        model = self.training_repository.find_by_id(training_id)

        if model is None:
            raise TrainingNotFound

        file_name, file_extension = os.path.splitext(model.path)
        return {'filename': model.name + file_extension, 'path': model.path}

    def find_all_classification_models_by_monitoring_script(self, monitoring_script_name: str) -> list[
        TrainingResponse]:
        models = self.training_repository.find_all_classifications_by_monitoring_script_name(
            monitoring_script_name)

        response = []
        for model in models:
            confusion_matrix_path = ""
            accuracy_path = ""
            loss_path = ""
            if model.confusion_matrix_path != "":
                with open(model.confusion_matrix_path, 'rb') as f:
                    confusion_matrix_path = base64.b64encode(f.read())
            if model.accuracy_path != "":
                with open(model.accuracy_path, 'rb') as f:
                    accuracy_path = base64.b64encode(f.read())
            if model.loss_path != "":
                with open(model.loss_path, 'rb') as f:
                    loss_path = base64.b64encode(f.read())

            df_training = pd.read_csv(model.dataset.training_path)
            df_testing = pd.read_csv(model.dataset.testing_path)
            combined_data = pd.concat([df_training, df_testing], axis=0)
            del df_training
            del df_testing

            classes = combined_data['label'].unique().tolist()
            del combined_data

            response.append(TrainingResponse(
                id=model.id,
                name=model.name,
                device_mender_id=model.device_mender_id,
                dataset_name=model.dataset.name,
                algorithm_description=model.algorithm_description,
                confusion_matrix_img=confusion_matrix_path,
                monitoring_script_name=model.monitoring_script_name,
                type=model.type,
                status=model.status,
                method=model.method,
                log_error=model.log_error,
                output_validation=model.validation_output,
                loss_path=loss_path,
                accuracy_path=accuracy_path,
                classification_classes=classes
            ))

        return response

    def find_all_anomaly_detection_models_by_monitoring_script(self, monitoring_script_name: str) -> list[
        TrainingResponse]:

        models = self.training_repository.find_all_anomaly_detectors_by_monitoring_script_name(monitoring_script_name)

        response = []
        for model in models:
            confusion_matrix_path = ""
            accuracy_path = ""
            loss_path = ""
            if model.confusion_matrix_path != "":
                with open(model.confusion_matrix_path, 'rb') as f:
                    confusion_matrix_path = base64.b64encode(f.read())
            if model.accuracy_path != "":
                with open(model.accuracy_path, 'rb') as f:
                    accuracy_path = base64.b64encode(f.read())
            if model.loss_path != "":
                with open(model.loss_path, 'rb') as f:
                    loss_path = base64.b64encode(f.read())

            response.append(TrainingResponse(
                id=model.id,
                name=model.name,
                device_mender_id=model.device_mender_id,
                dataset_name=model.dataset.name,
                algorithm_description=model.algorithm_description,
                confusion_matrix_img=confusion_matrix_path,
                monitoring_script_name=model.monitoring_script_name,
                type=model.type,
                status=model.status,
                method=model.method,
                log_error=model.log_error,
                output_validation=model.validation_output,
                loss_path=loss_path,
                accuracy_path=accuracy_path,
                classification_classes=None
            ))

        return response

    def remove_model(self, training_id: int):

        if self.user == RoleEnum.read_only:
            raise UserNoPermission

        if DeviceRepository(self.db).exists_device_monitoring_deployed_using_model(training_id):
            raise TrainingNotRemovable

        model = self.training_repository.find_by_id(training_id)

        if model is None:
            raise TrainingNotFound

        if model.status == "Training" or model.status == "In queue":
            raise TrainingNotRemovable

        if os.path.exists(model.confusion_matrix_path):
            os.remove(model.confusion_matrix_path)
        if os.path.exists(model.path):
            os.remove(model.path)
        if os.path.exists(model.loss_path):
            os.remove(model.loss_path)
        if os.path.exists(model.accuracy_path):
            os.remove(model.accuracy_path)

        self.training_repository.delete(model)

    def _generate_models(self, training_post: TrainingPost, trainings: list[Training]):

        for i in range(len(training_post.models)):
            match training_post.models[i].algorithm:
                case GNBPost():
                    try:
                        trainings[i].status = "Training"
                        self.training_repository.save(trainings[i])
                        self._apply_gnb(training_post.models[i], trainings[i])

                    except Exception as exc:
                        trainings[i].status = "Error"
                        trainings[i].log_error = str(exc)

                case KNNManualPost():
                    try:
                        trainings[i].status = "Training"
                        self.training_repository.save(trainings[i])
                        self._apply_knn(training_post.models[i], trainings[i])

                    except Exception as exc:
                        trainings[i].status = "Error"
                        trainings[i].log_error = str(exc)

                case KNNSearchPost():
                    try:
                        trainings[i].status = "Training"
                        self.training_repository.save(trainings[i])
                        self._apply_knn_search(training_post.models[i], trainings[i])

                    except Exception as exc:
                        trainings[i].status = "Error"
                        trainings[i].log_error = str(exc)

                case SVMManualPost():
                    try:
                        trainings[i].status = "Training"
                        self.training_repository.save(trainings[i])
                        self._apply_svm(training_post.models[i], trainings[i])

                    except Exception as exc:
                        trainings[i].status = "Error"
                        trainings[i].log_error = str(exc)

                case SVMSearchPost():
                    try:
                        trainings[i].status = "Training"
                        self.training_repository.save(trainings[i])
                        self._apply_svm_search(training_post.models[i], trainings[i])

                    except Exception as exc:
                        trainings[i].status = "Error"
                        trainings[i].log_error = str(exc)

                case SGDManualPost():
                    try:
                        trainings[i].status = "Training"
                        self.training_repository.save(trainings[i])
                        self._apply_sgd(training_post.models[i], trainings[i])

                    except Exception as exc:
                        trainings[i].status = "Error"
                        trainings[i].log_error = str(exc)

                case SGDSearchPost():
                    try:
                        trainings[i].status = "Training"
                        self.training_repository.save(trainings[i])
                        self._apply_sgd_search(training_post.models[i], trainings[i])

                    except Exception as exc:
                        trainings[i].status = "Error"
                        trainings[i].log_error = str(exc)

                case DTManualPost():
                    try:
                        trainings[i].status = "Training"
                        self.training_repository.save(trainings[i])
                        self._apply_dt(training_post.models[i], trainings[i])

                    except Exception as exc:
                        trainings[i].status = "Error"
                        trainings[i].log_error = str(exc)

                case DTSearchPost():
                    try:
                        trainings[i].status = "Training"
                        self.training_repository.save(trainings[i])
                        self._apply_dt_search(training_post.models[i], trainings[i])

                    except Exception as exc:
                        trainings[i].status = "Error"
                        trainings[i].log_error = str(exc)
                case RFManualPost():
                    try:
                        trainings[i].status = "Training"
                        self.training_repository.save(trainings[i])
                        self._apply_rf(training_post.models[i], trainings[i])

                    except Exception as exc:
                        trainings[i].status = "Error"
                        trainings[i].log_error = str(exc)

                case RFSearchPost():
                    try:
                        trainings[i].status = "Training"
                        self.training_repository.save(trainings[i])
                        self._apply_rf_search(training_post.models[i], trainings[i])

                    except Exception as exc:
                        trainings[i].status = "Error"
                        trainings[i].log_error = str(exc)
                case LOFManualPost():
                    try:
                        trainings[i].status = "Training"
                        self.training_repository.save(trainings[i])
                        self._apply_lof(training_post.models[i], trainings[i])

                    except Exception as exc:
                        trainings[i].status = "Error"
                        trainings[i].log_error = str(exc)
                case LOFSearchPost():
                    try:
                        trainings[i].status = "Training"
                        self.training_repository.save(trainings[i])
                        self._apply_lof_search(training_post.models[i], trainings[i])

                    except Exception as exc:
                        trainings[i].status = "Error"
                        trainings[i].log_error = str(exc)

                case OCSVMManualPost():

                    try:
                        trainings[i].status = "Training"
                        self.training_repository.save(trainings[i])
                        self._apply_ocsvm(training_post.models[i], trainings[i])

                    except Exception as exc:
                        trainings[i].status = "Error"
                        trainings[i].log_error = str(exc)
                case OCSVMSearchPost():

                    try:
                        trainings[i].status = "Training"
                        self.training_repository.save(trainings[i])
                        self._apply_ocsvm_search(training_post.models[i], trainings[i])

                    except Exception as exc:
                        trainings[i].status = "Error"
                        trainings[i].log_error = str(exc)
                case IFManualPost():
                    try:
                        trainings[i].status = "Training"
                        self.training_repository.save(trainings[i])
                        self._apply_if(training_post.models[i], trainings[i])

                    except Exception as exc:
                        trainings[i].status = "Error"
                        trainings[i].log_error = str(exc)
                case IFSearchPost():

                    try:
                        trainings[i].status = "Training"
                        self.training_repository.save(trainings[i])
                        self._apply_if_search(training_post.models[i], trainings[i])

                    except Exception as exc:
                        trainings[i].status = "Error"
                        trainings[i].log_error = str(exc)
                case NNPost():
                    try:
                        trainings[i].status = "Training"
                        self.training_repository.save(trainings[i])
                        if training_post.models[i].type == 'Classifier':
                            self._apply_dl_classifier(training_post.models[i], trainings[i])
                        else:
                            self._apply_dl_anomaly_detection(training_post.models[i], trainings[i])

                    except Exception as exc:
                        trainings[i].status = "Error"
                        trainings[i].log_error = str(exc)

                case NNSearchPost():
                    try:
                        trainings[i].status = "Training"
                        self.training_repository.save(trainings[i])
                        if training_post.models[i].type == 'Classifier':
                            self._apply_dl_classifier_search(training_post.models[i], trainings[i])
                        else:
                            self._apply_dl_anomaly_detection_search(training_post.models[i], trainings[i])

                    except Exception as exc:
                        trainings[i].status = "Error"
                        trainings[i].log_error = str(exc)

            self.training_repository.save(trainings[i])

    def create_models(self, training_post: TrainingPost, background_tasks) -> list[TrainingResponse]:
        trainings = []
        for model in training_post.models:
            algorithm_description = ""

            match model.algorithm:
                case GNBPost():
                    algorithm_description = f"Algorithm: Gaussian Naive Bayes (GNB)"
                    pass
                case KNNManualPost():
                    algorithm_description = f"Algorithm: K-Nearest  Neighbors (KNN)\nHyperparameters tuning: Manual\nHyperparameters: Number of neighbors:{model.algorithm.knn_n_neighbors}"
                    pass
                case KNNSearchPost():
                    if model.hyperparameters_tuning == "exhaustivesearch":
                        algorithm_description = f"Algorithm: K-Nearest  Neighbors (KNN)\nHyperparameters tuning: Exhaustive Search, Folds: {model.folds}"
                    else:
                        algorithm_description = f"Algorithm: K-Nearest  Neighbors (KNN)\nHyperparameters tuning: Random Search, Folds: {model.folds}, Iterations: {model.iterations}"

                case SVMManualPost():
                    algorithm_description = f"Algorithm: Support Vector Machine (SVM)\nHyperparameters tuning: Manual\nHyperparameters: C: {model.algorithm.svm_C}, Kernel: {model.algorithm.svm_kernel}, Gamma: {model.algorithm.svm_gamma}"

                case SVMSearchPost():
                    if model.hyperparameters_tuning == "exhaustivesearch":
                        algorithm_description = f"Algorithm: Support Vector Machine (SVM)\nHyperparameters tuning: Exhaustive Search, Folds: {model.folds}"
                    else:
                        algorithm_description = f"Algorithm: Support Vector Machine (SVM)\nHyperparameters tuning: Random Search, Folds: {model.folds}, Iterations: {model.iterations}"

                case SGDManualPost():
                    algorithm_description = f"Algorithm: Stochastic Gradient Descent (SGD)\nHyperparameters tuning: Manual\nHyperparameters: Loss: {model.algorithm.sgd_loss}, Penalty: {model.algorithm.sgd_penalty}, Alpha: {model.algorithm.sgd_alpha}, Learning Rate: {model.algorithm.sgd_learning_rate}"

                case SGDSearchPost():
                    if model.hyperparameters_tuning == "exhaustivesearch":
                        algorithm_description = f"Algorithm: Stochastic Gradient Descent (SGD)\nHyperparameters tuning: Exhaustive Search, Folds: {model.folds}"
                    else:
                        algorithm_description = f"Algorithm: Stochastic Gradient Descent (SGD)\nHyperparameters tuning: Random Search, Folds: {model.folds}, Iterations: {model.iterations}"

                case DTManualPost():
                    algorithm_description = f"Algorithm: Decision tree learning\nHyperparameters tuning: Manual\nHyperparameters: Maximum depth of the tree: {model.algorithm.dt_max_depth}, Minimum number of samples: {model.algorithm.dt_min_samples_split}"
                case DTSearchPost():
                    if model.hyperparameters_tuning == "exhaustivesearch":
                        algorithm_description = f"Algorithm: Decision tree learning\nHyperparameters tuning: Exhaustive Search, Folds: {model.folds}"
                    else:
                        algorithm_description = f"Algorithm: Decision tree learning\nHyperparameters tuning: Random Search, Folds: {model.folds}, Iterations: {model.iterations}"

                case RFManualPost():
                    max_depth = "None" if model.algorithm.rf_max_depth == "" else model.algorithm.rf_max_depth
                    algorithm_description = f"Algorithm: Random Forest (RF)\nHyperparameters tuning: Manual\nHyperparameters: Number of trees in the forest: {model.algorithm.rf_n_estimators}, Maximum depth of the tree: {max_depth}, Minimum number of samples: {model.algorithm.rf_min_samples_split}"

                case RFSearchPost():
                    if model.hyperparameters_tuning == "exhaustivesearch":
                        algorithm_description = f"Algorithm: Random Forest (RF)\nHyperparameters tuning: Exhaustive Search, Folds: {model.folds}"
                    else:
                        algorithm_description = f"Algorithm: Random Forest (RF)\nHyperparameters tuning: Random Search, Folds: {model.folds}, Iterations: {model.iterations}"

                case LOFManualPost():
                    algorithm_description = f"Algorithm: Local Outlier Factor (LOF)\nHyperparameters tuning: Manual\nHyperparameters: Number of neighbors: {model.algorithm.lof_n_neighbors}, Contamination: {model.algorithm.lof_contamination}"

                case LOFSearchPost():
                    metric = 'AUC Score' if model.evaluation_metric == "AUC" else 'TPR and TNR average'
                    if model.hyperparameters_tuning == "exhaustivesearch":
                        algorithm_description = f"Algorithm: Local Outlier Factor (LOF)\nHyperparameters tuning: Exhaustive Search, Evaluation metric: {metric}"
                    else:
                        algorithm_description = f"Algorithm: Local Outlier Factor (LOF)\nHyperparameters tuning: Random Search, Iterations: {model.iterations}, Evaluation metric: {metric}"

                case OCSVMManualPost():
                    algorithm_description = f"Algorithm: One Class Support Vector Machine (OCSVM)\nHyperparameters tuning: Manual\nHyperparameters: Kernel: {model.algorithm.ocsvm_kernel}, Gamma: {model.algorithm.ocsvm_gamma}, Nu: {model.algorithm.ocsvm_nu}"

                case OCSVMSearchPost():
                    metric = 'AUC Score' if model.evaluation_metric == "AUC" else 'TPR and TNR average'

                    if model.hyperparameters_tuning == "exhaustivesearch":
                        algorithm_description = f"Algorithm: One Class Support Vector Machine (OCSVM)\nHyperparameters tuning: Exhaustive Search, Evaluation metric: {metric}"
                    else:
                        algorithm_description = f"Algorithm: One Class Support Vector Machine (OCSVM)\nHyperparameters tuning: Random Search, Iterations: {model.iterations}, Evaluation metric: {metric}"

                case IFManualPost():

                    algorithm_description = f"Algorithm: Isolation Forest (IF)\nHyperparameters tuning: Manual\nHyperparameters: Number of base estimators: {model.algorithm.if_n_estimators}, Contamination: {model.algorithm.if_contamination}"
                    pass
                case IFSearchPost():
                    metric = 'AUC Score' if model.evaluation_metric == "AUC" else 'TPR and TNR average'

                    if model.hyperparameters_tuning == "exhaustivesearch":
                        algorithm_description = f"Algorithm: Isolation Forest (IF)\nHyperparameters tuning: Exhaustive Search, Evaluation metric: {metric}"
                    else:
                        algorithm_description = f"Algorithm: Isolation Forest (IF)\nHyperparameters tuning: Random Search, Iterations: {model.iterations}, Evaluation metric: {metric}"

                case NNPost():

                    algorithm_description = f"Hyperparameters: Epochs: {model.algorithm.epochs}, Loss: {model.algorithm.loss}, Optimizer: {model.algorithm.optimizer}, Learning rate: {model.algorithm.learning_rate}, Batch size: {model.algorithm.batch_size}"
                    if model.type == "Anomaly Detection":
                        algorithm_description = algorithm_description + f", Error threshold (MSE percentile): {model.algorithm.threshold}%"
                    algorithm_description = algorithm_description + f"\nNeural Network composed of {len(model.algorithm.layers)} layers:"
                    for i in range(len(model.algorithm.layers)):
                        algorithm_description = algorithm_description + f"\n\tLayer {i + 1}: "
                        match model.algorithm.layers[i].name:
                            case "input":
                                algorithm_description = algorithm_description + f"Input, Hyperparameters: Shape {model.algorithm.layers[i].layer.shape}"
                            case 'dense':
                                algorithm_description = algorithm_description + f"Dense, Hyperparameters: Units: {model.algorithm.layers[i].layer.units}, Activation: {model.algorithm.layers[i].layer.activation}"
                            case 'lstm':
                                algorithm_description = algorithm_description + f"LSTM, Hyperparameters: Units: {model.algorithm.layers[i].layer.units}, Activation: {model.algorithm.layers[i].layer.activation}, Return sequences: {model.algorithm.layers[i].layer.return_sequences}"
                            case 'gru':
                                algorithm_description = algorithm_description + f"LSTM, Hyperparameters: Units: {model.algorithm.layers[i].layer.units}, Activation: {model.algorithm.layers[i].layer.activation}, Return sequences: {model.algorithm.layers[i].layer.return_sequences}"
                            case 'repeat_vector':
                                algorithm_description = algorithm_description + f"RepeatVector, Hyperparameters: n: {model.algorithm.layers[i].layer.n}"
                            case 'conv_1D':
                                algorithm_description = algorithm_description + f"Conv1D, Hyperparameters: Filters: {model.algorithm.layers[i].layer.filters}, Activation: {model.algorithm.layers[i].layer.activation}, Kernel size: {model.algorithm.layers[i].layer.kernel_size}"
                            case 'dropout':
                                algorithm_description = algorithm_description + f"Dropout, Hyperparameters: Rate: {model.algorithm.layers[i].layer.rate}"
                            case 'max_pooling_1D':
                                algorithm_description = algorithm_description + f"MaxPooling1D, Hyperparameters: Pool size: {model.algorithm.layers[i].layer.pool_size}"
                            case 'flatten':
                                algorithm_description = algorithm_description + f"Flatten"
                case NNSearchPost():
                    if model.hyperparameters_tuning == "exhaustivesearch":
                        algorithm_description = f"Hyperparameters tuning: Exhaustive Search"
                    else:
                        algorithm_description = f"Hyperparameters tuning: Random Search, Iterations: {model.iterations}"

            dataset = DatasetRepository(self.db).find_by_id(model.dataset_id)
            model = Training(
                name=uuid.uuid4(),
                device_mender_id=model.device_mender_id,
                monitoring_script_name=model.monitoring_script_name,
                dataset=dataset,
                path="",
                algorithm_description=algorithm_description,
                confusion_matrix_path="",
                accuracy_path="",
                loss_path="",
                type="Classifier" if model.type == "Classifier" else "Anomaly detection",
                method="Machine learning" if model.method == "ml" else "Deep learning",
                status="In queue",
                log_error="",
                validation_output="",
                threshold=0.0
            )
            self.training_repository.save(model)
            trainings.append(model)

        background_tasks.add_task(self._generate_models, training_post, trainings)
        return self.find_all()

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

    def _apply_gnb(self, model, training):
        from sklearn.naive_bayes import GaussianNB
        df_training = pd.read_csv(training.dataset.training_path)
        df_testing = pd.read_csv(training.dataset.testing_path)

        if model.labels[0] != "All classes":
            df_training = df_training[df_training['label'].isin(model.labels)]
            df_testing = df_testing[df_testing['label'].isin(model.labels)]

            labels_selected = sorted(model.labels)
        else:
            labels_selected = sorted(df_training["label"].unique())

        df_testing = self._apply_transformations(df_testing, training.dataset.processings)

        X_train = df_training.drop('label', axis=1)
        X_test = df_testing.drop('label', axis=1)
        y_train = df_training['label']
        y_test = df_testing['label']

        del df_training
        del df_testing

        clf = GaussianNB()

        clf.fit(X_train, y_train)

        y_pred = clf.predict(X_test)
        conf_mat = confusion_matrix(y_test, y_pred, labels=labels_selected)
        row_sums = conf_mat.sum(axis=1, keepdims=True)
        confusion_matrix_normalized = conf_mat / row_sums

        # plt.figure(figsize=(5, 4))
        sns.heatmap(confusion_matrix_normalized, annot=True, cmap='Blues', fmt='.2f', cbar=False,
                    xticklabels=labels_selected, yticklabels=labels_selected)

        plt.title("GNB: Confusion matrix")
        plt.xlabel("")
        plt.ylabel("")

        confusion_matrix_path = f"imgs/{uuid.uuid4()}.png"
        plt.tight_layout()

        plt.savefig(confusion_matrix_path)
        plt.clf()

        model_path = f"trainings/{uuid.uuid4()}.joblib"

        dump(clf, model_path)

        training.validation_output = classification_report(y_test, y_pred, target_names=labels_selected)

        training.status = "Trained"
        training.path = model_path
        training.confusion_matrix_path = confusion_matrix_path

    def _apply_knn(self, model, training):
        from sklearn.neighbors import KNeighborsClassifier

        df_training = pd.read_csv(training.dataset.training_path)
        df_testing = pd.read_csv(training.dataset.testing_path)

        if model.labels[0] != "All classes":
            df_training = df_training[df_training['label'].isin(model.labels)]
            df_testing = df_testing[df_testing['label'].isin(model.labels)]

            labels_selected = sorted(model.labels)
        else:
            labels_selected = sorted(df_training["label"].unique())

        df_testing = self._apply_transformations(df_testing, training.dataset.processings)

        X_train = df_training.drop('label', axis=1)
        X_test = df_testing.drop('label', axis=1)
        y_train = df_training['label']
        y_test = df_testing['label']

        del df_training
        del df_testing

        clf = KNeighborsClassifier(n_neighbors=model.algorithm.knn_n_neighbors)

        clf.fit(X_train, y_train)
        y_pred = clf.predict(X_test)
        conf_mat = confusion_matrix(y_test, y_pred, labels=labels_selected)
        row_sums = conf_mat.sum(axis=1, keepdims=True)
        confusion_matrix_normalized = conf_mat / row_sums

        # plt.figure(figsize=(5, 4))
        sns.heatmap(confusion_matrix_normalized, annot=True, cmap='Blues', fmt='.2f', cbar=False,
                    xticklabels=labels_selected, yticklabels=labels_selected)
        plt.xlabel("")
        plt.ylabel("")
        plt.title("KNN: Confusion matrix")

        confusion_matrix_path = f"imgs/{uuid.uuid4()}.png"
        plt.tight_layout()

        plt.savefig(confusion_matrix_path)
        plt.clf()

        model_path = f"trainings/{uuid.uuid4()}.joblib"

        dump(clf, model_path)
        training.validation_output = classification_report(y_test, y_pred, target_names=labels_selected)

        training.status = "Trained"
        training.path = model_path
        training.confusion_matrix_path = confusion_matrix_path

    def _apply_knn_search(self, model, training):
        from sklearn.neighbors import KNeighborsClassifier

        df_training = pd.read_csv(training.dataset.training_path)
        df_testing = pd.read_csv(training.dataset.testing_path)

        if model.labels[0] != "All classes":
            df_training = df_training[df_training['label'].isin(model.labels)]
            df_testing = df_testing[df_testing['label'].isin(model.labels)]

            labels_selected = sorted(model.labels)
        else:
            labels_selected = sorted(df_training["label"].unique())

        df_testing = self._apply_transformations(df_testing, training.dataset.processings)

        X_train = df_training.drop('label', axis=1)
        X_test = df_testing.drop('label', axis=1)
        y_train = df_training['label']
        y_test = df_testing['label']

        del df_training
        del df_testing

        param = {'n_neighbors': model.algorithm.search_knn_n_neighbors}

        if model.hyperparameters_tuning == "exhaustivesearch":
            search_model = GridSearchCV(KNeighborsClassifier(), param_grid=param, cv=model.folds, scoring='accuracy')
        else:
            search_model = RandomizedSearchCV(KNeighborsClassifier(), param_distributions=param,
                                              n_iter=model.iterations, cv=model.folds,
                                              scoring='accuracy', random_state=42)

        search_model.fit(X_train, y_train)

        y_pred = search_model.predict(X_test)
        conf_mat = confusion_matrix(y_test, y_pred, labels=labels_selected)
        row_sums = conf_mat.sum(axis=1, keepdims=True)
        confusion_matrix_normalized = conf_mat / row_sums

        # plt.figure(figsize=(5, 4))
        sns.heatmap(confusion_matrix_normalized, annot=True, cmap='Blues', fmt='.2f', cbar=False,
                    xticklabels=labels_selected, yticklabels=labels_selected)
        plt.xlabel("")
        plt.ylabel("")
        plt.title("KNN: Confusion matrix")

        confusion_matrix_path = f"imgs/{uuid.uuid4()}.png"
        plt.tight_layout()

        plt.savefig(confusion_matrix_path)
        plt.clf()

        model_path = f"trainings/{uuid.uuid4()}.joblib"

        dump(search_model, model_path)
        training.validation_output = classification_report(y_test, y_pred, target_names=labels_selected)

        training.status = "Trained"
        training.algorithm_description = training.algorithm_description + f"\nHyperparameters: Number of neighbors: {search_model.best_params_['n_neighbors']}"
        training.path = model_path
        training.confusion_matrix_path = confusion_matrix_path

    def _apply_svm(self, model, training):
        from sklearn.svm import SVC

        df_training = pd.read_csv(training.dataset.training_path)
        df_testing = pd.read_csv(training.dataset.testing_path)

        if model.labels[0] != "All classes":
            df_training = df_training[df_training['label'].isin(model.labels)]
            df_testing = df_testing[df_testing['label'].isin(model.labels)]

            labels_selected = sorted(model.labels)
        else:
            labels_selected = sorted(df_training["label"].unique())

        df_testing = self._apply_transformations(df_testing, training.dataset.processings)

        X_train = df_training.drop('label', axis=1)
        X_test = df_testing.drop('label', axis=1)
        y_train = df_training['label']
        y_test = df_testing['label']

        del df_training
        del df_testing

        clf = SVC(C=model.algorithm.svm_C, kernel=model.algorithm.svm_kernel, gamma=model.algorithm.svm_gamma)

        clf.fit(X_train, y_train)

        y_pred = clf.predict(X_test)

        conf_mat = confusion_matrix(y_test, y_pred, labels=labels_selected)
        row_sums = conf_mat.sum(axis=1, keepdims=True)
        confusion_matrix_normalized = conf_mat / row_sums

        # plt.figure(figsize=(5, 4))
        sns.heatmap(confusion_matrix_normalized, annot=True, cmap='Blues', fmt='.2f', cbar=False,
                    xticklabels=labels_selected, yticklabels=labels_selected)
        plt.xlabel("")
        plt.ylabel("")
        plt.title("SVM: Confusion matrix")

        confusion_matrix_path = f"imgs/{uuid.uuid4()}.png"
        plt.tight_layout()

        plt.savefig(confusion_matrix_path)
        plt.clf()

        model_path = f"trainings/{uuid.uuid4()}.joblib"

        dump(clf, model_path)
        training.validation_output = classification_report(y_test, y_pred, target_names=labels_selected)

        training.status = "Trained"
        training.path = model_path
        training.confusion_matrix_path = confusion_matrix_path

    def _apply_svm_search(self, model, training):
        from sklearn.svm import SVC

        df_training = pd.read_csv(training.dataset.training_path)
        df_testing = pd.read_csv(training.dataset.testing_path)

        if model.labels[0] != "All classes":
            df_training = df_training[df_training['label'].isin(model.labels)]
            df_testing = df_testing[df_testing['label'].isin(model.labels)]

            labels_selected = sorted(model.labels)
        else:
            labels_selected = sorted(df_training["label"].unique())

        df_testing = self._apply_transformations(df_testing, training.dataset.processings)

        X_train = df_training.drop('label', axis=1)
        X_test = df_testing.drop('label', axis=1)
        y_train = df_training['label']
        y_test = df_testing['label']

        del df_training
        del df_testing

        param = {'C': model.algorithm.search_svm_C, 'kernel': model.algorithm.search_svm_kernel,
                 'gamma': model.algorithm.search_svm_gamma}

        if model.hyperparameters_tuning == "exhaustivesearch":
            search_model = GridSearchCV(SVC(), param_grid=param, cv=model.folds, scoring='accuracy')
        else:
            search_model = RandomizedSearchCV(SVC(), param_distributions=param, n_iter=model.iterations, cv=model.folds,
                                              scoring='accuracy', random_state=42)

        search_model.fit(X_train, y_train)

        y_pred = search_model.predict(X_test)
        conf_mat = confusion_matrix(y_test, y_pred, labels=labels_selected)
        row_sums = conf_mat.sum(axis=1, keepdims=True)
        confusion_matrix_normalized = conf_mat / row_sums

        # plt.figure(figsize=(5, 4))
        sns.heatmap(confusion_matrix_normalized, annot=True, cmap='Blues', fmt='.2f', cbar=False,
                    xticklabels=labels_selected, yticklabels=labels_selected)
        plt.xlabel("")
        plt.ylabel("")
        plt.title("SVM: Confusion matrix")

        confusion_matrix_path = f"imgs/{uuid.uuid4()}.png"
        plt.tight_layout()

        plt.savefig(confusion_matrix_path)
        plt.clf()

        model_path = f"trainings/{uuid.uuid4()}.joblib"

        dump(search_model, model_path)
        training.validation_output = classification_report(y_test, y_pred, target_names=labels_selected)

        training.status = "Trained"
        training.path = model_path
        training.confusion_matrix_path = confusion_matrix_path
        training.algorithm_description = training.algorithm_description + f"\nHyperparameters: C: {search_model.best_params_['C']}, Kernel: {search_model.best_params_['kernel']}, Gamma: {search_model.best_params_['gamma']}"

    def _apply_sgd(self, model, training):
        from sklearn.linear_model import SGDClassifier

        df_training = pd.read_csv(training.dataset.training_path)
        df_testing = pd.read_csv(training.dataset.testing_path)

        if model.labels[0] != "All classes":
            df_training = df_training[df_training['label'].isin(model.labels)]
            df_testing = df_testing[df_testing['label'].isin(model.labels)]

            labels_selected = sorted(model.labels)
        else:
            labels_selected = sorted(df_training["label"].unique())

        df_testing = self._apply_transformations(df_testing, training.dataset.processings)

        X_train = df_training.drop('label', axis=1)
        X_test = df_testing.drop('label', axis=1)
        y_train = df_training['label']
        y_test = df_testing['label']

        del df_training
        del df_testing

        clf = SGDClassifier(loss=model.algorithm.sgd_loss,
                            penalty=None if model.algorithm.sgd_penalty == 'none' else model.algorithm.sgd_penalty,
                            alpha=model.algorithm.sgd_alpha,
                            learning_rate=model.algorithm.sgd_learning_rate,
                            eta0=0.1 if model.algorithm.sgd_learning_rate == 'constant' or model.algorithm.sgd_learning_rate == 'invscaling' else 0.0)

        clf.fit(X_train, y_train)

        y_pred = clf.predict(X_test)

        conf_mat = confusion_matrix(y_test, y_pred, labels=labels_selected)
        row_sums = conf_mat.sum(axis=1, keepdims=True)
        confusion_matrix_normalized = conf_mat / row_sums

        # plt.figure(figsize=(5, 4))
        sns.heatmap(confusion_matrix_normalized, annot=True, cmap='Blues', fmt='.2f', cbar=False,
                    xticklabels=labels_selected, yticklabels=labels_selected)
        plt.xlabel("")
        plt.ylabel("")
        plt.title("SGD: Confusion matrix")

        confusion_matrix_path = f"imgs/{uuid.uuid4()}.png"
        plt.tight_layout()

        plt.savefig(confusion_matrix_path)
        plt.clf()

        model_path = f"trainings/{uuid.uuid4()}.joblib"

        dump(clf, model_path)

        training.validation_output = classification_report(y_test, y_pred, target_names=labels_selected)
        training.status = "Trained"
        training.path = model_path
        training.confusion_matrix_path = confusion_matrix_path

    def _apply_sgd_search(self, model, training):
        from sklearn.linear_model import SGDClassifier

        df_training = pd.read_csv(training.dataset.training_path)
        df_testing = pd.read_csv(training.dataset.testing_path)

        if model.labels[0] != "All classes":
            df_training = df_training[df_training['label'].isin(model.labels)]
            df_testing = df_testing[df_testing['label'].isin(model.labels)]

            labels_selected = sorted(model.labels)
        else:
            labels_selected = sorted(df_training["label"].unique())

        df_testing = self._apply_transformations(df_testing, training.dataset.processings)

        X_train = df_training.drop('label', axis=1)
        X_test = df_testing.drop('label', axis=1)
        y_train = df_training['label']
        y_test = df_testing['label']

        del df_training
        del df_testing

        result = list(map(lambda x: None if x == "none" else x, model.algorithm.search_sgd_penalty))
        param = {'loss': model.algorithm.search_sgd_loss,
                 'penalty': result,
                 'alpha': model.algorithm.search_sgd_alpha,
                 'learning_rate': model.algorithm.search_sgd_learning_rate}

        if model.hyperparameters_tuning == "exhaustivesearch":
            search_model = GridSearchCV(SGDClassifier(), param_grid=param, cv=model.folds, scoring='accuracy')
        else:
            search_model = RandomizedSearchCV(SGDClassifier(), param_distributions=param, n_iter=model.iterations,
                                              cv=model.folds,
                                              scoring='accuracy', random_state=42)

        search_model.fit(X_train, y_train)

        y_pred = search_model.predict(X_test)

        conf_mat = confusion_matrix(y_test, y_pred, labels=labels_selected)
        row_sums = conf_mat.sum(axis=1, keepdims=True)
        confusion_matrix_normalized = conf_mat / row_sums

        # plt.figure(figsize=(5, 4))
        sns.heatmap(confusion_matrix_normalized, annot=True, cmap='Blues', fmt='.2f', cbar=False,
                    xticklabels=labels_selected, yticklabels=labels_selected)

        plt.xlabel("")
        plt.ylabel("")
        plt.title("SGD: Confusion matrix")

        confusion_matrix_path = f"imgs/{uuid.uuid4()}.png"
        plt.tight_layout()

        plt.savefig(confusion_matrix_path)
        plt.clf()

        model_path = f"trainings/{uuid.uuid4()}.joblib"

        dump(search_model, model_path)

        training.validation_output = classification_report(y_test, y_pred, target_names=labels_selected)
        training.status = "Trained"
        training.path = model_path
        training.confusion_matrix_path = confusion_matrix_path
        training.algorithm_description = training.algorithm_description + f"\nHyperparameters: Loss: {search_model.best_params_['loss']}, Penalty: {search_model.best_params_['penalty']}, Alpha: {search_model.best_params_['alpha']}, Learning Rate: {search_model.best_params_['learning_rate']}"

    def _apply_dt(self, model, training):
        from sklearn.tree import DecisionTreeClassifier

        df_training = pd.read_csv(training.dataset.training_path)
        df_testing = pd.read_csv(training.dataset.testing_path)

        if model.labels[0] != "All classes":
            df_training = df_training[df_training['label'].isin(model.labels)]
            df_testing = df_testing[df_testing['label'].isin(model.labels)]

            labels_selected = sorted(model.labels)
        else:
            labels_selected = sorted(df_training["label"].unique())

        df_testing = self._apply_transformations(df_testing, training.dataset.processings)

        X_train = df_training.drop('label', axis=1)
        X_test = df_testing.drop('label', axis=1)
        y_train = df_training['label']
        y_test = df_testing['label']

        del df_training
        del df_testing

        clf = DecisionTreeClassifier(
            max_depth=None if model.algorithm.dt_max_depth == "" else model.algorithm.dt_max_depth,
            min_samples_split=model.algorithm.dt_min_samples_split)

        clf.fit(X_train, y_train)

        y_pred = clf.predict(X_test)

        conf_mat = confusion_matrix(y_test, y_pred, labels=labels_selected)
        row_sums = conf_mat.sum(axis=1, keepdims=True)
        confusion_matrix_normalized = conf_mat / row_sums

        # plt.figure(figsize=(5, 4))
        sns.heatmap(confusion_matrix_normalized, annot=True, cmap='Blues', fmt='.2f', cbar=False,
                    xticklabels=labels_selected, yticklabels=labels_selected)
        plt.title("DT: Confusion matrix")
        plt.xlabel("")
        plt.ylabel("")

        confusion_matrix_path = f"imgs/{uuid.uuid4()}.png"
        plt.tight_layout()

        plt.savefig(confusion_matrix_path)
        plt.clf()

        model_path = f"trainings/{uuid.uuid4()}.joblib"

        dump(clf, model_path)
        training.validation_output = classification_report(y_test, y_pred, target_names=labels_selected)

        training.status = "Trained"
        training.path = model_path
        training.confusion_matrix_path = confusion_matrix_path

    def _apply_dt_search(self, model, training):
        from sklearn.tree import DecisionTreeClassifier

        df_training = pd.read_csv(training.dataset.training_path)
        df_testing = pd.read_csv(training.dataset.testing_path)

        if model.labels[0] != "All classes":
            df_training = df_training[df_training['label'].isin(model.labels)]
            df_testing = df_testing[df_testing['label'].isin(model.labels)]

            labels_selected = sorted(model.labels)
        else:
            labels_selected = sorted(df_training["label"].unique())

        df_testing = self._apply_transformations(df_testing, training.dataset.processings)

        X_train = df_training.drop('label', axis=1)
        X_test = df_testing.drop('label', axis=1)
        y_train = df_training['label']
        y_test = df_testing['label']

        del df_training
        del df_testing

        result = list(map(lambda x: None if x == "None" else x, model.algorithm.search_dt_max_depth))
        param = {'max_depth': result,
                 'min_samples_split': model.algorithm.search_dt_min_samples_split}

        if model.hyperparameters_tuning == "exhaustivesearch":
            search_model = GridSearchCV(DecisionTreeClassifier(), param_grid=param, cv=model.folds, scoring='accuracy')
        else:
            search_model = RandomizedSearchCV(DecisionTreeClassifier(), param_distributions=param,
                                              n_iter=model.iterations, cv=model.folds,
                                              scoring='accuracy', random_state=42)

        search_model.fit(X_train, y_train)

        y_pred = search_model.predict(X_test)

        conf_mat = confusion_matrix(y_test, y_pred, labels=labels_selected)
        row_sums = conf_mat.sum(axis=1, keepdims=True)
        confusion_matrix_normalized = conf_mat / row_sums

        # plt.figure(figsize=(5, 4))
        sns.heatmap(confusion_matrix_normalized, annot=True, cmap='Blues', fmt='.2f', cbar=False,
                    xticklabels=labels_selected, yticklabels=labels_selected)
        plt.title("DT: Confusion matrix")
        plt.xlabel("")
        plt.ylabel("")

        confusion_matrix_path = f"imgs/{uuid.uuid4()}.png"
        plt.tight_layout()

        plt.savefig(confusion_matrix_path)
        plt.clf()

        model_path = f"trainings/{uuid.uuid4()}.joblib"

        dump(search_model, model_path)
        training.validation_output = classification_report(y_test, y_pred, target_names=labels_selected)

        training.status = "Trained"
        training.path = model_path
        training.confusion_matrix_path = confusion_matrix_path

        training.algorithm_description = training.algorithm_description + f"\nHyperparameters: Maximum depth of the tree: {search_model.best_params_['max_depth']}, Minimum number of samples: {search_model.best_params_['min_samples_split']}"

    def _apply_rf(self, model, training):
        from sklearn.ensemble import RandomForestClassifier

        df_training = pd.read_csv(training.dataset.training_path)
        df_testing = pd.read_csv(training.dataset.testing_path)

        if model.labels[0] != "All classes":
            df_training = df_training[df_training['label'].isin(model.labels)]
            df_testing = df_testing[df_testing['label'].isin(model.labels)]

            labels_selected = sorted(model.labels)
        else:
            labels_selected = sorted(df_training["label"].unique())

        df_testing = self._apply_transformations(df_testing, training.dataset.processings)

        X_train = df_training.drop('label', axis=1)
        X_test = df_testing.drop('label', axis=1)
        y_train = df_training['label']
        y_test = df_testing['label']

        del df_training
        del df_testing

        clf = RandomForestClassifier(n_estimators=model.algorithm.rf_n_estimators,
                                     max_depth=None if model.algorithm.rf_max_depth == "" else model.algorithm.rf_max_depth,
                                     min_samples_split=model.algorithm.rf_min_samples_split,
                                     bootstrap=False)

        clf.fit(X_train, y_train)

        y_pred = clf.predict(X_test)

        conf_mat = confusion_matrix(y_test, y_pred, labels=labels_selected)
        row_sums = conf_mat.sum(axis=1, keepdims=True)
        confusion_matrix_normalized = conf_mat / row_sums

        sns.heatmap(confusion_matrix_normalized, annot=True, cmap='Blues', fmt='.2f', cbar=False,
                    xticklabels=labels_selected, yticklabels=labels_selected)
        plt.title("RF: Confusion matrix")
        plt.xlabel("")
        plt.ylabel("")

        plt.tight_layout()

        confusion_matrix_path = f"imgs/{uuid.uuid4()}.png"
        plt.savefig(confusion_matrix_path)
        plt.clf()

        model_path = f"trainings/{uuid.uuid4()}.joblib"

        dump(clf, model_path)
        training.validation_output = classification_report(y_test, y_pred, target_names=labels_selected)

        training.status = "Trained"
        training.path = model_path
        training.confusion_matrix_path = confusion_matrix_path

    def _apply_rf_search(self, model, training):
        from sklearn.ensemble import RandomForestClassifier

        df_training = pd.read_csv(training.dataset.training_path)
        df_testing = pd.read_csv(training.dataset.testing_path)

        if model.labels[0] != "All classes":
            df_training = df_training[df_training['label'].isin(model.labels)]
            df_testing = df_testing[df_testing['label'].isin(model.labels)]

            labels_selected = sorted(model.labels)
        else:
            labels_selected = sorted(df_training["label"].unique())

        df_testing = self._apply_transformations(df_testing, training.dataset.processings)

        X_train = df_training.drop('label', axis=1)
        X_test = df_testing.drop('label', axis=1)
        y_train = df_training['label']
        y_test = df_testing['label']

        del df_training
        del df_testing

        result = list(map(lambda x: None if x == "None" else int(x), model.algorithm.search_rf_max_depth))
        param = {'n_estimators': model.algorithm.search_rf_n_estimators,
                 'max_depth': result,
                 'min_samples_split': model.algorithm.search_rf_min_samples_split,
                 'bootstrap': [False]}

        if model.hyperparameters_tuning == "exhaustivesearch":
            search_model = GridSearchCV(RandomForestClassifier(), param_grid=param, cv=model.folds, scoring='accuracy')
        else:
            search_model = RandomizedSearchCV(RandomForestClassifier(), param_distributions=param,
                                              n_iter=model.iterations, cv=model.folds,
                                              scoring='accuracy', random_state=42)

        search_model.fit(X_train, y_train)

        y_pred = search_model.predict(X_test)

        conf_mat = confusion_matrix(y_test, y_pred, labels=labels_selected)
        row_sums = conf_mat.sum(axis=1, keepdims=True)
        confusion_matrix_normalized = conf_mat / row_sums

        # plt.figure(figsize=(5, 4))
        sns.heatmap(confusion_matrix_normalized, annot=True, cmap='Blues', fmt='.2f', cbar=False,
                    xticklabels=labels_selected, yticklabels=labels_selected)
        plt.title("RF: Confusion matrix")
        plt.xlabel("")
        plt.ylabel("")

        plt.tight_layout()

        confusion_matrix_path = f"imgs/{uuid.uuid4()}.png"
        plt.savefig(confusion_matrix_path)
        plt.clf()

        model_path = f"trainings/{uuid.uuid4()}.joblib"

        dump(search_model, model_path)
        training.validation_output = classification_report(y_test, y_pred, target_names=labels_selected)

        training.status = "Trained"
        training.path = model_path
        training.confusion_matrix_path = confusion_matrix_path
        training.algorithm_description = training.algorithm_description + f"\nHyperparameters: Number of trees in the forest: {search_model.best_params_['n_estimators']}, Maximum depth of the tree: {search_model.best_params_['max_depth']}, Minimum number of samples: {search_model.best_params_['min_samples_split']}"

    def _apply_lof(self, model, training):
        from sklearn.neighbors import LocalOutlierFactor

        df_training = pd.read_csv(training.dataset.training_path)
        df_testing = pd.read_csv(training.dataset.testing_path)

        if model.labels[0] != "All classes":
            df_testing = df_testing[df_testing['label'].isin(model.labels)]

        df_testing = self._apply_transformations(df_testing, training.dataset.processings)

        feature_columns = df_training.drop('label', axis=1).columns.tolist()

        detector = LocalOutlierFactor(novelty=True, n_neighbors=model.algorithm.lof_n_neighbors,
                                      contamination=model.algorithm.lof_contamination)

        detector.fit(df_training[feature_columns])

        df_testing['predicted_label'] = detector.predict(df_testing[feature_columns])
        df_testing['predicted_label'] = df_testing['predicted_label'].map({-1: 'Abnormal', 1: 'Normal'})

        confusion_matrix_plot = pd.crosstab(df_testing['label'], df_testing['predicted_label'])
        all_categories = ['Normal', 'Abnormal']
        confusion_matrix_plot = confusion_matrix_plot.reindex(columns=all_categories, fill_value=0)

        confusion_matrix_decimal = confusion_matrix_plot.apply(lambda x: x / x.sum(), axis=1)

        plt.figure(figsize=(5, 4))
        sns.heatmap(confusion_matrix_decimal, annot=True, cmap='Blues', fmt='.2f', cbar=False)
        plt.xlabel("")
        plt.ylabel("")

        plt.title('LOF: Confusion Matrix')

        confusion_matrix_path = f"imgs/{uuid.uuid4()}.png"
        plt.tight_layout()

        plt.savefig(confusion_matrix_path)
        plt.clf()

        model_path = f"trainings/{uuid.uuid4()}.joblib"

        dump(detector, model_path)

        training.status = "Trained"
        training.path = model_path
        training.confusion_matrix_path = confusion_matrix_path

    def _apply_lof_search(self, model, training):
        from sklearn.neighbors import LocalOutlierFactor

        df_training = pd.read_csv(training.dataset.training_path)
        df_testing = pd.read_csv(training.dataset.testing_path)

        if model.labels[0] != "All classes":
            df_testing = df_testing[df_testing['label'].isin(model.labels)]

        df_testing = self._apply_transformations(df_testing, training.dataset.processings)

        feature_columns = df_training.drop('label', axis=1).columns.tolist()

        best_auc = -1
        best_model = None
        best_average = -1

        df_testing['label_transformed'] = df_testing['label'].apply(lambda x: 1 if x == "Normal" else 0)

        if model.hyperparameters_tuning == "exhaustivesearch":
            for n_neighbors in model.algorithm.search_lof_n_neighbors:
                for contamination in model.algorithm.search_lof_contamination:
                    detector = LocalOutlierFactor(novelty=True, n_neighbors=n_neighbors, contamination=contamination)

                    detector.fit(df_training[feature_columns])
                    df_testing['predicted_label'] = detector.predict(df_testing[feature_columns])
                    if model.evaluation_metric == "AUC":
                        scores = detector.decision_function(df_testing[feature_columns])
                        auc = roc_auc_score(df_testing['label_transformed'].tolist(), scores)
                        if auc > best_auc:
                            best_auc = auc
                            best_model = detector
                            df_testing['best_predicted_label'] = df_testing['predicted_label']
                    elif model.evaluation_metric == 'average':
                        y_pred = df_testing['predicted_label'].where(df_testing['predicted_label'] != -1, 0)
                        TN, FP, FN, TP = confusion_matrix(df_testing['label_transformed'].tolist(), y_pred).ravel()
                        TPR = TP / (TP + FN)
                        TNR = TN / (TN + FP)
                        average = (TPR + TNR) / 2
                        if average > best_average:
                            best_average = average
                            best_model = detector
                            df_testing['best_predicted_label'] = df_testing['predicted_label']
        else:
            for _ in range(model.iterations):

                detector = LocalOutlierFactor(novelty=True,
                                              n_neighbors=random.choice(model.algorithm.search_lof_n_neighbors),
                                              contamination=random.choice(model.algorithm.search_lof_contamination))

                detector.fit(df_training[feature_columns])
                df_testing['predicted_label'] = detector.predict(df_testing[feature_columns])
                if model.evaluation_metric == "AUC":
                    scores = detector.decision_function(df_testing[feature_columns])
                    auc = roc_auc_score(df_testing['label_transformed'].tolist(), scores)
                    if auc > best_auc:
                        best_auc = auc
                        best_model = detector
                        df_testing['best_predicted_label'] = df_testing['predicted_label']
                elif model.evaluation_metric == 'average':
                    y_pred = df_testing['predicted_label'].where(df_testing['predicted_label'] != -1, 0)
                    TN, FP, FN, TP = confusion_matrix(df_testing['label_transformed'].tolist(), y_pred).ravel()
                    TPR = TP / (TP + FN)
                    TNR = TN / (TN + FP)
                    average = (TPR + TNR) / 2
                    if average > best_average:
                        best_average = average
                        best_model = detector
                        df_testing['best_predicted_label'] = df_testing['predicted_label']

        df_testing['best_predicted_label'] = df_testing['best_predicted_label'].map({-1: 'Abnormal', 1: 'Normal'})

        confusion_matrix_plot = pd.crosstab(df_testing['label'], df_testing['best_predicted_label'])

        all_categories = ['Normal', 'Abnormal']
        confusion_matrix_plot = confusion_matrix_plot.reindex(columns=all_categories, fill_value=0)

        confusion_matrix_decimal = confusion_matrix_plot.apply(lambda x: x / x.sum(), axis=1)

        plt.figure(figsize=(5, 4))
        sns.heatmap(confusion_matrix_decimal, annot=True, cmap='Blues', fmt='.2f', cbar=False)
        plt.xlabel("")
        plt.ylabel("")

        plt.title('LOF: Confusion Matrix')

        confusion_matrix_path = f"imgs/{uuid.uuid4()}.png"
        plt.tight_layout()

        plt.savefig(confusion_matrix_path)
        plt.clf()

        model_path = f"trainings/{uuid.uuid4()}.joblib"

        dump(best_model, model_path)

        training.status = "Trained"
        training.path = model_path
        training.confusion_matrix_path = confusion_matrix_path
        if model.evaluation_metric == 'AUC':
            training.algorithm_description = training.algorithm_description + f": {best_auc}"
        else:
            training.algorithm_description = training.algorithm_description + f": {best_average}"
        training.algorithm_description = training.algorithm_description + f"\nHyperparameters: Number of neighbors: {best_model.get_params()['n_neighbors']}, Contamination: {best_model.get_params()['contamination']}"

    def _apply_ocsvm(self, model, training):
        from sklearn.svm import OneClassSVM

        df_training = pd.read_csv(training.dataset.training_path)
        df_testing = pd.read_csv(training.dataset.testing_path)

        if model.labels[0] != "All classes":
            df_testing = df_testing[df_testing['label'].isin(model.labels)]

        df_testing = self._apply_transformations(df_testing, training.dataset.processings)

        feature_columns = df_training.drop('label', axis=1).columns.tolist()

        detector = OneClassSVM(gamma=model.algorithm.ocsvm_gamma, kernel=model.algorithm.ocsvm_kernel,
                               nu=model.algorithm.ocsvm_nu)

        detector.fit(df_training[feature_columns])

        df_testing['predicted_label'] = detector.predict(df_testing[feature_columns])

        df_testing['predicted_label'] = df_testing['predicted_label'].map({-1: 'Abnormal', 1: 'Normal'})

        confusion_matrix_plot = pd.crosstab(df_testing['label'], df_testing['predicted_label'])
        all_categories = ['Normal', 'Abnormal']
        confusion_matrix_plot = confusion_matrix_plot.reindex(columns=all_categories, fill_value=0)
        confusion_matrix_decimal = confusion_matrix_plot.apply(lambda x: x / x.sum(), axis=1)

        plt.figure(figsize=(5, 4))
        sns.heatmap(confusion_matrix_decimal, annot=True, cmap='Blues', fmt='.2f', cbar=False)
        plt.xlabel("")
        plt.ylabel("")
        plt.title('OCSVM: Confusion Matrix')

        confusion_matrix_path = f"imgs/{uuid.uuid4()}.png"
        plt.tight_layout()

        plt.savefig(confusion_matrix_path)
        plt.clf()

        model_path = f"trainings/{uuid.uuid4()}.joblib"

        dump(detector, model_path)

        training.status = "Trained"
        training.path = model_path
        training.confusion_matrix_path = confusion_matrix_path

    def _apply_ocsvm_search(self, model, training):
        from sklearn.svm import OneClassSVM

        df_training = pd.read_csv(training.dataset.training_path)
        df_testing = pd.read_csv(training.dataset.testing_path)

        if model.labels[0] != "All classes":
            df_testing = df_testing[df_testing['label'].isin(model.labels)]

        df_testing = self._apply_transformations(df_testing, training.dataset.processings)
        df_testing['label_transformed'] = df_testing['label'].apply(lambda x: 1 if x == "Normal" else 0)

        feature_columns = df_training.drop('label', axis=1).columns.tolist()
        best_auc = -1
        best_average = -1
        best_model = None

        if model.hyperparameters_tuning == "exhaustivesearch":
            for gamma in model.algorithm.search_ocsvm_gamma:
                for kernel in model.algorithm.search_ocsvm_kernel:
                    for nu in model.algorithm.search_ocsvm_nu:

                        detector = OneClassSVM(gamma=gamma, kernel=kernel, nu=nu)

                        detector.fit(df_training[feature_columns])
                        df_testing['predicted_label'] = detector.predict(df_testing[feature_columns])
                        if model.evaluation_metric == "AUC":
                            scores = detector.decision_function(df_testing[feature_columns])
                            auc = roc_auc_score(df_testing['label_transformed'].tolist(), scores)
                            if auc > best_auc:
                                best_auc = auc
                                best_model = detector
                                df_testing['best_predicted_label'] = df_testing['predicted_label']
                        elif model.evaluation_metric == 'average':
                            y_pred = df_testing['predicted_label'].where(df_testing['predicted_label'] != -1, 0)
                            TN, FP, FN, TP = confusion_matrix(df_testing['label_transformed'].tolist(), y_pred).ravel()
                            TPR = TP / (TP + FN)
                            TNR = TN / (TN + FP)
                            average = (TPR + TNR) / 2
                            if average > best_average:
                                best_average = average
                                best_model = detector
                                df_testing['best_predicted_label'] = df_testing['predicted_label']


        else:
            for _ in range(model.iterations):

                detector = OneClassSVM(gamma=random.choice(model.algorithm.search_ocsvm_gamma),
                                       kernel=random.choice(model.algorithm.search_ocsvm_kernel),
                                       nu=random.choice(model.algorithm.search_ocsvm_nu))
                detector.fit(df_training[feature_columns])
                df_testing['predicted_label'] = detector.predict(df_testing[feature_columns])
                if model.evaluation_metric == "auc":
                    scores = detector.decision_function(df_testing[feature_columns])
                    auc = roc_auc_score(df_testing['label_transformed'].tolist(), scores)
                    if auc > best_auc:
                        best_auc = auc
                        best_model = detector
                        df_testing['best_predicted_label'] = df_testing['predicted_label']
                elif model.evaluation_metric == 'average':
                    y_pred = df_testing['predicted_label'].where(df_testing['predicted_label'] == -1, 0, 1)
                    TN, FP, FN, TP = confusion_matrix(df_testing['label_transformed'].tolist(), y_pred)
                    TPR = TP / (TP + FN)
                    TNR = TN / (TN + FP)
                    average = (TPR + TNR) / 2
                    if average > best_average:
                        best_average = average
                        best_model = detector
                        df_testing['best_predicted_label'] = df_testing['predicted_label']

        df_testing['best_predicted_label'] = df_testing['best_predicted_label'].map({-1: 'Abnormal', 1: 'Normal'})

        confusion_matrix_plot = pd.crosstab(df_testing['label'], df_testing['best_predicted_label'])

        all_categories = ['Normal', 'Abnormal']
        confusion_matrix_plot = confusion_matrix_plot.reindex(columns=all_categories, fill_value=0)

        confusion_matrix_decimal = confusion_matrix_plot.apply(lambda x: x / x.sum(), axis=1)

        plt.figure(figsize=(5, 4))
        sns.heatmap(confusion_matrix_decimal, annot=True, cmap='Blues', fmt='.2f', cbar=False)
        plt.xlabel("")
        plt.ylabel("")
        plt.title('OCSVM: Confusion Matrix')

        confusion_matrix_path = f"imgs/{uuid.uuid4()}.png"
        plt.tight_layout()

        plt.savefig(confusion_matrix_path)
        plt.clf()

        model_path = f"trainings/{uuid.uuid4()}.joblib"

        dump(best_model, model_path)

        training.status = "Trained"
        training.path = model_path
        training.confusion_matrix_path = confusion_matrix_path
        if model.evaluation_metric == 'AUC':
            training.algorithm_description = training.algorithm_description + f": {best_auc}"
        else:
            training.algorithm_description = training.algorithm_description + f": {best_average}"

        training.algorithm_description = training.algorithm_description + f"\nHyperparameters: Gamma: {best_model.get_params()['gamma']}, Kernel: {best_model.get_params()['kernel']}, Nu: {best_model.get_params()['nu']}"

    def _apply_if(self, model, training):
        from sklearn.ensemble import IsolationForest

        df_training = pd.read_csv(training.dataset.training_path)
        df_testing = pd.read_csv(training.dataset.testing_path)

        if model.labels[0] != "All classes":
            df_testing = df_testing[df_testing['label'].isin(model.labels)]

        df_testing = self._apply_transformations(df_testing, training.dataset.processings)

        feature_columns = df_training.drop('label', axis=1).columns.tolist()

        detector = IsolationForest(n_estimators=model.algorithm.if_n_estimators,
                                   contamination=model.algorithm.if_contamination)

        detector.fit(df_training[feature_columns])

        df_testing['predicted_label'] = detector.predict(df_testing[feature_columns])
        df_testing['predicted_label'] = df_testing['predicted_label'].map({-1: 'Abnormal', 1: 'Normal'})

        confusion_matrix_plot = pd.crosstab(df_testing['label'], df_testing['predicted_label'])

        all_categories = ['Normal', 'Abnormal']
        confusion_matrix_plot = confusion_matrix_plot.reindex(columns=all_categories, fill_value=0)
        confusion_matrix_decimal = confusion_matrix_plot.apply(lambda x: x / x.sum(), axis=1)

        plt.figure(figsize=(5, 4))
        sns.heatmap(confusion_matrix_decimal, annot=True, cmap='Blues', fmt='.2f', cbar=False)
        plt.xlabel("")
        plt.ylabel("")

        plt.title('IF: Confusion Matrix')

        confusion_matrix_path = f"imgs/{uuid.uuid4()}.png"
        plt.tight_layout()
        plt.savefig(confusion_matrix_path)
        plt.clf()

        model_path = f"trainings/{uuid.uuid4()}.joblib"

        dump(detector, model_path)

        training.status = "Trained"
        training.path = model_path
        training.confusion_matrix_path = confusion_matrix_path

    def _apply_if_search(self, model, training):
        from sklearn.ensemble import IsolationForest

        df_training = pd.read_csv(training.dataset.training_path)
        df_testing = pd.read_csv(training.dataset.testing_path)

        if model.labels[0] != "All classes":
            df_testing = df_testing[df_testing['label'].isin(model.labels)]

        df_testing = self._apply_transformations(df_testing, training.dataset.processings)

        feature_columns = df_training.drop('label', axis=1).columns.tolist()

        best_auc = -1
        best_model = None
        best_average = -1

        df_testing['label_transformed'] = df_testing['label'].apply(lambda x: 1 if x == "Normal" else 0)
        if model.hyperparameters_tuning == "exhaustivesearch":
            for n_estimators in model.algorithm.search_if_n_estimators:
                for contamination in model.algorithm.search_if_contamination:
                    detector = IsolationForest(n_estimators=n_estimators, contamination=contamination)

                    detector.fit(df_training[feature_columns])
                    df_testing['predicted_label'] = detector.predict(df_testing[feature_columns])
                    if model.evaluation_metric == "AUC":
                        scores = detector.decision_function(df_testing[feature_columns])
                        auc = roc_auc_score(df_testing['label_transformed'].tolist(), scores)
                        if auc > best_auc:
                            best_auc = auc
                            best_model = detector
                            df_testing['best_predicted_label'] = df_testing['predicted_label']
                    elif model.evaluation_metric == 'average':
                        y_pred = df_testing['predicted_label'].where(df_testing['predicted_label'] != -1, 0)
                        TN, FP, FN, TP = confusion_matrix(df_testing['label_transformed'].tolist(), y_pred).ravel()
                        TPR = TP / (TP + FN)
                        TNR = TN / (TN + FP)
                        average = (TPR + TNR) / 2
                        if average > best_average:
                            best_average = average
                            best_model = detector
                            df_testing['best_predicted_label'] = df_testing['predicted_label']
        else:
            for _ in range(model.iterations):

                detector = IsolationForest(n_estimators=random.choice(model.algorithm.search_if_n_estimators),
                                           contamination=random.choice(model.algorithm.search_if_contamination))

                detector.fit(df_training[feature_columns])
                df_testing['predicted_label'] = detector.predict(df_testing[feature_columns])
                if model.evaluation_metric == "AUC":
                    scores = detector.decision_function(df_testing[feature_columns])
                    auc = roc_auc_score(df_testing['label_transformed'].tolist(), scores)
                    if auc > best_auc:
                        best_auc = auc
                        best_model = detector
                        df_testing['best_predicted_label'] = df_testing['predicted_label']
                elif model.evaluation_metric == 'average':
                    y_pred = df_testing['predicted_label'].where(df_testing['predicted_label'] != -1, 0)
                    TN, FP, FN, TP = confusion_matrix(df_testing['label_transformed'].tolist(), y_pred).ravel()
                    TPR = TP / (TP + FN)
                    TNR = TN / (TN + FP)
                    average = (TPR + TNR) / 2
                    if average > best_average:
                        best_average = average
                        best_model = detector
                        df_testing['best_predicted_label'] = df_testing['predicted_label']

        df_testing['best_predicted_label'] = df_testing['best_predicted_label'].map({-1: 'Abnormal', 1: 'Normal'})

        confusion_matrix_plot = pd.crosstab(df_testing['label'], df_testing['best_predicted_label'])
        all_categories = ['Normal', 'Abnormal']
        confusion_matrix_plot = confusion_matrix_plot.reindex(columns=all_categories, fill_value=0)
        confusion_matrix_decimal = confusion_matrix_plot.apply(lambda x: x / x.sum(), axis=1)

        plt.figure(figsize=(5, 4))
        sns.heatmap(confusion_matrix_decimal, annot=True, cmap='Blues', fmt='.2f', cbar=False)
        plt.xlabel("")
        plt.ylabel("")
        plt.title('IF: Confusion Matrix')

        confusion_matrix_path = f"imgs/{uuid.uuid4()}.png"
        plt.tight_layout()

        plt.savefig(confusion_matrix_path)
        plt.clf()

        model_path = f"trainings/{uuid.uuid4()}.joblib"

        dump(best_model, model_path)

        training.status = "Trained"
        training.path = model_path
        training.confusion_matrix_path = confusion_matrix_path
        if model.evaluation_metric == 'AUC':
            training.algorithm_description = training.algorithm_description + f": {best_auc}"
        else:
            training.algorithm_description = training.algorithm_description + f": {best_average}"
        training.algorithm_description = training.algorithm_description + f"\nHyperparameters: Number of base estimators: {best_model.get_params()['n_estimators']}, Contamination: {best_model.get_params()['contamination']}"

    def _apply_dl_classifier(self, model, training):
        from keras.models import Sequential
        from keras.layers import Dense, Input, LSTM, GRU, RepeatVector, Conv1D, MaxPooling1D, Dropout, Flatten
        from keras.optimizers.legacy import Adam, SGD
        from ast import literal_eval
        from sklearn.preprocessing import LabelEncoder

        df_training = pd.read_csv(training.dataset.training_path)
        df_testing = pd.read_csv(training.dataset.testing_path)

        if model.labels[0] != "All classes":
            df_training = df_training[df_training['label'].isin(model.labels)]
            df_testing = df_testing[df_testing['label'].isin(model.labels)]

            labels_selected = sorted(model.labels)
        else:
            labels_selected = sorted(df_training["label"].unique())

        df_testing = self._apply_transformations(df_testing, training.dataset.processings)

        combined_data = pd.concat([df_training, df_testing], axis=0)
        le = LabelEncoder()
        le.fit(combined_data['label'])
        del combined_data

        df_training['label'] = le.transform(df_training['label'])
        df_testing['label'] = le.transform(df_testing['label'])

        X_train = df_training.drop('label', axis=1)
        X_test = df_testing.drop('label', axis=1)
        y_train = df_training['label']
        y_test = df_testing['label']

        del df_training
        del df_testing

        model_keras = Sequential()

        for layer in model.algorithm.layers:
            match layer.name:
                case "input":

                    model_keras.add(Input(shape=literal_eval(layer.layer.shape)))
                case 'dense':
                    model_keras.add(Dense(layer.layer.units, activation=layer.layer.activation))
                case 'lstm':
                    model_keras.add(LSTM(layer.layer.units, activation=layer.layer.activation,
                                         return_sequences=True if layer.layer.return_sequences == "yes" else False))
                    pass
                case 'gru':
                    model_keras.add(GRU(layer.layer.units, activation=layer.layer.activation,
                                        return_sequences=True if layer.layer.return_sequences == "yes" else False))

                    pass
                case 'repeat_vector':
                    model_keras.add(RepeatVector(n=layer.layer.n))

                case 'conv_1D':
                    model_keras.add(Conv1D(filters=layer.layer.filters, kernel_size=layer.layer.kernel_size,
                                           activation=layer.layer.activation))
                    pass
                case 'dropout':
                    model_keras.add(Dropout(rate=layer.layer.rate))

                    pass
                case 'max_pooling_1D':
                    model_keras.add(MaxPooling1D(pool_size=layer.layer.pool_size))
                    pass
                case 'flatten':
                    model_keras.add(Flatten())
                    pass

        opt = None

        if model.algorithm.optimizer == "adam":
            opt = Adam(learning_rate=model.algorithm.learning_rate)
        elif model.algorithm.optimizer == "sgd":
            opt = SGD(learning_rate=model.algorithm.learning_rate)

        model_keras.compile(loss=model.algorithm.loss, optimizer=opt, metrics=['accuracy'])
        history = model_keras.fit(X_train, y_train, epochs=model.algorithm.epochs,
                                  batch_size=model.algorithm.batch_size)

        loss, accuracy = model_keras.evaluate(X_test, y_test, verbose=0)
        plt.figure(figsize=(5, 4))
        plt.plot(history.history['accuracy'])
        plt.ylabel('Accuracy')
        plt.xlabel('Epoch')

        accuracy_path = f"imgs/{uuid.uuid4()}.png"
        plt.tight_layout()

        plt.savefig(accuracy_path)
        plt.clf()

        plt.figure(figsize=(5, 4))
        plt.plot(history.history['loss'])
        plt.ylabel('Loss')
        plt.xlabel('Epoch')

        loss_path = f"imgs/{uuid.uuid4()}.png"
        plt.tight_layout()

        plt.savefig(loss_path)
        plt.clf()

        y_pred = np.argmax(model_keras.predict(X_test), axis=-1)

        conf_mat = confusion_matrix(y_test, y_pred, labels=labels_selected)
        row_sums = conf_mat.sum(axis=1, keepdims=True)
        confusion_matrix_normalized = conf_mat / row_sums

        # plt.figure(figsize=(5, 4))
        sns.heatmap(confusion_matrix_normalized, annot=True, cmap='Blues', fmt='.2f', cbar=False,
                    xticklabels=labels_selected, yticklabels=labels_selected)
        plt.xlabel("")
        plt.ylabel("")
        plt.title("NN: Confusion matrix")

        confusion_matrix_path = f"imgs/{uuid.uuid4()}.png"
        plt.tight_layout()

        plt.savefig(confusion_matrix_path)
        plt.clf()

        model_path = f"trainings/{uuid.uuid4()}.h5"
        model_keras.save(model_path)

        training.status = "Trained"
        training.path = model_path
        training.confusion_matrix_path = confusion_matrix_path
        training.accuracy_path = accuracy_path
        training.loss_path = loss_path
        training.validation_output = f"Accuracy = {accuracy}, Loss = {loss}"

    def _apply_dl_classifier_search(self, model, training):
        from keras.models import Sequential
        from keras.layers import Dense, Input, LSTM, GRU, RepeatVector, Conv1D, MaxPooling1D, Dropout, Flatten
        from keras.optimizers.legacy import Adam, SGD
        from ast import literal_eval
        from sklearn.preprocessing import LabelEncoder
        from scikeras.wrappers import KerasClassifier

        df_training = pd.read_csv(training.dataset.training_path)
        df_testing = pd.read_csv(training.dataset.testing_path)

        if model.labels[0] != "All classes":
            df_training = df_training[df_training['label'].isin(model.labels)]
            df_testing = df_testing[df_testing['label'].isin(model.labels)]

            labels_selected = sorted(model.labels)
        else:
            labels_selected = sorted(df_training["label"].unique())

        df_testing = self._apply_transformations(df_testing, training.dataset.processings)

        combined_data = pd.concat([df_training, df_testing], axis=0)
        le = LabelEncoder()
        le.fit(combined_data['label'])
        del combined_data

        df_training['label'] = le.transform(df_training['label'])
        df_testing['label'] = le.transform(df_testing['label'])

        X_train = df_training.drop('label', axis=1)
        X_test = df_testing.drop('label', axis=1)
        y_train = df_training['label']
        y_test = df_testing['label']

        del df_training
        del df_testing

        def create_model(optimizer="adam"):
            clf = Sequential()
            for layer in model.algorithm.layers:
                match layer.name:
                    case "input":

                        clf.add(Input(shape=literal_eval(layer.layer.shape)))
                    case 'dense':
                        clf.add(Dense(layer.layer.units, activation=layer.layer.activation))
                    case 'lstm':
                        clf.add(LSTM(layer.layer.units, activation=layer.layer.activation,
                                     return_sequences=True if layer.layer.return_sequences == "yes" else False))
                        pass
                    case 'gru':
                        clf.add(GRU(layer.layer.units, activation=layer.layer.activation,
                                    return_sequences=True if layer.layer.return_sequences == "yes" else False))

                        pass
                    case 'repeat_vector':
                        clf.add(RepeatVector(n=layer.layer.n))

                    case 'conv_1D':
                        clf.add(Conv1D(filters=layer.layer.filters, kernel_size=layer.layer.kernel_size,
                                       activation=layer.layer.activation))
                        pass
                    case 'dropout':
                        clf.add(Dropout(rate=layer.layer.rate))

                        pass
                    case 'max_pooling_1D':
                        clf.add(MaxPooling1D(pool_size=layer.layer.pool_size))
                        pass
                    case 'flatten':
                        clf.add(Flatten())

            clf.compile(loss=model.algorithm.loss, optimizer=optimizer, metrics=['accuracy'])
            return clf

        clf = KerasClassifier(model=create_model, verbose=0)

        param_grid = {
            'epochs': model.algorithm.epochs,
            'optimizer': model.algorithm.optimizers,
            'optimizer__learning_rate': model.algorithm.learning_rates,
            'batch_size': model.algorithm.batch_sizes
        }

        if model.hyperparameters_tuning == "exhaustivesearch":
            search_model = GridSearchCV(estimator=clf, param_grid=param_grid, n_jobs=-1, cv=model.folds)
        else:
            search_model = RandomizedSearchCV(estimator=clf, param_distributions=param_grid,
                                              n_iter=model.iterations, cv=model.folds,
                                              scoring='accuracy', random_state=42)
        search_result = search_model.fit(X_train, y_train)
        del clf
        del search_model
        best_model_keras = Sequential()

        for layer in model.algorithm.layers:
            match layer.name:
                case "input":

                    best_model_keras.add(Input(shape=literal_eval(layer.layer.shape)))
                case 'dense':
                    best_model_keras.add(Dense(layer.layer.units, activation=layer.layer.activation))
                case 'lstm':
                    best_model_keras.add(LSTM(layer.layer.units, activation=layer.layer.activation,
                                              return_sequences=True if layer.layer.return_sequences == "yes" else False))
                    pass
                case 'gru':
                    best_model_keras.add(GRU(layer.layer.units, activation=layer.layer.activation,
                                             return_sequences=True if layer.layer.return_sequences == "yes" else False))

                    pass
                case 'repeat_vector':
                    best_model_keras.add(RepeatVector(n=layer.layer.n))

                case 'conv_1D':
                    best_model_keras.add(Conv1D(filters=layer.layer.filters, kernel_size=layer.layer.kernel_size,
                                                activation=layer.layer.activation))
                    pass
                case 'dropout':
                    best_model_keras.add(Dropout(rate=layer.layer.rate))

                    pass
                case 'max_pooling_1D':
                    best_model_keras.add(MaxPooling1D(pool_size=layer.layer.pool_size))
                    pass
                case 'flatten':
                    best_model_keras.add(Flatten())
                    pass

        opt = None
        if search_result.best_params_["optimizer"] == "adam":
            opt = Adam(learning_rate=search_result.best_params_["optimizer__learning_rate"])
        elif search_result.best_params_["optimizer"] == "sgd":
            opt = SGD(learning_rate=search_result.best_params_["optimizer__learning_rate"])

        best_model_keras.compile(loss=model.algorithm.loss, optimizer=opt, metrics=['accuracy'])
        history = best_model_keras.fit(X_train, y_train, epochs=search_result.best_params_["epochs"],
                                       batch_size=search_result.best_params_["batch_size"])
        loss, accuracy = best_model_keras.evaluate(X_test, y_test, verbose=0)
        plt.figure(figsize=(5, 4))
        plt.plot(history.history['accuracy'])
        plt.ylabel('Accuracy')
        plt.xlabel('Epoch')

        accuracy_path = f"imgs/{uuid.uuid4()}.png"
        plt.tight_layout()

        plt.savefig(accuracy_path)
        plt.clf()

        plt.figure(figsize=(5, 4))
        plt.plot(history.history['loss'])
        plt.ylabel('Loss')
        plt.xlabel('Epoch')

        loss_path = f"imgs/{uuid.uuid4()}.png"
        plt.tight_layout()

        plt.savefig(loss_path)
        plt.clf()

        y_pred = np.argmax(best_model_keras.predict(X_test), axis=-1)

        conf_mat = confusion_matrix(y_test, y_pred, labels=labels_selected)
        row_sums = conf_mat.sum(axis=1, keepdims=True)
        confusion_matrix_normalized = conf_mat / row_sums

        # plt.figure(figsize=(5, 4))
        sns.heatmap(confusion_matrix_normalized, annot=True, cmap='Blues', fmt='.2f', cbar=False,
                    xticklabels=labels_selected, yticklabels=labels_selected)
        plt.xlabel("")
        plt.ylabel("")
        plt.title("NN: Confusion matrix")

        confusion_matrix_path = f"imgs/{uuid.uuid4()}.png"
        plt.tight_layout()

        plt.savefig(confusion_matrix_path)
        plt.clf()

        model_path = f"trainings/{uuid.uuid4()}.h5"
        best_model_keras.save(model_path)

        training.status = "Trained"
        training.path = model_path
        training.confusion_matrix_path = confusion_matrix_path
        training.accuracy_path = accuracy_path
        training.loss_path = loss_path
        training.validation_output = f"Accuracy = {accuracy}, Loss = {loss}"
        training.algorithm_description = training.algorithm_description + f"\nHyperparameters: Epochs: {search_result.best_params_['epochs']}, Loss: {model.algorithm.loss}, Optimizer: {search_result.best_params_['optimizer']}, Learning rate: {search_result.best_params_['optimizer__learning_rate']}, Batch size: {search_result.best_params_['batch_size']}\nNeural Network composed of {len(model.algorithm.layers)} layers:"
        for i in range(len(model.algorithm.layers)):
            training.algorithm_description = training.algorithm_description + f"\n\tLayer {i + 1}: "
            match model.algorithm.layers[i].name:
                case "input":
                    training.algorithm_description = training.algorithm_description + f"Input, Hyperparameters: Shape {model.algorithm.layers[i].layer.shape}"
                case 'dense':
                    training.algorithm_description = training.algorithm_description + f"Dense, Hyperparameters: Units: {model.algorithm.layers[i].layer.units}, Activation: {model.algorithm.layers[i].layer.activation}"
                case 'lstm':
                    training.algorithm_description = training.algorithm_description + f"LSTM, Hyperparameters: Units: {model.algorithm.layers[i].layer.units}, Activation: {model.algorithm.layers[i].layer.activation}, Return sequences: {model.algorithm.layers[i].layer.return_sequences}"
                case 'gru':
                    training.algorithm_description = training.algorithm_description + f"LSTM, Hyperparameters: Units: {model.algorithm.layers[i].layer.units}, Activation: {model.algorithm.layers[i].layer.activation}, Return sequences: {model.algorithm.layers[i].layer.return_sequences}"
                case 'repeat_vector':
                    training.algorithm_description = training.algorithm_description + f"RepeatVector, Hyperparameters: n: {model.algorithm.layers[i].layer.n}"
                case 'conv_1D':
                    training.algorithm_description = training.algorithm_description + f"Conv1D, Hyperparameters: Filters: {model.algorithm.layers[i].layer.filters}, Activation: {model.algorithm.layers[i].layer.activation}, Kernel size: {model.algorithm.layers[i].layer.kernel_size}"
                case 'dropout':
                    training.algorithm_description = training.algorithm_description + f"Dropout, Hyperparameters: Rate: {model.algorithm.layers[i].layer.rate}"
                case 'max_pooling_1D':
                    training.algorithm_description = training.algorithm_description + f"MaxPooling1D, Hyperparameters: Pool size: {model.algorithm.layers[i].layer.pool_size}"
                case 'flatten':
                    training.algorithm_description = training.algorithm_description + f"Flatten"

    def _apply_dl_anomaly_detection(self, model, training):
        from keras.models import Sequential
        from keras.layers import Dense, Input, LSTM, GRU, RepeatVector, Conv1D, MaxPooling1D, Dropout, Flatten
        from keras.optimizers.legacy import Adam, SGD
        from ast import literal_eval

        df_training = pd.read_csv(training.dataset.training_path)
        df_testing = pd.read_csv(training.dataset.testing_path)

        if model.labels[0] != "All classes":
            df_testing = df_testing[df_testing['label'].isin(model.labels)]

        df_testing = self._apply_transformations(df_testing, training.dataset.processings)

        X_train = df_training.drop('label', axis=1)
        X_test = df_testing.drop('label', axis=1)
        del df_training

        model_keras = Sequential()

        for layer in model.algorithm.layers:
            match layer.name:
                case "input":

                    model_keras.add(Input(shape=literal_eval(layer.layer.shape)))
                case 'dense':
                    model_keras.add(Dense(layer.layer.units, activation=layer.layer.activation))
                case 'lstm':
                    model_keras.add(LSTM(layer.layer.units, activation=layer.layer.activation,
                                         return_sequences=True if layer.layer.return_sequences == "yes" else False))
                    pass
                case 'gru':
                    model_keras.add(GRU(layer.layer.units, activation=layer.layer.activation,
                                        return_sequences=True if layer.layer.return_sequences == "yes" else False))

                    pass
                case 'repeat_vector':
                    model_keras.add(RepeatVector(n=layer.layer.n))

                case 'conv_1D':
                    model_keras.add(Conv1D(filters=layer.layer.filters, kernel_size=layer.layer.kernel_size,
                                           activation=layer.layer.activation))
                    pass
                case 'dropout':
                    model_keras.add(Dropout(rate=layer.layer.rate))

                    pass
                case 'max_pooling_1D':
                    model_keras.add(MaxPooling1D(pool_size=layer.layer.pool_size))
                    pass
                case 'flatten':
                    model_keras.add(Flatten())
                    pass

        opt = None

        if model.algorithm.optimizer == "adam":
            opt = Adam(learning_rate=model.algorithm.learning_rate)
        elif model.algorithm.optimizer == "sgd":
            opt = SGD(learning_rate=model.algorithm.learning_rate)

        model_keras.compile(loss=model.algorithm.loss, optimizer=opt, metrics=['accuracy'])

        history = model_keras.fit(X_train, X_train, epochs=model.algorithm.epochs,
                                  batch_size=model.algorithm.batch_size)
        loss = history.history['loss'][-1]
        accuracy = history.history['accuracy'][-1]
        prediction = model_keras.predict(X_test)

        mse = np.mean(np.power(X_test - prediction, 2), axis=1)

        threshold = np.percentile(mse, model.algorithm.threshold)

        df_testing['predicted_label'] = np.where(mse > threshold, -1, 1)
        df_testing['predicted_label'] = df_testing['predicted_label'].map({-1: 'Abnormal', 1: 'Normal'})

        confusion_matrix_plot = pd.crosstab(df_testing['label'], df_testing['predicted_label'])

        all_categories = ['Normal', 'Abnormal']
        confusion_matrix_plot = confusion_matrix_plot.reindex(columns=all_categories, fill_value=0)

        confusion_matrix_decimal = confusion_matrix_plot.apply(lambda x: x / x.sum(), axis=1)

        plt.figure(figsize=(5, 4))
        sns.heatmap(confusion_matrix_decimal, annot=True, cmap="Blues", fmt='.2f', cbar=False)
        plt.xlabel("")
        plt.ylabel("")

        plt.title('NN: Confusion Matrix')

        confusion_matrix_path = f"imgs/{uuid.uuid4()}.png"
        plt.tight_layout()

        plt.savefig(confusion_matrix_path)
        plt.clf()

        plt.figure(figsize=(5, 4))
        plt.plot(history.history['accuracy'])
        plt.ylabel('Accuracy')
        plt.xlabel('Epoch')

        accuracy_path = f"imgs/{uuid.uuid4()}.png"
        plt.tight_layout()

        plt.savefig(accuracy_path)
        plt.clf()

        plt.figure(figsize=(5, 4))
        plt.plot(history.history['loss'])
        plt.ylabel('Loss')
        plt.xlabel('Epoch')

        loss_path = f"imgs/{uuid.uuid4()}.png"
        plt.tight_layout()

        plt.savefig(loss_path)
        plt.clf()

        model_path = f"trainings/{uuid.uuid4()}.h5"
        model_keras.save(model_path)

        training.status = "Trained"
        training.path = model_path
        training.confusion_matrix_path = confusion_matrix_path
        training.accuracy_path = accuracy_path
        training.loss_path = loss_path
        training.validation_output = f"Accuracy = {accuracy}, Loss = {loss}"
        training.threshold = model.algorithm.threshold

    def _apply_dl_anomaly_detection_search(self, model, training):
        from keras.models import Sequential
        from keras.layers import Dense, Input, LSTM, GRU, RepeatVector, Conv1D, MaxPooling1D, Dropout, Flatten
        from keras.optimizers.legacy import Adam, SGD
        from ast import literal_eval

        df_training = pd.read_csv(training.dataset.training_path)
        df_testing = pd.read_csv(training.dataset.testing_path)

        if model.labels[0] != "All classes":
            df_testing = df_testing[df_testing['label'].isin(model.labels)]

        df_testing = self._apply_transformations(df_testing, training.dataset.processings)

        X_train = df_training.drop('label', axis=1)
        X_test = df_testing.drop('label', axis=1)
        del df_training

        model_keras = Sequential()

        for layer in model.algorithm.layers:
            match layer.name:
                case "input":

                    model_keras.add(Input(shape=literal_eval(layer.layer.shape)))
                case 'dense':
                    model_keras.add(Dense(layer.layer.units, activation=layer.layer.activation))
                case 'lstm':
                    model_keras.add(LSTM(layer.layer.units, activation=layer.layer.activation,
                                         return_sequences=True if layer.layer.return_sequences == "yes" else False))
                    pass
                case 'gru':
                    model_keras.add(GRU(layer.layer.units, activation=layer.layer.activation,
                                        return_sequences=True if layer.layer.return_sequences == "yes" else False))

                    pass
                case 'repeat_vector':
                    model_keras.add(RepeatVector(n=layer.layer.n))

                case 'conv_1D':
                    model_keras.add(Conv1D(filters=layer.layer.filters, kernel_size=layer.layer.kernel_size,
                                           activation=layer.layer.activation))
                    pass
                case 'dropout':
                    model_keras.add(Dropout(rate=layer.layer.rate))

                    pass
                case 'max_pooling_1D':
                    model_keras.add(MaxPooling1D(pool_size=layer.layer.pool_size))
                    pass
                case 'flatten':
                    model_keras.add(Flatten())
                    pass
        df_testing['label_transformed'] = df_testing['label'].apply(lambda x: 1 if x == "Normal" else 0)
        best_model = None
        best_auc = -1
        best_history = None
        best_threshold = 0.0
        best_epochs = 0
        best_optimizer = ''
        best_learning_rate = 0.0
        best_batch_size = 0

        if model.hyperparameters_tuning == "exhaustivesearch":

            for epochs in model.algorithm.epochs:
                for optimizer in model.algorithm.optimizers:
                    for learning_rate in model.algorithm.learning_rates:
                        for batch_size in model.algorithm.batch_sizes:
                            for threshold in model.algorithm.thresholds:
                                opt = None
                                if optimizer == "adam":
                                    opt = Adam(learning_rate=learning_rate)
                                elif optimizer == "sgd":
                                    opt = SGD(learning_rate=learning_rate)

                                model_keras.compile(loss=model.algorithm.loss, optimizer=opt, metrics=['accuracy'])
                                history = model_keras.fit(X_train, X_train, epochs=epochs,
                                                          batch_size=batch_size)
                                prediction = model_keras.predict(X_test)
                                mse = np.mean(np.power(X_test - prediction, 2), axis=1)
                                threshold_new = np.percentile(mse, threshold)
                                anomalies = mse > threshold_new
                                auc = roc_auc_score(df_testing['label_transformed'], anomalies)

                                if auc > best_auc:
                                    df_testing['best_predicted_label'] = np.where(mse > threshold_new, -1, 1)

                                    best_history = history
                                    best_model = model_keras
                                    best_threshold = threshold
                                    best_epochs = epochs
                                    best_optimizer = optimizer
                                    best_learning_rate = learning_rate
                                    best_batch_size = batch_size

        else:
            for _ in range(model.iterations):
                epochs = random.choice(model.algorithm.epochs)
                optimizer = random.choice(model.algorithm.optimizers)
                learning_rate = random.choice(model.algorithm.learning_rates)
                batch_size = random.choice(model.algorithm.batch_sizes)
                threshold = random.choice(model.algorithm.thresholds)

                opt = None
                if optimizer == "adam":
                    opt = Adam(learning_rate=learning_rate)
                elif optimizer == "sgd":
                    opt = SGD(learning_rate=learning_rate)

                model_keras.compile(loss=model.algorithm.loss, optimizer=opt, metrics=['accuracy'])
                history = model_keras.fit(X_train, X_train, epochs=epochs,
                                          batch_size=batch_size)

                prediction = model_keras.predict(X_test)
                mse = np.mean(np.power(X_test - prediction, 2), axis=1)
                threshold_new = np.percentile(mse, threshold)
                anomalies = mse > threshold_new
                auc = roc_auc_score(df_testing['label_transformed'], anomalies)

                if auc > best_auc:
                    df_testing['best_predicted_label'] = np.where(mse > threshold_new, -1, 1)

                    best_history = history
                    best_model = model_keras
                    best_threshold = threshold
                    best_epochs = epochs
                    best_optimizer = optimizer
                    best_learning_rate = learning_rate
                    best_batch_size = batch_size

        df_testing['best_predicted_label'] = df_testing['best_predicted_label'].map({-1: 'Abnormal', 1: 'Normal'})
        confusion_matrix_plot = pd.crosstab(df_testing['label'], df_testing['best_predicted_label'])

        all_categories = ['Normal', 'Abnormal']
        confusion_matrix_plot = confusion_matrix_plot.reindex(columns=all_categories, fill_value=0)

        confusion_matrix_decimal = confusion_matrix_plot.apply(lambda x: x / x.sum(), axis=1)

        plt.figure(figsize=(5, 4))
        sns.heatmap(confusion_matrix_decimal, annot=True, cmap="Blues", fmt='.2f', cbar=False)
        plt.xlabel("")
        plt.ylabel("")

        plt.title('NN: Confusion Matrix')

        confusion_matrix_path = f"imgs/{uuid.uuid4()}.png"
        plt.tight_layout()

        plt.savefig(confusion_matrix_path)
        plt.clf()

        plt.figure(figsize=(5, 4))
        plt.plot(best_history.history['accuracy'])
        plt.ylabel('Accuracy')
        plt.xlabel('Epoch')

        accuracy_path = f"imgs/{uuid.uuid4()}.png"
        plt.tight_layout()

        plt.savefig(accuracy_path)
        plt.clf()

        plt.figure(figsize=(5, 4))
        plt.plot(best_history.history['loss'])
        plt.ylabel('Loss')
        plt.xlabel('Epoch')

        loss_path = f"imgs/{uuid.uuid4()}.png"
        plt.tight_layout()

        plt.savefig(loss_path)
        plt.clf()

        model_path = f"trainings/{uuid.uuid4()}.h5"
        best_model.save(model_path)

        training.status = "Trained"
        training.path = model_path
        training.confusion_matrix_path = confusion_matrix_path
        training.accuracy_path = accuracy_path
        training.loss_path = loss_path
        training.validation_output = f"Accuracy = {best_history.history['accuracy'][-1]}, Loss = {best_history.history['loss'][-1]}"
        training.threshold = best_threshold

        training.algorithm_description = training.algorithm_description + f"\nHyperparameters: Epochs: {best_epochs}, Loss: {model.algorithm.loss}, Optimizer: {best_optimizer}, Learning rate: {best_learning_rate}, Batch size: {best_batch_size}, Error threshold (MSE percentile): {best_threshold}%\nNeural Network composed of {len(model.algorithm.layers)} layers:"
        for i in range(len(model.algorithm.layers)):
            training.algorithm_description = training.algorithm_description + f"\n\tLayer {i + 1}: "
            match model.algorithm.layers[i].name:
                case "input":
                    training.algorithm_description = training.algorithm_description + f"Input, Hyperparameters: Shape {model.algorithm.layers[i].layer.shape}"
                case 'dense':
                    training.algorithm_description = training.algorithm_description + f"Dense, Hyperparameters: Units: {model.algorithm.layers[i].layer.units}, Activation: {model.algorithm.layers[i].layer.activation}"
                case 'lstm':
                    training.algorithm_description = training.algorithm_description + f"LSTM, Hyperparameters: Units: {model.algorithm.layers[i].layer.units}, Activation: {model.algorithm.layers[i].layer.activation}, Return sequences: {model.algorithm.layers[i].layer.return_sequences}"
                case 'gru':
                    training.algorithm_description = training.algorithm_description + f"LSTM, Hyperparameters: Units: {model.algorithm.layers[i].layer.units}, Activation: {model.algorithm.layers[i].layer.activation}, Return sequences: {model.algorithm.layers[i].layer.return_sequences}"
                case 'repeat_vector':
                    training.algorithm_description = training.algorithm_description + f"RepeatVector, Hyperparameters: n: {model.algorithm.layers[i].layer.n}"
                case 'conv_1D':
                    training.algorithm_description = training.algorithm_description + f"Conv1D, Hyperparameters: Filters: {model.algorithm.layers[i].layer.filters}, Activation: {model.algorithm.layers[i].layer.activation}, Kernel size: {model.algorithm.layers[i].layer.kernel_size}"
                case 'dropout':
                    training.algorithm_description = training.algorithm_description + f"Dropout, Hyperparameters: Rate: {model.algorithm.layers[i].layer.rate}"
                case 'max_pooling_1D':
                    training.algorithm_description = training.algorithm_description + f"MaxPooling1D, Hyperparameters: Pool size: {model.algorithm.layers[i].layer.pool_size}"
                case 'flatten':
                    training.algorithm_description = training.algorithm_description + f"Flatten"

    def evaluate_model_with_other_dataset(self, training_id: int, dataset_id: int):
        from io import BytesIO
        if self.user == RoleEnum.read_only:
            raise UserNoPermission

        model = self.training_repository.find_by_id(training_id)

        if model is None:
            raise TrainingNotFound

        dataset = DatasetRepository(self.db).find_by_id(dataset_id)

        if dataset is None:
            raise DatasetNotFound

        if model.monitoring_script_name != dataset.monitoring_script_name:
            raise DatasetNotEvaluable

        trained_model = None
        df = pd.read_csv(dataset.path)

        df = self._apply_transformations(df, model.dataset.processings)

        X = df.drop(columns=["label"], axis=1)

        y = df["label"]
        image_base64 = ""

        if model.method == "Machine learning":

            trained_model = load(model.path)
            y_pred = trained_model.predict(X)

            if model.type == "Classifier":
                labels_selected = sorted(df["label"].unique())
                conf_mat = confusion_matrix(y, y_pred, labels=labels_selected)
                row_sums = conf_mat.sum(axis=1, keepdims=True)
                confusion_matrix_normalized = conf_mat / row_sums

                sns.heatmap(confusion_matrix_normalized, annot=True, cmap='Blues', fmt='.2f', cbar=False,
                            xticklabels=labels_selected, yticklabels=labels_selected)
                plt.title(f"{dataset.name}")
                plt.xlabel("")
                plt.ylabel("")

                plt.tight_layout()

                buffer = BytesIO()
                plt.savefig(buffer, format="png")
                buffer.seek(0)

                image_base64 = base64.b64encode(buffer.read()).decode('utf-8')
                plt.clf()

            else:

                mapping = {-1: 'Abnormal', 1: 'Normal'}
                mapper = np.vectorize(lambda x: mapping[x])

                y_pred = mapper(y_pred)

                confusion_matrix_plot = pd.crosstab(y, y_pred)
                all_categories = ['Normal', 'Abnormal']
                confusion_matrix_plot = confusion_matrix_plot.reindex(columns=all_categories, fill_value=0)

                confusion_matrix_decimal = confusion_matrix_plot.apply(lambda x: x / x.sum(), axis=1)

                sns.heatmap(confusion_matrix_decimal, annot=True, cmap='Blues', fmt='.2f', cbar=False)
                plt.xlabel("")
                plt.ylabel("")

                plt.title(f"{dataset.name}")

                plt.tight_layout()

                buffer = BytesIO()
                plt.savefig(buffer, format="png")
                buffer.seek(0)

                image_base64 = base64.b64encode(buffer.read()).decode('utf-8')

                plt.clf()



        else:
            trained_model = load_model(model.path)

            if model.type == "Classifier":
                labels_selected = sorted(df["label"].unique())

                y_pred = np.argmax(trained_model.predict(X), axis=-1)

                conf_mat = confusion_matrix(y, y_pred, labels=labels_selected)
                row_sums = conf_mat.sum(axis=1, keepdims=True)
                confusion_matrix_normalized = conf_mat / row_sums

                sns.heatmap(confusion_matrix_normalized, annot=True, cmap='Blues', fmt='.2f', cbar=False,
                            xticklabels=labels_selected, yticklabels=labels_selected)
                plt.xlabel("")
                plt.ylabel("")
                plt.title(f"{dataset.name}")
                plt.tight_layout()


                buffer = BytesIO()
                plt.savefig(buffer, format="png")
                buffer.seek(0)

                image_base64 = base64.b64encode(buffer.read()).decode('utf-8')

                plt.clf()
            else:
                y_pred = trained_model.predict(X)
                mse = np.mean(np.power(X - y_pred, 2), axis=1)
                threshold = np.percentile(mse, model.algorithm.threshold)
                df_aux = pd.DataFrame(columns=['predicted_label'])
                df_aux['predicted_label'] = np.where(mse > threshold, -1, 1)
                df_aux['predicted_label'] = df_aux['predicted_label'].map({-1: 'Abnormal', 1: 'Normal'})

                confusion_matrix_plot = pd.crosstab(y, df_aux['predicted_label'])

                all_categories = ['Normal', 'Abnormal']
                confusion_matrix_plot = confusion_matrix_plot.reindex(columns=all_categories, fill_value=0)

                confusion_matrix_decimal = confusion_matrix_plot.apply(lambda x: x / x.sum(), axis=1)


                sns.heatmap(confusion_matrix_decimal, annot=True, cmap="Blues", fmt='.2f', cbar=False)
                plt.xlabel("")
                plt.ylabel("")

                plt.title(f"{dataset.name}")

                plt.tight_layout()
                buffer = BytesIO()
                plt.savefig(buffer, format="png")
                buffer.seek(0)

                image_base64 = base64.b64encode(buffer.read()).decode('utf-8')

                plt.clf()


        return image_base64
