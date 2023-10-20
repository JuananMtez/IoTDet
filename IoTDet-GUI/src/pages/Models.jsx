import {
    Alert,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Snackbar,
    Stack
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import OpenInBrowserIcon from "@mui/icons-material/OpenInBrowser";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import React, {forwardRef, useEffect, useState} from "react";
import Table from "../components/Tables/Table.jsx";
import {deleteTraining, downloadTraining, getAllModels, modifyNameTraining} from "../services/ModelRequests.js";
import {useNavigate} from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import ReportIcon from "@mui/icons-material/Report";
import TextFieldStyled from "../components/TextFieldStyled/TextFieldStyled.jsx";
import LoadingButton from "@mui/lab/LoadingButton";
import Slide from "@mui/material/Slide";
import FullSizeDialog from "../components/Dialog/FullSizeDialog.jsx";

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});
const Models = () => {

    const [state, setState] = useState({
        loading: true,
        models: [],
        openSnackBarModify: false,
        trainingSelectedIndex: '',
        newNameTraining: "",
        loadingChangeName: false,
        showErrorModifyName: false,
        openDialog: false,
        openFullSizeDialog: false,
        openSnackbarError: false,
        textError: '',
    })
    const navigate = useNavigate()
    const user = JSON.parse((localStorage.getItem('user')))


    useEffect(() => {
        let interval = setInterval(() => {
            getAllModels()
                .then(response => {
                    setState(prevState => ({
                        ...prevState,
                        models: response.data
                    }))
                })
        }, 10000)


        return () => {
            clearInterval(interval)
        }
    }, [])

    useEffect(() => {
        getAllModels()
            .then(response => {
                setState(prevState => ({
                    ...prevState,
                    models: response.data,
                    loading: false
                }))
            })
    }, [])



    const handleClickModifyName = () => {
        setState({
            ...state,
            loadingChangeName: true
        })


        modifyNameTraining(state.models[state.trainingSelectedIndex].id, state.newNameTraining)
            .then(() => {
                let list = [...state.models]
                list[state.trainingSelectedIndex].name = state.newNameTraining
                setState({
                    ...state,
                    openSnackBarModify: true,
                    openDialog: false,
                    showErrorModifyName: false,
                    trainingSelectedIndex: "",
                    newNameTraining: "",
                    loadingChangeName: false,
                    models: list
                })
            })
    }

    const handleClickDownload = (index) => {
        downloadTraining(state.models[index].id)
            .then(response=> {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                let extension = state.models[index].method === "Machine learning" ? "joblib": "keras"

                link.setAttribute('download', `${state.models[index].name}.${extension}`);

                document.body.appendChild(link);
                link.click();
            })
    }

    const handleDeleteTraining = (index) => {
        let id = state.models[index].id
        deleteTraining(id)
            .then(() => {
                let list = state.models.filter(el => el.id !== id)
                setState({
                    ...state,
                    models: list
                })

            }).catch(() => {
                setState({
                    ...state,
                    openSnackbarError: true
                })

        })


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

                    <CircularProgress sx={{color: 'white'}}/> : 'Sorry, no models found'
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
                        width: "20%",
                    },
                }),
            }
        },
        {
            name: "dataset_name",
            label: "Dataset",
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
            name: "type",
            label: "Type",
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
            name: "status",
            label: "Status",
            options: {
                filter: true,
                sort: false,
                customBodyRenderLite: (dataIndex) => {
                    return state.models[dataIndex].status === "Error" ? (
                        <Stack direction="row" spacing={1} alignItems="center">
                            <span>Error</span>
                            <IconButton onClick={() => setState({...state, openFullSizeDialog: true, textError: state.models[dataIndex].log_error})}>
                                <ReportIcon/>
                            </IconButton>
                        </Stack>
                    ) : state.models[dataIndex].status
                },
                setCellProps: () => ({
                    style: {
                        width: "60%",
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
                        <IconButton onClick={() => navigate(`/model/${state.models[dataIndex].id}`)}>
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
                        <IconButton onClick={() => setState({...state, openDialog: true, trainingSelectedIndex: dataIndex, newNameTraining: "", })}>
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
                        <IconButton disabled={user.role === 3 || state.models[dataIndex].status === "Training" || state.models[dataIndex].status === "Error" || state.models[dataIndex].status === "In queue"} onClick={() => handleClickDownload(dataIndex)}>
                            <FileDownloadIcon sx={{fontSize: '5vh'}}/>
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
                            sx={{
                                color: 'white',
                                '&. Mui-disabled': {
                                    color: 'rgba(0, 0, 0, 0.26) !important'
                                }
                            }}
                            disabled={user.role === 3 || state.models[dataIndex].status === "Training" || state.models[dataIndex].status === "In queue"} onClick={() => handleDeleteTraining(dataIndex)}>
                            <DeleteIcon sx={{fontSize: '5vh'}}/>
                        </IconButton>
                    )
                }
            }
        },

    ]

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Table title={"Models"} columns={columns} data={state.models}
                       options={options}/>
            </Grid>
            <Grid item xs={12}>
                <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    disabled={user.role === 3}
                    onClick={() => {
                        navigate('create')
                    }}
                    sx={{
                        borderRadius: '28px',
                        fontWeight: 'bold'
                    }}>
                    Create models
                </Button>
            </Grid>
            <Grid item xs={12}>
                <Dialog open={state.openDialog}

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
                    <DialogTitle sx={{fontWeight: 'bold'}}>Modify name of the model</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextFieldStyled
                                    disabled
                                    id="name"
                                    label="Actual name"
                                    type="name"
                                    value={state.trainingSelectedIndex === "" ? "" : state.models[state.trainingSelectedIndex].name}
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
                                    value={state.newNameTraining}
                                    fullWidth
                                    variant="filled"

                                    onChange={(e) => {
                                        setState({...state, newNameTraining: e.target.value})
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
                            disabled={state.loadingChangeName}
                            onClick={() => setState({
                                ...state,
                                openDialog: false,
                                trainingSelectedIndex: "",
                                newNameTraining: '',
                                loadingChangeName: false

                            })}>Cancel</Button>

                        <LoadingButton
                            loading={state.loadingChangeName}
                            size="small"
                            color="success"
                            disabled={state.newNameTraining === ""}
                            onClick={handleClickModifyName}
                            sx={{
                                borderRadius: '28px',
                                fontWeight: 'bold'
                            }}
                            variant="contained"
                           >Modify</LoadingButton>
                    </DialogActions>
                </Dialog>
            </Grid>
            <Grid item xs={12}>
                <Snackbar anchorOrigin={{vertical: "bottom", horizontal: "right"}} open={state.openSnackBarModify}
                          autoHideDuration={1500} onClose={() => setState({...state, openSnackBarModify: false})}>
                    <Alert onClose={() => setState({...state, openSnackBarModify: false})} severity="success"
                           sx={{width: '100%'}}>
                        Model name modified successfully!
                    </Alert>
                </Snackbar>
            </Grid>
            <Grid item xs={12}>
                <Snackbar anchorOrigin={{vertical: "bottom", horizontal: "right"}} open={state.openSnackbarError}
                          autoHideDuration={1500} onClose={() => setState({...state, openSnackbarError: false})}>
                    <Alert onClose={() => setState({...state, openSnackbarError: false})} severity="error"
                           sx={{width: '100%'}}>
                        Model cannot be removed! Check if some device is using it in a deployment
                    </Alert>
                </Snackbar>
            </Grid>

            <Grid item xs={12}>
                <FullSizeDialog
                    open={state.openFullSizeDialog}
                    handleClose={() => setState({...state, openFullSizeDialog: false, textError: ''})}
                    title="Log"
                >
                    <div style={{marginLeft:'10px'}}>
                        <pre style={{whiteSpace:'pre-wrap'}}>{state.textError}</pre>
                    </div>

                </FullSizeDialog>
            </Grid>
        </Grid>
    )
}

export default Models