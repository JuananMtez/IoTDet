from fastapi import APIRouter, Depends, HTTPException, Response, Request, BackgroundTasks
from config.security import get_current_user
from config.database import get_db
from exceptions.dataset_exception import DatasetNotFound, FeatureNotFoundInDataset, DatasetNotDeleteable, \
    DatasetInfoNotVisible, DatasetNotProcessable, MalwareNotFoundInDataset, DatasetNotRecordingType, \
    DatasetAlreadyFeatureExtraction
from schemas.dataset_schema import DatasetResponse, DatasetCopyResponse, DatasetModifyName, DatasetRecordingResponse, \
    DatasetRecordingInfoResponse, DatasetCopyInfoResponse, DatasetProcessingResponse, DatasetColumnResponse, \
    DatasetMalwareResponse, DatasetMonitoringResponse, DatasetPreprocessingPost, DatasetScatterPlotPost, \
    DatasetBoxPlotPost, DatasetHistogramPlotPost, DatasetFeatureExtractionPost, DatasetCopyPost
from services.dataset_service import DatasetService
from exceptions.user_exception import UserNoPermission
from fastapi.responses import FileResponse
from sqlalchemy.exc import IntegrityError
from typing import Union

dataset_controller = APIRouter(
    prefix="/dataset",
    tags=["datasets"])


@dataset_controller.get("/recording/finished", response_model=list[DatasetRecordingResponse])
def find_all_datasets_recording_finished(db=Depends(get_db),
                                         exists_current_user=Depends(get_current_user)):
    return DatasetService(db, exists_current_user).find_all_datasets_recording_finished()


@dataset_controller.get("/features-extracted", response_model=list[DatasetCopyResponse])
def find_all_datasets_copy_features_extracted(db=Depends(get_db),
                                              exists_current_user=Depends(get_current_user)):
    return DatasetService(db, exists_current_user).find_all_datasets_features_extracted()


@dataset_controller.get("/{dataset_id}",
                        response_model=Union[DatasetRecordingResponse, DatasetCopyResponse, DatasetMonitoringResponse])
def find_dataset_by_id(dataset_id: int, db=Depends(get_db),
                       exists_current_user=Depends(get_current_user)):
    try:
        return DatasetService(db, exists_current_user).find_dataset_by_id(dataset_id)
    except DatasetNotFound:
        raise HTTPException(status_code=404, detail="Dataset not found")


@dataset_controller.post("/recording/{dataset_id}/copy", response_model=DatasetCopyResponse)
def create_dataset_copy(dataset_id: int, dataset_copy_post: DatasetCopyPost, db=Depends(get_db),
                        exists_current_user=Depends(get_current_user)):
    try:
        return DatasetService(db, exists_current_user).create_copy(dataset_id, dataset_copy_post)
    except DatasetNotFound:
        raise HTTPException(status_code=404, detail="Dataset not found")
    except UserNoPermission:
        raise HTTPException(status_code=403, detail="User no permission")


@dataset_controller.get("/{dataset_id}/feature/{feature_name}/plot/online")
def get_data_from_dataset_by_feature_online(dataset_id: int, feature_name: str, db=Depends(get_db),
                                            exists_current_user=Depends(get_current_user)):
    try:
        return DatasetService(db, exists_current_user).get_data_from_dataset_by_feature_online(dataset_id, feature_name)
    except DatasetNotFound:
        raise HTTPException(status_code=404, detail="Dataset not found")

    except FeatureNotFoundInDataset:
        raise HTTPException(status_code=404, detail="Feature not found in dataset")


@dataset_controller.get("/{dataset_id}/type/{prediction_type}/plot/online")
def get_data_from_dataset_prediction_online(dataset_id: int, prediction_type: str, db=Depends(get_db),
                                            exists_current_user=Depends(get_current_user)):
    try:
        return DatasetService(db, exists_current_user).get_data_from_dataset_prediction_online(dataset_id,
                                                                                               prediction_type)
    except DatasetNotFound:
        raise HTTPException(status_code=404, detail="Dataset not found")

    except FeatureNotFoundInDataset:
        raise HTTPException(status_code=404, detail="Feature not found in dataset")


@dataset_controller.get("/{dataset_id}/feature/{feature_name}/plot/offline")
def get_data_from_dataset_by_feature_offline(dataset_id: int, feature_name: str, db=Depends(get_db),
                                             exists_current_user=Depends(get_current_user)):
    try:
        return DatasetService(db, exists_current_user).get_data_from_dataset_by_feature_offline(dataset_id,
                                                                                                feature_name)
    except DatasetNotFound:
        raise HTTPException(status_code=404, detail="Dataset not found")

    except FeatureNotFoundInDataset:
        raise HTTPException(status_code=404, detail="Feature not found in dataset")


