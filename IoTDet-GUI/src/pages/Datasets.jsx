import React, {forwardRef, useEffect, useState} from "react";
import {
    Alert, Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle, FormControl,
    Grid, InputAdornment, InputLabel, MenuItem, Select,
    Snackbar
} from "@mui/material";
import Table from "../components/Tables/Table.jsx";
import InnerTableDatasets from "../components/Tables/InnerTableDatasets.jsx";
import {
    createCopyDataset,
    deleteDataset,
    downloadDatasetRecording,
    getAllDatasetRecordingFinished, modifyNameDataset
} from "../services/DatasetRequests.js";
import IconButton from "@mui/material/IconButton";
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import OpenInBrowserIcon from '@mui/icons-material/OpenInBrowser';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import TextFieldStyled from "../components/TextFieldStyled/TextFieldStyled.jsx";
import LoadingButton from "@mui/lab/LoadingButton";
import Slide from "@mui/material/Slide";
import {useNavigate} from "react-router-dom";


const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});
const Datasets = () => {


    const [state, setState] = useState({
        datasets: [],
        loading: true,
        rowsExpanded: [],
        openSnackBarCopy: false,
        openSnackBarDelete: false,
        openSnackBarModify: false,
        datasetsChecked: [],
        openDialog: false,
        datasetSelectedIndex: "",
        newNameDataset: '',
        loadingChangeName: false,
        showErrorModifyName: false,
        openDialogCreateCopy: false,
        loadingCreateCopy: false,
        trainSize: '',
        shuffle: '',
        used_for: '',
        seed: '',
        showErrorRemove: false
    })

    const navigate = useNavigate()

    const handleDownloadDataset = (datasetIndex) => {

        downloadDatasetRecording(state.datasets[datasetIndex].id)
            .then(response => {

                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', state.datasets[datasetIndex].name);

                document.body.appendChild(link);
                link.click();


            })


    }

    const handleModifyName = () => {
        setState({
            ...state,
            loadingChangeName: true
        })
        modifyNameDataset(state.datasets[state.datasetSelectedIndex].id, state.newNameDataset + '.csv')
            .then(() => {
                let listDatasets = [...state.datasets]
                listDatasets[state.datasetSelectedIndex].name = state.newNameDataset + '.csv'
                setState({
                    ...state,
                    datasets: listDatasets,
                    openDialog: false,
                    datasetSelectedIndex: "",
                    newNameDataset: '',
                    loadingChangeName: false,
                    openSnackBarModify: true
                })
            })
            .catch(() => {
                setState({
                    ...state,
                    newNameDataset: '',
                    loadingChangeName: false,
                    showErrorModifyName: true

                })
            })
    }

    const handleDeleteDatasetCopied = (datasetParentIndex, datasetCopied) => {

        deleteDataset(datasetCopied.id)
            .then(() => {

                let allDatasetsChecked = [...state.datasetsChecked]

                let i = 0
                let found = false
                while (i < state.datasets[datasetParentIndex].datasets_copy.length && !found) {
                    if (state.datasets[datasetParentIndex].datasets_copy[i].id === datasetCopied.id)
                        found = true
                    else
                        i++
                }

                if (found) {
                    allDatasetsChecked[datasetParentIndex].splice(i, 1)
                }


                const list_datasets = [...state.datasets]
                const list_copies = [...list_datasets[datasetParentIndex].datasets_copy].filter(el => el.id !== datasetCopied.id)
                list_datasets[datasetParentIndex].datasets_copy = [...list_copies]
                setState({
                    ...state,
                    datasets: list_datasets,
                    openSnackBarDelete: true,
                    datasetsChecked: allDatasetsChecked
                })


            })
            .catch(() => {
                setState({
                    ...state,
                    showErrorRemove: true
                })
            })
    }

    const handleCopyDataset = () => {
        setState({
            ...state,
            loadingCreateCopy: true
        })

        const data = {}
        data.train_size = state.trainSize
        data.shuffle = state.shuffle === "yes"
        data.used_for = state.used_for
        data.seed = state.seed === "" ? null : state.seed


        createCopyDataset(state.datasets[state.datasetSelectedIndex].id, data)
            .then(response => {
                setState(prevState => {
                    const list_datasets = [...prevState.datasets]
                    const list_copies = [...list_datasets[state.datasetSelectedIndex].datasets_copy]
                    list_copies.push(response.data)
                    list_datasets[state.datasetSelectedIndex].datasets_copy = [...list_copies]


                    return {
                        ...prevState,
                        datasets: list_datasets,
                        openSnackBarCopy: true,
                        openDialogCreateCopy: false,
                        datasetSelectedIndex: "",
                        shuffle: "",
                        trainSize: "",
                        used_for: "",
                        seed: "",
                        loadingCreateCopy: false

                    }
                })
            })
    }


    const handleCheckRow = (datasetParentIndex, datasetSelected) => {

        let allDatasetsChecked = [...state.datasetsChecked]

        for (let i = 0; i < allDatasetsChecked[datasetParentIndex].length; i++) {
            if (state.datasets[datasetParentIndex].datasets_copy[i].id === datasetSelected.id) {
                allDatasetsChecked[datasetParentIndex][i] = !allDatasetsChecked[datasetParentIndex][i]
                break
            }

        }

        setState({
            ...state,
            datasetsChecked: allDatasetsChecked
        })


    }

    useEffect(() => {
        getAllDatasetRecordingFinished()
            .then(response => {
                let listDatasetChecked = []
                for (let i = 0; i < response.data.length; i++) {
                    let listDatasetCopyChecked = []
                    for (let j = 0; j < response.data[i].datasets_copy.length; j++) {
                        listDatasetCopyChecked.push(false)
                    }
                    listDatasetChecked.push(listDatasetCopyChecked)
                }

                setState({
                    ...state,
                    datasets: response.data,
                    loading: false,
                    datasetsChecked: listDatasetChecked
                })
            })
    }, [])


    const options = {
        search: true,
        download: false,
        rowsPerPageOptions: [5, 10, 30, 50, 100],
        print: false,
        tableBodyHeight: '100%',
        selectableRows: 'none',
        viewColumns: false,
        onRowExpansionChange: (currentRowsExpanded, allRowsExpanded) => {

            setState({
                ...state,
                rowsExpanded: allRowsExpanded.map(row => row.dataIndex)
            })
        },
        expandableRowsHeader: false,
        responsive: 'vertical',

        filter: true,
        expandableRows: true,
        renderExpandableRow: (rowData, rowMeta) => {
            return (
                <InnerTableDatasets parentIndex={rowMeta.rowIndex}
                                    handleCheckRow={handleCheckRow} handleDelete={handleDeleteDatasetCopied}
                                    rows={state.datasets[rowMeta.rowIndex].datasets_copy}/>
            )
        },
        rowsExpanded: state.rowsExpanded,
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
                        width: "20%",
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
            label: "",
            options: {
                filter: false,
                sort: false,
                customBodyRenderLite: (dataIndex) => {
                    return (
                        <IconButton onClick={() => navigate(`/dataset/${state.datasets[dataIndex].id}`)}>
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
                            datasetSelectedIndex: dataIndex,
                            openDialogCreateCopy: true
                        })}>
                            <FileCopyIcon sx={{fontSize: '5vh'}}/>
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
                            onClick={() => setState({...state, openDialog: true, datasetSelectedIndex: dataIndex})}>
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
                        <IconButton onClick={() => handleDownloadDataset(dataIndex)}>
                            <FileDownloadIcon sx={{fontSize: '5vh'}}/>
                        </IconButton>
                    )
                }
            }
        },

    ]


    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Table title={"Datasets"} columns={columns} data={state.datasets}
                       options={options}/>
            </Grid>
            <Grid item xs={12}>
                <Snackbar anchorOrigin={{vertical: "bottom", horizontal: "right"}} open={state.openSnackBarCopy}
                          autoHideDuration={1500} onClose={() => setState({...state, openSnackBarCopy: false})}>
                    <Alert onClose={() => setState({...state, openSnackBarCopy: false})} severity="success"
                           sx={{width: '100%'}}>
                        Dataset copied successfully!
                    </Alert>
                </Snackbar>
            </Grid>
            <Grid item xs={12}>
                <Snackbar anchorOrigin={{vertical: "bottom", horizontal: "right"}} open={state.openSnackBarDelete}
                          autoHideDuration={1500} onClose={() => setState({...state, openSnackBarDelete: false})}>
                    <Alert onClose={() => setState({...state, openSnackBarDelete: false})} severity="success"
                           sx={{width: '100%'}}>
                        Dataset deleted successfully!
                    </Alert>
                </Snackbar>
            </Grid>
            <Grid item xs={12}>
                <Snackbar anchorOrigin={{vertical: "bottom", horizontal: "right"}} open={state.openSnackBarModify}
                          autoHideDuration={1500} onClose={() => setState({...state, openSnackBarModify: false})}>
                    <Alert onClose={() => setState({...state, openSnackBarModify: false})} severity="success"
                           sx={{width: '100%'}}>
                        Dataset name modified successfully!
                    </Alert>
                </Snackbar>
            </Grid>
            <Grid item xs={12}>
                <Snackbar anchorOrigin={{vertical: "bottom", horizontal: "right"}} open={state.showErrorRemove}
                          autoHideDuration={3000} onClose={() => setState({...state, showErrorRemove: false})}>
                    <Alert onClose={() => setState({...state, showErrorRemove: false})} severity="error"
                           sx={{width: '100%'}}>
                        Could not be deleted, please check that there is no associated model.
                    </Alert>
                </Snackbar>
            </Grid>
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
                <DialogTitle sx={{fontWeight: 'bold'}}>Modify name of the dataset</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextFieldStyled
                                disabled
                                id="name"
                                label="Actual name"
                                type="name"
                                value={state.datasetSelectedIndex === "" ? "" : state.datasets[state.datasetSelectedIndex].name}
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
                                value={state.newNameDataset}
                                fullWidth
                                variant="filled"
                                InputProps={{

                                    endAdornment: (
                                        <InputAdornment
                                            position="end" style={{color: 'white'}}>.csv</InputAdornment>
                                    )

                                }}
                                onChange={(e) => {
                                    setState({...state, newNameDataset: e.target.value})
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
                            openDialog: false,
                            datasetSelectedIndex: "",
                            newNameDataset: '',
                            loadingChangeName: false

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
                        onClick={() => handleModifyName(state.datasetSelectedIndex)}>Modify</LoadingButton>
                </DialogActions>
            </Dialog>
            <Dialog open={state.openDialogCreateCopy}

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
                    maxWidth="md"
                    fullWidth
            >
                <DialogTitle sx={{fontWeight: 'bold'}}>Create copy of dataset</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextFieldStyled
                                disabled
                                id="name"
                                label="Dataset parent name"
                                type="name"
                                value={state.datasetSelectedIndex === "" ? "" : state.datasets[state.datasetSelectedIndex].name}
                                fullWidth
                                variant="filled"
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <TextFieldStyled
                                autoFocus
                                id="train_size"
                                label="Train size"
                                size="small"
                                value={state.trainSize}
                                fullWidth
                                type="number"
                                variant="filled"
                                InputProps={{

                                    endAdornment: (
                                        <InputAdornment
                                            position="end" style={{color: 'white'}}>%</InputAdornment>
                                    )

                                }}
                                onChange={(e) => {
                                    setState({...state, trainSize: e.target.value})
                                }}
                            />

                        </Grid>
                        <Grid item xs={2}>
                            <FormControl variant="filled" fullWidth>
                                <InputLabel id="demo-simple-select-label" sx={{color: 'white'}}>
                                    Shuffle
                                </InputLabel>
                                <Select
                                    size="small"
                                    value={state.shuffle}

                                    label="Shuffle"
                                    sx={{color: 'white'}}
                                    onChange={(e) => setState({...state, shuffle: e.target.value})}

                                    inputProps={{
                                        MenuProps: {
                                            MenuListProps: {
                                                sx: {
                                                    backgroundColor: '#525558', color: 'white'

                                                }
                                            }
                                        }
                                    }}

                                >

                                    <MenuItem value='yes'>Yes</MenuItem>
                                    <MenuItem value='no'>No</MenuItem>


                                </Select>
                            </FormControl>

                        </Grid>
                        <Grid item xs={4.5}>
                            <FormControl variant="filled" fullWidth>
                                <InputLabel id="demo-simple-select-label" sx={{color: 'white'}}>
                                    Used for
                                </InputLabel>
                                <Select
                                    size="small"
                                    value={state.used_for}

                                    label="Used for"
                                    sx={{color: 'white'}}
                                    onChange={(e) => setState({...state, used_for: e.target.value})}

                                    inputProps={{
                                        MenuProps: {
                                            MenuListProps: {
                                                sx: {
                                                    backgroundColor: '#525558', color: 'white'

                                                }
                                            }
                                        }
                                    }}

                                >

                                    <MenuItem value='Classifier'>Classifier</MenuItem>
                                    <MenuItem value='Anomaly detection'>Anomaly detection</MenuItem>


                                </Select>
                            </FormControl>

                        </Grid>
                        <Grid item xs={2.5}>
                            <TextFieldStyled
                                autoFocus
                                id="seed"
                                label="Seed"
                                size="small"
                                value={state.seed}
                                fullWidth
                                type="number"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                placeholder={"None"}
                                variant="filled"

                                onChange={(e) => {
                                    setState({...state, seed: e.target.value})
                                }}
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
                            openDialogCreateCopy: false,
                            datasetSelectedIndex: "",
                            loadingCreateCopy: false,
                            trainSize: '',
                            shuffle: '',
                            used_for: ''

                        })}>Cancel</Button>

                    <LoadingButton
                        loading={state.loadingCreateCopy}
                        size="small"
                        disabled={state.loadingCreateCopy || state.trainSize === "" || state.trainSize <= 0 || state.trainSize >= 100 || state.shuffle === "" || state.used_for === ""  || state.seed < 0 || state.seed > 4294967295}
                        color="success"
                        onClick={handleCopyDataset}
                        sx={{
                            borderRadius: '28px',
                            fontWeight: 'bold'
                        }}
                        variant="contained">Create</LoadingButton>
                </DialogActions>
            </Dialog>

        </Grid>
    )
}

export default Datasets