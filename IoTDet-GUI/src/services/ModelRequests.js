import axios from "axios"
import {properties} from '../properties'

const endpoint = `${properties.protocol}://${properties.url_server}:${properties.port}/training`

const getBearer = () => {
    return {headers: {Authorization: `Bearer ${JSON.parse(localStorage.getItem('token'))}`}}
}

export const getAllModels = () => axios.get(`${endpoint}/`, getBearer())
export const getModelById = (trainingId) => axios.get(`${endpoint}/${trainingId}`, getBearer())
export const getClassificationModelsByMonitoringScript = (monitoring_script_name) => axios.get(`${endpoint}/monitoring_script/${monitoring_script_name}/classification/find`, getBearer())
export const getAnomalyDetectionModelsByMonitoringScript = (monitoring_script_name) => axios.get(`${endpoint}/monitoring_script/${monitoring_script_name}/anomaly_detection/find`, getBearer())


export const createModels = (data) => axios.post(`${endpoint}/`, data, getBearer())

export const deleteTraining = (training_id) => axios.delete(`${endpoint}/${training_id}`, getBearer())


export const modifyNameTraining = (training_id, name) => axios.patch(`${endpoint}/${training_id}/name/modify`,{name: name}, getBearer())
export const downloadTraining = (training_id) => axios.get(`${endpoint}/${training_id}/download`, getBearer())
export const evaluateModel = (training_id, dataset_id) => axios.get(`${endpoint}/${training_id}/dataset/${dataset_id}/evaluate`, getBearer())
