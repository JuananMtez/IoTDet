import json
from typing import Union

from fastapi import APIRouter, Depends, UploadFile, HTTPException, Form
from fastapi.responses import FileResponse
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from config.database import get_db
from config.security import get_current_user
from exceptions.file_exception import UserNoPermission, FileNotFound, NotTwoMalwareFiles
from schemas.file_schema import MonitoringScriptPost, MonitoringScriptResponse, DeployfileMonitoringScriptPost, \
    DeployfileMonitoringScriptResponse, DeployfileMalwareResponse, MalwareResponse, FilePost, DeployfileMalwarePost, \
    MitigationScriptPost, MitigationScriptResponse, DeployfileMitigationScriptPost, DeployfileMitigationScriptResponse
from services.file_service import FileService

file_controller = APIRouter(
    prefix="/file",
    tags=["files"])


@file_controller.post("/monitoring_script", response_model=MonitoringScriptResponse)
def upload_monitoring_script(file: UploadFile, monitoring_script: MonitoringScriptPost = Depends(), db=Depends(get_db),
                             exists_current_user=Depends(get_current_user)):
    try:
        return FileService(db=db).upload_monitoring_script(file, monitoring_script, exists_current_user)
    except UserNoPermission:
        raise HTTPException(status_code=403, detail="The user can not upload files due to the permission assigned")
    except IntegrityError:
        raise HTTPException(status_code=409, detail="The name of the monitoring script is not available")


@file_controller.get("/monitoring_script/{monitoring_script_id}/download")
def download_monitoring_script(monitoring_script_id: int, exists_current_user=Depends(get_current_user),
                               db: Session = Depends(get_db)):
    try:
        monitoring_script = FileService(db).find_monitoring_script_by_id_download(
            monitoring_script_id)
        return FileResponse(monitoring_script["path"], filename=monitoring_script["filename"])

    except FileNotFound:
        raise HTTPException(status_code=404, detail="File not found")


@file_controller.get("/mitigation_script/{mitigation_script_id}/download")
def download_mitigation_script(mitigation_script_id: int, exists_current_user=Depends(get_current_user),
                               db: Session = Depends(get_db)):
    try:
        mitigation_script = FileService(db).find_mitigation_script_by_id_download(
            mitigation_script_id)
        return FileResponse(mitigation_script["path"], filename=mitigation_script["filename"])

    except FileNotFound:
        raise HTTPException(status_code=404, detail="File not found")


@file_controller.get("/mitigation_script/{mitigation_script_id}/download/device")
def download_mitigation_script(mitigation_script_id: int, db: Session = Depends(get_db)):
    try:
        mitigation_script = FileService(db).find_mitigation_script_by_id_download(
            mitigation_script_id)
        return FileResponse(mitigation_script["path"], filename=mitigation_script["filename"])

    except FileNotFound:
        raise HTTPException(status_code=404, detail="File not found")


@file_controller.get("/monitoring_script/{monitoring_script_id}/download/device")
def download_monitoring_script_by_device(monitoring_script_id: int,
                                         db: Session = Depends(get_db)):
    try:
        monitoring_script = FileService(db).find_monitoring_script_by_id_download(
            monitoring_script_id)
        return FileResponse(monitoring_script["path"], media_type='application/octet-stream',
                            filename=monitoring_script["filename"])

    except FileNotFound:
        raise HTTPException(status_code=404, detail="File not found")


@file_controller.get("/monitoring_script", response_model=list[MonitoringScriptResponse])
def get_all_monitoring_scripts(db=Depends(get_db),
                               exists_current_user=Depends(get_current_user)):
    return FileService(db).get_all_monitoring_scripts()


@file_controller.get("/monitoring_script/validated", response_model=list[MonitoringScriptResponse])
def get_all_validated_monitoring_scripts(db=Depends(get_db),
                                         exists_current_user=Depends(get_current_user)):
    return FileService(db).get_all_validated_monitoring_scripts()


