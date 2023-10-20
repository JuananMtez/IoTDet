from fastapi import APIRouter, Depends, HTTPException, Response, Request, BackgroundTasks
from config.security import get_current_user
from config.database import get_db
from schemas.training_schema import TrainingPost, TrainingResponse, TrainingModifyName
from services.training_service import TrainingService
from exceptions.user_exception import UserNoPermission
from exceptions.training_exception import TrainingNotFound, TrainingNotRemovable, DatasetNotEvaluable
from fastapi.responses import FileResponse

training_controller = APIRouter(
    prefix="/training",
    tags=["trainings"])


@training_controller.get("/", response_model=list[TrainingResponse])
def find_all_models(db=Depends(get_db),
                    exists_current_user=Depends(get_current_user)):
    return TrainingService(db, exists_current_user).find_all()


@training_controller.get("/{training_id}", response_model=TrainingResponse)
def find_by_id(training_id: int, db=Depends(get_db),
               exists_current_user=Depends(get_current_user)):
    try:
        return TrainingService(db, exists_current_user).find_by_id(training_id)
    except TrainingNotFound:
        raise HTTPException(status_code=404, detail="Training not found")


@training_controller.delete("/{training_id}")
def delete_training(training_id: int, db=Depends(get_db),
                    exists_current_user=Depends(get_current_user)):
    try:

        TrainingService(db, exists_current_user).remove_model(training_id)
        return Response(status_code=204)
    except UserNoPermission:
        raise HTTPException(status_code=403, detail="The user no permission")
    except TrainingNotFound:
        raise HTTPException(status_code=404, detail="Training not found")
    except TrainingNotRemovable:
        raise HTTPException(status_code=403, detail="Training not removable")


@training_controller.post('/', response_model=list[TrainingResponse])
def create_models(models_post: TrainingPost, background_tasks: BackgroundTasks, db=Depends(get_db),
                  exists_current_user=Depends(get_current_user)):
    return TrainingService(db, exists_current_user).create_models(models_post, background_tasks)


@training_controller.patch('/{training_id}/name/modify', response_model=TrainingResponse)
def modify_name(training_id: int, name_patch: TrainingModifyName, background_tasks: BackgroundTasks, db=Depends(get_db),
                exists_current_user=Depends(get_current_user)):
    try:

        return TrainingService(db, exists_current_user).modify_name(training_id, name_patch)

    except UserNoPermission:
        raise HTTPException(status_code=403, detail="The user no permission")
    except TrainingNotFound:
        raise HTTPException(status_code=404, detail="Training not found")


@training_controller.get('/{training_id}/download')
def download_training(training_id: int, db=Depends(get_db),
                      exists_current_user=Depends(get_current_user)):
    try:
        training = TrainingService(db, exists_current_user).download_training(training_id)
        return FileResponse(training["path"], filename=training["filename"])
    except TrainingNotFound:
        raise HTTPException(status_code=404, detail="Training not found")


@training_controller.get('/monitoring_script/{monitoring_script_name}/classification/find',
                         response_model=list[TrainingResponse])
def find_all_classification_trainings_by_monitoring_script(
        monitoring_script_name: str,
        db=Depends(get_db),
        exists_current_user=Depends(get_current_user)):
    return TrainingService(db,
                           exists_current_user).find_all_classification_models_by_monitoring_script(
        monitoring_script_name)


@training_controller.get('/monitoring_script/{monitoring_script_name}/anomaly_detection/find',
                         response_model=list[TrainingResponse])
def find_all_anomaly_detection_trainings_and_monitoring_script(monitoring_script_name: str,
                                                                         db=Depends(get_db),
                                                                         exists_current_user=Depends(get_current_user)):
    return TrainingService(db,
                           exists_current_user).find_all_anomaly_detection_models_by_monitoring_script(monitoring_script_name)



@training_controller.get('/{training_id}/dataset/{dataset_id}/evaluate')
def evaluate_model_with_dataset(training_id: int, dataset_id: int, db=Depends(get_db), exists_current_user=Depends(get_current_user)):
    try:
        return TrainingService(db, exists_current_user).evaluate_model_with_other_dataset(training_id, dataset_id)
    except UserNoPermission:
        raise HTTPException(status_code=403, detail="The user no permission")
    except TrainingNotFound:
        raise HTTPException(status_code=404, detail="Training not found")
    except DatasetNotEvaluable:
        raise HTTPException(status_code=404, detail="Dataset contains different features")


