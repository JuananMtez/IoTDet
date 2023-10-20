from pydantic import BaseModel


class FilePost(BaseModel):
    name: str
    description: str


class FileResponse(BaseModel):
    id: int
    name: str
    description: str
    is_validated: bool
    uploaded_by: str

    class Config:
        orm_mode = True


class ParametersMitigation(BaseModel):
    name: str
    description: str
    datatype: str

    class Config:
        orm_mode = True


class ColumnsMonitoringResponse(BaseModel):
    name: str
    datatype: str

    class Config:
        orm_mode = True


class MonitoringScriptResponse(FileResponse):
    columns: list[ColumnsMonitoringResponse]
    filename: str

    class Config:
        orm_mode = True


class MitigationScriptResponse(FileResponse):
    filename: str
    parameters: list[ParametersMitigation]

    class Config:
        orm_mode = True


class MonitoringScriptPost(FilePost):
    columns: str


class MitigationScriptPost(FilePost):
    parameters: list[ParametersMitigation]


class MalwareExecutable(BaseModel):
    id: int
    filename: str

    class Config:
        orm_mode = True


class MalwareResponse(FileResponse):
    malware_executable: MalwareExecutable
    malware_executable_cleaner: MalwareExecutable

    class Config:
        orm_mode = True


class DeployfileMonitoringScriptPost(FilePost):
    monitoring_script_id: int

class DeployfileMitigationScriptPost(FilePost):
    mitigation_script_id: int


class DeployfileMalwarePost(FilePost):
    malware_id: int


class DeployfileResponse(FileResponse):
    filename: str


class DeployfileMonitoringScriptResponse(DeployfileResponse):
    monitoring_script: MonitoringScriptResponse


class DeployfileMalwareResponse(DeployfileResponse):
    malware: MalwareResponse


class DeployfileMitigationScriptResponse(DeployfileResponse):
    mitigation_script: MitigationScriptResponse

class MonitoringScriptDatatypeResponse(BaseModel):
    name: str
    datatype: str