@file_controller.get("/mitigation_script/validated", response_model=list[MitigationScriptResponse])
def get_all_validated_mitigation_scripts(db=Depends(get_db),
                                         exists_current_user=Depends(get_current_user)):
    return FileService(db).get_all_validated_mitigation_scripts()


@file_controller.get("/monitoring_script/{monitoring_script_id}/code")
def get_code_from_monitoring_script(monitoring_script_id: int, db: Session = Depends(get_db),
                                    exists_current_user=Depends(get_current_user)):
    try:
        return FileService(db).get_code_monitoring_script(monitoring_script_id)

    except FileNotFound:
        raise HTTPException(status_code=404, detail="File not found")


@file_controller.get("/mitigation_script/{mitigation_script_id}/code")
def get_code_from_mitigation_script(mitigation_script_id: int, db: Session = Depends(get_db),
                                    exists_current_user=Depends(get_current_user)):
    try:
        return FileService(db).get_code_mitigation_script(mitigation_script_id)

    except FileNotFound:
        raise HTTPException(status_code=404, detail="File not found")


@file_controller.post('/deployfile/monitoring_script', response_model=DeployfileMonitoringScriptResponse)
def upload_deployfile_for_monitoring_script(file: UploadFile,
                                            deployfile_post: DeployfileMonitoringScriptPost = Depends(),
                                            db: Session = Depends(get_db),
                                            exists_current_user=Depends(get_current_user)):
    try:
        return FileService(db).upload_deployfile_for_monitoring_script(file, deployfile_post, exists_current_user)

    except FileNotFound:
        raise HTTPException(status_code=404, detail="File not found")

    except IntegrityError:
        raise HTTPException(status_code=403, detail="The name of the deployfile is not available")


@file_controller.post('/deployfile/mitigation_script', response_model=DeployfileMitigationScriptResponse)
def upload_deployfile_for_mitigation_script(file: UploadFile,
                                            deployfile_post: DeployfileMitigationScriptPost = Depends(),
                                            db: Session = Depends(get_db),
                                            exists_current_user=Depends(get_current_user)):
    try:
        return FileService(db).upload_deployfile_for_mitigation_script(file, deployfile_post, exists_current_user)

    except FileNotFound:
        raise HTTPException(status_code=404, detail="File not found")

    except IntegrityError:
        raise HTTPException(status_code=403, detail="The name of the deployfile is not available")


@file_controller.get('/deployfile/monitoring_script', response_model=list[DeployfileMonitoringScriptResponse])
def get_all_deployfiles_monitoring_script(db: Session = Depends(get_db), exists_current_user=Depends(get_current_user)):
    return FileService(db).get_all_deployfiles_monitoring_script()


@file_controller.get('/deployfile/mitigation_script', response_model=list[DeployfileMitigationScriptResponse])
def get_all_deployfiles_mitigation_script(db: Session = Depends(get_db), exists_current_user=Depends(get_current_user)):
    return FileService(db).get_all_deployfiles_mitigation_script()


@file_controller.get('/deployfile/{deployfile_id}/code')
def get_code_from_deployfile(deployfile_id: int, db: Session = Depends(get_db),
                             exists_current_user=Depends(get_current_user)):
    try:
        return FileService(db).get_code_deployfile(deployfile_id)

    except FileNotFound:
        raise HTTPException(status_code=404, detail="File not found")


@file_controller.get("/deployfile/{deployfile_id}/download")
def download_deployfile(deployfile_id: int, exists_current_user=Depends(get_current_user),
                        db: Session = Depends(get_db)):
    try:
        deployfile = FileService(db).find_deployfile_by_id_download(
            deployfile_id)
        return FileResponse(deployfile["path"], filename=deployfile["filename"])

    except FileNotFound:
        raise HTTPException(status_code=404, detail="File not found")


