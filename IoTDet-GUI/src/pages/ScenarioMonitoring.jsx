import {useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {finishMonitoring, getScenarioById} from "../services/ScenarioRequests.js";
import {
    Alert,
    Card,
    CardActions,
    CardContent, Checkbox,
    CircularProgress,
    FormControl, FormControlLabel,
    Grid, InputLabel, MenuItem, Select,
    Snackbar,
    Stack
} from "@mui/material";
import Typography from "@mui/material/Typography";
import {StatusScenarioEnum} from "../enums.js";
import LoadingButton from "@mui/lab/LoadingButton";
import TextFieldStyled from "../components/TextFieldStyled/TextFieldStyled.jsx";
import IconButton from "@mui/material/IconButton";
import ReportIcon from "@mui/icons-material/Report";
import BarChartSharpIcon from "@mui/icons-material/BarChartSharp";
import FullSizeDialog from "../components/Dialog/FullSizeDialog.jsx";
import {getAllDeployfilesMalwareValidated} from "../services/FileRequests.js";
import {installMalware, uninstallMalware} from "../services/DeviceRequests.js";

const ScenarioMonitoring = () => {
    const {scenarioId} = useParams()
    const [state, setState] = useState({
        scenario: null,
        loading: true,
        loadingFinishMonitoring: false,
        openSuccessFinish: false,
        openLogDialog: false,
        textError: '',
        allDeployfilesMalware: [],
        deployfilesMalwareSelectedByDevice: [],
        loadingMalware: []
    })
    const user = JSON.parse((localStorage.getItem('user')))
    const navigate = useNavigate()
    useEffect(() => {

        getScenarioById(scenarioId)
            .then(response => {

                    if (response.data.status === 0) {
                        getAllDeployfilesMalwareValidated()
                            .then(response2 => {
                                setState(prevState => ({
                                    ...prevState,
                                    scenario: response.data,
                                    allDeployfilesMalware: response2.data,
                                    loading: false,
                                    deployfilesMalwareSelectedByDevice: new Array(response.data.devices.length).fill(''),
                                    loadingMalware: new Array(response.data.devices.length).fill(false)
                                }))


                            })
                    } else {
                        setState(prevState => ({
                            ...prevState,
                            scenario: response.data,
                            loading: false
                        }))

                    }


                }
            )
        return () => {

        }
    }, [])


    useEffect(() => {
        let interval = 0
        if (state.loading === false) {
            interval = setInterval(() => {
                getScenarioById(scenarioId)
                    .then(response => {

                        if (response.data.status === 0) {
                            getAllDeployfilesMalwareValidated()
                                .then(response2 => {
                                    setState(prevState => ({
                                        ...prevState,
                                        scenario: response.data,
                                        allDeployfilesMalware: response2.data
                                    }))


                                })
                        } else {
                            setState(prevState => ({
                                ...prevState,
                                scenario: response.data,
                            }))

                        }


                    })
            }, 10000)


        }
        return () => {
            clearInterval(interval)
        }

    }, [state.loading])

    const handleClickInstallMalware = (deviceIndex) => {
        let loadingMalwareList = state.loadingMalware
        loadingMalwareList[deviceIndex] = true

        setState({
            ...state,
            loadingMalware: loadingMalwareList
        })

        installMalware(state.scenario.devices[deviceIndex].id_mender, state.deployfilesMalwareSelectedByDevice[deviceIndex])
            .then(response => {
                const devices = state.scenario.devices
                devices[deviceIndex] = response.data
                loadingMalwareList[deviceIndex] = false

                let malwareByDevice = state.deployfilesMalwareSelectedByDevice
                malwareByDevice[deviceIndex] = ''


                setState({
                    ...state,
                    scenario: {...state.scenario, devices: devices},
                    loadingMalware: loadingMalwareList,
                    deployfilesMalwareSelectedByDevice: malwareByDevice
                })
            })
    }

    const handleClickShowLog = (error) => {

        setState({
            ...state,
            openLogDialog: true,
            textError: error
        })


    }

    const handleFinishMonitoringScenario = () => {
        setState({
            ...state,
            loadingFinishMonitoring: true
        })
        finishMonitoring(scenarioId)
            .then(response => {
                setState({
                    ...state,
                    scenario: response.data,
                    openSuccessFinish: true,
                    loadingFinishMonitoring: false
                })
            })
    }
    const handleClickUninstallMalwareDevice = (indexDevice) => {
        let loadingMalwareList = state.loadingMalware
        loadingMalwareList[indexDevice] = true
        setState({
            ...state,
            loadingMalware: loadingMalwareList
        })
        uninstallMalware(state.scenario.devices[indexDevice].id_mender)
            .then(response => {
                const devices = state.scenario.devices
                devices[indexDevice] = response.data
                loadingMalwareList[indexDevice] = false
                setState({
                    ...state,
                    scenario: {...state.scenario, devices: devices},
                    loadingMalware: loadingMalwareList
                })
            })


    }



    const handleChangeMalware = (e, indexDevice) => {

        const deployfilesMalwareSelectedByDeviceList = state.deployfilesMalwareSelectedByDevice

        deployfilesMalwareSelectedByDeviceList[indexDevice] = e.target.value

        setState({
            ...state,
            deployfilesMalwareSelectedByDevice: deployfilesMalwareSelectedByDeviceList
        })
    }


    return (
        <Grid container>
            {
                state.loading ?
                    <Grid container sx={{mt: '10px'}} justifyContent="center">
                        <CircularProgress sx={{fontSize: '4vh', color: 'white'}} size={40}/>
                    </Grid>
                    :
                    <Grid container alignItems="center">
                        <Grid item xs={4} lg={6}>
                                <span style={{
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '18px'
                                }}>Scenario: {state.scenario.name}</span>
                            <Typography sx={{mb: 1.5, color: 'white', fontStyle: 'italic'}}
                                        color="text.secondary">
                                Status: {StatusScenarioEnum[state.scenario.status].value}
                            </Typography>
                        </Grid>
                        <Grid item xs={8} lg={6}>
                            {
                                state.scenario.status === 0 &&
                                <Grid
                                    container
                                    direction="row"
                                    justifyContent="flex-end"
                                    alignItems="center"
                                >


                                    <Grid item>
                                        <LoadingButton
                                            disabled={user.role === 3}

                                            size="small" variant="contained" sx={{
                                            color: 'white',
                                            backgroundColor: '#C63637',
                                            borderRadius: '28px',
                                            fontWeight: 'bold',
                                            '&:hover': {backgroundColor: '#9d292a'}
                                        }} loading={state.loadingFinishMonitoring}
                                            onClick={handleFinishMonitoringScenario}>Finish</LoadingButton>
                                    </Grid>


                                </Grid>
                            }

                        </Grid>
                        <Grid item xs={12} sx={{mb: '10px'}}>
                            <hr/>
                        </Grid>
                        <Grid item xs={12} sx={{mb: '20px'}}>
                <span style={{
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '18px',

                }}>Devices</span>
                        </Grid>
                        <Grid container spacing={2}>
                            {
                                state.scenario.devices.map((device, indexDevice) => (
                                    <Grid key={indexDevice} item md={6} xs={12}>
                                        <Card elevation={6} variant="elevation" sx={{
                                            borderRadius: '28px',
                                            backgroundColor: '#555555 !important',
                                        }}>
                                            <CardContent sx={{color: 'white', padding: '16px 12px 16px 12px'}}>
                                                <Typography sx={{fontWeight: 'bold'}} variant="h7" component="div">
                                                    Mender ID: {device.id_mender}
                                                </Typography>
                                                <Typography
                                                    sx={{fontWeight: 'bold', color: 'wheat', mb: 0, fontSize: '14px'}}>
                                                    MAC Address: {device.mac_address}
                                                </Typography>
                                                <hr/>
                                                <Grid container spacing={1}>
                                                    <Grid item xs={12}>
                                                        <Typography sx={{fontStyle: 'italic'}} variant="h7"
                                                                    component="div">
                                                            Deployfile for monitoring scripts
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <Grid container direction="row" justifyContent="center"
                                                              alignItems="center" spacing={1}
                                                              sx={{padding: '10px 10px 10px 10px'}}>
                                                            <Grid item xs={12}>
                                                                <Stack spacing={1} direction="row">
                                                                    <TextFieldStyled
                                                                        name="name"
                                                                        InputLabelProps={{shrink: true}}
                                                                        label="Name"

                                                                        value={device.deployfile_monitoring_script_selected.name}
                                                                        size="small"
                                                                        fullWidth
                                                                        InputProps={{
                                                                            readOnly: true
                                                                        }}
                                                                        variant="filled"
                                                                    />
                                                                    {
                                                                        state.scenario.status === 0 &&
                                                                        <TextFieldStyled
                                                                            name="status"
                                                                            InputLabelProps={{shrink: true}}
                                                                            label="Status"
                                                                            error={device.mender_deployments[0].status === "Installation failed"}
                                                                            value={device.mender_deployments[0].status}
                                                                            size="small"
                                                                            fullWidth
                                                                            InputProps={{
                                                                                readOnly: true
                                                                            }}
                                                                            variant="filled"
                                                                        />
                                                                    }
                                                                    {
                                                                        state.scenario.status === 0 && device.mender_deployments[0].status === "Installation failed" &&
                                                                        <IconButton
                                                                            sx={{
                                                                                color: 'white',
                                                                                '&.Mui-disabled': {
                                                                                    color: 'rgba(0, 0, 0, 0.26) !important'
                                                                                }
                                                                            }}
                                                                            onClick={() => handleClickShowLog(device.mender_deployments[0].log_error)}
                                                                        >
                                                                            <ReportIcon/>
                                                                        </IconButton>
                                                                    }
                                                                </Stack>

                                                            </Grid>

                                                        </Grid>
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <hr/>
                                                        <Grid container direction="row" spacing={2}>
                                                            <Grid item xs={12}>
                                                                <Typography sx={{fontStyle: 'italic'}} variant="h7"
                                                                            component="div">
                                                                    Models and deployfiles for mitigation script selected
                                                                </Typography>
                                                            </Grid>
                                                            <Grid item xs={12}>
                                                                <Grid container direction="row" justifyContent="center"
                                                                      alignItems="center" spacing={4}
                                                                      sx={{padding: '0px 10px 10px 10px'}}>
                                                                    <Grid item xs={12}>
                                                                        <TextFieldStyled
                                                                            name="status"
                                                                            InputLabelProps={{shrink: true}}
                                                                            label="Classification model"
                                                                            value={device.classification_model === null ? "None" : device.classification_model.name}
                                                                            size="small"
                                                                            fullWidth
                                                                            InputProps={{
                                                                                readOnly: true
                                                                            }}
                                                                            variant="filled"
                                                                        />

                                                                    </Grid>
                                                                    {
                                                                        Object.keys(device.tick_classification_classes).map((malware, indexMalware) => (
                                                                            <Grid key={indexMalware} item
                                                                                  xs={12}>
                                                                                <Grid container spacing={2}>
                                                                                    <Grid item xs={5}>
                                                                                        <TextFieldStyled
                                                                                            name="class"
                                                                                            InputLabelProps={{shrink: true}}
                                                                                            label="Class"
                                                                                            value={malware}
                                                                                            size="small"
                                                                                            fullWidth
                                                                                            InputProps={{
                                                                                                readOnly: true
                                                                                            }}
                                                                                            variant="filled"
                                                                                        />

                                                                                    </Grid>
                                                                                    <Grid item xs={7}>

                                                                                        {
                                                                                            device.is_activated_modify_ticks && device.deployfiles_mitigation_script_selected.filter(el => el.malware_name === malware).length > 0 &&
                                                                                            <TextFieldStyled
                                                                                                name="detection"
                                                                                                InputLabelProps={{shrink: true}}
                                                                                                label="Consecutive predictions to assert true positive"
                                                                                                value={device.tick_classification_classes[malware]}
                                                                                                size="small"
                                                                                                fullWidth
                                                                                                InputProps={{
                                                                                                    readOnly: true
                                                                                                }}
                                                                                                variant="filled"
                                                                                            />
                                                                                        }


                                                                                    </Grid>


                                                                                    {
                                                                                        device.deployfiles_mitigation_script_selected.filter(el => el.malware_name === malware).map((deployfile, indexDeployfile) => (
                                                                                            <Grid key={indexDeployfile}
                                                                                                  item xs={12}
                                                                                                  sx={{ml: 4}}>
                                                                                                <Grid container
                                                                                                      spacing={2}
                                                                                                      alignItems="center">
                                                                                                    <Grid item xs={0.5}>
                                                                                                        <span
                                                                                                            style={{fontWeight: 'bold'}}>{indexDeployfile + 1}.</span>
                                                                                                    </Grid>

                                                                                                    <Grid item xs={state.scenario.status === 0 ? 7.5: 11.5}>
                                                                                                        <TextFieldStyled
                                                                                                            name="detection"
                                                                                                            InputLabelProps={{shrink: true}}
                                                                                                            label="Deployfile mitigation script"
                                                                                                            value={deployfile.deployfile_mitigation_script.name}
                                                                                                            size="small"
                                                                                                            fullWidth
                                                                                                            InputProps={{
                                                                                                                readOnly: true
                                                                                                            }}
                                                                                                            variant="filled"
                                                                                                        />
                                                                                                    </Grid>
                                                                                                    {
                                                                                                        state.scenario.status === 0 &&
                                                                                                        <Grid item
                                                                                                              xs={deployfile.mender_deployment !== null && deployfile.mender_deployment.status === "Instalation failed" ? 3 : 4}>
                                                                                                            <TextFieldStyled
                                                                                                                name="detection"
                                                                                                                InputLabelProps={{shrink: true}}
                                                                                                                label="Status"
                                                                                                                error={deployfile.mender_deployment !== null && deployfile.mender_deployment.status === "Instalation failed"}
                                                                                                                value={deployfile.mender_deployment === null ? "Not installed" : deployfile.mender_deployment.status}
                                                                                                                size="small"
                                                                                                                fullWidth
                                                                                                                InputProps={{
                                                                                                                    readOnly: true
                                                                                                                }}
                                                                                                                variant="filled"
                                                                                                            />
                                                                                                        </Grid>

                                                                                                    }
                                                                                                    {
                                                                                                        state.scenario.status === 0 && deployfile.mender_deployment !== null && deployfile.mender_deployment.status === "Instalation failed" &&
                                                                                                        <Grid item
                                                                                                              xs={1}>

                                                                                                            <IconButton
                                                                                                                sx={{
                                                                                                                    color: 'white',
                                                                                                                    '&.Mui-disabled': {
                                                                                                                        color: 'rgba(0, 0, 0, 0.26) !important'
                                                                                                                    }
                                                                                                                }}
                                                                                                                onClick={() => handleClickShowLog(deployfile.mender_deployment.log_error)}
                                                                                                            >
                                                                                                                <ReportIcon/>
                                                                                                            </IconButton>
                                                                                                        </Grid>
                                                                                                    }

                                                                                                    {
                                                                                                        deployfile.parameters !== null &&
                                                                                                        <Grid item
                                                                                                              xs={12}>
                                                                                                            <TextFieldStyled
                                                                                                                name="detection"
                                                                                                                InputLabelProps={{shrink: true}}
                                                                                                                label="Parameters"
                                                                                                                value={JSON.stringify(deployfile.parameters, null, 2)}
                                                                                                                size="small"
                                                                                                                fullWidth
                                                                                                                multiline
                                                                                                                rows={5}
                                                                                                                InputProps={{
                                                                                                                    readOnly: true
                                                                                                                }}
                                                                                                                variant="filled"
                                                                                                            />
                                                                                                        </Grid>
                                                                                                    }



                                                                                                </Grid>
                                                                                            </Grid>
                                                                                        ))
                                                                                    }
                                                                                </Grid>
                                                                            </Grid>
                                                                        ))
                                                                    }


                                                                    <Grid item xs={12} sx={{mt: '15px'}}>
                                                                        <TextFieldStyled
                                                                            name="status"
                                                                            InputLabelProps={{shrink: true}}
                                                                            label="Anomaly detection model"
                                                                            value={device.anomaly_detection_model === null ? "None" : device.anomaly_detection_model.name}
                                                                            size="small"
                                                                            fullWidth
                                                                            InputProps={{
                                                                                readOnly: true
                                                                            }}
                                                                            variant="filled"
                                                                        />

                                                                    </Grid>


                                                                </Grid>
                                                            </Grid>
                                                        </Grid>
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <hr/>
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <Typography sx={{fontStyle: 'italic'}} variant="h7"
                                                                    component="div">
                                                            Mitigation mechanisms config
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={12} sx={{ml: "10px"}}>
                                                        <FormControlLabel

                                                            control={<Checkbox
                                                                sx={{
                                                                    color: 'white', '&.Mui-checked': {
                                                                        color: 'white',
                                                                    },
                                                                }}
                                                                checked={device.is_activated_mitigation}/>}
                                                            label="Activate mitigation mechanisms."/>
                                                    </Grid>
                                                    <Grid item xs={12} sx={{ml: "10px"}}>
                                                        <FormControlLabel

                                                            control={<Checkbox
                                                                sx={{
                                                                    color: 'white', '&.Mui-checked': {
                                                                        color: 'white',
                                                                    },
                                                                }}
                                                                checked={device.is_activated_modify_ticks}/>}
                                                            label="Modify ticks value (Default 1)."/>
                                                    </Grid>
                                                    <Grid item xs={12} sx={{ml: "10px"}}>
                                                        <FormControlLabel

                                                            control={<Checkbox
                                                                sx={{
                                                                    color: 'white', '&.Mui-checked': {
                                                                        color: 'white',
                                                                    },
                                                                }}
                                                                checked={device.is_activated_increment_classifier_anomaly}/>}
                                                            label="Increment tick when classifier and anomaly detector predict infected."/>
                                                    </Grid>



                                                    {
                                                        state.scenario.status === 0 &&
                                                        <Grid item xs={12}>
                                                            <hr/>
                                                            <Grid container direction="row" spacing={2}>
                                                                <Grid item xs={12}>
                                                                    <Typography sx={{fontStyle: 'italic'}} variant="h7"
                                                                                component="div">
                                                                        Malware
                                                                    </Typography>
                                                                </Grid>
                                                                <Grid item xs={12}>
                                                                    {
                                                                        device.mender_deployments.length === 1
                                                                            ?
                                                                            <Grid container direction="row"
                                                                                  alignItems="center" spacing={1}
                                                                                  sx={{padding: '0px 10px 10px 10px'}}>

                                                                                <Grid item xs={6}>
                                                                                    <FormControl variant="filled"
                                                                                                 fullWidth
                                                                                                 disabled={user.role === 3 || state.loadingMalware[indexDevice]}>
                                                                                        <InputLabel
                                                                                            id="demo-simple-select-label"
                                                                                            sx={{color: 'white'}}>Deployfile</InputLabel>
                                                                                        <Select
                                                                                            size="small"
                                                                                            value={state.deployfilesMalwareSelectedByDevice[indexDevice]}
                                                                                            disableUnderline={false}
                                                                                            label="Deployfile"
                                                                                            sx={{color: 'white'}}
                                                                                            onChange={event => handleChangeMalware(event, indexDevice)}

                                                                                            inputProps={{
                                                                                                MenuProps: {
                                                                                                    MenuListProps: {
                                                                                                        sx: {
                                                                                                            backgroundColor: '#525558',
                                                                                                            color: 'white'

                                                                                                        }
                                                                                                    }
                                                                                                }
                                                                                            }}

                                                                                        >
                                                                                            {
                                                                                                state.allDeployfilesMalware.map((el, index) => (

                                                                                                    <MenuItem
                                                                                                        key={index}
                                                                                                        value={el.id}>{el.name}</MenuItem>

                                                                                                ))
                                                                                            }


                                                                                        </Select>
                                                                                    </FormControl>


                                                                                </Grid>
                                                                                {
                                                                                    state.deployfilesMalwareSelectedByDevice[indexDevice] !== '' &&
                                                                                    <Grid item xs={3}>
                                                                                        <LoadingButton

                                                                                            size="small"
                                                                                            variant="contained"
                                                                                            sx={{
                                                                                                color: 'white',
                                                                                                backgroundColor: '#C63637',
                                                                                                borderRadius: '28px',
                                                                                                fontWeight: 'bold',
                                                                                                '&:hover': {backgroundColor: '#9d292a'}
                                                                                            }}
                                                                                            loading={state.loadingMalware[indexDevice]}
                                                                                            onClick={() => handleClickInstallMalware(indexDevice)}
                                                                                        >Install</LoadingButton>
                                                                                    </Grid>
                                                                                }


                                                                            </Grid>
                                                                            :
                                                                            <Grid container direction="row"
                                                                                  alignItems="center" spacing={1}
                                                                                  sx={{padding: '0px 10px 10px 10px'}}>
                                                                                <Grid item xs={5}>


                                                                                    <TextFieldStyled
                                                                                        name="status"
                                                                                        InputLabelProps={{shrink: true}}
                                                                                        label="Anomaly detection model"
                                                                                        value={device.deployfile_malware_selected.name}
                                                                                        size="small"
                                                                                        fullWidth
                                                                                        InputProps={{
                                                                                            readOnly: true
                                                                                        }}
                                                                                        variant="filled"
                                                                                    />
                                                                                </Grid>
                                                                                {
                                                                                    device.mender_deployments.length === 2 &&

                                                                                    <Grid item
                                                                                          xs={device.mender_deployments[1].status === "Installation failed" ? 4 : 7}>
                                                                                        <TextFieldStyled
                                                                                            name="status"
                                                                                            InputLabelProps={{shrink: true}}
                                                                                            label="Status"
                                                                                            error={device.mender_deployments[1].status === "Installation failed"}
                                                                                            value={device.mender_deployments[1].status}
                                                                                            size="small"
                                                                                            fullWidth
                                                                                            InputProps={{
                                                                                                readOnly: true
                                                                                            }}
                                                                                            variant="filled"
                                                                                        />

                                                                                    </Grid>
                                                                                }
                                                                                {
                                                                                    device.mender_deployments.length === 2 && device.mender_deployments[1].status === "Installation failed" &&
                                                                                    <Grid item xs={1}>

                                                                                        <IconButton
                                                                                            sx={{
                                                                                                color: 'white',
                                                                                                '&.Mui-disabled': {
                                                                                                    color: 'rgba(0, 0, 0, 0.26) !important'
                                                                                                }
                                                                                            }}
                                                                                            onClick={() => handleClickShowLog(device.mender_deployments[1].log_error)}
                                                                                        >
                                                                                            <ReportIcon/>
                                                                                        </IconButton>
                                                                                    </Grid>
                                                                                }
                                                                                {
                                                                                    device.mender_deployments.length === 2 && device.mender_deployments[1].status === "Installation failed" &&
                                                                                    <Grid item xs={1}>
                                                                                        <LoadingButton
                                                                                            disabled={user.role === 3}

                                                                                            size="small"
                                                                                            variant="contained"
                                                                                            sx={{
                                                                                                color: 'white',
                                                                                                backgroundColor: '#C63637',
                                                                                                borderRadius: '28px',
                                                                                                fontWeight: 'bold',
                                                                                                '&:hover': {backgroundColor: '#9d292a'}
                                                                                            }}
                                                                                            loading={state.loadingMalware[indexDevice] || device.remove_malware}
                                                                                            onClick={() => handleClickUninstallMalwareDevice(indexDevice)}>clean</LoadingButton>
                                                                                    </Grid>
                                                                                }

                                                                                {
                                                                                    device.mender_deployments.length === 2 && device.mender_deployments[1].status === "Installed" &&
                                                                                    <Grid item xs={2}>
                                                                                        <LoadingButton
                                                                                            disabled={user.role === 3}

                                                                                            size="small"
                                                                                            variant="contained"
                                                                                            sx={{
                                                                                                color: 'white',
                                                                                                backgroundColor: '#C63637',
                                                                                                borderRadius: '28px',
                                                                                                fontWeight: 'bold',
                                                                                                '&:hover': {backgroundColor: '#9d292a'}
                                                                                            }}
                                                                                            loading={state.loadingMalware[indexDevice] || device.remove_malware}
                                                                                            onClick={() => handleClickUninstallMalwareDevice(indexDevice)}>Uninstall</LoadingButton>

                                                                                    </Grid>

                                                                                }


                                                                            </Grid>
                                                                    }


                                                                </Grid>
                                                            </Grid>
                                                        </Grid>

                                                    }


                                                </Grid>
                                            </CardContent>
                                            <CardActions sx={{padding: '0px 8px 3px 8px', borderTop: '1px solid white'}}
                                                         disableSpacing>
                                                <IconButton
                                                    disabled={state.loadingFinishMonitoring}
                                                    sx={{
                                                        color: 'white',
                                                        '&.Mui-disabled': {
                                                            color: 'rgba(0, 0, 0, 0.26) !important'
                                                        }
                                                    }}
                                                    aria-label="add to favorites"
                                                    onClick={() => navigate(`/monitoring/scenario/${state.scenario.id}/device/${device.mac_address}`)}

                                                >
                                                    <BarChartSharpIcon/>
                                                </IconButton>
                                            </CardActions>
                                        </Card>
                                    </Grid>
                                ))


                            }
                        </Grid>

                    </Grid>


            }
            <FullSizeDialog
                open={state.openLogDialog}
                handleClose={() => setState({...state, openLogDialog: false, textError: ''})}
                title="Log"

            >
                <pre style={{overflowX: 'scroll'}}>{state.textError}</pre>
            </FullSizeDialog>
            <Snackbar anchorOrigin={{vertical: "bottom", horizontal: "right"}} open={state.openSuccessFinish}
                      autoHideDuration={3000} onClose={() => setState({...state, openSuccessFinish: false})}>
                <Alert onClose={() => setState({...state, openSuccessFinish: false})} severity="success"
                       sx={{width: '100%'}}>
                    The monitoring has been finished successfully!
                </Alert>
            </Snackbar>
        </Grid>
    )
}

export default ScenarioMonitoring