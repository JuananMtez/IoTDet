import axios from "axios"
import {properties} from '../properties'

const endpoint = `${properties.protocol}://${properties.url_server}:${properties.port}/dataset`
const getBearer = () => {
    return {headers: {Authorization: `Bearer ${JSON.parse(localStorage.getItem('token'))}`}}
}
export const getDataFromDatasetOnline = (datasetId, featureName) => axios.get(`${endpoint}/${datasetId}/feature/${featureName}/plot/online`, getBearer())
export const getDataFromDatasetPredictionOnline = (datasetId, type) => axios.get(`${endpoint}/${datasetId}/type/${type}/plot/online`, getBearer())

export const getDataFromDatasetOffline = (datasetId, featureName) => axios.get(`${endpoint}/${datasetId}/feature/${featureName}/plot/offline`, getBearer())

export const getAllDatasetRecordingFinished = () => axios.get(`${endpoint}/recording/finished`, getBearer())
export const getAllDatasetsFeaturesExtracted = () => axios.get(`${endpoint}/features-extracted`, getBearer())

export const createCopyDataset = (datasetId, data) => axios.post(`${endpoint}/recording/${datasetId}/copy`, data, getBearer())

export const deleteDataset = (datasetId) => axios.delete(`${endpoint}/${datasetId}`, getBearer())

export const downloadDatasetRecording = (datasetId) => axios.get(`${endpoint}/${datasetId}/recording/download`, getBearer())
export const downloadDatasetTraining = (datasetId) => axios.get(`${endpoint}/${datasetId}/training/download`, getBearer())
export const downloadDatasetTesting = (datasetId) => axios.get(`${endpoint}/${datasetId}/testing/download`, getBearer())

export const getDataFromDataset = (datasetId) => axios.get(`${endpoint}/${datasetId}/data`, getBearer())
export const getInfoDataset = (datasetId) => axios.get(`${endpoint}/${datasetId}/info`, getBearer())
export const getDatasetById = (datasetId) => axios.get(`${endpoint}/${datasetId}`, getBearer())
export const getProcessingsAppliedByDatasetId = (datasetId) => axios.get(`${endpoint}/${datasetId}/processings/applied`, getBearer())
export const getColumnsFromDataset = (datasetId) => axios.get(`${endpoint}/${datasetId}/columns`, getBearer())
export const getMalwareFromDataset = (datasetId) => axios.get(`${endpoint}/${datasetId}/malware`, getBearer())
export const applyPreprocessing = (datasetId, data) => axios.post(`${endpoint}/${datasetId}/preprocess`, data, getBearer())
export const applyFeatureExtraction = (datasetId, data) => axios.post(`${endpoint}/${datasetId}/extract-features`, data, getBearer())

export const removeProcessingsFailed = (datasetId) => axios.patch(`${endpoint}/${datasetId}/process/remove/failed`, {}, getBearer())
export const plotDataset = (datasetId, data) => axios.post(`${endpoint}/${datasetId}/plot`, data, getBearer())
export const getAllPlotsByDataset = (datasetId) => axios.get(`${endpoint}/${datasetId}/plot`, getBearer())
export const removePlot = (datasetId, plotId) => axios.delete(`${endpoint}/${datasetId}/plot/${plotId}`, getBearer())

export const modifyNameDataset = (datasetId, newName) => axios.patch(`${endpoint}/${datasetId}/name/modify`, {name: newName}, getBearer())
