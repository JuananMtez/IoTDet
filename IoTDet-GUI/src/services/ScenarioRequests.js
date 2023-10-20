import axios from "axios"
import {properties} from '../properties'

const endpoint = `${properties.protocol}://${properties.url_server}:${properties.port}/scenario`


const getBearer = () => {
    return {headers: {Authorization: `Bearer ${JSON.parse(localStorage.getItem('token'))}`}}
}

export const getAllScenarios = () => axios.get(`${endpoint}/`, getBearer())
export const getAllScenariosCheckingDeployable = () => axios.get(`${endpoint}/check/deployable`, getBearer())
export const modifyNameScenario = (scenarioId, name) => axios.patch(`${endpoint}/${scenarioId}/modify/name`, {
    name: name
}, getBearer())

export const deployRecording = (data) => axios.post(`${endpoint}/recording/create`, data, getBearer())
export const deployMonitoring = (data) => axios.post(`${endpoint}/monitoring/create`, data, getBearer())


export const getLogsFromDevice = (deviceId) => axios.get(`${endpoint}/monitoring/device/${deviceId}/logs`, getBearer())

export const getScenarioById = (scenarioId) => axios.get(`${endpoint}/${scenarioId}`, getBearer())

export const finishRecording = (scenarioId) => axios.patch(`${endpoint}/recording/${scenarioId}/finish`, {}, getBearer())
export const finishMonitoring = (scenarioId) => axios.patch(`${endpoint}/monitoring/${scenarioId}/finish`, {}, getBearer())

export const deleteScenario = (scenarioId) => axios.delete(`${endpoint}/${scenarioId}`, getBearer())
export const getScenarioFilteredByDevice = (scenarioId, macAddress) => axios.get(`${endpoint}/${scenarioId}/device/${macAddress}`, getBearer())

