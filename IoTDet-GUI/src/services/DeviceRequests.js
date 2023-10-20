import axios from "axios"
import {properties} from '../properties'

const endpoint = `${properties.protocol}://${properties.url_server}:${properties.port}/device`


const getBearer = () => {
    return {headers: {Authorization: `Bearer ${JSON.parse(localStorage.getItem('token'))}`}}
}

export const getDevicesMender = (page, amount) => axios.get(`${endpoint}/find/mender/filtered?page=${page}&amount=${amount}`, getBearer())
export const installMalware = (deviceMenderId, deployfileMalwareId) => axios.post(`${endpoint}/${deviceMenderId}/malware/${deployfileMalwareId}/install`, {},getBearer())
export const uninstallMalware = (deviceMenderId) => axios.post(`${endpoint}/${deviceMenderId}/malware/uninstall`, {},getBearer())

export const getAttributesDeviceMender = (id_device) => axios.get(`${endpoint}/find/mender/${id_device}`, getBearer())

export const getAvailableDeviceToDeploy = () => axios.get(`${endpoint}/find/available/deploy`, getBearer())