@file_controller.post("/malware", response_model=MalwareResponse)
def upload_malware(files: list[UploadFile], malware_post: FilePost = Depends(), db=Depends(get_db),
                   exists_current_user=Depends(get_current_user)):
    try:
        return FileService(db).upload_malware(files, malware_post, exists_current_user)

    except UserNoPermission:
        raise HTTPException(status_code=403, detail="The user can not upload files due to the permission assigned")

    except NotTwoMalwareFiles:
        raise HTTPException(status_code=400,
                            detail="The number of files uploaded is not correct. Two malware files are required: 1: Malware executable, 2: Executable to clean the malware on the device")
    except IntegrityError:
        raise HTTPException(status_code=403, detail="The name of the malware is not available")


@file_controller.get("/malware", response_model=list[MalwareResponse])
def get_all_malware(db=Depends(get_db),
                    exists_current_user=Depends(get_current_user)):
    return FileService(db).find_all_malware()


@file_controller.get("/malware/validated", response_model=list[MalwareResponse])
def get_all_validated_malware(db=Depends(get_db),
                              exists_current_user=Depends(get_current_user)):
    return FileService(db).get_all_validated_malware()


@file_controller.get("/malware/{malware_id}", response_model=MalwareResponse)
def get_malware_by_id(malware_id: int, db=Depends(get_db),
                      exists_current_user=Depends(get_current_user)):
    try:
        return FileService(db).find_malware_by_id(malware_id)
    except FileNotFound:
        raise HTTPException(status_code=404, detail="File not found")


@file_controller.get("/malware/{malware_id}/executable/code")
def get_malware_executable_code(malware_id: int, exists_current_user=Depends(get_current_user),
                                db: Session = Depends(get_db)):
    try:
        return FileService(db).get_code_malware(malware_id, "executable")

    except FileNotFound:
        raise HTTPException(status_code=404, detail="File not found")


@file_controller.get("/malware/{malware_id}/cleaner/code")
def get_malware_cleaner_code(malware_id: int, exists_current_user=Depends(get_current_user),
                             db: Session = Depends(get_db)):
    try:
        return FileService(db).get_code_malware(malware_id, "cleaner")

    except FileNotFound:
        raise HTTPException(status_code=404, detail="File not found")


@file_controller.get("/malware/{malware_id}/executable/download")
def download_malware_executable(malware_id: int, exists_current_user=Depends(get_current_user),
                                db: Session = Depends(get_db)):
    try:
        malware = FileService(db).malware_download_by_type(malware_id, "executable")
        return FileResponse(malware["path"], filename=malware["filename"])
    except FileNotFound:
        raise HTTPException(status_code=404, detail="File not found")


@file_controller.get("/malware/{malware_id}/cleaner/download")
def download_malware_cleaner(malware_id: int, exists_current_user=Depends(get_current_user),
                             db: Session = Depends(get_db)):
    try:
        malware = FileService(db).malware_download_by_type(malware_id, "cleaner")
        return FileResponse(malware["path"], filename=malware["filename"])

    except FileNotFound:
        raise HTTPException(status_code=404, detail="File not found")


@file_controller.get("/malware/{malware_id}/executable/download/device")
def download_malware_executable(malware_id: int,
                                db: Session = Depends(get_db)):
    try:
        malware = FileService(db).malware_download_by_type(malware_id, "executable")
        return FileResponse(malware["path"], filename=malware["filename"])
    except FileNotFound:
        raise HTTPException(status_code=404, detail="File not found")


@file_controller.get("/malware/{malware_id}/cleaner/download/device")
def download_malware_cleaner(malware_id: int,
                             db: Session = Depends(get_db)):
    try:
        malware = FileService(db).malware_download_by_type(malware_id, "cleaner")
        return FileResponse(malware["path"], filename=malware["filename"])

    except FileNotFound:
        raise HTTPException(status_code=404, detail="File not found")


@file_controller.get('/deployfile/malware', response_model=list[DeployfileMalwareResponse])
def get_all_deployfiles_malware(db: Session = Depends(get_db), exists_current_user=Depends(get_current_user)):
    return FileService(db).get_all_deployfiles_malware()


