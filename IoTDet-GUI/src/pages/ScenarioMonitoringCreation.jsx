import React, {useEffect, useState} from "react";
import {getAvailableDeviceToDeploy} from "../services/DeviceRequests.js";
import {
    getAllDeployfilesMitigationScriptValidated,
    getAllDeployfilesMonitoringScriptValidated
} from "../services/FileRequests.js";
import TextFieldStyled from "../components/TextFieldStyled/TextFieldStyled.jsx";
import {
    Alert,
    CircularProgress,
    Grid, Snackbar,
} from "@mui/material";
import Table from "../components/Tables/Table.jsx";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";

import {
    getAnomalyDetectionModelsByMonitoringScript,
    getClassificationModelsByMonitoringScript
} from "../services/ModelRequests.js";
import LoadingButton from "@mui/lab/LoadingButton";
import {deployMonitoring} from "../services/ScenarioRequests.js";
import {useNavigate} from "react-router-dom";

import CardDeviceMonitoringCreation from "../components/Cards/CardDeviceMonitoringCreation.jsx";

const ScenarioMonitoringCreation = () => {


    const [state, setState] = useState({
        name: "",
        loading: true,
        allAvailableDevices: [],
        devicesListAux: [],
        devicesSelected: [],
        allDeployfilesMonitoringScript: [],
        allDeployfilesMitigationScript: [],
        loadingCreateScenario: false,
        openErrorAlert: false,
        errorTextDetail: '',
        deviceCopy: null
    })

    const navigate = useNavigate()


    useEffect(() => {
        getAvailableDeviceToDeploy()
            .then(response => {
                getAllDeployfilesMonitoringScriptValidated()
                    .then(response2 => {
                        getAllDeployfilesMitigationScriptValidated()
                            .then(response3 => {
                                setState({
                                    ...state,
                                    allAvailableDevices: response.data,
                                    loading: false,
                                    allDeployfilesMonitoringScript: response2.data,
                                    allDeployfilesMitigationScript: response3.data
                                })
                            })


                    })
            })
            .catch(() => {
                setState({
                    ...state,
                    loading: false
                })
            })
    }, [])


    const deployScenario = () => {

        setState({
            ...state,
            loadingCreateScenario: true
        })

        let listDevices = []

        for (let i = 0; i < state.devicesSelected.length; i++) {
            let malwareClassification = []


            for (let j = 0; j < state.devicesSelected[i].classificationMalware.length; j++) {
                let mitigationMechanisms = []

                if (state.devicesSelected[i].isActivatedMitigation) {

                    for (let k = 0; k < state.devicesSelected[i].classificationMalware[j].mitigationMechanisms.length; k++) {
                        mitigationMechanisms.push({
                            deployfile_mitigation_script_selected: state.devicesSelected[i].classificationMalware[j].mitigationMechanisms[k].deployfileMitigationScriptSelected,
                            parameters: state.devicesSelected[i].classificationMalware[j].mitigationMechanisms[k].json
                        })
                    }

                    malwareClassification.push({
                        malware: state.devicesSelected[i].classificationMalware[j].malware,
                        cont: state.devicesSelected[i].classificationMalware[j].cont,
                        mitigation_mechanisms: mitigationMechanisms
                    })

                } else {
                    malwareClassification.push({
                        malware: state.devicesSelected[i].classificationMalware[j].malware,
                        cont: -1,
                        mitigation_mechanisms: []
                    })

                }

            }

            listDevices.push({
                mender_id: state.devicesSelected[i].mender_id,
                mac_address: state.devicesSelected[i].mac_address,
                device_type: state.devicesSelected[i].device_type,

                deployfile_monitoring_script_selected: state.devicesSelected[i].deployfileMonitoringScriptIdSelected,
                classification_training: state.devicesSelected[i].classificationModelSelected === "" ? "" : state.devicesSelected[i].classificationModelSelected,
                anomaly_detection_training: state.devicesSelected[i].anomalyDetectionModelSelected === "" ? "" : state.devicesSelected[i].anomalyDetectionModelSelected,
                malware_classification: malwareClassification,
                is_activated_mitigation: state.devicesSelected[i].isActivatedMitigation,
                is_activated_modify_ticks: state.devicesSelected[i].isActivatedConfigureTicks,
                is_activated_increment_classifier_anomaly: state.devicesSelected[i].isActivatedClassificationAndAnomaly,
            })

        }


        deployMonitoring({
            name: state.name,
            devices: listDevices
        })
            .then(response => {
                navigate(`/scenario/monitoring/${response.data.id}`)
            }).catch(error => {
                setState({
                    ...state,
                    loadingCreateScenario: false,
                    openErrorAlert: true,
                    errorTextDetail: error.response.data.detail,

                })
        })


    }

    const handleClickAddDevice = (index) => {
        const device = state.allAvailableDevices[index]
        const deviceListAuxCopy = state.devicesListAux
        deviceListAuxCopy.push(device)
        setState({
            ...state,
            allAvailableDevices: state.allAvailableDevices.filter((_, index_array) => index_array !== index),
            devicesSelected: [...state.devicesSelected, {
                mender_id: device.id_device,
                mac_address: device.mac,
                device_type: device.device_type,
                deployfileMonitoringScriptIdSelected: '',
                classificationModelsAvailable: [],
                anomalyDetectionModelsAvailable: [],
                classificationModelSelected: '',
                anomalyDetectionModelSelected: '',
                classificationMalware: [],

                loadingModels: false,
                isActivatedMitigation: false,
                isActivatedConfigureTicks: false,
                isActivatedClassificationAndAnomaly: false


            }],
            devicesListAux: deviceListAuxCopy
        })
    }


    const handleChangeSelectDeployfilesMonitoringScript = (e, deviceIndex) => {

        const listDevicesSelected = state.devicesSelected
        listDevicesSelected[deviceIndex].deployfileMonitoringScriptIdSelected = e.target.value
        listDevicesSelected[deviceIndex].loadingModels = true

        setState({
            ...state,
            devicesSelected: listDevicesSelected
        })

        const deployfile = state.allDeployfilesMonitoringScript.find(el => el.id === e.target.value)
        getClassificationModelsByMonitoringScript(deployfile.monitoring_script.name)
            .then(response => {
                getAnomalyDetectionModelsByMonitoringScript(deployfile.monitoring_script.name)
                    .then(response2 => {


                        listDevicesSelected[deviceIndex].classificationModelsAvailable = response.data.filter(el => el.status === "Trained")
                        listDevicesSelected[deviceIndex].anomalyDetectionModelsAvailable = response2.data.filter(el => el.status === "Trained")
                        listDevicesSelected[deviceIndex].loadingModels = false
                        listDevicesSelected[deviceIndex].classificationModelSelected = ""
                        listDevicesSelected[deviceIndex].anomalyDetectionModelSelected = ""
                        listDevicesSelected[deviceIndex].isActivatedMitigation = false
                        listDevicesSelected[deviceIndex].isActivatedClassificationAndAnomaly = false
                        listDevicesSelected[deviceIndex].isActivatedConfigureTicks = false


                        setState({
                            ...state,
                            devicesSelected: listDevicesSelected
                        })

                    })
            })


    }
    const handleChangeSelectClassificationModel = (e, deviceIndex) => {

        const listDevicesSelected = state.devicesSelected
        listDevicesSelected[deviceIndex].classificationModelSelected = e.target.value

        if (e.target.value !== "") {

            const model = listDevicesSelected[deviceIndex].classificationModelsAvailable.find(el => el.id === e.target.value)

            let list = []
            for (let i = 0; i < model.classification_classes.length; i++) {
                if (model.classification_classes[i] !== "Normal")
                    list.push({malware: model.classification_classes[i], cont: 1, mitigationMechanisms: []})

            }


            listDevicesSelected[deviceIndex].classificationMalware = list

        } else {
            listDevicesSelected[deviceIndex].classificationMalware = []
            listDevicesSelected[deviceIndex].isActivatedMitigation = false
            listDevicesSelected[deviceIndex].isActivatedConfigureTicks = false
            listDevicesSelected[deviceIndex].isActivatedClassificationAndAnomaly = false


        }


        setState({
            ...state,
            devicesSelected: listDevicesSelected
        })

    }

    const handleChangeSelectAnomalyDetectionModel = (e, deviceIndex) => {

        const listDevicesSelected = state.devicesSelected
        listDevicesSelected[deviceIndex].anomalyDetectionModelSelected = e.target.value

        if (e.target.value === "")
            listDevicesSelected[deviceIndex].isActivatedClassificationAndAnomaly = false


        setState({
            ...state,
            devicesSelected: listDevicesSelected
        })

    }

    const handleChangeActivateMitigation = (e, indexDevice) => {
        const devicesSelected = state.devicesSelected
        devicesSelected[indexDevice].isActivatedMitigation = e.target.checked


        if (!e.target.checked) {
            if (devicesSelected[indexDevice].classificationModelSelected !== "") {
                for (let i = 0; i < devicesSelected[indexDevice].classificationMalware.length; i++) {
                    devicesSelected[indexDevice].classificationMalware[i].cont = 1
                    devicesSelected[indexDevice].classificationMalware[i].mitigationMechanisms = []
                    devicesSelected[indexDevice].isActivatedConfigureTicks = false
                    devicesSelected[indexDevice].isActivatedClassificationAndAnomaly = false

                }


            }

        }


        setState({
            ...state,
            devicesSelected: devicesSelected
        })
    }

    const handleAddMitigationMechanism = (deviceIndex, malwareIndex) => {
        const listDevices = state.devicesSelected
        listDevices[deviceIndex].classificationMalware[malwareIndex].mitigationMechanisms.push({
            deployfileMitigationScriptSelected: '',
            json: ''
        })

        setState({
            ...state,
            devicesSelected: listDevices
        })
    }

    const handleChangeDeployfileMitigationScript = (e, deviceIndex, malwareIndex, mitigationMechanismIndex) => {
        const listDevices = state.devicesSelected

        const deployfileMitigationScript = state.allDeployfilesMitigationScript.find(el => el.id === e.target.value)


        let parameters = ""


        if (deployfileMitigationScript.mitigation_script.parameters.length > 0) {
            parameters += "{\n"
            for (let i = 0; i < deployfileMitigationScript.mitigation_script.parameters.length; i++) {
                parameters += `\t"${deployfileMitigationScript.mitigation_script.parameters[i].name}": `
                switch (deployfileMitigationScript.mitigation_script.parameters[i].datatype) {
                    case "int":
                        parameters += `${deployfileMitigationScript.mitigation_script.parameters[i].description} (${deployfileMitigationScript.mitigation_script.parameters[i].datatype})`
                        break
                    case "str":
                        parameters += `"${deployfileMitigationScript.mitigation_script.parameters[i].description} (${deployfileMitigationScript.mitigation_script.parameters[i].datatype})"`
                        break
                    case "list[int]":
                        parameters += `[${deployfileMitigationScript.mitigation_script.parameters[i].description}] (${deployfileMitigationScript.mitigation_script.parameters[i].datatype})`
                        break
                    case "list[str]":
                        parameters += `["${deployfileMitigationScript.mitigation_script.parameters[i].description}"] (${deployfileMitigationScript.mitigation_script.parameters[i].datatype})`
                }

                if (i + 1 !== deployfileMitigationScript.mitigation_script.parameters.length)
                    parameters += ","

                parameters += "\n"
            }
            parameters += "}"
        }


        listDevices[deviceIndex].classificationMalware[malwareIndex].mitigationMechanisms[mitigationMechanismIndex].deployfileMitigationScriptSelected = e.target.value
        listDevices[deviceIndex].classificationMalware[malwareIndex].mitigationMechanisms[mitigationMechanismIndex].json = parameters

        setState({
            ...state,
            devicesSelected: listDevices
        })


    }


    const handleRemoveMitigationMechanism = (indexDevice, indexMalware, indexMitigation) => {
        const listDevices = state.devicesSelected
        listDevices[indexDevice].classificationMalware[indexMalware].mitigationMechanisms.splice(indexMitigation, 1)

        setState({
            ...state,
            devicesSelected: listDevices
        })

    }

    const handleChangeParameterJson = (e, indexDevice, indexMalware, indexMitigation) => {
        const listDevices = state.devicesSelected
        listDevices[indexDevice].classificationMalware[indexMalware].mitigationMechanisms[indexMitigation].json = e.target.value
        setState({
            ...state,
            devicesSelected: listDevices
        })


    }

    const handleChangeActiveTicks = (e, indexDevice) => {
        const listDevices = state.devicesSelected
        listDevices[indexDevice].isActivatedConfigureTicks = e.target.checked

        if (!e.target.checked) {
            for (let i = 0; i < listDevices[indexDevice].classificationMalware.length; i++)
                listDevices[indexDevice].classificationMalware[i].cont = 1

        }

        setState({
            ...state,
            devicesSelected: listDevices
        })
    }

    const handleChangeActivateTruePrediction = (e, indexDevice) => {
        const listDevices = state.devicesSelected
        listDevices[indexDevice].isActivatedClassificationAndAnomaly = e.target.checked


        setState({
            ...state,
            devicesSelected: listDevices
        })
    }

    const handleChangeTicks = (e, indexDevice, indexMalware) => {
        const listDevices = state.devicesSelected
        listDevices[indexDevice].classificationMalware[indexMalware].cont = e.target.value
        setState({
            ...state,
            devicesSelected: listDevices
        })

    }

    const handleBtnCopy = (deviceIndex) => {
        setState({
            ...state,
            deviceCopy: JSON.parse(JSON.stringify(state.devicesSelected[deviceIndex]))

        })
    }

    const handleBtnPaste = (deviceIndex) => {
        const listDevicesSelected = [...state.devicesSelected]
        listDevicesSelected[deviceIndex] = state.deviceCopy


        setState({
            ...state,
            devicesSelected: listDevicesSelected
        })

    }

    const handleRemoveSelectedDevice = (deviceIndex) => {

        const device = state.devicesListAux[deviceIndex]
        setState({
            ...state,
            allAvailableDevices: [...state.allAvailableDevices, device],
            devicesSelected: state.devicesSelected.filter((_, index_array) => index_array !== deviceIndex),
            devicesListAux: state.devicesListAux.filter((_, index_array) => index_array !== deviceIndex)
        })

    }

    const handleDisabledBtnDeploy = () => {
        if (state.loadingCreateScenario || state.name === "" || state.devicesSelected.length === 0)
            return true

        for (let i = 0; i < state.devicesSelected.length; i++) {
            if (state.devicesSelected[i].deployfileMonitoringScriptIdSelected === "" || (state.devicesSelected[i].classificationModelSelected === "" && state.devicesSelected[i].anomalyDetectionModelSelected === ""))
                return true

            if (state.devicesSelected[i].classificationModelSelected !== "" && state.devicesSelected[i].isActivatedMitigation) {
                for (let j = 0; j < state.devicesSelected[i].classificationMalware.length; j++) {
                    if (state.devicesSelected[i].classificationMalware[j].cont === "" || state.devicesSelected[i].classificationMalware[j].cont <= 0)
                        return true
                    for (let k = 0; k < state.devicesSelected[i].classificationMalware[j].mitigationMechanisms.length; k++) {
                        if (state.devicesSelected[i].classificationMalware[j].mitigationMechanisms[k].deployfileMitigationScriptSelected === "")
                            return true

                        if (state.devicesSelected[i].classificationMalware[j].mitigationMechanisms[k].json !== "") {
                            try {
                                JSON.parse(state.devicesSelected[i].classificationMalware[j].mitigationMechanisms[k].json)
                            } catch (e) {
                                return true
                            }
                        }
                    }
                }
            }
        }
        return false
    }


    const options = {
        search: true, download: false, rowsPerPageOptions: [5], print: false, rowsPerPage: 5,

        selectableRows: 'none', viewColumns: false, responsive: 'vertical', filter: true, filterType: "dropdown",
        selectableRowsHeader: false,

        textLabels: {
            body: {
                noMatch: state.loading ?
                    <CircularProgress sx={{color: 'white'}}/> : ''
            }
        }, selectToolbarPlacement: 'none',

    };

    const columns = [{
        name: "id_device", label: "Mender ID", options: {
            filter: false, sort: false, setCellProps: () => ({style: {width: "350px"}}),
        }
    }, {
        name: "mac", label: "MAC Address", options: {
            filter: false, sort: false
        }
    }, {
        name: "device_type", label: "Type", options: {
            filter: true, sort: false
        }
    }, {
        name: "hostname", label: "Hostname", options: {
            filter: false, sort: false, display: 'excluded',
        }
    }, {
        name: "geo_city", label: "City", options: {
            filter: true, sort: false, display: 'excluded',
        }
    }, {
        name: "geo_contry", label: "Country", options: {
            filter: true, sort: false, display: 'excluded',
        }
    }, {
        name: "kernel", label: "Kernel", options: {
            filter: true, sort: false, display: 'excluded',
        }
    }, {
        name: "os", label: "Operative System", options: {
            filter: true, sort: false, display: 'excluded',
        }
    }, {
        name: "group", label: "Group", options: {
            filter: true, sort: false, display: 'excluded'
        }
    }, {
        name: "cpu_model", label: "CPU Model", options: {
            filter: false, sort: false, display: 'excluded',
        }
    },
        {
            name: "", label: "", options: {
                setCellProps: () => ({style: {width: "200px", textAlign: 'center', justifyContent: 'center'}}),
                filter: false, sort: false, viewColumns: false, customBodyRenderLite: (dataIndex) => {

                    return (
                        <IconButton onClick={() => handleClickAddDevice(dataIndex)}
                                    disabled={state.loadingCreateScenario}>
                            <AddIcon sx={{fontSize: '5vh'}}/>
                        </IconButton>)
                }

            }
        },

    ];


    return (
        <Grid container spacing={2}>
            <Grid item xs={3}>
                <Grid container spacing={1}>
                    <Grid item xs={12}>
                        <TextFieldStyled
                            variant="filled"
                            fullWidth
                            name="name"
                            label="Name"
                            disabled={state.loadingCreateScenario}
                            value={state.name}
                            onChange={(e) => setState({
                                ...state,
                                [e.target.name]: e.target.value
                            })}
                        />
                    </Grid>

                </Grid>

            </Grid>
            <Grid item xs={9} sx={{mb: 5}}>
                <Table title={"Available devices to deploy"} columns={columns} data={state.allAvailableDevices}
                       options={options}/>
            </Grid>
            {
                state.devicesSelected.map((device, indexDevice) => (
                    <Grid key={indexDevice} item md={6} xs={12}>
                        <CardDeviceMonitoringCreation
                            device={device}
                            indexDevice={indexDevice}
                            handleChangeSelectDeployfilesMonitoringScript={handleChangeSelectDeployfilesMonitoringScript}
                            allDeployfilesMonitoringScript={state.allDeployfilesMonitoringScript}
                            allDeployfilesMitigationScript={state.allDeployfilesMitigationScript}
                            loading={state.loadingCreateScenario}
                            handleChangeSelectClassificationModel={handleChangeSelectClassificationModel}
                            handleChangeSelectAnomalyDetectionModel={handleChangeSelectAnomalyDetectionModel}
                            handleChangeActivateMitigation={handleChangeActivateMitigation}
                            handleAddMitigationMechanism={handleAddMitigationMechanism}
                            handleChangeDeployfileMitigationScript={handleChangeDeployfileMitigationScript}
                            handleRemoveMitigationMechanism={handleRemoveMitigationMechanism}
                            handleChangeParameterJson={handleChangeParameterJson}
                            handleChangeActiveTicks={handleChangeActiveTicks}
                            handleChangeTicks={handleChangeTicks}
                            handleChangeActivateTruePrediction={handleChangeActivateTruePrediction}
                            handleBtnCopy={handleBtnCopy}
                            handleBtnPaste={handleBtnPaste}
                            handleRemoveSelectedDevice={handleRemoveSelectedDevice}
                            deviceCopy={state.deviceCopy}
                        />


                    </Grid>
                ))
            }

            <Grid item xs={12} sx={{mt: '20px', mb: '50px'}}>
                <LoadingButton
                    loading={state.loadingCreateScenario}
                    disabled={handleDisabledBtnDeploy()}
                    onClick={deployScenario}
                    fullWidth variant="contained" color="success"
                    sx={{borderRadius: '28px', fontWeight: 'bold'}}>Deploy</LoadingButton>
            </Grid>
            <Grid item xs={12}>
                <Snackbar anchorOrigin={{vertical: "bottom", horizontal: "right"}} open={state.openErrorAlert}
                          autoHideDuration={3000} onClose={() => setState({...state, openErrorAlert: false})}>
                    <Alert onClose={() => setState({...state, openErrorAlert: false})} severity="error"
                           sx={{width: '100%'}}>
                        {state.errorTextDetail}
                    </Alert>
                </Snackbar>
            </Grid>
        </Grid>

    )

}
export default ScenarioMonitoringCreation