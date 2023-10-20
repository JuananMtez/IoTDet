import axios from "axios"
import {properties} from '../properties'


const endpoint = `${properties.protocol}://${properties.url_server}:${properties.port}/file`

const getBearer = () => {
    return {headers: {Authorization: `Bearer ${JSON.parse(localStorage.getItem('token'))}`}}
}

export const findAllMonitoringScripts = () => axios.get(`${endpoint}/monitoring_script`, getBearer())

export const getCodeFromMonitoringScript = (monitoringScriptId) => axios.get(`${endpoint}/monitoring_script/${monitoringScriptId}/code`, getBearer())

export const getCodeFromMitigationScript = (mitigationScriptId) => axios.get(`${endpoint}/mitigation_script/${mitigationScriptId}/code`, getBearer())



export const downloadMonitoringScript = (monitoringScriptId) => axios.get(`${endpoint}/monitoring_script/${monitoringScriptId}/download`, getBearer())
export const downloadMitigationScript = (mitigationScriptId) => axios.get(`${endpoint}/mitigation_script/${mitigationScriptId}/download`, getBearer())

export const uploadMonitoringScript = (name, description, columns, file) => {
    const form_data = new FormData()
    form_data.append('file', file)
    return axios.post(`${endpoint}/monitoring_script?name=${name}&description=${description}&columns=${columns}`, form_data,
        {
            headers: {
                Authorization: `Bearer ${JSON.parse(localStorage.getItem('token'))}`,
                'Content-Type': 'multipart/form-data'
            }
        })
}

export const uploadMitigationScript = (name, description, parameters, file) => {
    const form_data = new FormData()
    form_data.append('file', file)
    form_data.append('mitigation_script_post', JSON.stringify({name, description, parameters}))




    return axios.post(`${endpoint}/mitigation_script`, form_data,
        {
            headers: {
                Authorization: `Bearer ${JSON.parse(localStorage.getItem('token'))}`,
                'Content-Type': 'multipart/form-data'
            }
        })
}



export const getAllDeployfilesMonitoringScript = () => axios.get(`${endpoint}/deployfile/monitoring_script`, getBearer())
export const getAllDeployfilesMitigationScript = () => axios.get(`${endpoint}/deployfile/mitigation_script`, getBearer())

export const getAllValidatedMonitoringScripts = () => axios.get(`${endpoint}/monitoring_script/validated`, getBearer())
export const getAllValidatedMitigationScripts = () => axios.get(`${endpoint}/mitigation_script/validated`, getBearer())


export const uploadDeployfileForMonitoringScript = (name, description, monitoring_script_id, file) => {
    const form_data = new FormData()
    form_data.append('file', file)
    return axios.post(`${endpoint}/deployfile/monitoring_script?name=${name}&description=${description}&monitoring_script_id=${monitoring_script_id}`, form_data,
        {
            headers: {
                Authorization: `Bearer ${JSON.parse(localStorage.getItem('token'))}`,
                'Content-Type': 'multipart/form-data'
            }
        })
}

export const uploadDeployfileForMitigationScript = (name, description, mitigation_script_id, file) => {
    const form_data = new FormData()
    form_data.append('file', file)
    return axios.post(`${endpoint}/deployfile/mitigation_script?name=${name}&description=${description}&mitigation_script_id=${mitigation_script_id}`, form_data,
        {
            headers: {
                Authorization: `Bearer ${JSON.parse(localStorage.getItem('token'))}`,
                'Content-Type': 'multipart/form-data'
            }
        })
}


export const getCodeFromDeployfile = (deployfileId) => axios.get(`${endpoint}/deployfile/${deployfileId}/code`, getBearer())
export const downloadDeployfile = (deployfileId) => axios.get(`${endpoint}/deployfile/${deployfileId}/download`, getBearer())

export const uploadMalware = (name, description, file_executable, file_cleaner) => {
    const form_data = new FormData()
    form_data.append('files', file_executable)
    form_data.append('files', file_cleaner)

    return axios.post(`${endpoint}/malware?name=${name}&description=${description}`, form_data,
        {
            headers: {
                Authorization: `Bearer ${JSON.parse(localStorage.getItem('token'))}`,
                'Content-Type': 'multipart/form-data'
            }
        })
}


export const findAllMalware = () => axios.get(`${endpoint}/malware`, getBearer())
export const downloadMalware = (malwareId, type) => axios.get(type === 'executable' ? `${endpoint}/malware/${malwareId}/executable/download` : `${endpoint}/malware/${malwareId}/cleaner/download`, getBearer())

export const getCodeFromMalwareExecutable = (malwareId) => axios.get(`${endpoint}/malware/${malwareId}/executable/code`, getBearer())
export const getCodeFromMalwareCleaner = (malwareId) => axios.get(`${endpoint}/malware/${malwareId}/cleaner/code`, getBearer())
export const getAllDeployfilesMalware = () => axios.get(`${endpoint}/deployfile/malware`, getBearer())
export const getAllValidatedMalware = () => axios.get(`${endpoint}/malware/validated`, getBearer())
export const uploadDeployfileForMalware = (name, description, malware_id, file) => {
    const form_data = new FormData()
    form_data.append('file', file)
    return axios.post(`${endpoint}/deployfile/malware?name=${name}&description=${description}&malware_id=${malware_id}`, form_data,
        {
            headers: {
                Authorization: `Bearer ${JSON.parse(localStorage.getItem('token'))}`,
                'Content-Type': 'multipart/form-data'
            }
        })
}


export const findAllMitigationScripts = () => axios.get(`${endpoint}/mitigation_script`, getBearer())


export const getAllDeployfilesMonitoringScriptValidated = () => axios.get(`${endpoint}/deployfile/monitoring_script/validated`, getBearer())
export const getAllDeployfilesMalwareValidated = () => axios.get(`${endpoint}/deployfile/malware/validated`, getBearer())
export const getAllDeployfilesMitigationScriptValidated = () => axios.get(`${endpoint}/deployfile/mitigation_script/validated`, getBearer())

export const validateFile = (fileId) => axios.patch(`${endpoint}/${fileId}/validate`, {}, getBearer())
export const invalidateFile = (fileId) => axios.patch(`${endpoint}/${fileId}/invalidate`, {}, getBearer())