@dataset_controller.patch("/{dataset_id}/name/modify", response_model=DatasetResponse)
def modify_name_dataset(dataset_id: int, dataset_patch: DatasetModifyName, db=Depends(get_db),
                        exists_current_user=Depends(get_current_user)):
    try:
        return DatasetService(db, exists_current_user).modify_name_dataset(dataset_id, dataset_patch)
    except DatasetNotFound:
        raise HTTPException(status_code=404, detail="Dataset not found")
    except UserNoPermission:
        raise HTTPException(status_code=403, detail="User no permission")
    except IntegrityError:
        raise HTTPException(status_code=409, detail="The name of the dataset is not available")


@dataset_controller.delete("/{dataset_id}")
def delete_recording_dataset_copied(dataset_id: int, db=Depends(get_db),
                                    exists_current_user=Depends(get_current_user)):
    try:
        DatasetService(db, exists_current_user).delete_dataset_recording_copied(dataset_id)
        return Response(status_code=204)
    except DatasetNotFound:
        raise HTTPException(status_code=404, detail="Dataset not found")
    except UserNoPermission:
        raise HTTPException(status_code=403, detail="User no permission")
    except DatasetNotDeleteable:
        raise HTTPException(status_code=403, detail="Dataset cannot be deleted")


@dataset_controller.get("/{dataset_id}/recording/download")
def download_recording_dataset(dataset_id: int, db=Depends(get_db),
                               exists_current_user=Depends(get_current_user)):
    try:
        dataset = DatasetService(db, exists_current_user).download_dataset(dataset_id, "recording")
        return FileResponse(dataset["path"], filename=dataset["filename"])
    except DatasetNotRecordingType:
        raise HTTPException(status_code=404, detail="Dataset not recording type")


    except DatasetNotFound:
        raise HTTPException(status_code=404, detail="Dataset not found")


@dataset_controller.get("/{dataset_id}/training/download")
def download_training_dataset(dataset_id: int, db=Depends(get_db),
                              exists_current_user=Depends(get_current_user)):
    try:
        dataset = DatasetService(db, exists_current_user).download_dataset(dataset_id, "training")
        return FileResponse(dataset["path"], filename=dataset["filename"])

    except DatasetNotFound:
        raise HTTPException(status_code=404, detail="Dataset not found")


@dataset_controller.get("/{dataset_id}/testing/download")
def download_testing_dataset(dataset_id: int, db=Depends(get_db),
                             exists_current_user=Depends(get_current_user)):
    try:
        dataset = DatasetService(db, exists_current_user).download_dataset(dataset_id, "testing")
        return FileResponse(dataset["path"], filename=dataset["filename"])

    except DatasetNotFound:
        raise HTTPException(status_code=404, detail="Dataset not found")


@dataset_controller.get("/{dataset_id}/data")
def get_data_dataset(dataset_id: int, db=Depends(get_db),
                     exists_current_user=Depends(get_current_user)):
    try:
        return DatasetService(db, exists_current_user).get_dataset_data(dataset_id)
    except DatasetNotFound:
        raise HTTPException(status_code=404, detail="Dataset not found")


@dataset_controller.get("/{dataset_id}/info",
                        response_model=Union[DatasetRecordingInfoResponse, DatasetCopyInfoResponse])
def get_info_dataset(dataset_id: int, db=Depends(get_db),
                     exists_current_user=Depends(get_current_user)):
    try:
        return DatasetService(db, exists_current_user).get_info_dataset(dataset_id)
    except DatasetNotFound:
        raise HTTPException(status_code=404, detail="Dataset not found")
    except DatasetInfoNotVisible:
        raise HTTPException(status_code=403, detail="Dataset not visible")


@dataset_controller.post("/{dataset_id}/preprocess", response_model=DatasetCopyResponse)
def preprocess_dataset(dataset_id: int, dataset_preprocessing_post: DatasetPreprocessingPost,
                       background_tasks: BackgroundTasks, db=Depends(get_db),
                       exists_current_user=Depends(get_current_user)):
    try:
        return DatasetService(db, exists_current_user).create_preprocessing_dataset(dataset_id,
                                                                                    dataset_preprocessing_post,
                                                                                    background_tasks)

    except DatasetNotFound:
        raise HTTPException(status_code=404, detail="Dataset not found")
    except DatasetNotProcessable:
        raise HTTPException(status_code=404, detail="Dataset not processable")
    except DatasetAlreadyFeatureExtraction:
        raise HTTPException(status_code=403, detail="Features extraction already applied")


