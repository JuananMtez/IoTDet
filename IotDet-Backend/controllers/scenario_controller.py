from fastapi import APIRouter, Depends, HTTPException, Response
from config.security import get_current_user
from exceptions.scenario_exception import ScenarioNotFound, ScenarioIsDeployed, InvalidDuration, ScenarioIncorrectType, \
    InvalidName
from exceptions.file_exception import FileNotFound
from schemas.scenario_schema import ScenarioRecordingPost, ScenarioMonitoringResponse, \
    ScenarioRecordingResponse, ScenarioModifyNamePatch, ScenarioAllResponse, ScenarioRecordingRedeployPost, \
    ScenarioMonitoringPost, LogMonitoringResponse
from typing import Union
from config.database import get_db
from services.scenario_service import ScenarioService
from exceptions.device_exception import DeviceIsDeployed, DeviceNotFoundInMender, DeviceNotDeployed, DeviceNotFound, \
    DeviceIsNotMonitoring
from exceptions.user_exception import UserNoPermission
from sqlalchemy.exc import IntegrityError

scenario_controller = APIRouter(
    prefix="/scenario",
    tags=["scenarios"])


@scenario_controller.get("/", response_model=list[Union[ScenarioRecordingResponse, ScenarioMonitoringResponse]])
def find_all_scenarios(db=Depends(get_db),
                       exists_current_user=Depends(get_current_user)):
    return ScenarioService(db, exists_current_user).find_all_scenarios()


@scenario_controller.get("/check/deployable", response_model=list[ScenarioAllResponse])
def find_all_scenarios_check_deployable(db=Depends(get_db),
                                        exists_current_user=Depends(get_current_user)):
    return ScenarioService(db, exists_current_user).find_all_scenario_check_deployable()


@scenario_controller.get("/{scenario_id}", response_model=Union[ScenarioRecordingResponse, ScenarioMonitoringResponse])
def find_scenario_by_id(scenario_id: int, db=Depends(get_db),
                        exists_current_user=Depends(get_current_user)):
    try:
        return ScenarioService(db, exists_current_user).find_scenario_by_id(scenario_id)
    except ScenarioNotFound:
        raise HTTPException(status_code=404, detail="Scenario not found")


@scenario_controller.delete("/{scenario_id}")
def delete_by_id(scenario_id: int, db=Depends(get_db),
                 exists_current_user=Depends(get_current_user)):
    try:
        ScenarioService(db, exists_current_user).delete_scenario(scenario_id)
        return Response(status_code=204)

    except ScenarioNotFound:
        raise HTTPException(status_code=404, detail="Scenario not found")
    except UserNoPermission:
        raise HTTPException(status_code=403, detail="The user cannot removed the scenario")
    except ScenarioIsDeployed:
        raise HTTPException(status_code=403, detail="Scenario cannot be deleted because it is deployed")


@scenario_controller.post("/recording/create")
def create_scenario_recording(scenario_recording_post: ScenarioRecordingPost, db=Depends(get_db),
                              exists_current_user=Depends(get_current_user)):
    try:

        return ScenarioService(db, exists_current_user).create_scenario_recording(scenario_recording_post)
    except DeviceIsDeployed as e:
        raise HTTPException(status_code=403, detail=str(e))

    except UserNoPermission:
        raise HTTPException(status_code=403, detail="The user has read-only permission")

    except FileNotFound:
        raise HTTPException(status_code=404, detail="Monitoring script or malware do not exist")

    except DeviceNotFoundInMender as e:
        raise HTTPException(status_code=404, detail=str(e))

    except InvalidName:
        raise HTTPException(status_code=409, detail="The name of the recording scenario is not available")


@scenario_controller.post("/monitoring/create", response_model=ScenarioMonitoringResponse)
def create_scenario_monitoring(scenario_monitoring_post: ScenarioMonitoringPost, db=Depends(get_db),
                               exists_current_user=Depends(get_current_user)):
    try:

        return ScenarioService(db, exists_current_user).create_scenario_monitoring(scenario_monitoring_post)
    except DeviceIsDeployed as e:
        raise HTTPException(status_code=403, detail=str(e))

    except UserNoPermission:
        raise HTTPException(status_code=403, detail="The user has read-only permission")

    except FileNotFound:
        raise HTTPException(status_code=404, detail="Monitoring script or malware do not exist")

    except DeviceNotFoundInMender as e:
        raise HTTPException(status_code=404, detail=str(e))

    except InvalidName:
        raise HTTPException(status_code=409, detail="The name of the recording scenario is not available")


@scenario_controller.patch("/{scenario_id}/modify/name",
                           response_model=Union[ScenarioRecordingResponse, ScenarioMonitoringResponse])
def modify_name_scenario(scenario_id: int, modify_name_patch: ScenarioModifyNamePatch, db=Depends(get_db),
                         exists_current_user=Depends(get_current_user)):
    try:
        return ScenarioService(db, exists_current_user).modify_name_scenario(scenario_id, modify_name_patch)
    except UserNoPermission:
        raise HTTPException(status_code=403, detail="The user has read-only permission")
    except ScenarioNotFound:
        raise HTTPException(status_code=404, detail="Scenario not found")


