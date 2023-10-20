from fastapi import APIRouter, Depends, HTTPException, Response, Request, BackgroundTasks
from config.security import get_current_user
from exceptions.device_exception import DeviceNotDeployed
from exceptions.file_exception import FileNotFound
from schemas.scenario_schema import DeviceScenarioMonitoringResponse
from services.device_service import DeviceService
from schemas.device_schema import DeviceResponseTable, DeviceAttributesResponse, DeviceGatherDataPost

from exceptions.mender_exception import MenderException

from config.database import get_db

device_controller = APIRouter(
    prefix="/device",
    tags=["devices"])


@device_controller.get('/find/mender/filtered', response_model=list[DeviceResponseTable])
def find_devices_in_mender_filtered(page: int, amount: int, db=Depends(get_db),
                                    exists_current_user=Depends(get_current_user)):
    try:
        return DeviceService(db=db, user=exists_current_user).find_devices_in_mender_per_page(page, amount)
    except MenderException:
        raise HTTPException(status_code=500, detail="Error with Mender service")


@device_controller.get('/find/available/deploy', response_model=list[DeviceResponseTable])
def find_devices_available_to_deploy(db=Depends(get_db),
                                     exists_current_user=Depends(get_current_user)):
    try:
        return DeviceService(db=db, user=exists_current_user).find_devices_available_to_deploy()
    except MenderException:
        raise HTTPException(status_code=500, detail="Error with Mender service")


@device_controller.get('/find/mender/{id_device}', response_model=DeviceAttributesResponse)
def find_device_attributes(id_device: str, db=Depends(get_db), exists_current_user=Depends(get_current_user)):
    try:
        return DeviceService(db=db, user=exists_current_user).get_device_attributes(id_device)
    except MenderException:
        raise HTTPException(status_code=500, detail="Error with Mender service")


@device_controller.post("/recording/data/store")
def store_data(data_post: DeviceGatherDataPost, background_tasks: BackgroundTasks, db=Depends(get_db)):
    try:
        DeviceService(db, None).store_data(data_post, background_tasks)
        return Response(status_code=204)
    except DeviceNotDeployed:
        raise HTTPException(status_code=403, detail=f"Device with mac {data_post.mac_address} is not deployed")


@device_controller.post('/{device_mender_id}/malware/{deployfile_malware_id}/install',
                        response_model=DeviceScenarioMonitoringResponse)
def install_malware_device(device_mender_id: str, deployfile_malware_id: int, db=Depends(get_db),
                           exists_current_user=Depends(get_current_user)):
    try:
        return DeviceService(db, exists_current_user).install_malware(device_mender_id, deployfile_malware_id)
    except DeviceNotDeployed:
        raise HTTPException(status_code=403, detail=f"Device {device_mender_id} is not deployed")
    except FileNotFound:
        raise HTTPException(status_code=404, detail=f"Deployfile not found")


@device_controller.post('/{device_mender_id}/malware/uninstall', response_model=DeviceScenarioMonitoringResponse)
def uninstall_malware_device(device_mender_id: str, db=Depends(get_db),
                             exists_current_user=Depends(get_current_user)):
    try:
        return DeviceService(db, exists_current_user).device_clean_malware(device_mender_id)
    except DeviceNotDeployed:
        raise HTTPException(status_code=403, detail=f"Device {device_mender_id} is not deployed")