@dataset_controller.post("/{dataset_id}/extract-features", response_model=DatasetCopyResponse)
def extract_features_dataset(dataset_id: int, dataset_feature_extraction_post: DatasetFeatureExtractionPost,
                             background_tasks: BackgroundTasks, db=Depends(get_db),
                             exists_current_user=Depends(get_current_user)):
    try:
        return DatasetService(db, exists_current_user).create_feature_extraction_dataset(dataset_id,
                                                                                         dataset_feature_extraction_post,
                                                                                         background_tasks)
    except DatasetNotFound:
        raise HTTPException(status_code=404, detail="Dataset not found")
    except DatasetNotProcessable:
        raise HTTPException(status_code=404, detail="Dataset not processable")
    except DatasetAlreadyFeatureExtraction:
        raise HTTPException(status_code=403, detail="Features extraction already applied")


@dataset_controller.get("/{dataset_id}/processings/applied", response_model=list[DatasetProcessingResponse])
def get_all_processings_applied_to_dataset(dataset_id: int, db=Depends(get_db),
                                           exists_current_user=Depends(get_current_user)):
    try:
        return DatasetService(db, exists_current_user).get_all_processings_applied_to_dataset(dataset_id)
    except DatasetNotFound:
        raise HTTPException(status_code=404, detail="Dataset not found")

    except DatasetNotProcessable:
        raise HTTPException(status_code=404, detail="Dataset not processable")


@dataset_controller.get("/{dataset_id}/columns", response_model=list[DatasetColumnResponse])
def get_columns_from_dataset(dataset_id: int, db=Depends(get_db),
                             exists_current_user=Depends(get_current_user)):
    try:
        return DatasetService(db, exists_current_user).get_all_columns_dataset(dataset_id)
    except DatasetNotFound:
        raise HTTPException(status_code=404, detail="Dataset not found")


@dataset_controller.get("/{dataset_id}/malware", response_model=list[DatasetMalwareResponse])
def get_malware_from_dataset(dataset_id: int, db=Depends(get_db),
                             exists_current_user=Depends(get_current_user)):
    try:
        return DatasetService(db, exists_current_user).get_all_malware_dataset(dataset_id)
    except DatasetNotFound:
        raise HTTPException(status_code=404, detail="Dataset not found")


@dataset_controller.patch("/{dataset_id}/process/remove/failed", response_model=DatasetCopyResponse)
def remove_failed_algorithms_processing(dataset_id: int, db=Depends(get_db),
                                        exists_current_user=Depends(get_current_user)):
    try:
        return DatasetService(db, exists_current_user).remove_failed_algorithms_processing(dataset_id)
    except DatasetNotFound:
        raise HTTPException(status_code=404, detail="Dataset not found")
    except DatasetNotProcessable:
        raise HTTPException(status_code=404, detail="Dataset not processable")


@dataset_controller.post("/{dataset_id}/plot")
def generate_dataset_plot(dataset_id: int,
                          plot_post: Union[DatasetScatterPlotPost, DatasetHistogramPlotPost, DatasetBoxPlotPost],
                          db=Depends(get_db),
                          exists_current_user=Depends(get_current_user)):
    try:
        return DatasetService(db, exists_current_user).create_plot(dataset_id, plot_post)
    except DatasetNotFound:
        raise HTTPException(status_code=404, detail="Dataset not found")
    except FeatureNotFoundInDataset:
        raise HTTPException(status_code=404, detail="Feature not found")
    except MalwareNotFoundInDataset:
        raise HTTPException(status_code=404, detail="Malware not found")

    except DatasetNotProcessable:
        raise HTTPException(status_code=404, detail="Dataset not processable")


@dataset_controller.get("/{dataset_id}/plot")
def get_all_plots_by_dataset(dataset_id: int, db=Depends(get_db),
                             exists_current_user=Depends(get_current_user)):
    try:
        return DatasetService(db, exists_current_user).get_all_plots_by_dataset_id(dataset_id)
    except DatasetNotFound:
        raise HTTPException(status_code=404, detail="Dataset not found")

    except DatasetNotProcessable:
        raise HTTPException(status_code=404, detail="Dataset not processable")


@dataset_controller.delete("/{dataset_id}/plot/{plot_id}")
def remove_plot(dataset_id: int, plot_id: int, db=Depends(get_db),
                exists_current_user=Depends(get_current_user)):
    try:
        DatasetService(db, exists_current_user).remove_plot(dataset_id, plot_id)
        return Response(status_code=204)

    except DatasetNotFound:
        raise HTTPException(status_code=404, detail="Dataset not found")

    except DatasetNotProcessable:
        raise HTTPException(status_code=404, detail="Dataset not processable")