@file_controller.post('/deployfile/malware', response_model=DeployfileMalwareResponse)
def upload_deployfile_for_malware(file: UploadFile,
                                  deployfile_post: DeployfileMalwarePost = Depends(),
                                  db: Session = Depends(get_db),
                                  exists_current_user=Depends(get_current_user)):
    try:
        return FileService(db).upload_deployfile_for_malware(file, deployfile_post, exists_current_user)
    except FileNotFound:
        raise HTTPException(status_code=404, detail="File not found")
    except IntegrityError:
        raise HTTPException(status_code=403, detail="The name of the deployfile is not available")


@file_controller.get("/deployfile/monitoring_script/validated", response_model=list[DeployfileMonitoringScriptResponse])
def get_all_validated_deployfiles_monitoring_script(db=Depends(get_db),
                                                    exists_current_user=Depends(get_current_user)):
    return FileService(db).get_all_validated_deployfiles_monitoring_scripts()


@file_controller.get("/deployfile/malware/validated", response_model=list[DeployfileMalwareResponse])
def get_all_validated_deployfiles_malware(db=Depends(get_db),
                                          exists_current_user=Depends(get_current_user)):
    return FileService(db).get_all_validated_deployfiles_malware()

@file_controller.get("/deployfile/mitigation_script/validated", response_model=list[DeployfileMitigationScriptResponse])
def get_all_validated_deployfiles_mitigation_script(db=Depends(get_db),
                                                    exists_current_user=Depends(get_current_user)):
    return FileService(db).get_all_validated_deployfiles_mitigation_scripts()


@file_controller.patch("/{file_id}/validate",
                       response_model=Union[
                           MonitoringScriptResponse, MalwareResponse, DeployfileMonitoringScriptResponse, DeployfileMitigationScriptResponse, MitigationScriptResponse,
                           DeployfileMalwareResponse])
def validate_file(file_id: int, db=Depends(get_db), exists_current_user=Depends(get_current_user)):
    try:
        return FileService(db).validate_file(file_id, exists_current_user)
    except FileNotFound:
        raise HTTPException(status_code=404, detail="File not found")
    except UserNoPermission:
        raise HTTPException(status_code=403, detail="User no permission")


@file_controller.patch("/{file_id}/invalidate",
                       response_model=Union[
                           MonitoringScriptResponse, MalwareResponse, DeployfileMonitoringScriptResponse, DeployfileMitigationScriptResponse, MitigationScriptResponse,
                           DeployfileMalwareResponse])
def invalidate_file(file_id: int, db=Depends(get_db), exists_current_user=Depends(get_current_user)):
    try:
        return FileService(db).invalidate_file(file_id, exists_current_user)
    except FileNotFound:
        raise HTTPException(status_code=404, detail="File not found")
    except UserNoPermission:
        raise HTTPException(status_code=403, detail="User no permission")


@file_controller.get("/mitigation_script", response_model=list[MitigationScriptResponse])
def get_all_mitigation_scripts(db=Depends(get_db),
                               exists_current_user=Depends(get_current_user)):
    return FileService(db).get_all_mitigation_scripts()


@file_controller.post("/mitigation_script", response_model=MitigationScriptResponse)
def upload_mitigation_script(file: UploadFile, mitigation_script_post: str = Form(...), db=Depends(get_db),
                             exists_current_user=Depends(get_current_user)):
    try:
        mitigation_script_dict = json.loads(mitigation_script_post)
        mitigation_script = MitigationScriptPost(**mitigation_script_dict)

        return FileService(db=db).upload_mitigation_script(file, mitigation_script, exists_current_user)
    except UserNoPermission:
        raise HTTPException(status_code=403, detail="The user can not upload files due to the permission assigned")
    except IntegrityError:
        raise HTTPException(status_code=409, detail="The name of the mitigation script is not available")
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="JSON Decode Error")
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
