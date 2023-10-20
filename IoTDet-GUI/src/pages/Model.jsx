import {useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {Button, CircularProgress, Grid} from "@mui/material";
import * as React from "react";
import {downloadTraining, evaluateModel, getModelById} from "../services/ModelRequests.js";
import Typography from "@mui/material/Typography";
import TextFieldStyled from "../components/TextFieldStyled/TextFieldStyled.jsx";

import Table from "../components/Tables/Table.jsx";
import {getAllDatasetRecordingFinished} from "../services/DatasetRequests.js";
import IconButton from "@mui/material/IconButton";
import AnalyticsIcon from '@mui/icons-material/Analytics';

const Model = () => {

    const [state, setState] = useState({model: null, datesets:[], loadingDatasets: [], imgs:[]})
    const {datasetId} = useParams()

    useEffect(() => {
        getModelById(datasetId)
            .then(response => {
                getAllDatasetRecordingFinished()
                    .then(response2 => {
                        let list = response2.data.filter(el => el.monitoring_script_name === response.data.monitoring_script_name)


                        setState({

                            ...state,
                            model: response.data,
                            datasets: list,
                            loadingDatasets: new Array(list.length).fill(false)
                        })

                    })




            })
    }, [])

    const handleClickDownload = () => {
        downloadTraining(state.model.id)
            .then(response => {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                let extension = state.model.method === "Machine learning" ? "joblib" : "keras"

                link.setAttribute('download', `${state.model.name}.${extension}`);

                document.body.appendChild(link);
                link.click();
            })
    }

    const handleClickEvaluate = (datasetIndex) => {

        let list = state.loadingDatasets
        list[datasetIndex] = true
        setState({
            ...state,
            loadingDatasets: list
        })


        evaluateModel(state.model.id, state.datasets[datasetIndex].id)
            .then(response => {

                list[datasetIndex] = false
                let listImgs = state.imgs
                listImgs.push(response.data)

                setState({
                    ...state,
                    imgs: listImgs,
                    loadingDatasets: list

                })
            })



    }

    const columns = [
        {
            name: "name",
            label: "Name",
            options: {
                filter: false,
                sort: false,
                setCellProps: () => ({
                    style: {
                        width: "20%",
                    },
                }),
            }
        },
        {
            name: "scenario_name",
            label: "Scenario",
            options: {
                filter: true,
                sort: false,
                setCellProps: () => ({
                    style: {
                        width: "20%",
                    },
                }),
            }
        },
        {
            name: "device_mender_id",
            label: "Device",
            options: {
                filter: true,
                sort: false,
                setCellProps: () => ({
                    style: {
                        width: "30%",
                    },
                }),

            }
        },
        {
            name: "monitoring_script_name",
            label: "Monitoring Script",
            options: {
                filter: true,
                sort: false,
                setCellProps: () => ({
                    style: {
                        width: "20%",
                    },
                }),

            }
        },
        {
          name: "",
          label:"",
          options: {
              filter: false,
              sort: false,
              customBodyRenderLite: (dataIndex) => {

                  if (state.loadingDatasets[dataIndex])
                      return (
                          <CircularProgress color="inherit"/>
                      )
                  else

                      return (

                          <IconButton onClick={() => handleClickEvaluate(dataIndex)}>
                              <AnalyticsIcon sx={{fontSize: '5vh'}}/>
                          </IconButton>
                      )
              },
              setCellProps: () => ({
                  style: {
                      width: "20%",
                  },
              }),
          }
        }

    ]

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
        expandableRows: false,
        filterType: "dropdown",
        selectableRowsHeader: false,
        textLabels: {
            body: {
                noMatch: state.loading ?
                    <CircularProgress sx={{color: 'white'}}/> : 'Sorry, no datasets found'
            }
        }, selectToolbarPlacement: 'none',

    };

    return (
        <Grid container spacing={2}>
            {
                state.model === null
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
                            <Grid item xs={9}>
                                <span style={{
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '18px'
                                }}>Model: {state.model.name}</span>
                                <Typography sx={{color: 'white', fontStyle: 'italic'}}
                                            color="text.secondary">
                                    Status: <span style={{
                                    color: state.model.status === "Error" ? '#C63637' : 'inherit',
                                    fontWeight: 'bold'
                                }}>{state.model.status}</span>
                                </Typography>
                            </Grid>
                            <Grid item xs={3}>
                                <Grid
                                    container
                                    direction="row"
                                    justifyContent="flex-end"
                                    alignItems="center"
                                >


                                    <Grid item>
                                        <Button
                                            size="small"
                                            disabled={state.model.status === "Training" || state.model.status === "Error" || state.model.status === "In queue"}
                                            fullWidth
                                            onClick={handleClickDownload}
                                            color="secondary"
                                            sx={{borderRadius: '28px', fontWeight: 'bold'}}
                                            variant="contained"
                                        >
                                            Download model
                                        </Button>
                                    </Grid>


                                </Grid>

                            </Grid>
                            <Grid item xs={12}>
                                <hr/>
                            </Grid>
                            <Grid item xs={12}>
                                <h3>General</h3>
                                <hr/>
                            </Grid>
                            <Grid item xs={12} sx={{mt: '20px'}}>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <TextFieldStyled
                                            name="dataset"
                                            InputLabelProps={{shrink: true}}
                                            label="Dataset"
                                            value={state.model.dataset_name}
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
                                            name="device_id"
                                            InputLabelProps={{shrink: true}}
                                            label="Device"
                                            value={state.model.device_mender_id}
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
                                            name="type"
                                            InputLabelProps={{shrink: true}}
                                            label="Type"
                                            value={state.model.type}
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
                                            name="method"
                                            InputLabelProps={{shrink: true}}
                                            label="Method"
                                            value={state.model.method}
                                            size="small"
                                            fullWidth
                                            InputProps={{
                                                readOnly: true
                                            }}
                                            variant="filled"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextFieldStyled
                                            name="algorithm_description"
                                            InputLabelProps={{shrink: true}}
                                            label="Description"
                                            value={state.model.algorithm_description}
                                            size="small"
                                            fullWidth
                                            multiline
                                            InputProps={{
                                                readOnly: true
                                            }}
                                            variant="filled"
                                        />
                                    </Grid>
                                    {
                                        state.model.status === "Error" &&
                                        <Grid item xs={12}>
                                            <TextFieldStyled
                                                name="error"
                                                InputLabelProps={{shrink: true}}
                                                label="Error"
                                                value={state.model.log_error}
                                                size="small"
                                                error
                                                fullWidth
                                                multiline
                                                InputProps={{
                                                    readOnly: true
                                                }}
                                                variant="filled"
                                            />
                                        </Grid>
                                    }
                                    {
                                        state.model.status === "Trained" &&
                                        <Grid item xs={12} sx={{mt: '10px'}}>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12}>
                                                    <h3>Validation</h3>
                                                    <hr/>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    }
                                    {
                                        state.model.status === "Trained" && state.model.type === "Classifier" && state.model.method === "Machine learning" &&
                                        <Grid item xs={12}>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12}>
                                                    <pre
                                                        style={{backgroundColor:'rgba(0, 0, 0, 0.06)', borderBottom:'1px solid white', color:'white', fontSize:'14px'}}

                                                    >{state.model.output_validation}</pre>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <img style={{
                                                        maxWidth: '100%',
                                                        height: 'auto',
                                                        width:'100%',
                                                        borderRadius:'28px'
                                                    }} src={`data:image/jpeg;base64,${state.model.confusion_matrix_img}`} alt=""/>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    }
                                    {
                                        state.model.status === "Trained" && state.model.method === "Deep learning" &&
                                        <Grid item xs={12}>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12}>
                                                    <pre
                                                        style={{backgroundColor:'rgba(0, 0, 0, 0.06)', borderBottom:'1px solid white', color:'white', fontSize:'14px'}}

                                                    >{state.model.output_validation}</pre>
                                                </Grid>

                                                <Grid item xs={6}>
                                                    <img style={{
                                                        maxWidth: '100%',
                                                        width:'100%',
                                                        height: 'auto',
                                                        borderRadius:'28px'
                                                    }} src={`data:image/jpeg;base64,${state.model.accuracy_path}`} alt=""/>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <img style={{
                                                        maxWidth: '100%',
                                                        width:'100%',

                                                        height: 'auto',
                                                        borderRadius:'28px'
                                                    }} src={`data:image/jpeg;base64,${state.model.loss_path}`} alt=""/>
                                                </Grid>
                                                <Grid item xs={6}>

                                                    <img style={{
                                                        maxWidth: '100%',
                                                        height: 'auto',
                                                        width:'100%',
                                                        borderRadius:'28px'
                                                    }} src={`data:image/jpeg;base64,${state.model.confusion_matrix_img}`} alt=""/>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    }
                                    {
                                        state.model.status === "Trained" && state.model.type === "Anomaly detection" && state.model.method === "Machine learning" &&
                                        <Grid item xs={12}>
                                            <Grid container>
                                                <Grid item xs={6}>
                                                    <img style={{
                                                        maxWidth: '100%',
                                                        height: 'auto',
                                                        width:'100%',
                                                        borderRadius:'28px'
                                                    }} src={`data:image/jpeg;base64,${state.model.confusion_matrix_img}`} alt=""/>
                                                </Grid>
                                            </Grid>

                                        </Grid>
                                    }
                                    <Grid item xs={12}>
                                        <h3>Evaluate with other datasets</h3>
                                        <hr/>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Table title={"Datasets"} columns={columns} data={state.datasets}
                                               options={options}/>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Grid container spacing={2}>
                                            {
                                                state.imgs.map((img, index) => (

                                                    <Grid key={index} item xs={6}>

                                                        <img style={{
                                                            maxWidth: '100%',
                                                            width: '100%',
                                                            height: 'auto',
                                                            borderRadius: '28px'
                                                        }} src={`data:image/jpeg;base64,${img}`} alt=""/>
                                                    </Grid>

                                                ))
                                            }
                                        </Grid>
                                    </Grid>


                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
            }

        </Grid>
    )

}

export default Model