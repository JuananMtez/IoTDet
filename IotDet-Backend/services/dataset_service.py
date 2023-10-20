from sklearn.model_selection import train_test_split

from exceptions.dataset_exception import DatasetNotFound, FeatureNotFoundInDataset, DatasetNotDeleteable, \
    DatasetInfoNotVisible, DatasetNotRecordingType, DatasetNotProcessable, MalwareNotFoundInDataset, \
    DatasetAlreadyFeatureExtraction
from models.models import Dataset, StatusScenarioEnum, DatasetCopy, RoleEnum, DatasetRecording, Processing, \
    StatusDatasetEnum, Plot
from repositories.dataset_repository import DatasetRepository
import pandas as pd
import datetime
import time
from models.models import User
from typing import Union

from repositories.device_repository import DeviceRepository
from repositories.training_repository import TrainingRepository
from schemas.dataset_schema import DatasetModifyName, DatasetDataResponse, FeatureFloatInfoResponse, \
    FeatureStrInfoResponse, MalwareInfoResponse, FeatureStrValueResponse, \
    DatasetRecordingInfoResponse, DatasetCopyInfoResponse, DatasetCopyResponse, FeatureFloatGroupedByMalwareResponse, \
    FeatureStrGroupedByMalwareResponse, DatasetColumnResponse, DatasetMalwareResponse, \
    DatasetPreprocessingPost, DatasetScatterPlotPost, DatasetBoxPlotPost, DatasetHistogramPlotPost, \
    DatasetFeatureExtractionPost, DatasetCopyPost
from services.scenario_service import ScenarioService
from exceptions.user_exception import UserNoPermission
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import base64
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis as LDA
from keras.layers import Input, Dense
from keras.models import Model
from sklearn.decomposition import TruncatedSVD
from joblib import dump
import uuid


