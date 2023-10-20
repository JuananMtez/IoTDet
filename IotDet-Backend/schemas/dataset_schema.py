from pydantic import BaseModel
from typing import Union

from models.models import StatusDatasetEnum


class DatasetModifyName(BaseModel):
    name: str


class DatasetProcessingResponse(BaseModel):
    index: int
    algorithm_description: str
    type: str
    status: str
    log_error: str
    date: str

    class Config:
        orm_mode = True


class DatasetResponse(BaseModel):
    id: int
    name: str
    scenario_name: str
    device_mender_id: str
    monitoring_script_name: str
    status: Union[StatusDatasetEnum, None]
    type: str

    class Config:
        orm_mode = True


class DatasetCopyResponse(DatasetResponse):
    processings: list[DatasetProcessingResponse]
    used_for: str
    is_shuffled: str
    train_size: str
    seed: str

    class Config:
        orm_mode = True


class DatasetRecordingResponse(DatasetResponse):
    datasets_copy: list[DatasetCopyResponse]

    class Config:
        orm_mode = True


class DatasetMonitoringResponse(DatasetResponse):
    class Config:
        orm_mode = True


class DatasetDataResponse(BaseModel):
    columns: list[str]
    rows: list[dict]


class FeatureFloatGroupedByMalwareResponse(BaseModel):
    malware_name: str
    data_min: float
    data_max: float
    mean: float
    standard_deviation: float
    percentile_25: float
    percentile_50: float
    percentile_75: float


class FeatureFloatInfoResponse(BaseModel):
    name: str
    values_grouped_by_malware: list[FeatureFloatGroupedByMalwareResponse]
    type: str


class FeatureStrValueResponse(BaseModel):
    unique_value_name: str
    count: int
    frequency: float


class FeatureStrGroupedByMalwareResponse(BaseModel):
    malware_name: str
    values: list[FeatureStrValueResponse]


class FeatureStrInfoResponse(BaseModel):
    name: str
    values_grouped: list[FeatureStrGroupedByMalwareResponse]
    type: str


class MalwareInfoResponse(BaseModel):
    name: str
    count: int
    frequency: float


class DatasetInfoResponse(BaseModel):
    id: int
    name: str
    type: str
    scenario_name: str
    device_mender_id: str
    monitoring_script_name: str


class DatasetRecordingInfoResponse(DatasetInfoResponse):
    datasets_copy: list[DatasetCopyResponse]
    features: list[Union[FeatureStrInfoResponse, FeatureFloatInfoResponse]]
    malware: list[MalwareInfoResponse]
    count: int


class DatasetCopyInfoResponse(DatasetInfoResponse):
    dataset_parent_name: str
    used_for: str
    is_shuffled: str
    seed: str
    train_size: str
    features_training_dataset: list[Union[FeatureStrInfoResponse, FeatureFloatInfoResponse]]
    malware_training_dataset: list[MalwareInfoResponse]
    count_training_dataset: int
    features_testing_dataset: list[Union[FeatureStrInfoResponse, FeatureFloatInfoResponse]]
    malware_testing_dataset: list[MalwareInfoResponse]
    count_testing_dataset: int


class DatasetMalwareResponse(BaseModel):
    name: str


class DatasetColumnResponse(DatasetMalwareResponse):
    type: str


class DatasetPreprocessingSpecific(BaseModel):
    algorithm: str
    features: list[str]


class DatasetPreprocessingPost(BaseModel):
    algorithms: list[DatasetPreprocessingSpecific]


class DatasetFeatureExtractionPost(BaseModel):
    algorithm: str
    parameter: int


class DatasetPlotPost(BaseModel):
    x_axis_variable: str
    malware: str


class DatasetScatterPlotPost(DatasetPlotPost):
    y_axis_variable: str


class DatasetBoxPlotPost(DatasetPlotPost):
    pass


class DatasetHistogramPlotPost(DatasetPlotPost):
    bins: int


class DatasetCopyPost(BaseModel):
    train_size: float
    shuffle: bool
    used_for: str
    seed: Union[None, int]
