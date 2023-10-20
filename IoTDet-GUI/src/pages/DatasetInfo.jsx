import {
    Accordion, AccordionDetails, AccordionSummary,
    Alert,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Dialog, DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    InputAdornment, Snackbar
} from "@mui/material";
import {forwardRef, useEffect, useState} from "react";
import * as React from "react";
import {
    deleteDataset,
    getInfoDataset,
    modifyNameDataset
} from "../services/DatasetRequests.js";
import {useNavigate, useOutletContext} from "react-router-dom";
import TextFieldStyled from "../components/TextFieldStyled/TextFieldStyled.jsx";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import OpenInBrowserIcon from "@mui/icons-material/OpenInBrowser";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import Table from "../components/Tables/Table.jsx";
import LoadingButton from "@mui/lab/LoadingButton";
import Slide from "@mui/material/Slide";
import DeleteIcon from "@mui/icons-material/Delete";
import {DatasetStatusEnum} from "../enums.js";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";


const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});
const DatasetInfo = () => {

    const [state, setState] = useState({
        datasetInfo: null,
        openDialogModifyName: false,
        datasetCopyIndexSelected: '',
        showSuccessModifyName: false,
        showSuccessDeleteDataset: false,
        showSuccessCopyDataset: false,

        newNameSelected: '',
        showErrorModifyName: false,
        loadingModifyName: false

    })
    const [dataset] = useOutletContext()
    const navigate = useNavigate()

    useEffect(() => {
        getInfoDataset(dataset.id)
            .then(response => {
                setState({
                    ...state,
                    datasetInfo: response.data
                })
            })
    }, [])


    const handleDeleteDatasetCopy = (index) => {

        deleteDataset(state.datasetInfo.datasets_copy[index].id)
            .then(() => {
                const datasetInfoAux = state.datasetInfo
                datasetInfoAux.datasets_copy.splice(index, 1)

                setState({
                    ...state,
                    showSuccessDeleteDataset: true,
                    datasetInfo: datasetInfoAux
                })
            })
    }

    const handleModifyName = () => {
        setState({
            ...state,
            loadingModifyName: true,
        })

        modifyNameDataset(state.datasetInfo.datasets_copy[state.datasetCopyIndexSelected].id, state.newNameSelected + '.csv')
            .then(() => {


                let datasetInfo_aux = state.datasetInfo

                datasetInfo_aux.datasets_copy[state.datasetCopyIndexSelected].name = state.newNameSelected + '.csv'

                setState({
                    ...state,
                    openDialogModifyName: false,
                    datasetCopyIndexSelected: '',
                    showSuccessModifyName: true,
                    newNameSelected: '',
                    showErrorModifyName: false,
                    loadingModifyName: false,
                    datasetInfo: datasetInfo_aux

                })
            })
            .catch(() => {
                setState({
                    ...state,

                    newNameSelected: '',
                    showErrorModifyName: true,
                    loadingModifyName: false
                })
            })
    }

    const getSizeMainCardColumn = (list) => {
        switch (list.length) {
            case 0:
                return 0
            case 1:
                return 3
            case 2:
                return 6
            case 3:
                return 9
            case 4:
                return 12
            default:
                return 12
        }

    }

    const getSizeInnerCardColumn = (list) => {
        switch (list.length) {
            case 0:
                return 0
            case 1:
                return 12
            case 2:
                return 6
            case 3:
                return 4
            case 4:
                return 3
            default:
                return 3
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
        expandableRowsHeader: false,
        responsive: 'vertical',

        filter: true,
        filterType: "dropdown",
        selectableRowsHeader: false,
        textLabels: {
            body: {
                noMatch: state.loading ?
                    <CircularProgress sx={{color: 'white'}}/> : 'Sorry, no datasets found'
            }
        }, selectToolbarPlacement: 'none',

    };

    const columns = [
        {
            name: "name",
            label: "Name",
            options: {
                filter: false,
                sort: false
            }
        },
        {
            name: "status",
            label: "Status",
            options: {
                filter: true,
                sort: false,
                customBodyRenderLite: (dataIndex) => {
                    return state.datasetInfo.datasets_copy[dataIndex] === undefined ? "" : DatasetStatusEnum[state.datasetInfo.datasets_copy[dataIndex].status].value
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
                            onClick={() => navigate(`/dataset/${state.datasetInfo.datasets_copy[dataIndex].id}`)}>
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
                        <IconButton onClick={() => setState({
                            ...state,
                            openDialogModifyName: true,
                            datasetCopyIndexSelected: dataIndex
                        })}>
                            <AutoFixHighIcon sx={{fontSize: '5vh'}}/>
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
                        <IconButton onClick={() => handleDeleteDatasetCopy(dataIndex)}>
                            <DeleteIcon sx={{fontSize: '5vh'}}/>
                        </IconButton>
                    )
                }
            }
        },

    ]


    return (
        <Grid container spacing={2}>

            {
                state.datasetInfo === null
                    ?
                    <Grid container justifyContent="center"
                          alignItems="center">


                        <Grid item sx={{mt: '50px'}}>
                            <CircularProgress sx={{color: 'white'}}/>
                        </Grid>
                    </Grid>
                    :
                    <Grid item xs={12} sx={{mt: '0px'}}>
                        <Grid container spacing={2}>

                            <Grid item xs={12}>
                                <h3>General</h3>
                                <hr/>
                            </Grid>
                            <Grid item xs={12} md={12}>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <TextFieldStyled
                                            name="scenario"
                                            InputLabelProps={{shrink: true}}
                                            label="Scenario"
                                            value={state.datasetInfo.scenario_name}
                                            size="small"
                                            fullWidth
                                            InputProps={{
                                                readOnly: true
                                            }}
                                            variant="filled"
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextFieldStyled
                                            name="device"
                                            InputLabelProps={{shrink: true}}
                                            label="Device"
                                            value={state.datasetInfo.device_mender_id}
                                            size="small"
                                            fullWidth
                                            InputProps={{
                                                readOnly: true
                                            }}
                                            variant="filled"
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextFieldStyled
                                            name="monitoring_script"
                                            InputLabelProps={{shrink: true}}
                                            label="Monitoring Script"
                                            value={state.datasetInfo.monitoring_script_name}
                                            size="small"
                                            fullWidth
                                            InputProps={{
                                                readOnly: true
                                            }}
                                            variant="filled"
                                        />
                                    </Grid>
                                    {
                                        state.datasetInfo.type === "dataset_copy" &&
                                        <Grid item xs={6}>
                                            <TextFieldStyled
                                                name="dataset_parent_name"
                                                InputLabelProps={{shrink: true}}
                                                label="Dataset Parent Name"
                                                value={state.datasetInfo.dataset_parent_name}
                                                size="small"
                                                fullWidth
                                                InputProps={{
                                                    readOnly: true
                                                }}
                                                variant="filled"
                                            />
                                        </Grid>
                                    }
                                    <Grid item xs={12} sx={{mt: '15px'}}>

                                    </Grid>
                                    {
                                        state.datasetInfo.type === "dataset_copy" &&
                                        <Grid item xs={6}>
                                            <TextFieldStyled
                                                name="count"
                                                InputLabelProps={{shrink: true}}
                                                label="Training dataset: Amount of data"
                                                value={state.datasetInfo.count_training_dataset}
                                                size="small"
                                                fullWidth

                                                variant="filled"
                                                InputProps={{
                                                    readOnly: true,
                                                    endAdornment: (
                                                        <InputAdornment
                                                            position="end"
                                                            style={{color: 'white'}}>samples</InputAdornment>
                                                    )

                                                }}
                                            />
                                        </Grid>

                                    }
                                    {
                                        state.datasetInfo.type === "dataset_copy" &&
                                        <Grid item xs={6}>
                                            <TextFieldStyled
                                                name="count"
                                                InputLabelProps={{shrink: true}}
                                                label="Testing dataset: Amount of data"
                                                value={state.datasetInfo.count_testing_dataset}
                                                size="small"
                                                fullWidth

                                                variant="filled"
                                                InputProps={{
                                                    readOnly: true,
                                                    endAdornment: (
                                                        <InputAdornment
                                                            position="end"
                                                            style={{color: 'white'}}>samples</InputAdornment>
                                                    )

                                                }}
                                            />
                                        </Grid>

                                    }
                                    {
                                        state.datasetInfo.type === "dataset_copy" &&
                                        <Grid item xs={3}>
                                            <TextFieldStyled
                                                name="count"
                                                InputLabelProps={{shrink: true}}
                                                label="Train size"
                                                value={state.datasetInfo.train_size}
                                                size="small"
                                                fullWidth

                                                variant="filled"
                                                InputProps={{
                                                    readOnly: true,
                                                    endAdornment: (
                                                        <InputAdornment
                                                            position="end"
                                                            style={{color: 'white'}}>%</InputAdornment>
                                                    )

                                                }}
                                            />
                                        </Grid>

                                    }
                                    {
                                        state.datasetInfo.type === "dataset_copy" &&
                                        <Grid item xs={3}>
                                            <TextFieldStyled
                                                name="count"
                                                InputLabelProps={{shrink: true}}
                                                label="Seed"
                                                value={state.datasetInfo.seed}
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
                                        state.datasetInfo.type === "dataset_copy" &&
                                        <Grid item xs={3}>
                                            <TextFieldStyled
                                                name="count"
                                                InputLabelProps={{shrink: true}}
                                                label="Is shuffled?"
                                                value={state.datasetInfo.is_shuffled}
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
                                        state.datasetInfo.type === "dataset_copy" &&
                                        <Grid item xs={3}>
                                            <TextFieldStyled
                                                name="count"
                                                InputLabelProps={{shrink: true}}
                                                label="Used for?"
                                                value={state.datasetInfo.used_for}
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
                                        state.datasetInfo.type === "dataset_recording" &&
                                        <Grid item xs={3}>
                                            <TextFieldStyled
                                                name="count"
                                                InputLabelProps={{shrink: true}}
                                                label="Amount of data"
                                                value={state.datasetInfo.count}
                                                size="small"
                                                fullWidth

                                                variant="filled"
                                                InputProps={{
                                                    readOnly: true,
                                                    endAdornment: (
                                                        <InputAdornment
                                                            position="end"
                                                            style={{color: 'white'}}>samples</InputAdornment>
                                                    )

                                                }}
                                            />
                                        </Grid>

                                    }


                                </Grid>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Grid container spacing={2}>

                                </Grid>
                            </Grid>
                            {
                                state.datasetInfo.type === "dataset_recording" &&
                                <Grid item xs={12} sx={{mt: '20px'}}>
                                    <Accordion TransitionProps={{unmountOnExit: true}} square={true}
                                               disableGutters={true} elevation={0}
                                               sx={{boxShadow: 'none', backgroundColor: 'transparent', padding: 0}}>
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon sx={{color: 'white'}}/>}
                                            aria-controls="panel1a-content"
                                            id="panel1a-header"
                                            sx={{padding: 0, borderBottom: '1px solid white'}}
                                        >
                                            <Typography sx={{
                                                color: 'white',
                                                fontWeight: 'bold',
                                                fontSize: '25px'
                                            }}>Features</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails sx={{padding: 0, mt: '40px'}}>
                                            <Grid container spacing={2}>
                                                {
                                                    state.datasetInfo.features.map((feature, indexFeature) => (
                                                        <Grid key={indexFeature} item
                                                              xs={getSizeMainCardColumn(feature.values_grouped_by_malware)}>
                                                            <Card elevation={6} variant="elevation" sx={{
                                                                borderRadius: '28px',
                                                                backgroundColor: '#555555 !important',
                                                            }}>
                                                                <CardContent sx={{
                                                                    color: 'white',
                                                                    padding: '16px 12px 16px 12px'
                                                                }}>
                                                                    {
                                                                        feature.type === 'float'

                                                                            ?
                                                                            <Grid container spacing={2}>
                                                                                <Grid item xs={12}>
                                                                                    <span
                                                                                        style={{fontWeight: 'bold'}}>{feature.name}</span>
                                                                                    <hr/>
                                                                                </Grid>
                                                                                <Grid item xs={12}>
                                                                                    {
                                                                                        dataset.status !== 2 && dataset.status !== 4 ?
                                                                                            <Grid container spacing={2}>
                                                                                                {
                                                                                                    feature.values_grouped_by_malware.map((value, indexValue) => (
                                                                                                        <Grid item
                                                                                                              key={indexValue}
                                                                                                              xs={getSizeInnerCardColumn(feature.values_grouped_by_malware)}
                                                                                                        >
                                                                                                            <Grid
                                                                                                                style={{
                                                                                                                    backgroundColor: 'rgb(61 59 59 / 27%)',
                                                                                                                    borderRadius: '20px',
                                                                                                                    padding: 10
                                                                                                                }}
                                                                                                                container
                                                                                                                spacing={0}>
                                                                                                                <Grid
                                                                                                                    item
                                                                                                                    xs={12}>
                                                                                    <span
                                                                                        style={{fontWeight: 'bold'}}>{value.malware_name}</span>
                                                                                                                    <hr/>
                                                                                                                </Grid>

                                                                                                                <Grid
                                                                                                                    item
                                                                                                                    xs={12}>
                                                                                        <span style={{
                                                                                            display: 'inline-block',
                                                                                            width: '100%'
                                                                                        }}>
                                                                                        <span style={{
                                                                                            fontWeight: 'bold',
                                                                                            float: 'left',
                                                                                            whiteSpace: 'pre'
                                                                                        }}>    Range:</span>
                                                                                        <span style={{
                                                                                            float: 'right'
                                                                                        }}>[{value.data_min} - {value.data_max}]</span>

                                                                                        </span>
                                                                                                                </Grid>
                                                                                                                <Grid
                                                                                                                    item
                                                                                                                    xs={12}>
                                                                                        <span style={{
                                                                                            display: 'inline-block',
                                                                                            width: '100%'
                                                                                        }}>
                                                                                        <span style={{
                                                                                            fontWeight: 'bold',
                                                                                            float: 'left',
                                                                                            whiteSpace: 'pre'
                                                                                        }}>    Mean:</span>
                                                                                        <span style={{
                                                                                            float: 'right'
                                                                                        }}>{value.mean}</span>

                                                                                        </span>
                                                                                                                </Grid>
                                                                                                                <Grid
                                                                                                                    item
                                                                                                                    xs={12}>
                                                                                        <span style={{
                                                                                            display: 'inline-block',
                                                                                            width: '100%'
                                                                                        }}>
                                                                                        <span style={{
                                                                                            fontWeight: 'bold',
                                                                                            float: 'left',
                                                                                            whiteSpace: 'pre'
                                                                                        }}>    Std:</span>
                                                                                        <span style={{
                                                                                            float: 'right'
                                                                                        }}>{value.standard_deviation}</span>

                                                                                        </span>
                                                                                                                </Grid>
                                                                                                                <Grid
                                                                                                                    item
                                                                                                                    xs={12}>
                                                                                        <span style={{
                                                                                            display: 'inline-block',
                                                                                            width: '100%'
                                                                                        }}>
                                                                                        <span style={{
                                                                                            fontWeight: 'bold',
                                                                                            float: 'left',
                                                                                            whiteSpace: 'pre'
                                                                                        }}>    Percentile 25%:</span>
                                                                                        <span style={{
                                                                                            float: 'right'
                                                                                        }}>{value.percentile_25}</span>

                                                                                        </span>
                                                                                                                </Grid>
                                                                                                                <Grid
                                                                                                                    item
                                                                                                                    xs={12}>
                                                                                        <span style={{
                                                                                            display: 'inline-block',
                                                                                            width: '100%'
                                                                                        }}>
                                                                                        <span style={{
                                                                                            fontWeight: 'bold',
                                                                                            float: 'left',
                                                                                            whiteSpace: 'pre'
                                                                                        }}>    Percentile 50%:</span>
                                                                                        <span style={{
                                                                                            float: 'right'
                                                                                        }}>{value.percentile_50}</span>

                                                                                        </span>
                                                                                                                </Grid>
                                                                                                                <Grid
                                                                                                                    item
                                                                                                                    xs={12}>
                                                                                        <span style={{
                                                                                            display: 'inline-block',
                                                                                            width: '100%'
                                                                                        }}>
                                                                                        <span style={{
                                                                                            fontWeight: 'bold',
                                                                                            float: 'left',
                                                                                            whiteSpace: 'pre'
                                                                                        }}>    Percentile 75%:</span>
                                                                                        <span style={{
                                                                                            float: 'right'
                                                                                        }}>{value.percentile_75}</span>

                                                                                        </span>
                                                                                                                </Grid>


                                                                                                            </Grid>
                                                                                                        </Grid>
                                                                                                    ))
                                                                                                }
                                                                                            </Grid>
                                                                                            :
                                                                                            <Grid
                                                                                                justifyContent="center"
                                                                                                container>
                                                                                                <Grid item>
                                                                                                    <CircularProgress
                                                                                                        color="inherit"/>
                                                                                                </Grid>
                                                                                            </Grid>
                                                                                    }

                                                                                </Grid>
                                                                            </Grid>
                                                                            :
                                                                            <Grid container spacing={2}>
                                                                                <Grid item xs={12}>
                                                                                    <span
                                                                                        style={{fontWeight: 'bold'}}>{feature.name}</span>
                                                                                    <hr/>
                                                                                </Grid>
                                                                                <Grid item xs={12}>
                                                                                    <Grid container spacing={2}>
                                                                                        {
                                                                                            feature.values_grouped.map((valueGrouped, indexValueGrouped) => (
                                                                                                <Grid item
                                                                                                      key={indexValueGrouped}
                                                                                                      xs={12}>
                                                                                                    <Grid style={{
                                                                                                        backgroundColor: 'rgb(61 59 59 / 27%)',
                                                                                                        borderRadius: '20px',
                                                                                                        padding: 10
                                                                                                    }} container
                                                                                                          spacing={1}>
                                                                                                        <Grid item
                                                                                                              xs={12}>
                                                                                        <span
                                                                                            style={{fontWeight: 'bold'}}>{valueGrouped.malware_name}</span>
                                                                                                            <hr/>
                                                                                                        </Grid>
                                                                                                        {
                                                                                                            valueGrouped.values.map((value, indexValue) => (
                                                                                                                <Grid
                                                                                                                    item
                                                                                                                    key={indexValue}
                                                                                                                    xs={12}
                                                                                                                    sm={6}
                                                                                                                    md={4}
                                                                                                                    lg={3}>

                                                                                                                    <Grid
                                                                                                                        container
                                                                                                                        spacing={0}
                                                                                                                        style={{
                                                                                                                            backgroundColor: '#4844445e',
                                                                                                                            borderRadius: '20px',
                                                                                                                            padding: 10
                                                                                                                        }}>
                                                                                                                        <Grid
                                                                                                                            item
                                                                                                                            xs={12}>
                                                                                                        <span
                                                                                                            style={{fontWeight: 'bold'}}>{value.unique_value_name}</span>
                                                                                                                            <hr/>
                                                                                                                        </Grid>
                                                                                                                        <Grid
                                                                                                                            item
                                                                                                                            xs={12}>
                                                                                                         <span style={{
                                                                                                             display: 'inline-block',
                                                                                                             width: '100%'
                                                                                                         }}>
                                                                                                        <span style={{
                                                                                                            fontWeight: 'bold',
                                                                                                            float: 'left',
                                                                                                            whiteSpace: 'pre'
                                                                                                        }}>    Count:</span>
                                                                                                        <span style={{
                                                                                                            float: 'right'
                                                                                                        }}>{value.count}</span>

                                                                                                        </span>
                                                                                                                        </Grid>
                                                                                                                        <Grid
                                                                                                                            item
                                                                                                                            xs={12}>
                                                                                                         <span style={{
                                                                                                             display: 'inline-block',
                                                                                                             width: '100%'
                                                                                                         }}>
                                                                                                        <span style={{
                                                                                                            fontWeight: 'bold',
                                                                                                            float: 'left',
                                                                                                            whiteSpace: 'pre'
                                                                                                        }}>    Frequency:</span>
                                                                                                        <span style={{
                                                                                                            float: 'right'
                                                                                                        }}>{value.frequency}%</span>

                                                                                                        </span>
                                                                                                                        </Grid>

                                                                                                                    </Grid>
                                                                                                                </Grid>
                                                                                                            ))
                                                                                                        }
                                                                                                    </Grid>
                                                                                                </Grid>
                                                                                            ))
                                                                                        }
                                                                                    </Grid>
                                                                                </Grid>
                                                                            </Grid>
                                                                    }


                                                                </CardContent>
                                                            </Card>
                                                        </Grid>
                                                    ))

                                                }

                                            </Grid>
                                        </AccordionDetails>
                                    </Accordion>

                                </Grid>

                            }
                            {
                                state.datasetInfo.type === "dataset_recording" &&
                                <Grid item xs={12} sx={{mt: '20px'}}>
                                    <Accordion TransitionProps={{unmountOnExit: true}} square={true}
                                               disableGutters={true} elevation={0}
                                               sx={{boxShadow: 'none', backgroundColor: 'transparent', padding: 0}}>
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon sx={{color: 'white'}}/>}
                                            aria-controls="panel1a-content"
                                            id="panel1a-header"
                                            sx={{padding: 0, borderBottom: '1px solid white'}}
                                        >
                                            <Typography sx={{
                                                color: 'white',
                                                fontWeight: 'bold',
                                                fontSize: '25px'
                                            }}>Labels</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails sx={{padding: 0, mt: '40px'}}>
                                            <Grid container spacing={2}>
                                                {
                                                    state.datasetInfo.malware.map((malware, indexMalware) => (
                                                        <Grid key={indexMalware} item xs={12} sm={6} md={4} lg={3}>
                                                            <Card elevation={6} variant="elevation" sx={{
                                                                borderRadius: '28px',
                                                                backgroundColor: '#555555 !important',
                                                            }}>
                                                                <CardContent sx={{
                                                                    color: 'white',
                                                                    padding: '16px 12px 16px 12px'
                                                                }}>
                                                                    <Typography sx={{
                                                                        color: 'white',
                                                                        fontWeight: 'bold',

                                                                        mb: '10px'
                                                                    }}
                                                                                component="div">
                                                                        {malware.name}

                                                                    </Typography>
                                                                    <hr/>
                                                                    <Grid container spacing={0}>
                                                                        <Grid item xs={12}>
                                                                <span style={{display: 'inline-block', width: '100%'}}>
                                                                <span style={{
                                                                    fontWeight: 'bold',
                                                                    float: 'left'
                                                                }}>Count:</span>
                                                                <span style={{
                                                                    float: 'right'
                                                                }}>{malware.count}</span>
                                                                </span>
                                                                        </Grid>
                                                                        <Grid item xs={12}>
                                                                <span style={{display: 'inline-block', width: '100%'}}>
                                                                <span style={{
                                                                    fontWeight: 'bold',
                                                                    float: 'left'
                                                                }}>Frequency:</span>
                                                                <span style={{
                                                                    float: 'right'
                                                                }}>{malware.frequency}%</span>
                                                                </span>
                                                                        </Grid>
                                                                    </Grid>


                                                                </CardContent>
                                                            </Card>
                                                        </Grid>
                                                    ))
                                                }
                                            </Grid>
                                        </AccordionDetails>
                                    </Accordion>
                                </Grid>

                            }
                            {
                                state.datasetInfo.type === "dataset_copy" &&
                                <Grid item xs={12} sx={{mt: '20px'}}>
                                    <Accordion TransitionProps={{unmountOnExit: true}} square={true}
                                               disableGutters={true} elevation={0}
                                               sx={{boxShadow: 'none', backgroundColor: 'transparent', padding: 0}}>
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon sx={{color: 'white'}}/>}
                                            aria-controls="panel1a-content"
                                            id="panel1a-header"
                                            sx={{padding: 0, borderBottom: '1px solid white'}}
                                        >
                                            <Typography sx={{color: 'white', fontWeight: 'bold', fontSize: '25px'}}>Training
                                                dataset: Features</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails sx={{padding: 0, mt: '40px'}}>
                                            <Grid container spacing={2}>
                                                {
                                                    state.datasetInfo.features_training_dataset.map((feature, indexFeature) => (
                                                        <Grid key={indexFeature} item
                                                              xs={getSizeMainCardColumn(feature.values_grouped_by_malware)}>
                                                            <Card elevation={6} variant="elevation" sx={{
                                                                borderRadius: '28px',
                                                                backgroundColor: '#555555 !important',
                                                            }}>
                                                                <CardContent sx={{
                                                                    color: 'white',
                                                                    padding: '16px 12px 16px 12px'
                                                                }}>
                                                                    {
                                                                        feature.type === 'float'

                                                                            ?
                                                                            <Grid container spacing={2}>
                                                                                <Grid item xs={12}>
                                                                                    <span
                                                                                        style={{fontWeight: 'bold'}}>{feature.name}</span>
                                                                                    <hr/>
                                                                                </Grid>
                                                                                <Grid item xs={12}>
                                                                                    {
                                                                                        dataset.status !== 2 && dataset.status !== 4 ?
                                                                                            <Grid container spacing={2}>
                                                                                                {
                                                                                                    feature.values_grouped_by_malware.map((value, indexValue) => (
                                                                                                        <Grid item
                                                                                                              key={indexValue}

                                                                                                              xs={getSizeInnerCardColumn(feature.values_grouped_by_malware)}>
                                                                                                            <Grid
                                                                                                                style={{
                                                                                                                    backgroundColor: 'rgb(61 59 59 / 27%)',
                                                                                                                    borderRadius: '20px',
                                                                                                                    padding: 10
                                                                                                                }}
                                                                                                                container
                                                                                                                spacing={0}>
                                                                                                                <Grid
                                                                                                                    item
                                                                                                                    xs={12}>
                                                                                    <span
                                                                                        style={{fontWeight: 'bold'}}>{value.malware_name}</span>
                                                                                                                    <hr/>
                                                                                                                </Grid>

                                                                                                                <Grid
                                                                                                                    item
                                                                                                                    xs={12}>
                                                                                        <span style={{
                                                                                            display: 'inline-block',
                                                                                            width: '100%'
                                                                                        }}>
                                                                                        <span style={{
                                                                                            fontWeight: 'bold',
                                                                                            float: 'left',
                                                                                            whiteSpace: 'pre'
                                                                                        }}>    Range:</span>
                                                                                        <span style={{
                                                                                            float: 'right'
                                                                                        }}>[{value.data_min} - {value.data_max}]</span>

                                                                                        </span>
                                                                                                                </Grid>
                                                                                                                <Grid
                                                                                                                    item
                                                                                                                    xs={12}>
                                                                                        <span style={{
                                                                                            display: 'inline-block',
                                                                                            width: '100%'
                                                                                        }}>
                                                                                        <span style={{
                                                                                            fontWeight: 'bold',
                                                                                            float: 'left',
                                                                                            whiteSpace: 'pre'
                                                                                        }}>    Mean:</span>
                                                                                        <span style={{
                                                                                            float: 'right'
                                                                                        }}>{value.mean}</span>

                                                                                        </span>
                                                                                                                </Grid>
                                                                                                                <Grid
                                                                                                                    item
                                                                                                                    xs={12}>
                                                                                        <span style={{
                                                                                            display: 'inline-block',
                                                                                            width: '100%'
                                                                                        }}>
                                                                                        <span style={{
                                                                                            fontWeight: 'bold',
                                                                                            float: 'left',
                                                                                            whiteSpace: 'pre'
                                                                                        }}>    Std:</span>
                                                                                        <span style={{
                                                                                            float: 'right'
                                                                                        }}>{value.standard_deviation}</span>

                                                                                        </span>
                                                                                                                </Grid>
                                                                                                                <Grid
                                                                                                                    item
                                                                                                                    xs={12}>
                                                                                        <span style={{
                                                                                            display: 'inline-block',
                                                                                            width: '100%'
                                                                                        }}>
                                                                                        <span style={{
                                                                                            fontWeight: 'bold',
                                                                                            float: 'left',
                                                                                            whiteSpace: 'pre'
                                                                                        }}>    Percentile 25%:</span>
                                                                                        <span style={{
                                                                                            float: 'right'
                                                                                        }}>{value.percentile_25}</span>

                                                                                        </span>
                                                                                                                </Grid>
                                                                                                                <Grid
                                                                                                                    item
                                                                                                                    xs={12}>
                                                                                        <span style={{
                                                                                            display: 'inline-block',
                                                                                            width: '100%'
                                                                                        }}>
                                                                                        <span style={{
                                                                                            fontWeight: 'bold',
                                                                                            float: 'left',
                                                                                            whiteSpace: 'pre'
                                                                                        }}>    Percentile 50%:</span>
                                                                                        <span style={{
                                                                                            float: 'right'
                                                                                        }}>{value.percentile_50}</span>

                                                                                        </span>
                                                                                                                </Grid>
                                                                                                                <Grid
                                                                                                                    item
                                                                                                                    xs={12}>
                                                                                        <span style={{
                                                                                            display: 'inline-block',
                                                                                            width: '100%'
                                                                                        }}>
                                                                                        <span style={{
                                                                                            fontWeight: 'bold',
                                                                                            float: 'left',
                                                                                            whiteSpace: 'pre'
                                                                                        }}>    Percentile 75%:</span>
                                                                                        <span style={{
                                                                                            float: 'right'
                                                                                        }}>{value.percentile_75}</span>

                                                                                        </span>
                                                                                                                </Grid>


                                                                                                            </Grid>
                                                                                                        </Grid>
                                                                                                    ))
                                                                                                }
                                                                                            </Grid>
                                                                                            :
                                                                                            <Grid
                                                                                                justifyContent="center"
                                                                                                container>
                                                                                                <Grid item>
                                                                                                    <CircularProgress
                                                                                                        color="inherit"/>
                                                                                                </Grid>
                                                                                            </Grid>
                                                                                    }

                                                                                </Grid>
                                                                            </Grid>
                                                                            :
                                                                            <Grid container spacing={2}>
                                                                                <Grid item xs={12}>
                                                                                    <span
                                                                                        style={{fontWeight: 'bold'}}>{feature.name}</span>
                                                                                    <hr/>
                                                                                </Grid>
                                                                                <Grid item xs={12}>
                                                                                    <Grid container spacing={2}>
                                                                                        {
                                                                                            feature.values_grouped.map((valueGrouped, indexValueGrouped) => (
                                                                                                <Grid item
                                                                                                      key={indexValueGrouped}
                                                                                                      xs={12}>
                                                                                                    <Grid style={{
                                                                                                        backgroundColor: 'rgb(61 59 59 / 27%)',
                                                                                                        borderRadius: '20px',
                                                                                                        padding: 10
                                                                                                    }} container
                                                                                                          spacing={1}>
                                                                                                        <Grid item
                                                                                                              xs={12}>
                                                                                        <span
                                                                                            style={{fontWeight: 'bold'}}>{valueGrouped.malware_name}</span>
                                                                                                            <hr/>
                                                                                                        </Grid>
                                                                                                        {
                                                                                                            valueGrouped.values.map((value, indexValue) => (
                                                                                                                <Grid
                                                                                                                    item
                                                                                                                    key={indexValue}
                                                                                                                    xs={12}
                                                                                                                    sm={6}
                                                                                                                    md={4}
                                                                                                                    lg={3}>

                                                                                                                    <Grid
                                                                                                                        container
                                                                                                                        spacing={0}
                                                                                                                        style={{
                                                                                                                            backgroundColor: '#4844445e',
                                                                                                                            borderRadius: '20px',
                                                                                                                            padding: 10
                                                                                                                        }}>
                                                                                                                        <Grid
                                                                                                                            item
                                                                                                                            xs={12}>
                                                                                                        <span
                                                                                                            style={{fontWeight: 'bold'}}>{value.unique_value_name}</span>
                                                                                                                            <hr/>
                                                                                                                        </Grid>
                                                                                                                        <Grid
                                                                                                                            item
                                                                                                                            xs={12}>
                                                                                                         <span style={{
                                                                                                             display: 'inline-block',
                                                                                                             width: '100%'
                                                                                                         }}>
                                                                                                        <span style={{
                                                                                                            fontWeight: 'bold',
                                                                                                            float: 'left',
                                                                                                            whiteSpace: 'pre'
                                                                                                        }}>    Count:</span>
                                                                                                        <span style={{
                                                                                                            float: 'right'
                                                                                                        }}>{value.count}</span>

                                                                                                        </span>
                                                                                                                        </Grid>
                                                                                                                        <Grid
                                                                                                                            item
                                                                                                                            xs={12}>
                                                                                                         <span style={{
                                                                                                             display: 'inline-block',
                                                                                                             width: '100%'
                                                                                                         }}>
                                                                                                        <span style={{
                                                                                                            fontWeight: 'bold',
                                                                                                            float: 'left',
                                                                                                            whiteSpace: 'pre'
                                                                                                        }}>    Frequency:</span>
                                                                                                        <span style={{
                                                                                                            float: 'right'
                                                                                                        }}>{value.frequency}%</span>

                                                                                                        </span>
                                                                                                                        </Grid>

                                                                                                                    </Grid>
                                                                                                                </Grid>
                                                                                                            ))
                                                                                                        }
                                                                                                    </Grid>
                                                                                                </Grid>
                                                                                            ))
                                                                                        }
                                                                                    </Grid>
                                                                                </Grid>
                                                                            </Grid>
                                                                    }


                                                                </CardContent>
                                                            </Card>
                                                        </Grid>
                                                    ))

                                                }

                                            </Grid>
                                        </AccordionDetails>
                                    </Accordion>

                                </Grid>

                            }
                            {
                                state.datasetInfo.type === "dataset_copy" &&
                                <Grid item xs={12} sx={{mt: '20px'}}>
                                    <Accordion TransitionProps={{unmountOnExit: true}} square={true}
                                               disableGutters={true} elevation={0}
                                               sx={{boxShadow: 'none', backgroundColor: 'transparent', padding: 0}}>
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon sx={{color: 'white'}}/>}
                                            aria-controls="panel1a-content"
                                            id="panel1a-header"
                                            sx={{padding: 0, borderBottom: '1px solid white'}}
                                        >
                                            <Typography sx={{color: 'white', fontWeight: 'bold', fontSize: '25px'}}>Testing
                                                dataset: Features</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails sx={{padding: 0, mt: '40px'}}>
                                            <Grid container spacing={2}>
                                                {
                                                    state.datasetInfo.features_testing_dataset.map((feature, indexFeature) => (
                                                        <Grid key={indexFeature} item
                                                              xs={getSizeMainCardColumn(feature.values_grouped_by_malware)}>
                                                            <Card elevation={6} variant="elevation" sx={{
                                                                borderRadius: '28px',
                                                                backgroundColor: '#555555 !important',
                                                            }}>
                                                                <CardContent sx={{
                                                                    color: 'white',
                                                                    padding: '16px 12px 16px 12px'
                                                                }}>
                                                                    {
                                                                        feature.type === 'float'

                                                                            ?
                                                                            <Grid container spacing={2}>
                                                                                <Grid item xs={12}>
                                                                                    <span
                                                                                        style={{fontWeight: 'bold'}}>{feature.name}</span>
                                                                                    <hr/>
                                                                                </Grid>
                                                                                <Grid item xs={12}>
                                                                                    {
                                                                                        dataset.status !== 2 && dataset.status !== 4 ?
                                                                                            <Grid container spacing={2}>
                                                                                                {
                                                                                                    feature.values_grouped_by_malware.map((value, indexValue) => (
                                                                                                        <Grid item
                                                                                                              key={indexValue}
                                                                                                              xs={getSizeInnerCardColumn(feature.values_grouped_by_malware)}
                                                                                                        >
                                                                                                            <Grid
                                                                                                                style={{
                                                                                                                    backgroundColor: 'rgb(61 59 59 / 27%)',
                                                                                                                    borderRadius: '20px',
                                                                                                                    padding: 10
                                                                                                                }}
                                                                                                                container
                                                                                                                spacing={0}>
                                                                                                                <Grid
                                                                                                                    item
                                                                                                                    xs={12}>
                                                                                    <span
                                                                                        style={{fontWeight: 'bold'}}>{value.malware_name}</span>
                                                                                                                    <hr/>
                                                                                                                </Grid>

                                                                                                                <Grid
                                                                                                                    item
                                                                                                                    xs={12}>
                                                                                        <span style={{
                                                                                            display: 'inline-block',
                                                                                            width: '100%'
                                                                                        }}>
                                                                                        <span style={{
                                                                                            fontWeight: 'bold',
                                                                                            float: 'left',
                                                                                            whiteSpace: 'pre'
                                                                                        }}>    Range:</span>
                                                                                        <span style={{
                                                                                            float: 'right'
                                                                                        }}>[{value.data_min} - {value.data_max}]</span>

                                                                                        </span>
                                                                                                                </Grid>
                                                                                                                <Grid
                                                                                                                    item
                                                                                                                    xs={12}>
                                                                                        <span style={{
                                                                                            display: 'inline-block',
                                                                                            width: '100%'
                                                                                        }}>
                                                                                        <span style={{
                                                                                            fontWeight: 'bold',
                                                                                            float: 'left',
                                                                                            whiteSpace: 'pre'
                                                                                        }}>    Mean:</span>
                                                                                        <span style={{
                                                                                            float: 'right'
                                                                                        }}>{value.mean}</span>

                                                                                        </span>
                                                                                                                </Grid>
                                                                                                                <Grid
                                                                                                                    item
                                                                                                                    xs={12}>
                                                                                        <span style={{
                                                                                            display: 'inline-block',
                                                                                            width: '100%'
                                                                                        }}>
                                                                                        <span style={{
                                                                                            fontWeight: 'bold',
                                                                                            float: 'left',
                                                                                            whiteSpace: 'pre'
                                                                                        }}>    Std:</span>
                                                                                        <span style={{
                                                                                            float: 'right'
                                                                                        }}>{value.standard_deviation}</span>

                                                                                        </span>
                                                                                                                </Grid>
                                                                                                                <Grid
                                                                                                                    item
                                                                                                                    xs={12}>
                                                                                        <span style={{
                                                                                            display: 'inline-block',
                                                                                            width: '100%'
                                                                                        }}>
                                                                                        <span style={{
                                                                                            fontWeight: 'bold',
                                                                                            float: 'left',
                                                                                            whiteSpace: 'pre'
                                                                                        }}>    Percentile 25%:</span>
                                                                                        <span style={{
                                                                                            float: 'right'
                                                                                        }}>{value.percentile_25}</span>

                                                                                        </span>
                                                                                                                </Grid>
                                                                                                                <Grid
                                                                                                                    item
                                                                                                                    xs={12}>
                                                                                        <span style={{
                                                                                            display: 'inline-block',
                                                                                            width: '100%'
                                                                                        }}>
                                                                                        <span style={{
                                                                                            fontWeight: 'bold',
                                                                                            float: 'left',
                                                                                            whiteSpace: 'pre'
                                                                                        }}>    Percentile 50%:</span>
                                                                                        <span style={{
                                                                                            float: 'right'
                                                                                        }}>{value.percentile_50}</span>

                                                                                        </span>
                                                                                                                </Grid>
                                                                                                                <Grid
                                                                                                                    item
                                                                                                                    xs={12}>
                                                                                        <span style={{
                                                                                            display: 'inline-block',
                                                                                            width: '100%'
                                                                                        }}>
                                                                                        <span style={{
                                                                                            fontWeight: 'bold',
                                                                                            float: 'left',
                                                                                            whiteSpace: 'pre'
                                                                                        }}>    Percentile 75%:</span>
                                                                                        <span style={{
                                                                                            float: 'right'
                                                                                        }}>{value.percentile_75}</span>

                                                                                        </span>
                                                                                                                </Grid>


                                                                                                            </Grid>
                                                                                                        </Grid>
                                                                                                    ))
                                                                                                }
                                                                                            </Grid>
                                                                                            :
                                                                                            <Grid
                                                                                                justifyContent="center"
                                                                                                container>
                                                                                                <Grid item>
                                                                                                    <CircularProgress
                                                                                                        color="inherit"/>
                                                                                                </Grid>
                                                                                            </Grid>
                                                                                    }

                                                                                </Grid>
                                                                            </Grid>
                                                                            :
                                                                            <Grid container spacing={2}>
                                                                                <Grid item xs={12}>
                                                                                    <span
                                                                                        style={{fontWeight: 'bold'}}>{feature.name}</span>
                                                                                    <hr/>
                                                                                </Grid>
                                                                                <Grid item xs={12}>
                                                                                    <Grid container spacing={2}>
                                                                                        {
                                                                                            feature.values_grouped.map((valueGrouped, indexValueGrouped) => (
                                                                                                <Grid item
                                                                                                      key={indexValueGrouped}
                                                                                                      xs={12}>
                                                                                                    <Grid style={{
                                                                                                        backgroundColor: 'rgb(61 59 59 / 27%)',
                                                                                                        borderRadius: '20px',
                                                                                                        padding: 10
                                                                                                    }} container
                                                                                                          spacing={1}>
                                                                                                        <Grid item
                                                                                                              xs={12}>
                                                                                        <span
                                                                                            style={{fontWeight: 'bold'}}>{valueGrouped.malware_name}</span>
                                                                                                            <hr/>
                                                                                                        </Grid>
                                                                                                        {
                                                                                                            valueGrouped.values.map((value, indexValue) => (
                                                                                                                <Grid
                                                                                                                    item
                                                                                                                    key={indexValue}
                                                                                                                    xs={12}
                                                                                                                    sm={6}
                                                                                                                    md={4}
                                                                                                                    lg={3}>

                                                                                                                    <Grid
                                                                                                                        container
                                                                                                                        spacing={0}
                                                                                                                        style={{
                                                                                                                            backgroundColor: '#4844445e',
                                                                                                                            borderRadius: '20px',
                                                                                                                            padding: 10
                                                                                                                        }}>
                                                                                                                        <Grid
                                                                                                                            item
                                                                                                                            xs={12}>
                                                                                                        <span
                                                                                                            style={{fontWeight: 'bold'}}>{value.unique_value_name}</span>
                                                                                                                            <hr/>
                                                                                                                        </Grid>
                                                                                                                        <Grid
                                                                                                                            item
                                                                                                                            xs={12}>
                                                                                                         <span style={{
                                                                                                             display: 'inline-block',
                                                                                                             width: '100%'
                                                                                                         }}>
                                                                                                        <span style={{
                                                                                                            fontWeight: 'bold',
                                                                                                            float: 'left',
                                                                                                            whiteSpace: 'pre'
                                                                                                        }}>    Count:</span>
                                                                                                        <span style={{
                                                                                                            float: 'right'
                                                                                                        }}>{value.count}</span>

                                                                                                        </span>
                                                                                                                        </Grid>
                                                                                                                        <Grid
                                                                                                                            item
                                                                                                                            xs={12}>
                                                                                                         <span style={{
                                                                                                             display: 'inline-block',
                                                                                                             width: '100%'
                                                                                                         }}>
                                                                                                        <span style={{
                                                                                                            fontWeight: 'bold',
                                                                                                            float: 'left',
                                                                                                            whiteSpace: 'pre'
                                                                                                        }}>    Frequency:</span>
                                                                                                        <span style={{
                                                                                                            float: 'right'
                                                                                                        }}>{value.frequency}%</span>

                                                                                                        </span>
                                                                                                                        </Grid>

                                                                                                                    </Grid>
                                                                                                                </Grid>
                                                                                                            ))
                                                                                                        }
                                                                                                    </Grid>
                                                                                                </Grid>
                                                                                            ))
                                                                                        }
                                                                                    </Grid>
                                                                                </Grid>
                                                                            </Grid>
                                                                    }


                                                                </CardContent>
                                                            </Card>
                                                        </Grid>
                                                    ))

                                                }

                                            </Grid>
                                        </AccordionDetails>
                                    </Accordion>

                                </Grid>

                            }
                            {
                                state.datasetInfo.type === "dataset_copy" &&
                                <Grid item xs={12} sx={{mt: '20px'}}>
                                    <Accordion TransitionProps={{unmountOnExit: true}} square={true}
                                               disableGutters={true} elevation={0}
                                               sx={{boxShadow: 'none', backgroundColor: 'transparent', padding: 0}}>
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon sx={{color: 'white'}}/>}
                                            aria-controls="panel1a-content"
                                            id="panel1a-header"
                                            sx={{padding: 0, borderBottom: '1px solid white'}}
                                        >
                                            <Typography sx={{color: 'white', fontWeight: 'bold', fontSize: '25px'}}>Training
                                                dataset: Malware</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails sx={{padding: 0, mt: '40px'}}>
                                            <Grid container spacing={2}>
                                                {
                                                    state.datasetInfo.malware_training_dataset.map((malware, indexMalware) => (
                                                        <Grid key={indexMalware} item xs={12} sm={6} md={4} lg={3}>
                                                            <Card elevation={6} variant="elevation" sx={{
                                                                borderRadius: '28px',
                                                                backgroundColor: '#555555 !important',
                                                            }}>
                                                                <CardContent sx={{
                                                                    color: 'white',
                                                                    padding: '16px 12px 16px 12px'
                                                                }}>
                                                                    <Typography sx={{
                                                                        color: 'white',
                                                                        fontWeight: 'bold',

                                                                        mb: '10px'
                                                                    }}
                                                                                component="div">
                                                                        {malware.name}

                                                                    </Typography>
                                                                    <hr/>
                                                                    <Grid container spacing={0}>
                                                                        <Grid item xs={12}>
                                                                <span style={{display: 'inline-block', width: '100%'}}>
                                                                <span style={{
                                                                    fontWeight: 'bold',
                                                                    float: 'left'
                                                                }}>Count:</span>
                                                                <span style={{
                                                                    float: 'right'
                                                                }}>{malware.count}</span>
                                                                </span>
                                                                        </Grid>
                                                                        <Grid item xs={12}>
                                                                <span style={{display: 'inline-block', width: '100%'}}>
                                                                <span style={{
                                                                    fontWeight: 'bold',
                                                                    float: 'left'
                                                                }}>Frequency:</span>
                                                                <span style={{
                                                                    float: 'right'
                                                                }}>{malware.frequency}%</span>
                                                                </span>
                                                                        </Grid>
                                                                    </Grid>


                                                                </CardContent>
                                                            </Card>
                                                        </Grid>
                                                    ))
                                                }
                                            </Grid>
                                        </AccordionDetails>
                                    </Accordion>
                                </Grid>

                            }
                            {
                                state.datasetInfo.type === "dataset_copy" &&
                                <Grid item xs={12} sx={{mt: '20px'}}>
                                    <Accordion TransitionProps={{unmountOnExit: true}} square={true}
                                               disableGutters={true} elevation={0}
                                               sx={{boxShadow: 'none', backgroundColor: 'transparent', padding: 0}}>
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon sx={{color: 'white'}}/>}
                                            aria-controls="panel1a-content"
                                            id="panel1a-header"
                                            sx={{padding: 0, borderBottom: '1px solid white'}}
                                        >
                                            <Typography sx={{color: 'white', fontWeight: 'bold', fontSize: '25px'}}>Testing
                                                dataset: Malware</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails sx={{padding: 0, mt: '40px'}}>
                                            <Grid container spacing={2}>
                                                {
                                                    state.datasetInfo.malware_testing_dataset.map((malware, indexMalware) => (
                                                        <Grid key={indexMalware} item xs={12} sm={6} md={4} lg={3}>
                                                            <Card elevation={6} variant="elevation" sx={{
                                                                borderRadius: '28px',
                                                                backgroundColor: '#555555 !important',
                                                            }}>
                                                                <CardContent sx={{
                                                                    color: 'white',
                                                                    padding: '16px 12px 16px 12px'
                                                                }}>
                                                                    <Typography sx={{
                                                                        color: 'white',
                                                                        fontWeight: 'bold',

                                                                        mb: '10px'
                                                                    }}
                                                                                component="div">
                                                                        {malware.name}

                                                                    </Typography>
                                                                    <hr/>
                                                                    <Grid container spacing={0}>
                                                                        <Grid item xs={12}>
                                                                <span style={{display: 'inline-block', width: '100%'}}>
                                                                <span style={{
                                                                    fontWeight: 'bold',
                                                                    float: 'left'
                                                                }}>Count:</span>
                                                                <span style={{
                                                                    float: 'right'
                                                                }}>{malware.count}</span>
                                                                </span>
                                                                        </Grid>
                                                                        <Grid item xs={12}>
                                                                <span style={{display: 'inline-block', width: '100%'}}>
                                                                <span style={{
                                                                    fontWeight: 'bold',
                                                                    float: 'left'
                                                                }}>Frequency:</span>
                                                                <span style={{
                                                                    float: 'right'
                                                                }}>{malware.frequency}%</span>
                                                                </span>
                                                                        </Grid>
                                                                    </Grid>


                                                                </CardContent>
                                                            </Card>
                                                        </Grid>
                                                    ))
                                                }
                                            </Grid>
                                        </AccordionDetails>
                                    </Accordion>
                                </Grid>

                            }

                            {
                                state.datasetInfo.type === "dataset_recording" &&
                                <Grid item xs={12}>
                                    <Grid container spacing={2}>

                                        <Grid item xs={12} sx={{mt: '20px'}}>
                                            <h3>Datasets copied</h3>
                                            <hr/>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Table title={""} columns={columns} data={state.datasetInfo.datasets_copy}
                                                   options={options}/>
                                        </Grid>

                                    </Grid>
                                </Grid>
                            }

                        </Grid>
                    </Grid>
            }
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
                <DialogTitle sx={{fontWeight: 'bold'}}>Modify name of the dataset</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextFieldStyled
                                disabled
                                id="name"
                                label="Actual name"
                                type="name"
                                value={state.datasetCopyIndexSelected === "" ? "" : state.datasetInfo.datasets_copy[state.datasetCopyIndexSelected].name}
                                fullWidth
                                variant="filled"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextFieldStyled
                                autoFocus
                                id="name"
                                label="Name"
                                disabled={state.loadingModifyName}
                                type="name"
                                value={state.newNameSelected}
                                fullWidth
                                variant="filled"
                                InputProps={{

                                    endAdornment: (
                                        <InputAdornment
                                            position="end" style={{color: 'white'}}>.csv</InputAdornment>
                                    )

                                }}
                                onChange={(e) => {
                                    setState({...state, newNameSelected: e.target.value})
                                }}
                            />

                        </Grid>
                        {
                            state.showErrorModifyName &&
                            <Grid item xs={12}>
                                <span>The name is not available</span>

                            </Grid>
                        }

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
                            openDialogModifyName: false,
                            datasetCopyIndexSelected: "",
                            newNameSelected: '',
                            showErrorModifyName: false,
                            loadingModifyName: false

                        })}>Cancel</Button>

                    <LoadingButton
                        loading={state.loadingModifyName}
                        size="small"
                        color="success"
                        onClick={handleModifyName}
                        sx={{
                            borderRadius: '28px',
                            fontWeight: 'bold'
                        }}
                        variant="contained"
                    >Modify</LoadingButton>
                </DialogActions>
            </Dialog>
            <Grid item xs={12}>
                <Snackbar anchorOrigin={{vertical: "bottom", horizontal: "right"}} open={state.showSuccessModifyName}
                          autoHideDuration={1500} onClose={() => setState({...state, showSuccessModifyName: false})}>
                    <Alert onClose={() => setState({...state, showSuccessModifyName: false})} severity="success"
                           sx={{width: '100%'}}>
                        Dataset name modified successfully!
                    </Alert>
                </Snackbar>
            </Grid>
            <Grid item xs={12}>
                <Snackbar anchorOrigin={{vertical: "bottom", horizontal: "right"}} open={state.showSuccessDeleteDataset}
                          autoHideDuration={1500} onClose={() => setState({...state, showSuccessDeleteDataset: false})}>
                    <Alert onClose={() => setState({...state, showSuccessDeleteDataset: false})} severity="success"
                           sx={{width: '100%'}}>
                        Dataset deleted successfully!
                    </Alert>
                </Snackbar>
            </Grid>


        </Grid>
    )
}

export default DatasetInfo