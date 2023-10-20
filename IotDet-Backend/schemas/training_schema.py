from pydantic import BaseModel
from typing import Union


class GNBPost(BaseModel):
    pass


class KNNManualPost(BaseModel):
    knn_n_neighbors: int


class KNNSearchPost(BaseModel):
    search_knn_n_neighbors: list[int]


class SVMManualPost(BaseModel):
    svm_C: float
    svm_kernel: str
    svm_gamma: Union[float, str]


class SVMSearchPost(BaseModel):
    search_svm_C: list[float]
    search_svm_kernel: list[str]
    search_svm_gamma: list[Union[float, str]]


class SGDManualPost(BaseModel):
    sgd_loss: str
    sgd_penalty: str
    sgd_alpha: float
    sgd_learning_rate: str


class SGDSearchPost(BaseModel):
    search_sgd_loss: list[str]
    search_sgd_penalty: list[str]
    search_sgd_alpha: list[float]
    search_sgd_learning_rate: list[str]


class DTManualPost(BaseModel):
    dt_max_depth: Union[int, str]
    dt_min_samples_split: int


class DTSearchPost(BaseModel):
    search_dt_max_depth: list[str]
    search_dt_min_samples_split: list[int]


class RFManualPost(BaseModel):
    rf_n_estimators: int
    rf_max_depth: Union[int, str]
    rf_min_samples_split: int


class RFSearchPost(BaseModel):
    search_rf_n_estimators: list[int]
    search_rf_max_depth: list[str]
    search_rf_min_samples_split: list[int]


class LOFManualPost(BaseModel):
    lof_n_neighbors: int
    lof_contamination: float


class LOFSearchPost(BaseModel):
    search_lof_n_neighbors: list[int]
    search_lof_contamination: list[float]


class OCSVMManualPost(BaseModel):
    ocsvm_gamma: Union[float, str]
    ocsvm_kernel: str
    ocsvm_nu: float


class OCSVMSearchPost(BaseModel):
    search_ocsvm_gamma: list[Union[float, str]]
    search_ocsvm_kernel: list[str]
    search_ocsvm_nu: list[float]


class IFManualPost(BaseModel):
    if_n_estimators: int
    if_contamination: float


class IFSearchPost(BaseModel):
    search_if_n_estimators: list[int]
    search_if_contamination: list[float]


class DropoutSearchPost(BaseModel):
    rate: list[float]

class DropoutPost(BaseModel):
    rate: float


class DenseLayerSearchPost(BaseModel):
    units: int
    activation: list[str]

class DenseLayerPost(BaseModel):
    units: int
    activation: str


class RepeatVectorLayerSearchPost(BaseModel):
    n: list[int]

class RepeatVectorLayerPost(BaseModel):
    n: int

class MaxPooling1DLayerSearchPost(BaseModel):
    pool_size: list[float]

class MaxPooling1DLayerPost(BaseModel):
    pool_size: float


class FlattenLayerPost(BaseModel):
    pass

class Conv1DLayerSearchPost(BaseModel):
    filters: list[int]
    kernel_size: list[int]
    activation: list[str]

class Conv1DLayerPost(BaseModel):
    filters: int
    kernel_size: int
    activation: str

class LSTMLayerSearchPost(BaseModel):
    units: int
    return_sequences: str
    activation: list[str]

class LSTMLayerPost(BaseModel):
    units: int
    return_sequences: str
    activation: str


class GRULayerSearchPost(BaseModel):
    units: int
    return_sequences: str
    activation: list[str]

class GRULayerPost(BaseModel):
    units: int
    return_sequences: str
    activation: str


class InputLayerSearchPost(BaseModel):
    shape: str


class InputLayerPost(BaseModel):
    shape: str




class SpecificLayerPost(BaseModel):
    name: str
    layer: Union[
        InputLayerPost, GRULayerPost, LSTMLayerPost, Conv1DLayerPost, RepeatVectorLayerPost, DenseLayerPost, DropoutPost, MaxPooling1DLayerPost, FlattenLayerPost]


class NNPost(BaseModel):
    layers: list[SpecificLayerPost]
    optimizer: str
    loss: str
    epochs: int
    learning_rate: float
    batch_size: int
    threshold: float


class SpecificLayerSearchPost(BaseModel):
    name: str
    layer: Union[
        InputLayerSearchPost, GRULayerSearchPost, LSTMLayerSearchPost, Conv1DLayerSearchPost, RepeatVectorLayerSearchPost, DenseLayerSearchPost, DropoutSearchPost, MaxPooling1DLayerSearchPost, FlattenLayerPost]


class NNSearchPost(BaseModel):
    layers: list[SpecificLayerPost]
    optimizers: list[str]
    loss: str
    epochs: list[int]
    learning_rates: list[float]
    batch_sizes: list[int]
    thresholds: list[float]



class TrainingSpecificPost(BaseModel):
    device_mender_id: str
    monitoring_script_name: str
    dataset_id: int
    algorithm: Union[
        KNNManualPost, KNNSearchPost, SVMManualPost, SVMSearchPost, SGDManualPost, SGDSearchPost, DTManualPost,
        DTSearchPost, RFManualPost, RFSearchPost, LOFManualPost, LOFSearchPost, OCSVMManualPost, OCSVMSearchPost,
        IFManualPost, IFSearchPost, NNPost, NNSearchPost, GNBPost]
    labels: list[str]
    method: str
    hyperparameters_tuning: str
    evaluation_metric: str
    folds: int
    iterations: int

    type: str


class TrainingPost(BaseModel):
    models: list[TrainingSpecificPost]


class TrainingResponse(BaseModel):
    id: int
    name: str
    device_mender_id: str
    dataset_name: str
    algorithm_description: str
    confusion_matrix_img: str
    type: str
    status: str
    monitoring_script_name: str
    log_error: str
    method: str
    output_validation: str
    accuracy_path: str
    loss_path: str
    classification_classes: Union[None, list[str]]


class TrainingResponseReduced(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True


class TrainingModifyName(BaseModel):
    name: str