class DatasetService:
    def __init__(self, db, user: User):
        self.db = db
        self.user = User
        self.dataset_repository = DatasetRepository(db)

    @staticmethod
    def _split_dataset_in_train_test(df, train_size, shuffle: bool, used_for: str, training_path: str,
                                     testing_path: str, seed: Union[None, int]):
        dfs_one_label = []

        labels = df['label'].unique()

        for label in labels:
            dfs_one_label.append(df.loc[df["label"] == label])

        train_data = pd.DataFrame(columns=df.columns)
        test_data = pd.DataFrame(columns=df.columns)
        if used_for == "Classifier":
            for label in labels:
                label_data = df[df['label'] == label]
                X_train, X_test = train_test_split(label_data, shuffle=shuffle, train_size=float(train_size / 100),
                                                   random_state=seed)
                train_data = pd.concat([train_data, X_train])
                test_data = pd.concat([test_data, X_test])

        else:
            df_normal = df[df['label'] == 'Normal']
            X_train, X_test = train_test_split(df_normal, shuffle=shuffle, train_size=float(train_size / 100),
                                               random_state=42)
            df_other = df[df['label'] != 'Normal']
            train_data = pd.concat([train_data, X_train])
            test_data = pd.concat([X_test, df_other])
        train_data.to_csv(training_path, index=False)
        test_data.to_csv(testing_path, index=False)

    @staticmethod
    def _generate_dataset_path(is_copied: bool) -> dict:
        import uuid
        uuid = uuid.uuid4()
        name = f"{uuid}.csv"
        if not is_copied:
            path_file = f"datasets/{name}"

            return {"name": name, "path_file": path_file}
        else:
            training_path = f"datasets/training_{name}"
            testing_path = f"datasets/testing_{name}"
            return {"name": name, "training_file": training_path, "testing_file": testing_path}

    def find_all_datasets_recording_finished(self) -> list[DatasetRecording]:

        datasets_recording = []
        scenarios = ScenarioService(self.db, self.user).find_all_scenarios()

        for scenario in scenarios:
            if scenario.type == "scenario_recording" and scenario.status == StatusScenarioEnum.finished:
                for device in scenario.devices:
                    for deployfile_monitoring_script_selected in device.deployfiles_monitoring_script_selected:
                        datasets_recording.append(deployfile_monitoring_script_selected.dataset)
        return datasets_recording

    def find_all_datasets_features_extracted(self) -> list[DatasetCopy]:
        return self.dataset_repository.find_all_extracted_features()

    def find_dataset_by_id(self, dataset_id: int) -> Dataset:
        dataset = self.dataset_repository.find_by_id(dataset_id)
        if dataset is None:
            raise DatasetNotFound

        return dataset

    def get_data_from_dataset_prediction_online(self, dataset_id: int, prediction_type: str):
        dataset = self.dataset_repository.find_by_id(dataset_id)
        if dataset is None:
            raise DatasetNotFound
        df = pd.read_csv(dataset.path)

        if prediction_type not in df.columns:
            raise FeatureNotFoundInDataset

        df['timestamp'] = df['timestamp'].apply(lambda x: int(x))

        output_data = []
        last_value = None
        if not df.empty:
            for i in range(df['timestamp'].iloc[0], df['timestamp'].iloc[-1] + 1):
                if not df[df['timestamp'] == i].empty:
                    last_value = df[df['timestamp'] == i][prediction_type].values[0]
                output_data.append({'timestamp': i, 'value': last_value})

        return output_data

    def get_data_from_dataset_by_feature_online(self, dataset_id: int, feature_name: str):
        dataset = self.dataset_repository.find_by_id(dataset_id)
        if dataset is None:
            raise DatasetNotFound
        df = pd.read_csv(dataset.path)

        if feature_name not in df.columns:
            raise FeatureNotFoundInDataset

        df['timestamp'] = df['timestamp'].astype(int)
        df.set_index('timestamp', inplace=True)

        now = int(time.time())
        start = now - 180

        subset_df = df.loc[start:now - 1]

        times = list(range(start, now))
        output = []

        match df[feature_name].dtype:
            case "int64":

                last_value = int(df.loc[:start][feature_name].iloc[-1]) if not df.loc[:start].empty else None

                for t in times:
                    if t in subset_df.index:
                        last_value = int(subset_df.loc[t, feature_name])
                        output.append({feature_name: last_value})
                    else:
                        output.append({feature_name: last_value})
            case "float64":
                last_value = float(df.loc[:start][feature_name].iloc[-1]) if not df.loc[:start].empty else None

                for t in times:
                    if t in subset_df.index:
                        last_value = subset_df.loc[t, feature_name]
                        output.append({feature_name: last_value})
                    else:
                        output.append({feature_name: last_value})
                output = list(reversed(output))

            case "object":
                grouped_df = df.groupby(feature_name).size().reset_index(name='count')
                list_aux = grouped_df.to_dict('records')
                output = list(map(lambda x: {"name": x[feature_name], "value": x["count"]}, list_aux))

        return output

    def get_data_from_dataset_by_feature_offline(self, dataset_id: int, feature_name: str):
        import math
        import numpy as np
        dataset = self.dataset_repository.find_by_id(dataset_id)
        if dataset is None:
            raise DatasetNotFound
        df = pd.read_csv(dataset.path)

        if feature_name not in df.columns:
            raise FeatureNotFoundInDataset

        output = []
        a = df[feature_name].dtype
        match df[feature_name].dtype:
            case "int64":
                pass
            case "float64":

                df['timestamp'] = df['timestamp'].apply(lambda x: math.floor(x))
                all_seconds = pd.DataFrame(index=np.arange(df['timestamp'].min(), df['timestamp'].max() + 1),
                                           columns=[feature_name])
                for i in df.index:
                    all_seconds.loc[df.loc[i, 'timestamp'], feature_name] = df.loc[i, feature_name]
                all_seconds.fillna(method='ffill', inplace=True)
                output = [{feature_name: v[feature_name]} for k, v in all_seconds.iterrows()]

            case "object":
                grouped_df = df.groupby(feature_name).size().reset_index(name='count')
                list_aux = grouped_df.to_dict('records')
                output = list(map(lambda x: {"name": x[feature_name], "value": x["count"]}, list_aux))

        return output

    def create_copy(self, dataset_id: int, dataset_copy_post: DatasetCopyPost) -> DatasetCopy:
        dataset_original = self.dataset_repository.find_by_id(dataset_id)

        if dataset_original is None:
            raise DatasetNotFound

        if self.user.role == RoleEnum.read_only:
            raise UserNoPermission

        attributes = self._generate_dataset_path(is_copied=True)

        dataset_copy = DatasetCopy(name=attributes["name"],
                                   path="",
                                   training_path=attributes["training_file"],
                                   testing_path=attributes["testing_file"],
                                   monitoring_script_name=dataset_original.monitoring_script_name,
                                   device_mender_id=dataset_original.device_mender_id,
                                   scenario_name=dataset_original.scenario_name,
                                   status=StatusDatasetEnum.unprocessed,
                                   processings=[],
                                   train_size=dataset_copy_post.train_size,
                                   is_shuffled="Yes" if dataset_copy_post.shuffle else "No",
                                   used_for=dataset_copy_post.used_for,
                                   seed="None" if dataset_copy_post.seed is None else str(dataset_copy_post.seed)

                                   )

        df = pd.read_csv(dataset_original.path)
        self._split_dataset_in_train_test(df,
                                          train_size=dataset_copy_post.train_size,
                                          shuffle=dataset_copy_post.shuffle,
                                          used_for=dataset_copy_post.used_for,
                                          training_path=dataset_copy.training_path,
                                          testing_path=dataset_copy.testing_path,
                                          seed=dataset_copy.seed)

        dataset_original.datasets_copy.append(dataset_copy)
        self.dataset_repository.save(dataset_original)

        return dataset_copy

    def delete_dataset_recording_copied(self, dataset_id: int):
        import os
        dataset = self.dataset_repository.find_by_id(dataset_id)

        if dataset is None:
            raise DatasetNotFound

        if dataset.type != "dataset_copy":
            raise DatasetNotDeleteable

        if self.user.role == RoleEnum.read_only:
            raise UserNoPermission

        if TrainingRepository(self.db).exists_training_associated_to_dataset(dataset_id):
            raise DatasetNotDeleteable

        if os.path.exists(dataset.path):
            os.remove(dataset.path)
        if os.path.exists(dataset.training_path):
            os.remove(dataset.training_path)
        if os.path.exists(dataset.testing_path):
            os.remove(dataset.testing_path)

        for processing in dataset.processings:
            if processing.type == "Feature Extraction" and (
                    processing.algorithm == "pca" or processing.algorithm == "lda" or processing.algorithm == "autoencoder" or processing.algorithm == "svd") and os.path.exists(
                processing.parameters["path"]):
                os.remove(processing.parameters["path"])

        for plot in dataset.plots:
            if os.path.exists(plot.path):
                os.remove(plot.path)

        self.dataset_repository.delete(dataset)

    def download_dataset(self, dataset_id: int, type: str):

        dataset = self.dataset_repository.find_by_id(dataset_id)

        if dataset is None:
            raise DatasetNotFound

        if type == "recording":
            return {'filename': dataset.name, 'path': dataset.path}
        elif type == "training":
            return {'filename': dataset.name, 'path': dataset.training_path}
        elif type == "testing":
            return {'filename': dataset.name, 'path': dataset.testing_path}

    def modify_name_dataset(self, dataset_id: int, dataset_patch: DatasetModifyName) -> Dataset:
        dataset = self.dataset_repository.find_by_id(dataset_id)
        if dataset is None:
            raise DatasetNotFound
        if self.user == RoleEnum.read_only:
            raise UserNoPermission

        dataset.name = dataset_patch.name
        return self.dataset_repository.save(dataset)

    def get_dataset_data(self, dataset_id: int) -> DatasetDataResponse:
        dataset = self.dataset_repository.find_by_id(dataset_id)

        if dataset is None:
            raise DatasetNotFound
        df = None
        if dataset.type == "dataset_recording":
            df = pd.read_csv(dataset.path)
            df = df.drop('timestamp', axis=1)
        else:
            df = pd.read_csv(dataset.training_path)

        columns = ['index'] + df.columns.tolist()

        rows = []
        for index, row in df.iterrows():
            row_dict = {'index': index}
            row_dict.update(row.to_dict())
            rows.append(row_dict)

        return DatasetDataResponse(
            columns=columns,
            rows=rows
        )

    def get_info_dataset(self, dataset_id: int) -> Union[DatasetRecordingInfoResponse, DatasetCopyInfoResponse]:

        dataset = self.dataset_repository.find_by_id(dataset_id)

        if dataset is None:
            raise DatasetNotFound

        if dataset.type == "dataset" or dataset.type == "dataset_monitoring":
            raise DatasetInfoNotVisible

        if dataset.type == "dataset_recording":
            df = pd.read_csv(dataset.path)
            df = df.drop('timestamp', axis=1)
            features_info = []
            malware_info = []
            count = len(df.index)
            unique_labels = df['label'].unique()
            for column in df.columns:
                match df[column].dtype:
                    case "int64":
                        pass
                    case "float64":
                        values_feature_float_info_grouped_by_malware = []
                        for unique_label in unique_labels:
                            df_copy = df[df['label'] == unique_label]

                            stats = df_copy[column].describe()
                            result = stats.loc[['min', 'max', 'mean', 'std', '25%', '50%', '75%']]

                            values_feature_float_info_grouped_by_malware.append(FeatureFloatGroupedByMalwareResponse(
                                malware_name=unique_label,
                                data_min=float("{:.3f}".format(result.loc['min'])),
                                data_max=float("{:.3f}".format(result.loc['max'])),
                                mean=float("{:.3f}".format(result.loc['mean'])),
                                percentile_25=float("{:.3f}".format(result.loc['25%'])),
                                percentile_50=float("{:.3f}".format(result.loc['50%'])),
                                percentile_75=float("{:.3f}".format(result.loc['75%'])),
                                standard_deviation=float("{:.3f}".format(result.loc['std'])),
                            ))
                        features_info.append(FeatureFloatInfoResponse(
                            name=column,
                            type="float",
                            values_grouped_by_malware=values_feature_float_info_grouped_by_malware
                        ))

                    case "object":

                        if column == 'label':
                            grouped_df = df.groupby(column).size().reset_index(name='count')
                            list_aux = grouped_df.to_dict('records')
                            for label in list_aux:
                                malware_info.append(
                                    MalwareInfoResponse(
                                        name=label[column],
                                        count=label["count"],
                                        frequency=float("{:.3f}".format((label["count"] / count) * 100)),
                                    )
                                )

                        else:

                            feature_str_info = FeatureStrInfoResponse(
                                name=column,
                                values_grouped=[],
                                type="str"
                            )
                            for unique_label in unique_labels:
                                df_copy = df[df['label'] == unique_label]

                                grouped_df = df_copy.groupby(column).size().reset_index(name='count')
                                list_aux = grouped_df.to_dict('records')
                                feature_str_grouped_by_malware = FeatureStrGroupedByMalwareResponse(
                                    malware_name=unique_label,
                                    values=[]

                                )
                                for item in list_aux:
                                    feature_str_grouped_by_malware.values.append(FeatureStrValueResponse(
                                        count=item["count"],
                                        frequency=float("{:.3f}".format((item["count"] / len(df_copy.index)) * 100)),
                                        unique_value_name=item[column]
                                    ))

                                feature_str_info.values_grouped.append(feature_str_grouped_by_malware)

                            features_info.append(feature_str_info)

            datasets_copied = []

            for dataset_copy in dataset.datasets_copy:
                datasets_copied.append(DatasetCopyResponse(
                    id=dataset_copy.id,
                    name=dataset_copy.name,
                    scenario_name=dataset_copy.scenario_name,
                    device_mender_id=dataset_copy.device_mender_id,
                    used_for=dataset_copy.used_for,
                    seed=dataset_copy.seed,
                    is_shuffled=dataset_copy.is_shuffled,
                    train_size=dataset_copy.train_size,

                    monitoring_script_name=dataset_copy.monitoring_script_name,
                    type="dataset_copy",
                    status=dataset_copy.status,
                    processings=dataset_copy.processings

                ))
            return DatasetRecordingInfoResponse(
                id=dataset.id,
                name=dataset.name,
                scenario_name=dataset.scenario_name,
                device_mender_id=dataset.device_mender_id,
                monitoring_script_name=dataset.monitoring_script_name,
                count=count,
                features=features_info,
                malware=malware_info,
                type=dataset.type,
                datasets_copy=datasets_copied
            )

        else:
            df_training = pd.read_csv(dataset.training_path)
            if "timestamp" in df_training:
                df_training = df_training.drop("timestamp", axis=1)
            df_testing = pd.read_csv(dataset.testing_path)
            df_testing = df_testing.drop("timestamp", axis=1)
            features_training_info = []
            malware_training_info = []
            count_training_dataset = len(df_training.index)
            features_testing_info = []
            malware_testing_info = []
            count_testing_dataset = len(df_testing.index)

            unique_labels_training = df_training['label'].unique()
            unique_labels_testing = df_testing['label'].unique()

            for column in df_training.columns:
                match df_training[column].dtype:
                    case "int64":
                        pass
                    case "float64":
                        values_feature_float_info_grouped_by_malware = []
                        for unique_label in unique_labels_training:
                            df_copy_training = df_training[df_training['label'] == unique_label]

                            stats = df_copy_training[column].describe()
                            result = stats.loc[['min', 'max', 'mean', 'std', '25%', '50%', '75%']]

                            values_feature_float_info_grouped_by_malware.append(FeatureFloatGroupedByMalwareResponse(
                                malware_name=unique_label,
                                data_min=float("{:.3f}".format(result.loc['min'])),
                                data_max=float("{:.3f}".format(result.loc['max'])),
                                mean=float("{:.3f}".format(result.loc['mean'])),
                                percentile_25=float("{:.3f}".format(result.loc['25%'])),
                                percentile_50=float("{:.3f}".format(result.loc['50%'])),
                                percentile_75=float("{:.3f}".format(result.loc['75%'])),
                                standard_deviation=float("{:.3f}".format(result.loc['std'])),
                            ))
                        features_training_info.append(FeatureFloatInfoResponse(
                            name=column,
                            type="float",
                            values_grouped_by_malware=values_feature_float_info_grouped_by_malware
                        ))

                    case "object":

                        if column == 'label':
                            grouped_df = df_training.groupby(column).size().reset_index(name='count')
                            list_aux = grouped_df.to_dict('records')
                            for label in list_aux:
                                malware_training_info.append(
                                    MalwareInfoResponse(
                                        name=label[column],
                                        count=label["count"],
                                        frequency=float(
                                            "{:.3f}".format((label["count"] / count_training_dataset) * 100)),
                                    )
                                )

                        else:

                            feature_str_info = FeatureStrInfoResponse(
                                name=column,
                                values_grouped=[],
                                type="str"
                            )
                            for unique_label in unique_labels_training:
                                df_copy = df_training[df_training['label'] == unique_label]

                                grouped_df = df_copy.groupby(column).size().reset_index(name='count')
                                list_aux = grouped_df.to_dict('records')
                                feature_str_grouped_by_malware = FeatureStrGroupedByMalwareResponse(
                                    malware_name=unique_label,
                                    values=[]

                                )
                                for item in list_aux:
                                    feature_str_grouped_by_malware.values.append(FeatureStrValueResponse(
                                        count=item["count"],
                                        frequency=float("{:.3f}".format((item["count"] / len(df_copy.index)) * 100)),
                                        unique_value_name=item[column]
                                    ))

                                feature_str_info.values_grouped.append(feature_str_grouped_by_malware)

                            features_training_info.append(feature_str_info)

            for column in df_testing.columns:
                match df_testing[column].dtype:
                    case "int64":
                        pass
                    case "float64":
                        values_feature_float_info_grouped_by_malware = []
                        for unique_label in unique_labels_testing:
                            df_copy_testing = df_testing[df_testing['label'] == unique_label]

                            stats = df_copy_testing[column].describe()
                            result = stats.loc[['min', 'max', 'mean', 'std', '25%', '50%', '75%']]

                            values_feature_float_info_grouped_by_malware.append(FeatureFloatGroupedByMalwareResponse(
                                malware_name=unique_label,
                                data_min=float("{:.3f}".format(result.loc['min'])),
                                data_max=float("{:.3f}".format(result.loc['max'])),
                                mean=float("{:.3f}".format(result.loc['mean'])),
                                percentile_25=float("{:.3f}".format(result.loc['25%'])),
                                percentile_50=float("{:.3f}".format(result.loc['50%'])),
                                percentile_75=float("{:.3f}".format(result.loc['75%'])),
                                standard_deviation=float("{:.3f}".format(result.loc['std'])),
                            ))
                        features_testing_info.append(FeatureFloatInfoResponse(
                            name=column,
                            type="float",
                            values_grouped_by_malware=values_feature_float_info_grouped_by_malware
                        ))

                    case "object":

                        if column == 'label':
                            grouped_df = df_testing.groupby(column).size().reset_index(name='count')
                            list_aux = grouped_df.to_dict('records')
                            for label in list_aux:
                                malware_testing_info.append(
                                    MalwareInfoResponse(
                                        name=label[column],
                                        count=label["count"],
                                        frequency=float(
                                            "{:.3f}".format((label["count"] / count_testing_dataset) * 100)),
                                    )
                                )

                        else:

                            feature_str_info = FeatureStrInfoResponse(
                                name=column,
                                values_grouped=[],
                                type="str"
                            )
                            for unique_label in unique_labels_testing:
                                df_copy = df_testing[df_testing['label'] == unique_label]

                                grouped_df = df_copy.groupby(column).size().reset_index(name='count')
                                list_aux = grouped_df.to_dict('records')
                                feature_str_grouped_by_malware = FeatureStrGroupedByMalwareResponse(
                                    malware_name=unique_label,
                                    values=[]

                                )
                                for item in list_aux:
                                    feature_str_grouped_by_malware.values.append(FeatureStrValueResponse(
                                        count=item["count"],
                                        frequency=float("{:.3f}".format((item["count"] / len(df_copy.index)) * 100)),
                                        unique_value_name=item[column]
                                    ))

                                feature_str_info.values_grouped.append(feature_str_grouped_by_malware)

                            features_testing_info.append(feature_str_info)
            dataset_parent = self.dataset_repository.find_by_id(dataset.dataset_recording_id)
            return DatasetCopyInfoResponse(
                id=dataset.id,
                name=dataset.name,
                scenario_name=dataset.scenario_name,
                device_mender_id=dataset.device_mender_id,
                monitoring_script_name=dataset.monitoring_script_name,
                train_size=dataset.train_size,
                is_shuffled=dataset.is_shuffled,
                seed=dataset.seed,
                used_for=dataset.used_for,
                count_training_dataset=count_training_dataset,
                features_training_dataset=features_training_info,
                malware_training_dataset=malware_training_info,

                count_testing_dataset=count_testing_dataset,
                features_testing_dataset=features_testing_info,
                malware_testing_dataset=malware_testing_info,

                type=dataset.type,
                dataset_parent_name=dataset_parent.name
            )

    def get_all_processings_applied_to_dataset(self, dataset_id: int) -> list[Processing]:

        dataset = self.dataset_repository.find_by_id(dataset_id)

        if dataset is None:
            raise DatasetNotFound

        if dataset.type != 'dataset_copy':
            raise DatasetNotProcessable

        return dataset.processings

    def get_all_columns_dataset(self, dataset_id: int) -> list[DatasetColumnResponse]:
        dataset = self.dataset_repository.find_by_id(dataset_id)

        if dataset is None:
            raise DatasetNotFound

        df = pd.read_csv(dataset.training_path)

        all_columns = []
        for column in df.columns:
            if column != 'label' and column != 'timestamp':
                all_columns.append(DatasetColumnResponse(
                    name=column,
                    type=str(df[column].dtype)
                ))

        return all_columns

    def get_all_malware_dataset(self, dataset_id: int) -> list[DatasetMalwareResponse]:
        dataset = self.dataset_repository.find_by_id(dataset_id)

        if dataset is None:
            raise DatasetNotFound
        df = None
        if dataset.type == "dataset_recording":
            df = pd.read_csv(dataset.path)
        elif dataset.type == "dataset_copy":
            if dataset.used_for == "Classifier":
                df = pd.read_csv(dataset.training_path)
            else:
                df = pd.read_csv(dataset.testing_path)
        elif dataset.type == "dataset_monitoring":
            return list(map(lambda x: {"name": x}, dataset.all_labels["labels"]))

        all_malware = df['label'].unique()
        return list(map(lambda x: {"name": x}, all_malware))

    @staticmethod
    def _apply_remove_outliers(df, features: list[str]):
        parameters = {}

        for feature in features:
            Q1 = df[feature].quantile(0.25)
            Q3 = df[feature].quantile(0.75)
            IQR = Q3 - Q1

            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            parameters[feature] = {"lower_bound": lower_bound, "upper_bound": upper_bound}
            df = df[~((df[feature] < lower_bound) | (df[feature] > upper_bound))]
        return df, parameters

    @staticmethod
    def _apply_remove_duplicates(df, features_to_consider: list[str]):
        parameters = {"features": features_to_consider}
        df = df.drop_duplicates(subset=features_to_consider)
        return df, parameters

    @staticmethod
    def _apply_min_max_normalization(df, features: list[str]):
        from sklearn.preprocessing import MinMaxScaler

        scaler = MinMaxScaler()
        parameters = {}

        for feature in features:
            df[feature] = scaler.fit_transform(df[[feature]])

            parameters[feature] = {
                'min': scaler.data_min_[0],
                'max': scaler.data_max_[0]
            }

        return df, parameters

    @staticmethod
    def _apply_one_hot_encoding(df, features: list[str]):

        parameters = {}
        for feature in features:
            dummies = pd.get_dummies(df[feature], prefix=feature)
            df = pd.concat([df, dummies], axis=1)
            df.drop([feature], axis=1, inplace=True)
            parameters[feature] = dummies.columns.tolist()
        return df, parameters

    @staticmethod
    def _apply_standard_scaler_normalization(df, features: list[str]):

        scaler = StandardScaler()
        parameters = {}
        for feature in features:
            df[feature] = scaler.fit_transform(df[[feature]])
            parameters[feature] = {"mean": scaler.mean_[0], "var": scaler.var_[0]}

        return df, parameters

    @staticmethod
    def _apply_drop_features(df, features: list[str]):
        parameters = {"features": features}
        df = df.drop(columns=features, axis=1)
        return df, parameters

    @staticmethod
    def _apply_random_undersampling(df, features: list[str]):
        from imblearn.under_sampling import RandomUnderSampler
        parameters = {"features": features}

        X = df.drop("label", axis=1)
        y = df["label"]
        rus = RandomUnderSampler(random_state=42)
        X_res, y_res = rus.fit_resample(X, y)
        X_res["label"] = y_res
        return X_res, parameters

    @staticmethod
    def _apply_nearmiss_undersampling(df, features: list[str]):
        from imblearn.under_sampling import NearMiss
        parameters = {"features": features}

        X = df.drop("label", axis=1)
        y = df["label"]
        nus = NearMiss(version=2)
        X_res, y_res = nus.fit_resample(X, y)
        X_res["label"] = y_res
        return X_res, parameters

    @staticmethod
    def _apply_random_oversampling(df, features: list[str]):
        from imblearn.over_sampling import RandomOverSampler
        parameters = {"features": features}

        X = df.drop("label", axis=1)
        y = df["label"]
        ros = RandomOverSampler(random_state=42)
        X_res, y_res = ros.fit_resample(X, y)
        X_res["label"] = y_res
        X_res = X_res.sort_values('timestamp')
        return X_res, parameters

    @staticmethod
    def _apply_smote_oversampling(df, features: list[str]):
        from imblearn.over_sampling import SMOTE
        parameters = {"features": features}

        X = df.drop("label", axis=1)
        y = df["label"]
        sos = SMOTE(random_state=42)
        X_res, y_res = sos.fit_resample(X, y)
        X_res["label"] = y_res
        X_res = X_res.sort_values('timestamp')
        return X_res, parameters

    def _preprocess_dataset(self, dataset, algorithms_post):
        error = False

        all_processings = dataset.processings.copy()
        cont = -1
        for i in range(len(all_processings)):
            if not error and all_processings[i].type == "Preprocessing" and all_processings[i].status == 'In queue':
                cont = cont + 1
                dataset.processings[i].status = 'In progress'
                self.dataset_repository.save(dataset)
                df = pd.read_csv(dataset.training_path)
                match algorithms_post.algorithms[cont].algorithm:
                    case 'remove_outliers':
                        try:
                            df, parameters = self._apply_remove_outliers(df, algorithms_post.algorithms[cont].features)
                            dataset.processings[i].status = "Applied"
                            dataset.processings[i].parameters = parameters
                            dataset.processings[i].algorithm = "remove_outliers"

                            df.to_csv(dataset.training_path, index=False)
                        except Exception as exc:
                            error = True
                            dataset.processings[i].status = "Error"
                            dataset.processings[i].log_error = str(exc)

                    case 'remove_duplicates':
                        try:
                            df, parameters = self._apply_remove_duplicates(df,
                                                                           algorithms_post.algorithms[cont].features)
                            dataset.processings[i].status = "Applied"
                            dataset.processings[i].parameters = parameters
                            dataset.processings[i].algorithm = "remove_duplicates"

                            df.to_csv(dataset.training_path, index=False)
                        except Exception as exc:
                            error = True
                            dataset.processings[i].status = "Error"

                            dataset.processings[i].log_error = str(exc)

                    case 'min-max_normalization':
                        try:
                            df, parameters = self._apply_min_max_normalization(df, algorithms_post.algorithms[
                                cont].features)
                            dataset.processings[i].status = "Applied"
                            dataset.processings[i].parameters = parameters
                            dataset.processings[i].algorithm = "min-max_normalization"

                            df.to_csv(dataset.training_path, index=False)
                        except Exception as exc:
                            error = True
                            dataset.processings[i].status = "Error"

                            dataset.processings[i].log_error = str(exc)

                    case 'one-hot_encoding':
                        try:
                            df, parameters = self._apply_one_hot_encoding(df, algorithms_post.algorithms[cont].features)
                            dataset.processings[i].status = "Applied"
                            dataset.processings[i].parameters = parameters
                            dataset.processings[i].algorithm = "one-hot_encoding"
                            df.to_csv(dataset.training_path, index=False)
                        except Exception as exc:
                            error = True
                            dataset.processings[i].status = "Error"
                            dataset.processings[i].log_error = str(exc)
                    case 'standard_scaler_normalization':
                        try:
                            df, parameters = self._apply_standard_scaler_normalization(df,
                                                                                       algorithms_post.algorithms[
                                                                                           cont].features)
                            dataset.processings[i].status = "Applied"
                            dataset.processings[i].parameters = parameters
                            dataset.processings[i].algorithm = "standard_scaler_normalization"
                            df.to_csv(dataset.training_path, index=False)

                        except Exception as exc:
                            error = True
                            dataset.processings[i].status = "Error"
                            dataset.processings[i].log_error = str(exc)
                    case 'drop_features':
                        try:
                            df, parameters = self._apply_drop_features(df,
                                                                       algorithms_post.algorithms[
                                                                           cont].features)
                            dataset.processings[i].status = "Applied"
                            dataset.processings[i].parameters = parameters
                            dataset.processings[i].algorithm = "drop_features"
                            df.to_csv(dataset.training_path, index=False)

                        except Exception as exc:
                            error = True
                            dataset.processings[i].status = "Error"
                            dataset.processings[i].log_error = str(exc)
                    case 'random_undersampling':
                        try:
                            df, parameters = self._apply_random_undersampling(df,
                                                                              algorithms_post.algorithms[
                                                                                  cont].features)
                            dataset.processings[i].status = "Applied"
                            dataset.processings[i].parameters = parameters
                            dataset.processings[i].algorithm = "random_undersampling"
                            df.to_csv(dataset.training_path, index=False)

                        except Exception as exc:
                            error = True
                            dataset.processings[i].status = "Error"
                            dataset.processings[i].log_error = str(exc)
                    case 'nearmiss_undersampling':
                        try:
                            df, parameters = self._apply_nearmiss_undersampling(df,
                                                                                algorithms_post.algorithms[
                                                                                    cont].features)
                            dataset.processings[i].status = "Applied"
                            dataset.processings[i].parameters = parameters
                            dataset.processings[i].algorithm = "nearmiss_undersampling"
                            df.to_csv(dataset.training_path, index=False)

                        except Exception as exc:
                            error = True
                            dataset.processings[i].status = "Error"
                            dataset.processings[i].log_error = str(exc)
                    case 'random_oversampling':
                        try:
                            df, parameters = self._apply_random_oversampling(df,
                                                                             algorithms_post.algorithms[
                                                                                 cont].features)
                            dataset.processings[i].status = "Applied"
                            dataset.processings[i].parameters = parameters
                            dataset.processings[i].algorithm = "random_oversampling"
                            df.to_csv(dataset.training_path, index=False)

                        except Exception as exc:
                            error = True
                            dataset.processings[i].status = "Error"
                            dataset.processings[i].log_error = str(exc)
                    case 'smote_oversampling':
                        try:
                            df, parameters = self._apply_smote_oversampling(df,
                                                                            algorithms_post.algorithms[
                                                                                cont].features)
                            dataset.processings[i].status = "Applied"
                            dataset.processings[i].parameters = parameters
                            dataset.processings[i].algorithm = "smote_oversampling"
                            df.to_csv(dataset.training_path, index=False)

                        except Exception as exc:
                            error = True
                            dataset.processings[i].status = "Error"
                            dataset.processings[i].log_error = str(exc)

                self.dataset_repository.save(dataset)
            elif error:
                dataset.processings[i].status = "Aborted"

        if len(list(filter(lambda x: x.status == "Applied" and x.type == "Preprocessing",
                           dataset.processings))) > 0:
            dataset.status = StatusDatasetEnum.preprocessed

        self.dataset_repository.save(dataset)

    def _extract_features_dataset(self, dataset, algorithm_post):

        all_processings = dataset.processings.copy()
        for i in range(len(all_processings)):
            if all_processings[i].type == "Feature Extraction" and all_processings[
                i].status == 'In queue':
                dataset.processings[i].status = 'In progress'
                self.dataset_repository.save(dataset)
                df = pd.read_csv(dataset.training_path)
                match algorithm_post.algorithm:
                    case 'skip':
                        if "timestamp" in df.columns:
                            df = df.drop("timestamp", axis=1)
                        dataset.processings[i].status = "Applied"
                        dataset.processings[i].algorithm = "skip"
                        df.to_csv(dataset.training_path, index=False)
                    case 'pca':
                        try:
                            df, parameters = self._apply_pca(df, algorithm_post.parameter)
                            dataset.processings[i].status = "Applied"
                            dataset.processings[i].parameters = parameters
                            dataset.processings[i].algorithm = "pca"

                            df.to_csv(dataset.training_path, index=False)
                        except Exception as exc:
                            dataset.processings[i].status = "Error"
                            dataset.processings[i].log_error = str(exc)
                    case 'lda':
                        try:
                            df, parameters = self._apply_lda(df, algorithm_post.parameter)
                            dataset.processings[i].status = "Applied"
                            dataset.processings[i].parameters = parameters
                            dataset.processings[i].algorithm = "lda"
                            df.to_csv(dataset.training_path, index=False)
                        except Exception as exc:
                            dataset.processings[i].status = "Error"
                            dataset.processings[i].log_error = str(exc)
                    case 'autoencoder':
                        try:
                            df, parameters = self._apply_autoencoder(df, algorithm_post.parameter)
                            dataset.processings[i].status = "Applied"
                            dataset.processings[i].parameters = parameters
                            dataset.processings[i].algorithm = "autoencoder"
                            df.to_csv(dataset.training_path, index=False)
                        except Exception as exc:
                            dataset.processings[i].status = "Error"
                            dataset.processings[i].log_error = str(exc)
                    case 'svd':
                        try:
                            df, parameters = self._apply_svd(df, algorithm_post.parameter)
                            dataset.processings[i].status = "Applied"
                            dataset.processings[i].parameters = parameters
                            dataset.processings[i].algorithm = "svd"
                            df.to_csv(dataset.training_path, index=False)
                        except Exception as exc:
                            dataset.processings[i].status = "Error"
                            dataset.processings[i].log_error = str(exc)

        if len(list(filter(lambda x: x.status == "Applied" and x.type == "Feature Extraction",
                           dataset.processings))) > 0:
            dataset.status = StatusDatasetEnum.extracted_features

        self.dataset_repository.save(dataset)

    def create_preprocessing_dataset(self, dataset_id: int, dataset_preprocessing_post: DatasetPreprocessingPost,
                                     background_tasks):

        dataset = self.dataset_repository.find_by_id(dataset_id)

        if dataset is None:
            raise DatasetNotFound
        if dataset.type != 'dataset_copy':
            raise DatasetNotProcessable

        if dataset.status == StatusDatasetEnum.extracted_features:
            raise DatasetAlreadyFeatureExtraction

        for algorithm in dataset_preprocessing_post.algorithms:
            algorithm_description = ""
            match algorithm.algorithm:
                case 'remove_outliers':
                    algorithm_description = f"Algorithm: Remove outliers\nFeatures selected: {algorithm.features}"
                case 'remove_duplicates':
                    algorithm_description = f"Algorithm: Remove duplicates,\nFeatures selected: {algorithm.features}"
                case 'min-max_normalization':
                    algorithm_description = f"Algorithm: Min-max normalization,\nFeatures selected: {algorithm.features}"

                case 'z_score_normalization':
                    algorithm_description = f"Algorithm: Z-score normalization,\nFeatures selected: {algorithm.features}"

                case 'one-hot_encoding':
                    algorithm_description = f"Algorithm: One-hot encoding,\nFeatures selected: {algorithm.features}"

                case 'standard_scaler_normalization':
                    algorithm_description = f"Algorithm: Standard scaler normalization,\nFeatures selected: {algorithm.features}"
                case 'drop_features':
                    algorithm_description = f"Algorithm: Drop features\nFeatures selected: {algorithm.features}"
                case 'random_undersampling':
                    algorithm_description = f"Algorithm: Random Under-Sampling"
                case 'nearmiss_undersampling':
                    algorithm_description = f"Algorithm: NearMiss Under-Sampling"
                case 'random_oversampling':
                    algorithm_description = f"Algorithm: Random Over-Sampling"
                case 'smote_oversampling':
                    algorithm_description = f"Algorithm: Smote Over-Sampling"
            dataset.processings.append(Processing(index=len(dataset.processings) + 1,
                                                  algorithm_description=algorithm_description,
                                                  type='Preprocessing',
                                                  status='In queue',
                                                  log_error="",
                                                  date=datetime.datetime.now().strftime("%d-%m-%Y %H:%M:%S"),
                                                  parameters={},
                                                  algorithm="",
                                                  ))

        dataset.status = StatusDatasetEnum.preprocessing
        self.dataset_repository.save(dataset)
        background_tasks.add_task(self._preprocess_dataset, dataset, dataset_preprocessing_post)
        return dataset

    def create_feature_extraction_dataset(self, dataset_id: int,
                                          dataset_feature_extraction_post: DatasetFeatureExtractionPost,
                                          background_tasks):

        dataset = self.dataset_repository.find_by_id(dataset_id)

        if dataset is None:
            raise DatasetNotFound
        if dataset.type != 'dataset_copy':
            raise DatasetNotProcessable

        if dataset.status == StatusDatasetEnum.extracted_features:
            raise DatasetAlreadyFeatureExtraction

        algorithm_description = ""
        match dataset_feature_extraction_post.algorithm:
            case 'skip':
                algorithm_description = "Skipped"
            case 'pca':
                algorithm_description = f"Algorithm: Principal Component Analysis\nNumber of component: {dataset_feature_extraction_post.parameter}"
            case 'lda':
                algorithm_description = f"Algorithm: Linear Discriminant Analysis\nNumber of component: {dataset_feature_extraction_post.parameter}"
            case 'autoencoder':
                algorithm_description = f"Algorithm: Autoencoder\nSize of the dimension: {dataset_feature_extraction_post.parameter}"
            case 'svd':
                algorithm_description = f"Algorithm: Singular Value Decomposition\nNumber of component: {dataset_feature_extraction_post.parameter}"

        dataset.processings.append(Processing(index=len(dataset.processings) + 1,
                                              algorithm_description=algorithm_description,
                                              type='Feature Extraction',
                                              status='In queue',
                                              log_error="",
                                              date=datetime.datetime.now().strftime("%d-%m-%Y %H:%M:%S"),
                                              parameters={},
                                              algorithm="",
                                              ))
        dataset.status = StatusDatasetEnum.extracting_features
        self.dataset_repository.save(dataset)
        background_tasks.add_task(self._extract_features_dataset, dataset, dataset_feature_extraction_post)
        return dataset

    def remove_failed_algorithms_processing(self, dataset_id: int) -> DatasetCopy:
        dataset = self.dataset_repository.find_by_id(dataset_id)

        if dataset is None:
            raise DatasetNotFound

        if dataset.type != 'dataset_copy':
            raise DatasetNotProcessable

        new_list = []
        cont = 1
        for processing in dataset.processings:
            if processing.status != "Error" and processing.status != "Aborted":
                processing.index = cont
                new_list.append(processing)
                cont = cont + 1
            else:
                self.dataset_repository.delete(processing)

        dataset.processings = new_list

        return self.dataset_repository.save(dataset)

    def create_plot(self, dataset_id: int,
                    plot_post: Union[DatasetScatterPlotPost, DatasetBoxPlotPost, DatasetHistogramPlotPost]):
        import uuid

        dataset = self.dataset_repository.find_by_id(dataset_id)

        if dataset is None:
            raise DatasetNotFound
        if dataset.type != 'dataset_copy':
            raise DatasetNotProcessable

        df = pd.read_csv(dataset.training_path)

        unique_labels = df['label'].unique()
        if not plot_post.malware in unique_labels:
            raise MalwareNotFoundInDataset

        df_subset = df[df['label'] == plot_post.malware]

        del df

        path = f"imgs/{uuid.uuid4()}.png"

        match plot_post:
            case DatasetScatterPlotPost():
                if not plot_post.x_axis_variable in df_subset.columns or not plot_post.y_axis_variable:
                    raise FeatureNotFoundInDataset

                self._generate_scatter_plot(df_subset, plot_post, path)

            case DatasetBoxPlotPost():
                if not plot_post.x_axis_variable in df_subset.columns:
                    raise FeatureNotFoundInDataset

                self._generate_box_plot(df_subset, plot_post, path)

            case DatasetHistogramPlotPost():
                if not plot_post.x_axis_variable in df_subset.columns:
                    raise FeatureNotFoundInDataset
                self._generate_hist_plot(df_subset, plot_post, path)

        plot = Plot(
            path=path
        )
        dataset.plots.append(plot)
        self.dataset_repository.save(dataset)
        with open(path, 'rb') as f:
            return {"id": plot.id, "data": base64.b64encode(f.read())}

    def _generate_scatter_plot(self, df: pd.DataFrame, plot_post: DatasetScatterPlotPost, path: str):
        plt.figure(figsize=(5, 4))

        sns.regplot(x=df[plot_post.x_axis_variable], y=df[plot_post.y_axis_variable])
        date = datetime.datetime.now().strftime("%d-%m-%Y %H:%M:%S")
        plt.xlabel(plot_post.x_axis_variable)
        plt.ylabel(plot_post.y_axis_variable)
        plt.title(
            f"Plot created: {date}\n{plot_post.x_axis_variable} vs {plot_post.y_axis_variable} during {plot_post.malware}")

        plt.savefig(path)
        plt.clf()

    def _generate_hist_plot(self, df: pd.DataFrame, plot_post: DatasetHistogramPlotPost, path: str):
        plt.figure(figsize=(5, 4))
        sns.histplot(df[plot_post.x_axis_variable], bins=plot_post.bins)
        date = datetime.datetime.now().strftime("%d-%m-%Y %H:%M:%S")

        plt.title(f"Plot created: {date}\n{plot_post.x_axis_variable} during {plot_post.malware}")
        plt.xlabel(plot_post.x_axis_variable)
        plt.ylabel("Frequency")
        plt.savefig(path)
        plt.clf()

    def _generate_box_plot(self, df: pd.DataFrame, plot_post: DatasetBoxPlotPost, path: str):
        plt.figure(figsize=(5, 4))
        sns.boxplot(x=df[plot_post.x_axis_variable])
        date = datetime.datetime.now().strftime("%d-%m-%Y %H:%M:%S")

        plt.title(f"Plot created: {date}\n{plot_post.x_axis_variable} during {plot_post.malware}")
        plt.xlabel(plot_post.x_axis_variable)
        plt.savefig(path)
        plt.clf()

    def get_all_plots_by_dataset_id(self, dataset_id: int):
        dataset = self.dataset_repository.find_by_id(dataset_id)

        if dataset is None:
            raise DatasetNotFound
        if dataset.type != 'dataset_copy':
            raise DatasetNotProcessable

        returned = []

        for plot in dataset.plots:
            with open(plot.path, 'rb') as f:
                returned.append({"id": plot.id, "data": base64.b64encode(f.read())})

        return returned

    def remove_plot(self, dataset_id: int, plot_id):
        dataset = self.dataset_repository.find_by_id(dataset_id)

        if dataset is None:
            raise DatasetNotFound
        if dataset.type != 'dataset_copy':
            raise DatasetNotProcessable

        for plot in dataset.plots:
            if plot.id == plot_id:
                self.dataset_repository.delete_plot(plot)

    @staticmethod
    def _apply_pca(df, parameter):

        if "timestamp" in df.columns:
            df = df.drop("timestamp", axis=1)

        X = df.drop('label', axis=1)
        y = df['label']

        pca = PCA(n_components=parameter)
        X_pca = pca.fit_transform(X)

        df = pd.DataFrame(data=X_pca, columns=[f'Component {i + 1}' for i in range(parameter)])
        df = pd.concat([df, y], axis=1)
        path = f"trainings/pca_{uuid.uuid4()}_model.joblib"
        dump(pca, path)

        parameters = {"path": path}
        return df, parameters

    @staticmethod
    def _apply_lda(df, parameter):
        if "timestamp" in df.columns:
            df = df.drop("timestamp", axis=1)

        X = df.drop('label', axis=1)
        y = df['label']

        lda = LDA(n_components=parameter)
        X_lda = lda.fit_transform(X, y)
        df = pd.DataFrame(data=X_lda, columns=[f'Component {i + 1}' for i in range(parameter)])
        df = pd.concat([df, y], axis=1)

        path = f"trainings/lda_{uuid.uuid4()}_model.joblib"
        dump(lda, path)

        parameters = {"path": path}
        return df, parameters

    @staticmethod
    def _apply_autoencoder(df, parameter):
        if "timestamp" in df.columns:
            df = df.drop("timestamp", axis=1)

        X = df.drop('label', axis=1)
        y = df['label']
        encoding_dim = parameter

        input_data = Input(shape=(X.shape[1],))

        encoded = Dense(encoding_dim, activation='relu')(input_data)

        decoded = Dense(X.shape[1], activation='sigmoid')(encoded)

        autoencoder = Model(input_data, decoded)

        encoder = Model(input_data, encoded)

        autoencoder.compile(optimizer='adam', loss='binary_crossentropy')

        autoencoder.fit(X, X, epochs=50, batch_size=256, shuffle=True)

        X_encoded = encoder.predict(X)

        df = pd.DataFrame(X_encoded, columns=[f'Component {i + 1}' for i in range(encoding_dim)])
        df['label'] = y

        path = f"trainings/autoencoder_{uuid.uuid4()}_model.h5"
        autoencoder.save(path)

        parameters = {"path": path}
        return df, parameters

    def _apply_svd(self, df, parameter):

        if "timestamp" in df.columns:
            df = df.drop("timestamp", axis=1)

        X = df.drop('label', axis=1)
        y = df['label']

        n_components = parameter

        svd = TruncatedSVD(n_components=n_components)
        X_svd = svd.fit_transform(X)
        df = pd.DataFrame(X_svd, columns=[f'Component {i + 1}' for i in range(n_components)])
        df['label'] = y

        path = f"trainings/svd_{uuid.uuid4()}_model.joblib"
        dump(svd, path)

        parameters = {"path": path}
        return df, parameters
