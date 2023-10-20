import {useParams} from "react-router-dom";
import {
    Accordion, AccordionDetails,
    AccordionSummary, Box, Checkbox,
    CircularProgress, Collapse,
    FormControlLabel,
    Grid, Stack,

} from "@mui/material";
import React, {useEffect, useState} from "react";
import {getScenarioFilteredByDevice} from "../services/ScenarioRequests.js";
import Typography from "@mui/material/Typography";
import {StatusScenarioEnum} from "../enums.js";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CardChartRealTime from "../components/Cards/CardChartRealTime.jsx";
import CardChartStatic from "../components/Cards/CardChartStatic.jsx";
import CardChartRealTimePrediction from "../components/Cards/CardChartRealTimePrediction.jsx";
import CardChartStaticPrediction from "../components/Cards/CardChartStaticPrediction.jsx";
import ExpandMore from "../components/Expand/ExpandMore.jsx";
import Table from "../components/Tables/Table.jsx";
import LogsMonitoringRealTime from "../components/Logs/LogsMonitoringRealTime.jsx";
import LogsMonitoringStatic from "../components/Logs/LogsMonitoringStatic.jsx";

const ChartDevice = () => {
    const [state, setState] = useState({scenario: null, loading: true, checked: [], expanded: false})
    //const [intervalGetStatus, setIntervalGetStatus] = useState(null)
    const {scenarioId, deviceId} = useParams()

    useEffect(() => {
        getScenarioFilteredByDevice(scenarioId, deviceId)
            .then(response => {
                let list = []
                if (response.data.type === "scenario_recording") {
                    for (let i = 0; i < response.data.devices[0].deployfiles_monitoring_script_selected.length; i++) {
                        list.push(new Array(response.data.devices[0].deployfiles_monitoring_script_selected[i].deployfile_monitoring_script.monitoring_script.columns.length).fill(false))
                    }
                } else {
                    list = new Array(response.data.devices[0].deployfile_monitoring_script_selected.monitoring_script.columns.length).fill(false)
                }


                setState({
                    ...state,
                    scenario: response.data,
                    loading: false,
                    checked: list
                })
            })
    }, [])


    const handleChecked = (e, indexDeployfile, indexColumn) => {
        let list = state.checked
        list[indexDeployfile][indexColumn] = e.target.checked

        setState({
            ...state,
            checked: list
        })
    }

    const handleCheckedParent = (e, indexDeployfile) => {
        let list = state.checked
        for (let i = 0; i < state.checked[indexDeployfile].length; i++) {
            list[indexDeployfile][i] = e.target.checked
        }
        setState({
            ...state,
            checked: list
        })
    }

    const isIndeterminated = (indexDeployfile) => {
        return state.checked[indexDeployfile].some(value => value === true) && !state.checked[indexDeployfile].every(value => value === true)


    }

    const handleCheckedMonitoring = (e, indexColumn) => {
        let list = state.checked
        list[indexColumn] = e.target.checked

        setState({
            ...state,
            checked: list
        })
    }

    const handleCheckedParentMonitoring = (e) => {
        let list = state.checked
        for (let i = 0; i < state.checked.length; i++) {
            list[i] = e.target.checked
        }
        setState({
            ...state,
            checked: list
        })
    }

    const isIndeterminatedMonitoring = () => {
        return state.checked.some(value => value === true) && !state.checked.every(value => value === true)


    }

    const getMonitoringScripts = () => {


        if (state.scenario.type === "scenario_recording") {

            return state.scenario.devices[0].deployfiles_monitoring_script_selected.map((deployfileSelected, indexDeployfile) => (

                <Grid key={indexDeployfile} item xs={12} sx={{mt: "20px"}}>
                    <Accordion TransitionProps={{unmountOnExit: true}} square={true} disableGutters={true} elevation={0}
                               sx={{boxShadow: 'none', backgroundColor: 'transparent', padding: 0}}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon sx={{color: 'white'}}/>}
                            aria-controls="panel1a-content"
                            id="panel1a-header"
                            sx={{padding: 0, borderBottom: '1px solid white'}}
                        >
                            <Typography sx={{color: 'white', fontWeight: 'bold', fontSize: '25px'}}>Monitoring
                                script: {deployfileSelected.deployfile_monitoring_script.monitoring_script.name}</Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{padding: 0, mt: '40px'}}>

                            <Grid container spacing={4}>
                                <Grid item xs={2.5}>
                                    <Stack direction="row" spacing={0.1}
                                           sx={{borderBottom: '2px solid white', mb: '10px'}}>
                                        <FormControlLabel
                                            label="Select all"
                                            sx={{color: 'white'}}
                                            control={
                                                <Checkbox
                                                    sx={{
                                                        color: 'white',
                                                        '&.Mui-checked': {
                                                            color: 'white',
                                                        },
                                                        '&.MuiCheckbox-indeterminate': {
                                                            color: 'white',
                                                        }
                                                    }}
                                                    checked={state.checked[indexDeployfile].every(value => value === true)}
                                                    indeterminate={isIndeterminated(indexDeployfile)}
                                                    onChange={(e) => handleCheckedParent(e, indexDeployfile)}

                                                />
                                            }
                                        />
                                        <ExpandMore
                                            expand={state.expanded}
                                            onClick={() => setState({...state, expanded: !state.expanded})}
                                            aria-label="show more"
                                        >
                                            <ExpandMoreIcon/>
                                        </ExpandMore>
                                    </Stack>
                                    <Collapse in={state.expanded} unmountOnExit>
                                        <Box sx={{display: 'flex', flexDirection: 'column', ml: 1, width: '100%'}}>
                                            {
                                                deployfileSelected.deployfile_monitoring_script.monitoring_script.columns.map((column, indexColumn) => (
                                                    <FormControlLabel
                                                        key={indexColumn}
                                                        sx={{color: 'white', lineBreak: 'anywhere'}}
                                                        label={`${column.name}`}
                                                        control={
                                                            <Checkbox sx={{
                                                                color: 'white',
                                                                '&.Mui-checked': {
                                                                    color: 'white !important',
                                                                },
                                                            }}
                                                                      checked={state.checked[indexDeployfile][indexColumn]}
                                                                      onChange={(e) => handleChecked(e, indexDeployfile, indexColumn)}
                                                            />
                                                        }
                                                    />
                                                ))
                                            }

                                        </Box>
                                    </Collapse>
                                </Grid>

                                <Grid item xs={9.5}>
                                    <Grid container spacing={2}>


                                        {
                                            deployfileSelected.deployfile_monitoring_script.monitoring_script.columns.map((column, indexColumn) => (
                                                <>
                                                    {
                                                        state.checked[indexDeployfile][indexColumn] &&


                                                        <Grid item key={indexColumn} xs={12} md={6} lg={6}>
                                                            {
                                                                state.scenario.status === 0
                                                                    ?
                                                                    <CardChartRealTime
                                                                        datasetId={deployfileSelected.dataset.id}
                                                                        featureName={column.name}
                                                                        featureDatatype={column.datatype}/>
                                                                    :
                                                                    <CardChartStatic
                                                                        datasetId={deployfileSelected.dataset.id}
                                                                        featureName={column.name}
                                                                        featureDatatype={column.datatype}/>

                                                            }
                                                        </Grid>
                                                    }
                                                </>

                                            ))

                                        }
                                    </Grid>

                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>

                </Grid>
            ))
        } else if (state.scenario.type === "scenario_monitoring")
            return (
                <Grid item xs={12} sx={{mt: "20px"}}>
                    <Accordion TransitionProps={{unmountOnExit: true}} square={true} disableGutters={true} elevation={0}
                               sx={{boxShadow: 'none', backgroundColor: 'transparent', padding: 0}}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon sx={{color: 'white'}}/>}
                            aria-controls="panel1a-content"
                            id="panel1a-header"
                            sx={{padding: 0, borderBottom: '1px solid white'}}
                        >
                            <Typography sx={{color: 'white', fontWeight: 'bold', fontSize: '25px'}}>Monitoring
                                script: {state.scenario.devices[0].deployfile_monitoring_script_selected.monitoring_script.name}</Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{padding: 0, mt: '40px'}}>
                            <Grid container spacing={3}>
                                <Grid item xs={2.5}>
                                    <Stack direction="row" spacing={0.1}
                                           sx={{borderBottom: '2px solid white', mb: '10px'}}>

                                        <FormControlLabel
                                            label="Select all"
                                            sx={{color: 'white'}}
                                            control={
                                                <Checkbox
                                                    sx={{
                                                        color: 'white',
                                                        '&.Mui-checked': {
                                                            color: 'white',
                                                        },
                                                        '&.MuiCheckbox-indeterminate': {
                                                            color: 'white',
                                                        }
                                                    }}
                                                    checked={state.checked.every(value => value === true)}
                                                    indeterminate={isIndeterminatedMonitoring()}
                                                    onChange={(e) => handleCheckedParentMonitoring(e)}

                                                />
                                            }
                                        />
                                        <ExpandMore
                                            expand={state.expanded}
                                            onClick={() => setState({...state, expanded: !state.expanded})}
                                            aria-label="show more"
                                        >
                                            <ExpandMoreIcon/>
                                        </ExpandMore>
                                    </Stack>
                                    <Collapse in={state.expanded} unmountOnExit>
                                        <Box sx={{display: 'flex', flexDirection: 'column', ml: 3, width: '100%'}}>
                                            {
                                                state.scenario.devices[0].deployfile_monitoring_script_selected.monitoring_script.columns.map((column, indexColumn) => (
                                                    <FormControlLabel
                                                        key={indexColumn}
                                                        sx={{color: 'white', lineBreak: 'anywhere'}}
                                                        label={`${column.name}`}
                                                        control={
                                                            <Checkbox sx={{
                                                                color: 'white',
                                                                '&.Mui-checked': {
                                                                    color: 'white !important',
                                                                },
                                                            }}
                                                                      checked={state.checked[indexColumn]}
                                                                      onChange={(e) => handleCheckedMonitoring(e, indexColumn)}
                                                            />
                                                        }
                                                    />
                                                ))
                                            }

                                        </Box>
                                    </Collapse>
                                </Grid>

                                <Grid item xs={9.5}>
                                    <Grid container spacing={2}>
                                        {
                                            state.scenario.devices[0].deployfile_monitoring_script_selected.monitoring_script.columns.map((column, indexColumn) => (

                                                <>
                                                    {
                                                        state.checked[indexColumn] &&


                                                        <Grid item key={indexColumn} xs={12} md={6} lg={6}>

                                                            {
                                                                state.scenario.status === 0
                                                                    ?
                                                                    <CardChartRealTime
                                                                        datasetId={state.scenario.devices[0].dataset_monitoring.id}
                                                                        featureName={column.name}
                                                                        featureDatatype={column.datatype}
                                                                        datasetType={"monitoring"}
                                                                    />
                                                                    :
                                                                    <CardChartStatic
                                                                        datasetId={state.scenario.devices[0].dataset_monitoring.id}
                                                                        featureName={column.name}
                                                                        featureDatatype={column.datatype}
                                                                        datasetType={"monitoring"}/>


                                                            }
                                                        </Grid>
                                                    }
                                                </>
                                            ))

                                        }


                                        {
                                            state.scenario.devices[0].classification_model !== null && state.scenario.status === 0 &&
                                            <Grid item xs={12}>
                                                <CardChartRealTimePrediction
                                                    datasetId={state.scenario.devices[0].dataset_prediction.id}
                                                    predictionType={"classification"}/>

                                            </Grid>

                                        }
                                        {
                                            state.scenario.devices[0].classification_model !== null && state.scenario.status === 1 &&
                                            <Grid item xs={12}>
                                                <CardChartStaticPrediction
                                                    datasetId={state.scenario.devices[0].dataset_prediction.id}
                                                    predictionType={"classification"}/>

                                            </Grid>

                                        }
                                        {
                                            state.scenario.devices[0].anomaly_detection_model !== null && state.scenario.status === 0 &&
                                            <Grid item xs={12}>
                                                <CardChartRealTimePrediction
                                                    datasetId={state.scenario.devices[0].dataset_prediction.id}
                                                    predictionType={"anomaly_detection"}/>

                                            </Grid>
                                        }
                                        {
                                            state.scenario.devices[0].anomaly_detection_model !== null && state.scenario.status === 1 &&
                                            <Grid item xs={12}>
                                                <CardChartStaticPrediction
                                                    datasetId={state.scenario.devices[0].dataset_prediction.id}
                                                    predictionType={"anomaly_detection"}/>

                                            </Grid>
                                        }
                                    </Grid>
                                </Grid>
                            </Grid>
                        </AccordionDetails>

                    </Accordion>
                </Grid>
            )


    }


    const getLogs = () => {

        return (
            <Grid item xs={12} sx={{mt: "30px"}}>
                <Accordion TransitionProps={{unmountOnExit: true}} square={true} disableGutters={true} elevation={0}
                           sx={{boxShadow: 'none', backgroundColor: 'transparent', padding: 0}}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon sx={{color: 'white'}}/>}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                        sx={{padding: 0, borderBottom: '1px solid white'}}
                    >
                        <Typography sx={{color: 'white', fontWeight: 'bold', fontSize: '25px'}}>Logs</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{padding: 0, mt: '40px'}}>
                        {
                            state.scenario.status === 0 ?
                                <LogsMonitoringRealTime deviceId={state.scenario.devices[0].id}/>
                                :
                                <LogsMonitoringStatic deviceId={state.scenario.devices[0].id}/>


                        }
                    </AccordionDetails>

                </Accordion>
            </Grid>
        )

    }

    return (
        <Grid container>
            {
                state.loading ?
                    <Grid container sx={{mt: '10px'}} justifyContent="center">
                        <CircularProgress sx={{fontSize: '4vh', color: 'white'}} size={40}/>
                    </Grid>
                    :
                    <Grid container>
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


                            </Grid>
                        </Grid>

                        <Grid item xs={12}>
                             <span style={{
                                 color: 'white',
                                 fontWeight: 'bold',
                                 fontSize: '18px'
                             }}>Device: {state.scenario.devices[0].id_mender}</span>

                            <hr/>
                        </Grid>
                        <Grid item xs={12}>
                            <Grid container>
                                {
                                    getMonitoringScripts()
                                }

                                {
                                    state.scenario.type === "scenario_monitoring" &&
                                    getLogs()
                                }

                            </Grid>

                        </Grid>


                    </Grid>
            }
        </Grid>
    )
}

export default ChartDevice