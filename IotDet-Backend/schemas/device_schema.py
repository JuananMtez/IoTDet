from pydantic import BaseModel
from typing import Union


class DeviceResponseTable(BaseModel):
    id_device: str
    mac = 'unknown'
    name = 'unknown'
    hostname = 'unknown'
    device_type = 'unknown'
    geo_city = 'unknown'
    geo_country = 'unknown'
    kernel = 'unknown'
    os = 'unknown'
    group = 'unknown'
    cpu_model = 'unknown'


value = Union[str, list[str]]


class DeviceAttribute(BaseModel):
    name: str
    value: value
    scope: str


class DeviceAttributesResponse(BaseModel):
    id: str
    attributes: list[DeviceAttribute]


class DeviceGatherDataPost(BaseModel):
    mac_address: str
    name: str
    values: list[Union[float, str]]


