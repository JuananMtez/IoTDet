import React, {useEffect, useState} from "react";
import {getAvailableDeviceToDeploy} from "../services/DeviceRequests.js";
import {
    getAllDeployfilesMalwareValidated,
    getAllDeployfilesMonitoringScriptValidated
} from "../services/FileRequests.js";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from '@mui/icons-material/Remove';
import {
    Alert,
    Card,
    CardActions,
    CardContent,
    CircularProgress, FormControl,
    Grid, InputAdornment,
    InputLabel,
    MenuItem,
    Select, Snackbar, Stack
} from "@mui/material";
import TextFieldStyled from "../components/TextFieldStyled/TextFieldStyled.jsx";
import Table from "../components/Tables/Table.jsx";
import Typography from "@mui/material/Typography";
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import {deployRecording} from "../services/ScenarioRequests.js";
import LoadingButton from "@mui/lab/LoadingButton";
import {useNavigate} from "react-router-dom";

const ScenarioRecordingCreation = () => {

    const [state, setState] = useState({
        name: "",
        loading: true,
        allAvailableDevices: [],
        devicesListAux: [],
        devicesSelected: [],
        allDeployfilesMonitoringScript: [],
        allDeployfilesMalware: [],
        loadingCreateScenario: false,
        deviceCopy: null,
        duration: 1,
        openErrorAlert: false,
        errorTextDetail: ''

    })

    const navigate = useNavigate()
    useEffect(() => {
        getAvailableDeviceToDeploy()
            .then(response => {
                getAllDeployfilesMonitoringScriptValidated()
                    .then(response2 => {
                        getAllDeployfilesMalwareValidated()
                            .then(response3 => {
                                setState({
                                    ...state,
                                    allAvailableDevices: response.data,
                                    loading: false,
                                    allDeployfilesMonitoringScript: response2.data,
                                    allDeployfilesMalware: response3.data
                                })

                            })
                    })

            })
            .catch(() => {
                setState({
                    ...state, loading: false
                })
            })
    }, [])

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
                deployfiles_monitoring_script_selected: [''],
                deployfiles_malware_selected: [],


            }],
            devicesListAux: deviceListAuxCopy
        })
    }

    const handleChangeSelectDeployfilesMonitoringScript = (e, deviceIndex, selectIndex) => {

        const listDevicesSelected = state.devicesSelected
        listDevicesSelected[deviceIndex].deployfiles_monitoring_script_selected[selectIndex] = e.target.value

        setState({
            ...state,
            devicesSelected: listDevicesSelected
        })

    }

    const handleAddMoreDeployfilesMonitoringScript = (deviceIndex) => {
        const listDevicesSelected = state.devicesSelected
        listDevicesSelected[deviceIndex].deployfiles_monitoring_script_selected.push('')
        setState({
            ...state,
            devicesSelected: listDevicesSelected
        })

    }
    const handleAddMoreDeployfilesMalware = (deviceIndex) => {
        const listDevicesSelected = state.devicesSelected
        listDevicesSelected[deviceIndex].deployfiles_malware_selected.push({id: '', duration: 1})
        setState({
            ...state,
            devicesSelected: listDevicesSelected
        })

    }

    const handleRemoveDeployfilesMonitoringScript = (deviceIndex, selectIndex) => {
        const listDevicesSelected = state.devicesSelected
        listDevicesSelected[deviceIndex].deployfiles_monitoring_script_selected.splice(selectIndex, 1)
        setState({
            ...state,
            devicesSelected: listDevicesSelected
        })
    }

    const handleChangeSelectDeployfilesMalware = (e, deviceIndex, selectIndex) => {
        const listDevicesSelected = state.devicesSelected
        listDevicesSelected[deviceIndex].deployfiles_malware_selected[selectIndex].id = e.target.value

        setState({
            ...state,
            devicesSelected: listDevicesSelected
        })
    }

    const handleRemoveDeployfilesMalware = (deviceIndex, selectIndex) => {
        const listDevicesSelected = state.devicesSelected
        listDevicesSelected[deviceIndex].deployfiles_malware_selected.splice(selectIndex, 1)
        setState({
            ...state,
            devicesSelected: listDevicesSelected
        })
    }

    const handleChangeDurationDeployfileMalware = (e, deviceIndex, selectIndex) => {
        const listDevicesSelected = state.devicesSelected
        listDevicesSelected[deviceIndex].deployfiles_malware_selected[selectIndex].duration = e.target.value
        setState({
            ...state,
            devicesSelected: listDevicesSelected
        })
    }

    const handleUpDeployfileMalware = (deviceIndex, selectIndex) => {
        const listDevicesSelected = state.devicesSelected
        const auxDeployfileMalware = listDevicesSelected[deviceIndex].deployfiles_malware_selected[selectIndex - 1]

        listDevicesSelected[deviceIndex].deployfiles_malware_selected[selectIndex - 1] = listDevicesSelected[deviceIndex].deployfiles_malware_selected[selectIndex]
        listDevicesSelected[deviceIndex].deployfiles_malware_selected[selectIndex] = auxDeployfileMalware

        setState({
            ...state,
            devicesSelected: listDevicesSelected
        })
    }
    const handleDownDeployfileMalware = (deviceIndex, selectIndex) => {
        const listDevicesSelected = state.devicesSelected
        const auxDeployfileMalware = listDevicesSelected[deviceIndex].deployfiles_malware_selected[selectIndex + 1]

        listDevicesSelected[deviceIndex].deployfiles_malware_selected[selectIndex + 1] = listDevicesSelected[deviceIndex].deployfiles_malware_selected[selectIndex]
        listDevicesSelected[deviceIndex].deployfiles_malware_selected[selectIndex] = auxDeployfileMalware

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

    const disabledButtonDeploy = () => {
        if (state.loadingCreateScenario || state.devicesSelected.length === 0 || state.name === '')
            return true
        for (let i = 0; i < state.devicesSelected.length; i++) {
            for (let j = 0; j < state.devicesSelected[i].deployfiles_monitoring_script_selected.length; j++) {
                if (state.devicesSelected[i].deployfiles_monitoring_script_selected[j] === '')
                    return true
            }
            if (state.devicesSelected[i].deployfiles_malware_selected.length === 0)
                return true
            for (let j = 0; j < state.devicesSelected[i].deployfiles_malware_selected.length; j++) {
                if (state.devicesSelected[i].deployfiles_malware_selected[j].id === '' || state.devicesSelected[i].deployfiles_malware_selected[j].duration === '' || state.devicesSelected[i].deployfiles_malware_selected[j].duration === 0)
                    return true
            }
        }

        return false

    }

    const handleBtnCopy = (deviceIndex) => {
        setState({
            ...state,
            deviceCopy: JSON.parse(JSON.stringify(state.devicesSelected[deviceIndex]))

        })
    }


    const handleBtnPaste = (deviceIndex) => {
        const listDevicesSelected = [...state.devicesSelected]
        listDevicesSelected[deviceIndex].deployfiles_monitoring_script_selected = [...state.deviceCopy.deployfiles_monitoring_script_selected]
        listDevicesSelected[deviceIndex].deployfiles_malware_selected = [...state.deviceCopy.deployfiles_malware_selected]

        setState({
            ...state,
            devicesSelected: listDevicesSelected
        })
    }

    const handleBtnDeploy = () => {

        setState({
            ...state,
            loadingCreateScenario: true
        })

        const devices = []

        for (let i = 0; i < state.devicesSelected.length; i++) {
            let deployfiles_monitoring_script_selected = []
            let deployfiles_malware_selected = []

            for (let j = 0; j < state.devicesSelected[i].deployfiles_monitoring_script_selected.length; j++)
                deployfiles_monitoring_script_selected.push({deployfile_monitoring_script_id: state.devicesSelected[i].deployfiles_monitoring_script_selected[j]})
            for (let j = 0; j < state.devicesSelected[i].deployfiles_malware_selected.length; j++)
                deployfiles_malware_selected.push({
                    deployfile_malware_id: state.devicesSelected[i].deployfiles_malware_selected[j].id,
                    duration: state.devicesSelected[i].deployfiles_malware_selected[j].duration
                })

            devices.push({
                mender_id: state.devicesSelected[i].mender_id,
                mac_address: state.devicesSelected[i].mac_address,
                device_type: state.devicesSelected[i].device_type,
                deployfiles_monitoring_script_selected: deployfiles_monitoring_script_selected,
                deployfiles_malware_selected: deployfiles_malware_selected
            })
        }



        deployRecording({name: state.name, devices: devices})
            .then(response => {
                navigate(`/scenario/recording/${response.data.id}`)
            })
            .catch(error => {
                setState({
                    ...state,
                    loadingCreateScenario: false,
                    openErrorAlert: true,
                    errorTextDetail: error.response.data.detail
                })
            })

    }


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
        name: "geo_country", label: "Country", options: {
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
                        <Card elevation={6} variant="elevation" sx={{
                            borderRadius: '28px',
                            backgroundColor: '#555555 !important',
                        }}>
                            <CardContent sx={{color: 'white', padding: '16px 12px 16px 12px'}}>
                                <Typography sx={{fontWeight: 'bold'}} variant="h7" component="div">
                                    Mender ID: {device.mender_id}
                                </Typography>
                                <Typography sx={{fontWeight: 'bold', color: 'wheat', mb: 0, fontSize: '14px'}}>
                                    MAC Address: {device.mac_address}
                                </Typography>
                                <hr/>
                                <Grid container spacing={1}>
                                    <Grid item xs={12}>
                                        <Grid container direction="row">
                                            <Grid item xs={12}>
                                                <Typography sx={{fontStyle: 'italic'}} variant="h7" component="div">
                                                    Deployfiles for monitoring scripts
                                                </Typography>

                                            </Grid>
                                            <Grid item xs={12}>
                                                <Grid container direction="row" justifyContent="center"
                                                      alignItems="center" spacing={1}
                                                      sx={{padding: '10px 10px 10px 10px'}}>
                                                    {
                                                        device.deployfiles_monitoring_script_selected.map((select, indexSelect) => (
                                                            <Grid key={indexSelect} item xs={12}>
                                                                <Stack direction="row" spacing={1} alignItems="center">
                                                                    <FormControl variant="filled" fullWidth
                                                                                 disabled={state.loadingCreateScenario}>
                                                                        <InputLabel sx={{color: 'white'}}
                                                                                    id="demo-simple-select-label">Deployfile {indexSelect + 1}</InputLabel>
                                                                        <Select
                                                                            labelId="demo-simple-select-label"
                                                                            size="small"
                                                                            id="demo-simple-select"
                                                                            //disabled={state.loadingScenario}
                                                                            disableUnderline={false}
                                                                            value={select}
                                                                            label="fff"
                                                                            sx={{color: 'white'}}
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
                                                                            onChange={(e) => handleChangeSelectDeployfilesMonitoringScript(e, indexDevice, indexSelect)}
                                                                        >

                                                                            {
                                                                                state.allDeployfilesMonitoringScript.map((deployfile, indexDeplofilesMonitoringScript) => (
                                                                                    <MenuItem
                                                                                        key={indexDeplofilesMonitoringScript}
                                                                                        value={deployfile.id}>{deployfile.name}</MenuItem>
                                                                                ))
                                                                            }


                                                                        </Select>
                                                                    </FormControl>

                                                                    <IconButton
                                                                        onClick={() => handleRemoveDeployfilesMonitoringScript(indexDevice, indexSelect)}
                                                                        disabled={indexSelect === 0 || state.loadingCreateScenario}
                                                                        sx={{
                                                                            color: 'white',
                                                                            '&.Mui-disabled': {
                                                                                color: 'rgba(0, 0, 0, 0.26) !important'
                                                                            }
                                                                        }}
                                                                        aria-label="add to favorites">
                                                                        <RemoveIcon/>
                                                                    </IconButton>
                                                                </Stack>
                                                            </Grid>
                                                        ))
                                                    }
                                                    <Grid item>
                                                        <IconButton
                                                            onClick={() => handleAddMoreDeployfilesMonitoringScript(indexDevice)}
                                                            size="small"
                                                            sx={{
                                                                color: 'white',
                                                                '&.Mui-disabled': {
                                                                    color: 'rgba(0, 0, 0, 0.26) !important'
                                                                }
                                                            }}
                                                            disabled={state.loadingCreateScenario}>
                                                            <AddIcon/>
                                                        </IconButton>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    <Grid item md={12} xs={12}>
                                        <hr/>
                                        <Grid container direction="row">
                                            <Grid item xs={12}>
                                                <Typography sx={{fontStyle: 'italic'}} variant="h7" component="div">
                                                    Deployfiles for malware
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Grid container direction="row" justifyContent="center"
                                                      alignItems="center" spacing={1}
                                                      sx={{padding: '10px 10px 10px 10px'}}>

                                                    {
                                                        device.deployfiles_malware_selected.map((select, indexSelect) => (
                                                            <Grid key={indexSelect} item xs={12}>
                                                                <Stack direction="row" spacing={1} alignItems="center">
                                                                    <span
                                                                        style={{color: 'white'}}>{indexSelect + 1}.</span>
                                                                    <FormControl disabled={state.loadingCreateScenario}
                                                                                 variant="filled" fullWidth>
                                                                        <InputLabel sx={{color: 'white'}}
                                                                                    id="demo-simple-select-label">Deployfile {indexSelect + 1}</InputLabel>
                                                                        <Select
                                                                            labelId="demo-simple-select-label"
                                                                            size="small"
                                                                            id="demo-simple-select"
                                                                            //disabled={state.loadingScenario}
                                                                            disableUnderline={false}
                                                                            value={select.id}
                                                                            label="fff"
                                                                            sx={{color: 'white'}}
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
                                                                            onChange={(e) => handleChangeSelectDeployfilesMalware(e, indexDevice, indexSelect)}
                                                                        >

                                                                            {
                                                                                state.allDeployfilesMalware.map((deployfile, indexDeplofilesMalware) => (
                                                                                    <MenuItem
                                                                                        key={indexDeplofilesMalware}
                                                                                        value={deployfile.id}>{deployfile.name}</MenuItem>
                                                                                ))
                                                                            }


                                                                        </Select>
                                                                    </FormControl>


                                                                    <TextFieldStyled
                                                                        variant="filled"
                                                                        fullWidth
                                                                        size="small"
                                                                        disabled={state.loadingCreateScenario}
                                                                        name="duration"
                                                                        type="number"
                                                                        label="Duration"
                                                                        placeholder=""
                                                                        value={select.duration}
                                                                        onChange={(e) => handleChangeDurationDeployfileMalware(e, indexDevice, indexSelect)}

                                                                        InputLabelProps={{
                                                                            shrink: true,
                                                                        }}
                                                                        InputProps={{
                                                                            min: 0,
                                                                            inputMode: 'numeric', pattern: '+[0-9]*',
                                                                            endAdornment: (
                                                                                <InputAdornment
                                                                                    position="end">seconds</InputAdornment>
                                                                            )

                                                                        }}
                                                                    />
                                                                    <IconButton
                                                                        onClick={() => handleRemoveDeployfilesMalware(indexDevice, indexSelect)}
                                                                        disabled={state.loadingCreateScenario}
                                                                        sx={{
                                                                            color: 'white',
                                                                            '&.Mui-disabled': {
                                                                                color: 'rgba(0, 0, 0, 0.26) !important'
                                                                            }
                                                                        }}
                                                                        aria-label="add to favorites">
                                                                        <RemoveIcon/>
                                                                    </IconButton>
                                                                    <IconButton
                                                                        disabled={indexSelect === 0 || state.loadingCreateScenario}
                                                                        onClick={() => handleUpDeployfileMalware(indexDevice, indexSelect)}
                                                                        sx={{
                                                                            color: 'white',
                                                                            '&.Mui-disabled': {
                                                                                color: 'rgba(0, 0, 0, 0.26) !important'
                                                                            }
                                                                        }}
                                                                        aria-label="add to favorites">
                                                                        <ArrowUpwardIcon/>
                                                                    </IconButton>
                                                                    <IconButton
                                                                        onClick={() => handleDownDeployfileMalware(indexDevice, indexSelect)}

                                                                        disabled={device.deployfiles_malware_selected.length === 1 || device.deployfiles_malware_selected.length === indexSelect + 1 || state.loadingCreateScenario}
                                                                        sx={{
                                                                            color: 'white',
                                                                            '&.Mui-disabled': {
                                                                                color: 'rgba(0, 0, 0, 0.26) !important'
                                                                            }
                                                                        }}
                                                                        aria-label="add to favorites">
                                                                        <ArrowDownwardIcon/>
                                                                    </IconButton>
                                                                </Stack>
                                                            </Grid>
                                                        ))
                                                    }
                                                    <Grid item>
                                                        <IconButton
                                                            onClick={() => handleAddMoreDeployfilesMalware(indexDevice)}
                                                            size="small"
                                                            disabled={state.loadingCreateScenario}
                                                            sx={{
                                                                color: 'white',
                                                                '&.Mui-disabled': {
                                                                    color: 'rgba(0, 0, 0, 0.26) !important'
                                                                }
                                                            }}>
                                                            <AddIcon/>
                                                        </IconButton>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Grid>

                                    </Grid>

                                </Grid>
                            </CardContent>
                            <CardActions sx={{padding: '0px 8px 3px 8px', borderTop: '1px solid white'}} disableSpacing>

                                <IconButton
                                    disabled={state.loadingCreateScenario}
                                    sx={{
                                        color: 'white',
                                        '&.Mui-disabled': {
                                            color: 'rgba(0, 0, 0, 0.26) !important'
                                        }
                                    }}
                                    aria-label="add to favorites"
                                    onClick={() => handleRemoveSelectedDevice(indexDevice)}
                                >
                                    <DeleteIcon/>
                                </IconButton>
                                <IconButton
                                    disabled={state.loadingCreateScenario}
                                    onClick={() => handleBtnCopy(indexDevice)}
                                    aria-label="add to favorites"
                                    sx={{
                                        color: 'white',
                                        '&.Mui-disabled': {
                                            color: 'rgba(0, 0, 0, 0.26) !important'
                                        }
                                    }}
                                >
                                    <ContentCopyIcon/>
                                </IconButton>
                                <IconButton
                                    onClick={() => handleBtnPaste(indexDevice)}
                                    disabled={state.deviceCopy === null || state.loadingCreateScenario}
                                    aria-label="add to favorites"
                                    sx={{
                                        color: 'white',
                                        '&.Mui-disabled': {
                                            color: 'rgba(0, 0, 0, 0.26) !important'
                                        }
                                    }}
                                >
                                    <ContentPasteIcon/>
                                </IconButton>
                            </CardActions>
                        </Card>
                    </Grid>
                ))
            }
            <Grid item xs={12} sx={{mt: '20px', mb: '50px'}}>
                <LoadingButton
                    loading={state.loadingCreateScenario}
                    disabled={disabledButtonDeploy()}
                    onClick={handleBtnDeploy}
                    fullWidth variant="contained" color="success"
                    sx={{borderRadius: '28px', fontWeight: 'bold'}}>Deploy</LoadingButton>
            </Grid>
            <Snackbar anchorOrigin={{vertical: "bottom", horizontal: "right"}} open={state.openErrorAlert}
                      autoHideDuration={3000} onClose={() => setState({...state, openErrorAlert: false})}>
                <Alert onClose={() => setState({...state, openErrorAlert: false})} severity="error"
                       sx={{width: '100%'}}>
                    {state.errorTextDetail}
                </Alert>
            </Snackbar>

        </Grid>
    )
}

export default ScenarioRecordingCreation