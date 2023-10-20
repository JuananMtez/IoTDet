import {Outlet, useLocation, useNavigate, useParams} from "react-router-dom";
import {Alert, Button, CircularProgress, Grid, Snackbar, Tooltip} from "@mui/material";
import {useEffect, useState} from "react";
import TabsStyled from "../components/Tabs/TabsStyled.jsx";
import TabStyled from "../components/Tabs/TabStyled.jsx";
import {
    applyFeatureExtraction,
    applyPreprocessing, downloadDatasetRecording, downloadDatasetTesting, downloadDatasetTraining,
    getDatasetById, removeProcessingsFailed
} from "../services/DatasetRequests.js";
import * as React from "react";
import Typography from "@mui/material/Typography";
import {DatasetStatusEnum, StatusScenarioEnum} from "../enums.js";


const getTab = () => {
    switch (location.pathname.split('/')[3]) {
        case 'info':
            return 0

        case 'processing':
            return 1
        case 'plots':
            return 2

        default:
            return 0
    }
}

const Dataset = () => {

    const {datasetId} = useParams()
    const [state, setState] = useState({
        tab: getTab(),
        dataset: null,
        openSnackbarPreprocessing: false,
        openSnackbarRemoveFailed: false,
        openSnackbarFeatureExtraction: false
    })


    const location = useLocation()
    const navigate = useNavigate()


    useEffect(() => {

        getDatasetById(datasetId)
            .then(response => {
                setState({
                    ...state,
                    dataset: response.data
                })
            })

        if (location.pathname.split('/')[3] === undefined)
            navigate('info')

    }, [datasetId])

    useEffect(() => {
        let interval = setInterval(() => {
            getDatasetById(datasetId)
                .then(response => {
                    setState(prevState => ({
                        ...prevState,
                        dataset: response.data
                    }))
                })
        }, 10000)


        return () => {
            clearInterval(interval)
        }
    }, [datasetId])


    const handleChange = (event, newValue) => {
        setState({
            ...state,
            tab: newValue
        });

        switch (newValue) {
            case 0:
                navigate('info')
                break

            case 1:
                navigate('processing')
                break
            case 2:
                navigate('plots')
                break


        }

    };

    const handleDownloadRecordingDataset = () => {


        downloadDatasetRecording(state.dataset.id)
            .then(response => {

                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', state.dataset.name);

                document.body.appendChild(link);
                link.click();

            })


    }
    const handleDownloadTrainingDataset = () => {


        downloadDatasetTraining(state.dataset.id)
            .then(response => {

                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `training_${state.dataset.name}`);

                document.body.appendChild(link);
                link.click();

            })


    }
    const handleDownloadTestingDataset = () => {


        downloadDatasetTesting(state.dataset.id)
            .then(response => {

                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `testing_${state.dataset.name}`);

                document.body.appendChild(link);
                link.click();

            })


    }

    const handleRemoveProcessingsFailed = (handleCleanLoading) => {

        removeProcessingsFailed(state.dataset.id)
            .then(response => {
                setState({
                    ...state,
                    dataset: response.data,
                    openSnackbarRemoveFailed: true
                })
                handleCleanLoading()
            })
    }

    const handlePreprocessDataset = (data) => {
        applyPreprocessing(datasetId, data)
            .then(response => {
                setState({
                    ...state,
                    dataset: response.data,
                    openSnackbarPreprocessing: true
                })
            })
    }

    const handleExtractFeatures = (data) => {

        applyFeatureExtraction(state.dataset.id, data)
            .then(response => {
                setState({
                    ...state,
                    dataset: response.data,
                    openSnackbarFeatureExtraction: true
                })
            })

    }


    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <TabsStyled
                    value={state.tab}

                    onChange={handleChange}
                    TabIndicatorProps={{
                        style: {
                            backgroundColor: "gray",
                            height: '3px'
                        }
                    }}
                >
                    <TabStyled label="Information"/>
                    {
                        state.dataset !== null && state.dataset.type !== "dataset_copy" &&
                        <Tooltip title={"Create a copy to apply processing to dataset"} placement="top" arrow>
                            <div>
                                <TabStyled
                                    disabled
                                    sx={{opacity:'1 !important'}}
                                    label="Processing"/>
                            </div>

                        </Tooltip>

                    }
                    {
                        state.dataset !== null && state.dataset.type !== "dataset_copy" &&
                        <Tooltip title={"Create a copy to apply processing to dataset"} placement="top" arrow>
                            <div>
                                <TabStyled
                                    disabled
                                    sx={{opacity:'1 !important'}}

                                    label="Plots"/>
                            </div>

                        </Tooltip>

                    }
                    {
                        state.dataset !== null && state.dataset.type === "dataset_copy" &&
                        <TabStyled

                            label="Processing"/>
                    }
                    {
                        state.dataset !== null && state.dataset.type === "dataset_copy" &&
                        <TabStyled

                            label="Plots"/>
                    }

                </TabsStyled>


                <hr style={{margin: 'auto'}}/>

            </Grid>


            {
                state.dataset === null
                    ?
                    <Grid container justifyContent="center"
                          alignItems="center">


                        <Grid item sx={{mt: '50px'}}>
                            <CircularProgress sx={{color: 'white'}}/>
                        </Grid>
                    </Grid>
                    :
                    <Grid item xs={12} sx={{mt: '20px'}}>
                        <Grid container>
                            <Grid item xs={4} lg={6}>
                                <span style={{
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '18px'
                                }}>Dataset: {state.dataset.name}</span>
                                <Typography sx={{mb: 1.5, color: 'white', fontStyle: 'italic'}}
                                            color="text.secondary">
                                    Status: {DatasetStatusEnum[state.dataset.status].value}
                                </Typography>
                            </Grid>
                            <Grid item xs={8} lg={6}>


                                {
                                    state.dataset.type === "dataset_copy"
                                        ?
                                        <Grid
                                            container
                                            direction="row"
                                            justifyContent="flex-end"
                                            alignItems="center"
                                            spacing={2}
                                        >
                                            <Grid item>
                                                <Button
                                                    size="small"
                                                    disabled={state.dataset.status === 2 || state.dataset.status === 4}
                                                    fullWidth
                                                    onClick={handleDownloadTrainingDataset}
                                                    color="secondary"
                                                    sx={{borderRadius: '28px', fontWeight: 'bold'}}
                                                    variant="contained"
                                                >
                                                    Download training dataset
                                                </Button>
                                            </Grid>
                                            <Grid item>
                                                <Button
                                                    size="small"
                                                    disabled={state.dataset.status === 2 || state.dataset.status === 4}
                                                    fullWidth
                                                    onClick={handleDownloadTestingDataset}
                                                    color="secondary"
                                                    sx={{borderRadius: '28px', fontWeight: 'bold'}}
                                                    variant="contained"
                                                >
                                                    Download testing dataset
                                                </Button>
                                            </Grid>
                                        </Grid>
                                        :
                                        <Grid
                                            container
                                            direction="row"
                                            justifyContent="flex-end"
                                            alignItems="center"
                                            spacing={2}
                                        >
                                            <Grid item>
                                                <Button
                                                    size="small"
                                                    disabled={state.dataset.status === 2 || state.dataset.status === 4}
                                                    fullWidth
                                                    onClick={handleDownloadRecordingDataset}
                                                    color="secondary"
                                                    sx={{borderRadius: '28px', fontWeight: 'bold'}}
                                                    variant="contained"
                                                >
                                                    Download dataset
                                                </Button>
                                            </Grid>
                                        </Grid>

                                }


                            </Grid>
                            <Grid item xs={12}>
                                <hr/>
                            </Grid>
                            <Grid item xs={12}>
                                <Outlet
                                    context={[state.dataset, handlePreprocessDataset, handleExtractFeatures, handleRemoveProcessingsFailed]}/>
                            </Grid>
                            <Grid item xs={12}>
                                <Snackbar anchorOrigin={{vertical: "bottom", horizontal: "right"}}
                                          open={state.openSnackbarPreprocessing}
                                          autoHideDuration={2000}
                                          onClose={() => setState({...state, openSnackbarPreprocessing: false})}>
                                    <Alert onClose={() => setState({...state, openSnackbarPreprocessing: false})}
                                           severity="success"
                                           sx={{width: '100%'}}>
                                        Preprocessing algorithms created successfully!
                                    </Alert>
                                </Snackbar>
                            </Grid>
                            <Grid item xs={12}>
                                <Snackbar anchorOrigin={{vertical: "bottom", horizontal: "right"}}
                                          open={state.openSnackbarRemoveFailed}
                                          autoHideDuration={2000}
                                          onClose={() => setState({...state, openSnackbarRemoveFailed: false})}>
                                    <Alert onClose={() => setState({...state, openSnackbarRemoveFailed: false})}
                                           severity="success"
                                           sx={{width: '100%'}}>
                                        Failed algorithms removed successfully!
                                    </Alert>
                                </Snackbar>
                            </Grid>
                            <Grid item xs={12}>
                                <Snackbar anchorOrigin={{vertical: "bottom", horizontal: "right"}}
                                          open={state.openSnackbarFeatureExtraction}
                                          autoHideDuration={2000}
                                          onClose={() => setState({...state, openSnackbarFeatureExtraction: false})}>
                                    <Alert onClose={() => setState({...state, openSnackbarFeatureExtraction: false})}
                                           severity="success"
                                           sx={{width: '100%'}}>
                                        Feature extraction algorithm created successfully!
                                    </Alert>
                                </Snackbar>
                            </Grid>

                        </Grid>
                    </Grid>


            }

        </Grid>
    )
}

export default Dataset