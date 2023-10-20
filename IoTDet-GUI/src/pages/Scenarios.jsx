import React, {forwardRef, useEffect, useState} from "react";
import {
    deleteScenario, finishMonitoring, finishRecording,
    getAllScenariosCheckingDeployable,
    modifyNameScenario
} from "../services/ScenarioRequests.js";
import {
    Alert,
    Button,
    CircularProgress, Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid, Snackbar, Stack
} from "@mui/material";
import Table from "../components/Tables/Table.jsx";
import {StatusScenarioEnum} from "../enums.js";
import OpenInBrowserIcon from '@mui/icons-material/OpenInBrowser';
import IconButton from "@mui/material/IconButton";
import DriveFileRenameOutlineSharpIcon from '@mui/icons-material/DriveFileRenameOutlineSharp';
import TextFieldStyled from "../components/TextFieldStyled/TextFieldStyled.jsx";
import Slide from "@mui/material/Slide";
import LoadingButton from "@mui/lab/LoadingButton"
import {useNavigate} from "react-router-dom"
import DeleteIcon from '@mui/icons-material/Delete'
import ReplayIcon from '@mui/icons-material/Replay'
import StopCircleIcon from "@mui/icons-material/StopCircle";

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});


const Scenarios = () => {

    const [state, setState] = useState({
        scenarios: [],
        loading: true,
        openDialogModifyName: false,
        scenarioSelectedIndex: "",
        newNameScenario: "",
        loadingChangeName: false,
        openSuccessModifyName: false,
        loadingsFinish: [],
        newNameSelected: '',
        openSuccessFinishRecording: false,
        openErrorDelete: false,
        openSuccessFinishMonitoring: false
    })
    const user = JSON.parse((localStorage.getItem('user')))


    const navigate = useNavigate()

    useEffect(() => {
        getAllScenariosCheckingDeployable()
            .then(response => setState({
                ...state,
                loading: false,
                scenarios: response.data,
                loadingsFinish: Array.from({length: response.data.length}, () => false)
            }))

    }, [])


    const onChangeName = (event) => {
        setState({
            ...state,
            newNameScenario: event.target.value
        })
    }


    const handleClickModifyName = () => {
        setState({
            ...state,
            loadingChangeName: true
        })
        modifyNameScenario(state.scenarios[state.scenarioSelectedIndex].id, state.newNameScenario)
            .then(response => {
                const list = state.scenarios
                list[state.scenarioSelectedIndex].name = response.data.name

                setState({
                    ...state,
                    scenarios: list,
                    scenarioSelectedIndex: "",
                    newNameScenario: "",
                    loadingChangeName: false,
                    openDialogModifyName: false,
                    openSuccessModifyName: true,

                })
            })
    }

    const handleClickRemoveScenario = (index) => {
        deleteScenario(state.scenarios[index].id)
            .then(() => {
                let list = [...state.scenarios]
                list.splice(index, 1)

                setState({
                    ...state,
                    scenarios: list
                })
            }).catch(() => {
                setState({
                    ...state,
                    openErrorDelete: true
                })
        })
    }

    const handleFinishScenario = (index) => {

        let list = [...state.loadingsFinish]
        list[index] = true

        setState({
            ...state,
            loadingsFinish: list
        })

        if (state.scenarios[index].type === "scenario_recording") {
            finishRecording(state.scenarios[index].id)
                .then(response => {

                    list[index] = false
                    let list_scenarios = [...state.scenarios]
                    list_scenarios[index] = response.data
                    setState({
                        ...state,
                        loadingsFinish: list,
                        openSuccessFinishRecording: true,
                        scenarios: list_scenarios

                    })
                })

        }

        else if (state.scenarios[index].type === "scenario_monitoring") {
            finishMonitoring(state.scenarios[index].id)
                .then(response => {

                    list[index] = false
                    let list_scenarios = [...state.scenarios]
                    list_scenarios[index] = response.data
                    setState({
                        ...state,
                        loadingsFinish: list,
                        openSuccessFinishMonitoring: true,
                        scenarios: list_scenarios

                    })
                })
        }
    }


    const options = {
        search: true,
        download: false,
        rowsPerPageOptions: [5, 10, 30, 50, 100],
        print: false,
        tableBodyHeight: '100%',
        selectableRows: 'none',
        viewColumns: false,
        responsive: 'vertical',
        filter: true,
        filterType: "dropdown",
        selectableRowsHeader: false,
        textLabels: {
            body: {
                noMatch: state.loading ?
                    <CircularProgress sx={{color: 'white'}}/> : 'Sorry, no scenarios found'
            }
        }, selectToolbarPlacement: 'none',

    };

    const columns = [
        {
            name: "name",
            label: "Name",
            options: {
                filter: false,
                sort: false,
                setCellProps: () => ({
                    style: {
                        width: "25%",
                    },
                }),
            }
        },
        {
            name: "type",
            label: "Type",
            options: {
                filter: true,
                sort: false,
                customBodyRenderLite: (dataIndex) => {
                    return state.scenarios[dataIndex].type === "scenario_recording" ? "Recording" : "Monitoring"
                },
                setCellProps: () => ({
                    style: {
                        width: "10%",
                    },
                }),
            }
        },
        {
            name: "status",
            label: "Status",
            options: {
                filter: false,
                sort: false,
                customBodyRenderLite: (dataIndex) => {
                    return StatusScenarioEnum[state.scenarios[dataIndex].status].value
                },
                setCellProps: () => ({
                    style: {
                        width: "40%",
                    },
                }),
            }
        },
        {
            name: "",
            label: "",
            options: {
                filter: false,
                sort: false,
                customBodyRenderLite: (dataIndex) => {
                    return (
                        <IconButton disabled={state.loadingsFinish[dataIndex]} onClick={() => {
                            if (state.scenarios[dataIndex].type === 'scenario_recording')
                                navigate(`/scenario/recording/${state.scenarios[dataIndex].id}`)
                            else
                                navigate(`/scenario/monitoring/${state.scenarios[dataIndex].id}`)
                        }}>
                            <OpenInBrowserIcon sx={{fontSize: '5vh'}}/>
                        </IconButton>
                    )
                }
            }
        },
        {
            name: "",
            label: "",
            options: {
                filter: false,
                sort: false,
                customBodyRenderLite: (dataIndex) => {
                    return (
                        <>
                            {
                                state.loadingsFinish[dataIndex] ?
                                    <CircularProgress color="inherit"/>
                                    :
                                    <IconButton
                                        sx={{
                                            '&.Mui-disabled': {
                                                color: 'rgba(0, 0, 0, 0.26) !important'
                                            },

                                        }}

                                        onClick={() => handleFinishScenario(dataIndex)}
                                        disabled={user.role === 3 || state.scenarios[dataIndex].status === 1}>
                                        <StopCircleIcon sx={{fontSize:'5vh'}}/>
                                    </IconButton>

                            }
                        </>

                    )
                }
            }
        },
        {
            name: "",
            label: "",
            options: {
                filter: false,
                sort: false,
                customBodyRenderLite: (dataIndex) => {
                    return (
                        <IconButton disabled={user.role === 3 || state.loadingsFinish[dataIndex]}
                                    onClick={() => setState({
                                        ...state,
                                        openDialogModifyName: true,
                                        scenarioSelectedIndex: dataIndex
                                    })}>
                            <DriveFileRenameOutlineSharpIcon sx={{fontSize: '5vh'}}/>
                        </IconButton>
                    )
                }
            }
        },
        {
            name: "",
            label: "",
            options: {
                filter: false,
                sort: false,
                customBodyRenderLite: (dataIndex) => {
                    return (
                        <IconButton
                            disabled={user.role === 3 || state.scenarios[dataIndex].status === 0 || state.loadingsFinish[dataIndex]}
                            onClick={() => handleClickRemoveScenario(dataIndex)}>
                            <DeleteIcon sx={{fontSize: '5vh'}}/>
                        </IconButton>
                    )
                }
            }
        },
        {
            name: "",
            label: "",
            options: {
                filter: false,
                sort: false,
                customBodyRenderLite: (dataIndex) => {
                    return (
                        <IconButton onClick={() => {

                            navigate(`/scenario/${state.scenarios[dataIndex].type === "scenario_recording" ? "recording" : "monitoring"}/${state.scenarios[dataIndex].id}/redeploy`)
                        }}
                                    disabled={user.role === 3 || !state.scenarios[dataIndex].deployable || state.loadingsFinish[dataIndex]}>
                            <ReplayIcon sx={{fontSize: '5vh'}}/>
                        </IconButton>
                    )
                }
            }
        },

    ]

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Table title={"Scenarios"} columns={columns} data={state.scenarios}
                       options={options}/>
            </Grid>
            <Grid item xs={12} sx={{mt: '10px'}}>
                <Stack direction="row" spacing={2}>
                    <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        disabled={user.role === 3}
                        onClick={() => {
                            navigate('/scenario/recording/create')
                        }}
                        sx={{
                            borderRadius: '28px',
                            fontWeight: 'bold'
                        }}>
                        Create recording
                    </Button>

                    <Button
                        size="small"
                        disabled={user.role === 3}
                        variant="contained"
                        color="secondary"
                        onClick={() => navigate('/scenario/monitoring/create')}
                        sx={{
                            borderRadius: '28px',
                            fontWeight: 'bold'
                        }}>
                        Create monitoring
                    </Button>
                </Stack>


            </Grid>


            <Dialog open={state.openDialogModifyName}

                    PaperProps={{
                        style: {
                            backgroundColor: '#676767',
                            color: 'white',
                            fontWeight: 'bold',
                            borderRadius: '25px'
                        }
                    }}
                    TransitionComponent={Transition}
                    keepMounted
                    maxWidth="sm"
                    fullWidth
            >
                <DialogTitle sx={{fontWeight: 'bold'}}>Modify name of the scenario</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextFieldStyled
                                disabled
                                id="name"
                                label="Actual name"
                                type="name"
                                value={state.scenarioSelectedIndex === "" ? "" : state.scenarios[state.scenarioSelectedIndex].name}
                                fullWidth
                                variant="filled"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextFieldStyled
                                autoFocus
                                id="name"
                                label="Name"
                                type="name"
                                value={state.newNameScenario}
                                fullWidth
                                variant="filled"
                                onChange={onChangeName}
                            />
                        </Grid>
                    </Grid>


                </DialogContent>
                <DialogActions>
                    <Button
                        size="small"
                        color="error"
                        sx={{
                            borderRadius: '28px',
                            fontWeight: 'bold'
                        }}
                        variant="contained"
                        onClick={() => setState({
                            ...state,
                            scenarioSelectedIndex: '',
                            openDialogModifyName: false,
                            loadingChangeName: false,
                            newNameScenario: '',

                        })}>Cancel</Button>

                    <LoadingButton
                        loading={state.loadingChangeName}
                        size="small"
                        color="success"
                        sx={{
                            borderRadius: '28px',
                            fontWeight: 'bold'
                        }}
                        variant="contained"
                        onClick={() => handleClickModifyName(state.scenarioSelectedIndex)}>Modify</LoadingButton>
                </DialogActions>
            </Dialog>
            <Snackbar anchorOrigin={{vertical: "bottom", horizontal: "right"}} open={state.openSuccessModifyName}
                      autoHideDuration={2000} onClose={() => setState({...state, openSuccessModifyName: false})}>
                <Alert onClose={() => setState({...state, openSuccessModifyName: false})} severity="success"
                       sx={{width: '100%'}}>
                    The name has been modified successfully.
                </Alert>
            </Snackbar>
            <Snackbar anchorOrigin={{vertical: "bottom", horizontal: "right"}} open={state.openSuccessFinishRecording}
                      autoHideDuration={2000} onClose={() => setState({...state, openSuccessFinishRecording: false})}>
                <Alert onClose={() => setState({...state, openSuccessFinishRecording: false})} severity="success"
                       sx={{width: '100%'}}>
                    The recording has been finished successfully!
                </Alert>
            </Snackbar>
            <Snackbar anchorOrigin={{vertical: "bottom", horizontal: "right"}} open={state.openSuccessFinishMonitoring}
                      autoHideDuration={2000} onClose={() => setState({...state, openSuccessFinishMonitoring: false})}>
                <Alert onClose={() => setState({...state, openSuccessFinishMonitoring: false})} severity="success"
                       sx={{width: '100%'}}>
                    The monitoring has been finished successfully!
                </Alert>
            </Snackbar>
            <Snackbar anchorOrigin={{vertical: "bottom", horizontal: "right"}} open={state.openErrorDelete}
                      autoHideDuration={2000} onClose={() => setState({...state, openErrorDelete: false})}>
                <Alert onClose={() => setState({...state, openErrorDelete: false})} severity="error"
                       sx={{width: '100%'}}>
                    Scenario cannot be removed!
                </Alert>
            </Snackbar>

        </Grid>
    )
}

export default Scenarios