@scenario_controller.patch("/recording/{scenario_id}/finish", response_model=ScenarioRecordingResponse)
def finish_recording(scenario_id: int, db=Depends(get_db),
                     exists_current_user=Depends(get_current_user)):
    try:
        return ScenarioService(db, exists_current_user).finish_recording(scenario_id)
    except UserNoPermission:
        raise HTTPException(status_code=403, detail="The user has read-only permission")
    except ScenarioNotFound:
        raise HTTPException(status_code=404, detail="Scenario not found")


@scenario_controller.patch("/monitoring/{scenario_id}/finish", response_model=ScenarioMonitoringResponse)
def finish_monitoring(scenario_id: int, db=Depends(get_db),
                      exists_current_user=Depends(get_current_user)):
    try:
        return ScenarioService(db, exists_current_user).finish_monitoring(scenario_id)
    except UserNoPermission:
        raise HTTPException(status_code=403, detail="The user has read-only permission")
    except ScenarioNotFound:
        raise HTTPException(status_code=404, detail="Scenario not found")


@scenario_controller.get("/recording/device/malware/time/finished/check")
def check_malware_time_is_finished(mac_address: str, db=Depends(get_db)):
    try:
        return ScenarioService(db, None).check_malware_timestamp_finished(mac_address=mac_address)
    except DeviceNotDeployed:
        raise HTTPException(status_code=404, detail="Device not deployed")


@scenario_controller.get("/recording/device/malware/finish")
def finish_malware_deployment(mac_address: str, db=Depends(get_db)):
    try:
        ScenarioService(db, None).finish_malware_deployment(mac_address=mac_address)
        return Response(status_code=204)
    except DeviceNotDeployed:
        raise HTTPException(status_code=404, detail="Device not deployed")


@scenario_controller.get("/recording/device/can_send_data/check")
def check_scenario_active_by_mac_address(mac_address: str, db=Depends(get_db)):
    try:

        return ScenarioService(db, None).check_if_device_can_send_data_by_mac_address(mac_address)
    except DeviceNotDeployed:
        raise HTTPException(status_code=404, detail="Device not deployed")


@scenario_controller.get("/{scenario_id}/device/{mac_address}",
                         response_model=Union[ScenarioRecordingResponse, ScenarioMonitoringResponse])
def get_info_scenario_filtered_by_mac_address(scenario_id: int, mac_address: str, db=Depends(get_db),
                                              exists_current_user=Depends(get_current_user)):
    try:
        return ScenarioService(db, exists_current_user).get_info_scenario_filtered_by_mac_address(scenario_id,
                                                                                                  mac_address)
    except ScenarioNotFound:
        raise HTTPException(status_code=404, detail="Scenario not found")

    except DeviceNotFound:
        raise HTTPException(status_code=404, detail="Device not found")


@scenario_controller.post("/recording/{scenario_id}/redeploy")
def redeploy_scenario(scenario_id: int, scenario_redeploy: ScenarioRecordingRedeployPost, db=Depends(get_db),
                      exists_current_user=Depends(get_current_user)):
    try:
        return ScenarioService(db, exists_current_user).redeploy_scenario_recording(scenario_id, scenario_redeploy)
    except ScenarioNotFound:
        raise HTTPException(status_code=404, detail="Scenario not found")

    except ScenarioIncorrectType:
        raise HTTPException(status_code=403, detail="Scenario to redeploy is not recording type")
    except InvalidDuration as e:
        raise HTTPException(status_code=403, detail=str(e))
    except DeviceIsDeployed as e:
        raise HTTPException(status_code=403, detail=str(e))


@scenario_controller.get("/monitoring/device/{device_id}/logs", response_model=list[LogMonitoringResponse])
def get_logs_from_device_monitoring(device_id: int, db=Depends(get_db),
                                    exists_current_user=Depends(get_current_user)):
    try:
        return ScenarioService(db, exists_current_user).get_logs_from_device_monitoring(device_id)
    except DeviceNotFound:
        raise HTTPException(status_code=404, detail="Device not found")


@scenario_controller.get("/monitoring/device/mitigation/finish")
def finish_mitigation_deployment(mac_address: str, db=Depends(get_db)):
    try:
        ScenarioService(db, None).finish_mitigation_deployment(mac_address=mac_address)
        return Response(status_code=204)
    except DeviceNotDeployed:
        raise HTTPException(status_code=404, detail="Device not deployed")


@scenario_controller.get("/monitoring/device/mitigation/args")
def get_args_from_mitigation_script(mac_address: str, db=Depends(get_db)):
    try:
        return ScenarioService(db, None).get_args_from_mitigation_script(mac_address=mac_address)
    except DeviceNotDeployed:
        raise HTTPException(status_code=404, detail="Device not deployed")
