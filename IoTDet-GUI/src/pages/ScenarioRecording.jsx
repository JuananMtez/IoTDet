import {useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {finishRecording, getScenarioById} from "../services/ScenarioRequests.js";
import {Alert, Card, CardActions, CardContent, CircularProgress, Grid, Snackbar, Stack} from "@mui/material";
import Typography from "@mui/material/Typography";
import {StatusScenarioEnum} from "../enums.js";
import Countdown, {zeroPad} from "react-countdown";
import LoadingButton from "@mui/lab/LoadingButton";
import TextFieldStyled from "../components/TextFieldStyled/TextFieldStyled.jsx";
import IconButton from "@mui/material/IconButton";
import BarChartSharpIcon from '@mui/icons-material/BarChartSharp';
import CheckIcon from '@mui/icons-material/Check';
import ReportIcon from '@mui/icons-material/Report';
import FullSizeDialog from "../components/Dialog/FullSizeDialog.jsx";
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

const ScenarioRecording = () => {
    const {scenarioId} = useParams()
    const [state, setState] = useState({
        scenario: null,
        loading: true,
        loadingFinishRecording: false,
        openSuccessFinish: false,
        openLogDialog: false,
        textError: ''
    })


    const convertSecondsToDate = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        const hoursString = hours.toString().padStart(2, '0');
        const minutesString = minutes.toString().padStart(2, '0');
        const secondsString = remainingSeconds.toString().padStart(2, '0');

        return hoursString + ':' + minutesString + ':' + secondsString;
    }
    const user = JSON.parse((localStorage.getItem('user')))

    const navigate = useNavigate()
    useEffect(() => {

        getScenarioById(scenarioId)
            .then(response => setState({
                ...state,
                scenario: response.data,
                loading: false,

            }))
        return () => {

        }
    }, [])

    useEffect(() => {
        let interval = 0
        if (state.loading === false) {
            interval = setInterval(() => {
                getScenarioById(scenarioId)
                    .then(response => {
                        setState(prevState => ({
                            ...prevState,
                            scenario: response.data
                        }));
                    })
            }, 10000)


        }
        return () => {
            clearInterval(interval)
        }

    }, [state.loading])


    const handleFinishRecordingScenario = () => {
        setState({
            ...state,
            loadingFinishRecording: true
        })
        finishRecording(scenarioId)
            .then(response => {
                setState({
                    ...state,
                    scenario: response.data,
                    openSuccessFinish: true,
                    loadingFinishRecording: false
                })
            })
    }


    const rendererCountdownMalware = ({days, hours, minutes, seconds, completed}) => {
        if (!completed) {
            const totalHours = days * 24 + hours

            return (
                <span
                    style={{
                        fontWeight: 'bold',
                        color: 'white'
                    }}>{zeroPad(totalHours)}:{zeroPad(minutes)}:{zeroPad(seconds)}</span>
            )
        } else
            return (
                <IconButton
                    disabled sx={{
                    color: 'white',
                    '&.Mui-disabled': {
                        color: 'white !important'
                    }
                }}>
                    <HourglassEmptyIcon/>
                </IconButton>

            )


    }


    const getComponentButton = () => {


        if (state.scenario !== null) {
            if (state.scenario.status === 0) {
                return (
                        <LoadingButton
                            disabled={user.role === 3}
                            size="small" variant="contained" sx={{
                            color: 'white',
                            backgroundColor: '#C63637',
                            borderRadius: '28px',
                            fontWeight: 'bold',
                            '&:hover': {backgroundColor: '#9d292a'}
                        }} loading={state.loadingFinishRecording}
                            onClick={handleFinishRecordingScenario}>Finish</LoadingButton>

                )

            }

        }

    }


    const handleClickShowLog = (error) => {

        setState({
            ...state,
            openLogDialog: true,
            textError: error
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
                    <Grid container alignItems={'center'}>
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
                            <Grid
                                container
                                direction="row"
                                justifyContent="flex-end"
                                alignItems="center"

                            >
                                {

                                    <Grid item>
                                        {getComponentButton()}
                                    </Grid>
                                }


                            </Grid>

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
                                                            Deployfiles for monitoring scripts
                                                        </Typography>
                                                    </Grid>
                                                    <Grid container direction="row" justifyContent="center"
                                                          alignItems="center" spacing={1}
                                                          sx={{padding: '10px 10px 10px 10px'}}>
                                                        {
                                                            device.deployfiles_monitoring_script_selected.map((deployfileMonitoringScriptSelected, indexDeployfileMonitoringScriptSelected) => (
                                                                <Grid item xs={12}
                                                                      key={indexDeployfileMonitoringScriptSelected}>
                                                                    <Stack spacing={1} direction="row">

                                                                        <TextFieldStyled
                                                                            name="name"
                                                                            InputLabelProps={{shrink: true}}
                                                                            label="Name"

                                                                            value={deployfileMonitoringScriptSelected.deployfile_monitoring_script.name}
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
                                                                                error={deployfileMonitoringScriptSelected.mender_deployment.status === "Installation failed"}
                                                                                value={deployfileMonitoringScriptSelected.mender_deployment.status}
                                                                                size="small"
                                                                                fullWidth
                                                                                InputProps={{
                                                                                    readOnly: true
                                                                                }}
                                                                                variant="filled"
                                                                            />
                                                                        }
                                                                        {
                                                                            state.scenario.status === 0 && deployfileMonitoringScriptSelected.mender_deployment.status === "Installation failed" &&
                                                                            <IconButton
                                                                                sx={{
                                                                                    color: 'white',
                                                                                    '&.Mui-disabled': {
                                                                                        color: 'rgba(0, 0, 0, 0.26) !important'
                                                                                    }
                                                                                }}
                                                                                onClick={() => handleClickShowLog(deployfileMonitoringScriptSelected.mender_deployment.log_error)}


                                                                            >
                                                                                <ReportIcon/>
                                                                            </IconButton>
                                                                        }
                                                                    </Stack>

                                                                </Grid>
                                                            ))
                                                        }
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <hr/>
                                                        <Typography sx={{fontStyle: 'italic'}} variant="h7"
                                                                    component="div">
                                                            Deployfiles for malware
                                                        </Typography>

                                                    </Grid>
                                                    <Grid container direction="row" justifyContent="center"
                                                          alignItems="center" spacing={1}
                                                          sx={{padding: '10px 10px 10px 10px'}}>

                                                        {
                                                            device.deployfiles_malware_selected.map((deployfileMalwareSelected, indexDeployfileMalwareSelected) => (
                                                                <Grid key={indexDeployfileMalwareSelected} item xs={12}>
                                                                    <Stack direction="row" spacing={1}
                                                                           alignItems="center">
                                                                        <TextFieldStyled
                                                                            name="name"
                                                                            InputLabelProps={{shrink: true}}
                                                                            label="Name"

                                                                            value={deployfileMalwareSelected.deployfile_malware.name}
                                                                            size="small"
                                                                            fullWidth
                                                                            InputProps={{
                                                                                readOnly: true
                                                                            }}
                                                                            variant="filled"
                                                                        />
                                                                        {
                                                                            state.scenario.status === 0 && deployfileMalwareSelected.mender_deployment !== null && device.current_malware === indexDeployfileMalwareSelected &&
                                                                            <TextFieldStyled
                                                                                name="status"
                                                                                InputLabelProps={{shrink: true}}
                                                                                label="Status"
                                                                                error={deployfileMalwareSelected.mender_deployment.status === "Installation failed"}
                                                                                value={deployfileMalwareSelected.mender_deployment.status}
                                                                                size="small"
                                                                                fullWidth
                                                                                InputProps={{
                                                                                    readOnly: true
                                                                                }}
                                                                                variant="filled"
                                                                            />
                                                                        }


                                                                        {
                                                                            state.scenario.status === 0 && deployfileMalwareSelected.mender_deployment !== null && deployfileMalwareSelected.mender_deployment.status === "Installation failed" &&
                                                                            <IconButton sx={{
                                                                                color: 'white',
                                                                                '&.Mui-disabled': {
                                                                                    color: 'rgba(0, 0, 0, 0.26) !important'
                                                                                }
                                                                            }}
                                                                                        onClick={() => handleClickShowLog(deployfileMalwareSelected.mender_deployment.log_error)}

                                                                            >
                                                                                <ReportIcon/>
                                                                            </IconButton>
                                                                        }
                                                                        {
                                                                            state.scenario.status === 0 && device.current_malware === indexDeployfileMalwareSelected && deployfileMalwareSelected.mender_deployment !== null && deployfileMalwareSelected.mender_deployment.status !== "Installation failed" && deployfileMalwareSelected.timestamp_finished !== null &&
                                                                            <Countdown
                                                                                date={new Date(deployfileMalwareSelected.timestamp_finished).getTime()}
                                                                                renderer={rendererCountdownMalware}
                                                                            />
                                                                        }
                                                                        {
                                                                            state.scenario.status === 0 && device.current_malware === indexDeployfileMalwareSelected && deployfileMalwareSelected.mender_deployment !== null && deployfileMalwareSelected.mender_deployment.status !== "Installation failed" && deployfileMalwareSelected.timestamp_finished === null &&
                                                                            <span
                                                                                style={{
                                                                                    fontWeight: 'bold',
                                                                                    color: 'white'
                                                                                }}>{convertSecondsToDate(deployfileMalwareSelected.duration)}</span>
                                                                        }

                                                                        {
                                                                            state.scenario.status === 0 && (device.current_malware === -1 || device.current_malware > indexDeployfileMalwareSelected) &&
                                                                            <IconButton
                                                                                disabled sx={{
                                                                                color: 'white',
                                                                                '&.Mui-disabled': {
                                                                                    color: 'white !important'
                                                                                }
                                                                            }}>
                                                                                <CheckIcon/>
                                                                            </IconButton>
                                                                        }
                                                                    </Stack>

                                                                </Grid>
                                                            ))
                                                        }
                                                    </Grid>
                                                </Grid>


                                            </CardContent>
                                            <CardActions sx={{padding: '0px 8px 3px 8px', borderTop: '1px solid white'}}
                                                         disableSpacing>
                                                <IconButton
                                                    disabled={state.loadingFinishRecording}
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
                <div>
                    <pre style={{overflowX: 'scroll'}}>{state.textError}</pre>
                </div>

            </FullSizeDialog>
            <Snackbar anchorOrigin={{vertical: "bottom", horizontal: "right"}} open={state.openSuccessFinish}
                      autoHideDuration={3000} onClose={() => setState({...state, openSuccessFinish: false})}>
                <Alert onClose={() => setState({...state, openSuccessFinish: false})} severity="success"
                       sx={{width: '100%'}}>
                    The recording has been finished successfully!
                </Alert>
            </Snackbar>
        </Grid>
    )
}

export default ScenarioRecording