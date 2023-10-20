import {
    Button,
    CircularProgress,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    ListSubheader,
    Box, Chip, Checkbox, ListItemText, Stack
} from "@mui/material";
import RemoveIcon from '@mui/icons-material/Remove';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import React, {useEffect, useState} from "react";

import Table from "../components/Tables/Table.jsx";
import { getColumnsFromDataset } from "../services/DatasetRequests.js";
import {useOutletContext} from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import LoadingButton from "@mui/lab/LoadingButton";
import ReportIcon from "@mui/icons-material/Report";
import FullSizeDialog from "../components/Dialog/FullSizeDialog.jsx";
import TextFieldStyled from "../components/TextFieldStyled/TextFieldStyled.jsx";


const DatasetProcessing = () => {

    const [state, setState] = useState({
        loading: true,
        columnsDataset: [],
        algorithmBtnSelected: -1,
        algorithmsPreprocessingSelected: [],
        algorithmFeatureExtractionSelected: {algorithm: '', parameter: 0},
        loadingPreprocessing: false,
        openLogDialog: false,
        textError: '',
        loadingFeatureExtraction: false,
        loadingRemoveFailed: false,


    })

    const [dataset, handlePreprocessDataset, handleFeatureExtractionDataset, handleRemoveProcessingsFailed] = useOutletContext()

    useEffect(() => {

        getColumnsFromDataset(dataset.id)
            .then(
                response2 => {
                    setState({
                        ...state,
                        loading: false,
                        columnsDataset: response2.data,
                    })
                }
            )


    }, [])

    const handleClickPreprocessingBtn = () => {

        let list
        if (state.algorithmsPreprocessingSelected.length === 0)
            list = [{
                algorithm: "",
                columns: [],
            }]
        else
            list = [...state.algorithmsPreprocessingSelected]

        setState({
            ...state,
            algorithmBtnSelected: 0,
            algorithmsPreprocessingSelected: list,
            algorithmFeatureExtractionSelected: {algorithm: '', parameter: 0}
        })
    }
    const handleClickFeatureExtractionBtn = () => {


        setState({
            ...state,
            algorithmBtnSelected: 1,
            algorithmsPreprocessingSelected: []
        })

    }


    const handleOnChangeAlgorithmPreprocessingSelected = (e, index) => {
        let list = [...state.algorithmsPreprocessingSelected]
        list[index].algorithm = e.target.value


        if (e.target.value === "random_undersampling" || e.target.value === "nearmiss_undersampling" || e.target.value === "random_oversampling" || e.target.value === "smote_oversampling") {
            list[index].columns = ['All features']
        }

        setState({
            ...state,
            algorithmsPreprocessingSelected: list
        })

    }


    const handleChangeSelectChipColumns = (event, index) => {
        const {
            target: {value},
        } = event;

        let list = [...state.algorithmsPreprocessingSelected]

        if (value.indexOf('All features') > -1)
            list[index].columns = ['All features']
        else
            list[index].columns = typeof value === 'string' ? value.split(',') : value


        setState({
            ...state,
            algorithmsPreprocessingSelected: list

        })
    };


    const handleDeleteProcessingAlgorithm = (index) => {
        let list = [...state.algorithmsPreprocessingSelected]
        list.splice(index, 1)
        setState({
            ...state,
            algorithmsPreprocessingSelected: list
        })
    }

    const handleAddNewPreprocessingAlgorithm = () => {

        let list = [...state.algorithmsPreprocessingSelected]
        list.push({
            algorithm: '',
            columns: [],
        })
        setState({
            ...state,
            algorithmsPreprocessingSelected: list
        })
    }

    const getLabelName = () => {
        switch (state.algorithmFeatureExtractionSelected.algorithm) {
            case 1:
                return 'Number of components'
            case 2:
                return 'Number of components'
            case 3:
                return 'Size of the encoded representation space'
            case 4:
                return 'Number of components'
        }
    }

    const handleClickShowLog = (error) => {

        setState({
            ...state,
            openLogDialog: true,
            textError: error
        })


    }

    const handleUpProcessingAlgorithm = (index) => {
        const listAlgorithms = state.algorithmsPreprocessingSelected
        const auxAlgorithm = state.algorithmsPreprocessingSelected[index - 1]

        listAlgorithms[index - 1] = listAlgorithms[index]
        listAlgorithms[index] = auxAlgorithm

        setState({
            ...state,
            algorithmsPreprocessingSelected: listAlgorithms
        })
    }

    const handleDownProcessingAlgorithm = (index) => {
        const listAlgorithms = state.algorithmsPreprocessingSelected
        const auxAlgorithm = state.algorithmsPreprocessingSelected[index + 1]

        listAlgorithms[index + 1] = listAlgorithms[index]
        listAlgorithms[index] = auxAlgorithm

        setState({
            ...state,
            algorithmsPreprocessingSelected: listAlgorithms
        })
    }
    const disableBtnApplyPreprocessing = () => {

        for (let i = 0; i < state.algorithmsPreprocessingSelected.length; i++) {
            if (state.algorithmsPreprocessingSelected[i].algorithm === '' || state.algorithmsPreprocessingSelected[i].columns.length === 0)
                return true
        }
        return false
    }

    const handleApplyFeatureExtraction = () => {

        setState({
            ...state,
            loadingFeatureExtraction: true

        })

        let name_algorithm = ""

        switch (state.algorithmFeatureExtractionSelected.algorithm) {
            case 0:
                name_algorithm = 'skip'
                break
            case 1:
                name_algorithm = 'pca'
                break

            case 2:
                name_algorithm = 'lda'
                break
            case 3:
                name_algorithm = 'autoencoder'
                break
            case 4:
                name_algorithm = 'svd'
                break
        }


        handleFeatureExtractionDataset({
            algorithm: name_algorithm,
            parameter: state.algorithmFeatureExtractionSelected.parameter
        })

        setState({
            ...state,
            loadingFeatureExtraction: false,
            algorithmBtnSelected: -1,
            algorithmsPreprocessingSelected: [],
            algorithmFeatureExtractionSelected: {algorithm: '', parameter: 0},

        })


    }

    const handleApplyPreprocessing = () => {

        setState({
            ...state,
            loadingPreprocessing: true

        })


        let algorithms = []
        for (let i = 0; i < state.algorithmsPreprocessingSelected.length; i++) {

            let features_copy = []
            if (state.algorithmsPreprocessingSelected[i].columns[0] === "All features") {
                for (let j = 0; j < state.columnsDataset.length; j++) {
                    features_copy.push(state.columnsDataset[j].name)
                }
            } else
                features_copy = [...state.algorithmsPreprocessingSelected[i].columns]


            algorithms.push({
                algorithm: state.algorithmsPreprocessingSelected[i].algorithm,
                features: features_copy,

            })
        }


        handlePreprocessDataset({algorithms: algorithms})

        setState({
            ...state,
            algorithmBtnSelected: -1,
            algorithmsPreprocessingSelected: [],
            algorithmFeatureExtractionSelected: {algorithm: '', parameter: 0},
            loadingPreprocessing: false

        })


    }

    const handleStopLoadingRemove = () => {
        setState({
            ...state,
            loadingRemoveFailed: false,
        })


    }

    const handleBtnRemoveFailedAlgorithms = () => {

        setState({
            loadingRemoveFailed: true
        })
        handleRemoveProcessingsFailed(handleStopLoadingRemove)


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
        expandableRows: false,

        filterType: "dropdown",
        selectableRowsHeader: false,
        textLabels: {
            body: {
                noMatch: state.loading ?
                    <CircularProgress sx={{color: 'white'}}/> : 'No processing algorithms applied'
            }
        }, selectToolbarPlacement: 'none',

    };

    const columns = [
        {
            name: "index",
            label: "Order",
            options: {
                filter: false,
                sort: false,
                setCellProps: () => ({
                    style: {
                        width: "5%",
                    },
                }),
            }
        },
        {
            name: "date",
            label: "Date",
            options: {
                filter: false,
                sort: false,
                setCellProps: () => ({
                    style: {
                        width: "15%",
                    },
                }),
            }
        },
        {
            name: "algorithm_description",
            label: "Algorithm applied",
            options: {
                filter: true,
                sort: false,
                customBodyRenderLite: (dataIndex) => {
                    return (
                        <span style={{
                            whiteSpace: 'pre-line',
                            fontSize: '14px'
                        }}>{dataset.processings[dataIndex].algorithm_description}</span>
                    )
                },
                setCellProps: () => ({
                    style: {
                        width: "60%",
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
                    return dataset.processings[dataIndex].status === "Error" ? (
                        <Stack direction="row" spacing={1} alignItems="center">
                            <span>Error</span>
                            <IconButton onClick={() => handleClickShowLog(dataset.processings[dataIndex].log_error)}>
                                <ReportIcon/>
                            </IconButton>
                        </Stack>
                    ) : dataset.processings[dataIndex].status
                },
                setCellProps: () => ({
                    style: {
                        width: "25%",
                    },
                }),

            }
        }
    ]

    const getLabelFeaturePreprocessingSelect = (index) => {

        switch (state.algorithmsPreprocessingSelected[index].algorithm) {
            case '':
                return "Features"
            case 'remove_outliers':
                return "Features"
            case 'remove_duplicates':
                return "Features to consider"
            case 'min-max_normalization':
                return "Features"
            case 'standard_scaler_normalization':
                return 'Features'
            case 'one-hot_encoding':
                return 'Features'
            case 'drop_features':
                return 'Features'
            default:
                return 'Features'


        }
    }

    return (
        <Grid container spacing={2} sx={{mt: '20px'}}>
            <Grid item xs={12}>
                <Table title={"Applied processing algorithms"} columns={columns} data={dataset.processings}
                       options={options}/>
            </Grid>
            {
                dataset.processings.filter(el => el.status === "Error").length > 0 &&
                <Grid item xs={3}>
                    <LoadingButton loading={state.loadingRemoveFailed} onClick={handleBtnRemoveFailedAlgorithms}
                                   size="small" variant="contained" sx={{
                        color: 'white',
                        backgroundColor: '#C63637',
                        borderRadius: '28px',
                        fontWeight: 'bold',
                        '&:hover': {backgroundColor: '#9d292a'}
                    }}>Delete failed algorithms</LoadingButton>
                </Grid>

            }


            <Grid item xs={12} sx={{mt: '40px'}}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <Button
                            size="small" fullWidth
                            disabled={dataset.status === 2 || dataset.status === 4 || dataset.status === 5}
                            variant={state.algorithmBtnSelected === 0 ? "outlined" : 'contained'}
                            sx={{fontWeight: 'bold', borderRadius: '28px'}}
                            onClick={handleClickPreprocessingBtn}
                        >
                            Preprocessing
                        </Button>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Button size="small" color="secondary" fullWidth
                                disabled={dataset.status === 2 || dataset.status === 4 || dataset.status === 5}
                                variant={state.algorithmBtnSelected === 1 ? "outlined" : 'contained'}
                                sx={{fontWeight: 'bold', borderRadius: '28px'}}
                                onClick={handleClickFeatureExtractionBtn}
                        >Feature extraction</Button>
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={12} sx={{mt: '10px'}}>
                {
                    state.algorithmBtnSelected === 0 &&
                    <Grid container>
                        <Grid item xs={12}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <hr/>
                                </Grid>
                                {
                                    state.algorithmsPreprocessingSelected.map((algorithmSelected, indexAlgorithmSelected) => (
                                        <Grid key={indexAlgorithmSelected} item xs={12} sx={{mt: '10px'}}>
                                            <Stack spacing={2} direction="row"
                                                   justifyContent="center"
                                                   alignItems="center">

                                                    <span style={{
                                                        color: 'white',
                                                        fontWeight: 'bold'
                                                    }}>{indexAlgorithmSelected + 1}.</span>

                                                <FormControl variant="filled" fullWidth>
                                                    <InputLabel id="demo-simple-select-label"
                                                                sx={{color: 'white'}}>
                                                        Algorithm
                                                    </InputLabel>
                                                    <Select
                                                        size="small"
                                                        value={algorithmSelected.algorithm}
                                                        onChange={(e) => handleOnChangeAlgorithmPreprocessingSelected(e, indexAlgorithmSelected)}
                                                        label="Algorithm"
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

                                                    >
                                                        <ListSubheader sx={{
                                                            backgroundColor: '#493c3c7a',
                                                            fontWeight: 'bold',
                                                            color: 'wheat',
                                                            fontStyle: 'italic'
                                                        }}>Data cleaning</ListSubheader>
                                                        <MenuItem value={'remove_outliers'}>Remove outliers (IQR
                                                            Method)</MenuItem>
                                                        <MenuItem value={'remove_duplicates'}>Remove
                                                            duplicates</MenuItem>
                                                        <ListSubheader sx={{
                                                            backgroundColor: '#493c3c7a',
                                                            fontWeight: 'bold',
                                                            color: 'wheat',
                                                            fontStyle: 'italic'
                                                        }}>Data transformation</ListSubheader>
                                                        <MenuItem value={'min-max_normalization'}>Min-max
                                                            normalization</MenuItem>
                                                        <MenuItem value={'standard_scaler_normalization'}>Standard
                                                            scaler normalization</MenuItem>
                                                        <MenuItem value={'one-hot_encoding'}>One-hot encoding</MenuItem>
                                                        <MenuItem value={'drop_features'}>Drop features</MenuItem>
                                                        {
                                                            dataset.used_for === "Classifier" && [
                                                                <ListSubheader
                                                                    key="data-balancing-header"
                                                                    sx={{
                                                                        backgroundColor: '#493c3c7a',
                                                                        fontWeight: 'bold',
                                                                        color: 'wheat',
                                                                        fontStyle: 'italic'
                                                                    }}
                                                                >
                                                                    Data balancing
                                                                </ListSubheader>,
                                                                <MenuItem key="random_undersampling"
                                                                          value={'random_undersampling'}>
                                                                    Under-sampling (Random)
                                                                </MenuItem>,
                                                                <MenuItem key="nearmiss_undersampling"
                                                                          value={'nearmiss_undersampling'}>
                                                                    Under-sampling (NearMiss)
                                                                </MenuItem>,
                                                                <MenuItem key="random_oversampling"
                                                                          value={'random_oversampling'}>
                                                                    Over-sampling (Random)
                                                                </MenuItem>,
                                                                <MenuItem key="smote_oversampling"
                                                                          value={'smote_oversampling'}>
                                                                    Over-sampling (SMOTE)
                                                                </MenuItem>
                                                            ].map(el => (el))
                                                        }

                                                    </Select>
                                                </FormControl>

                                                <FormControl variant="filled" fullWidth>
                                                    <InputLabel id="demo-simple-select-label"
                                                                sx={{color: 'white'}}>
                                                        {getLabelFeaturePreprocessingSelect(indexAlgorithmSelected)}
                                                    </InputLabel>
                                                    <Select
                                                        labelId="demo-multiple-chip-label"
                                                        id="demo-multiple-chip"
                                                        size="small"
                                                        multiple

                                                        label={getLabelFeaturePreprocessingSelect(indexAlgorithmSelected)}
                                                        onChange={(e) => handleChangeSelectChipColumns(e, indexAlgorithmSelected)}
                                                        sx={{color: 'white'}}
                                                        value={algorithmSelected.columns}
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

                                                        renderValue={(selected) => (
                                                            <Box sx={{
                                                                display: 'flex',
                                                                flexWrap: 'wrap',
                                                                gap: 0.5
                                                            }}>
                                                                {selected.map((value) => (
                                                                    <Chip size="small" key={value} label={value}
                                                                          sx={{color: 'white'}}/>
                                                                ))}
                                                            </Box>
                                                        )}
                                                    >
                                                        <MenuItem disabled={algorithmSelected.algorithm === "random_undersampling" || algorithmSelected.algorithm === "nearmiss_undersampling" ||algorithmSelected.algorithm === "random_oversampling"|| algorithmSelected.algorithm === "smote_oversampling"}
                                                                  value="All features">
                                                            <Checkbox
                                                                checked={algorithmSelected.columns.indexOf("All features") > -1}/>
                                                            <ListItemText primary="All features"/>
                                                        </MenuItem>
                                                        <hr/>
                                                        {
                                                            state.columnsDataset.map((column, indexColumn) => (
                                                                <MenuItem
                                                                    disabled={algorithmSelected.columns.filter(el => el === "All features").length > 0}
                                                                    key={indexColumn}
                                                                    value={column.name}>
                                                                    <Checkbox
                                                                        checked={algorithmSelected.columns.indexOf(column.name) > -1}/>
                                                                    <ListItemText
                                                                        primary={`${column.name} (${(column.type === 'float64' || column.type === 'int64') ? "Numerical" : "Categorical"})`}/>

                                                                </MenuItem>
                                                            ))
                                                        }


                                                    </Select>
                                                </FormControl>


                                                <IconButton
                                                    onClick={() => handleUpProcessingAlgorithm(indexAlgorithmSelected)}
                                                    disabled={indexAlgorithmSelected === 0}
                                                    sx={{
                                                        color: 'white',
                                                        '&.Mui-disabled': {
                                                            color: 'rgba(0, 0, 0, 0.26) !important'
                                                        }
                                                    }}

                                                >
                                                    <ArrowUpwardIcon/>
                                                </IconButton>


                                                <IconButton
                                                    onClick={() => handleDownProcessingAlgorithm(indexAlgorithmSelected)}
                                                    disabled={indexAlgorithmSelected + 1 === state.algorithmsPreprocessingSelected.length}
                                                    sx={{
                                                        color: 'white',
                                                        '&.Mui-disabled': {
                                                            color: 'rgba(0, 0, 0, 0.26) !important'
                                                        }
                                                    }}

                                                >
                                                    <ArrowDownwardIcon/>
                                                </IconButton>


                                                <IconButton
                                                    onClick={() => handleDeleteProcessingAlgorithm(indexAlgorithmSelected)}
                                                    disabled={indexAlgorithmSelected === 0}
                                                    sx={{
                                                        color: 'white',
                                                        '&.Mui-disabled': {
                                                            color: 'rgba(0, 0, 0, 0.26) !important'
                                                        }
                                                    }}

                                                >
                                                    <RemoveIcon/>
                                                </IconButton>


                                            </Stack>
                                        </Grid>
                                    ))
                                }
                                <Grid item xs={12}>
                                    <Grid container justifyContent="center"
                                          alignItems="center">
                                        <Grid item>
                                            <IconButton
                                                onClick={handleAddNewPreprocessingAlgorithm}
                                                sx={{
                                                    color: 'white',
                                                    '&.Mui-disabled': {
                                                        color: 'rgba(0, 0, 0, 0.26) !important'
                                                    }
                                                }}

                                            >
                                                <AddIcon/>
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item xs={12} sx={{mt: '30px'}}>
                                    <LoadingButton
                                        disabled={disableBtnApplyPreprocessing()}
                                        loading={state.loadingPreprocessing}
                                        onClick={handleApplyPreprocessing} fullWidth size="small"
                                        color="success" variant="contained"
                                        sx={{borderRadius: '28px', fontWeight: 'bold'}}>
                                        Apply
                                    </LoadingButton>
                                </Grid>


                            </Grid>
                        </Grid>

                    </Grid>
                }
                {
                    state.algorithmBtnSelected === 1 &&
                    <Grid container>
                        <Grid item xs={12}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <hr/>
                                </Grid>


                                <Grid item xs={12}>
                                    <Grid container spacing={2}>

                                        <Grid item xs={3}>
                                            <FormControl variant="filled" fullWidth>
                                                <InputLabel id="demo-simple-select-label"
                                                            sx={{color: 'white'}}>
                                                    Algorithm
                                                </InputLabel>
                                                <Select
                                                    size="small"
                                                    onChange={(e) => setState({
                                                        ...state,
                                                        algorithmFeatureExtractionSelected: {
                                                            ...state.algorithmFeatureExtractionSelected,
                                                            algorithm: e.target.value
                                                        }
                                                    })}
                                                    value={state.algorithmFeatureExtractionSelected.algorithm}
                                                    label="Algorithm"
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

                                                >
                                                    <MenuItem value={0}>
                                                        <em>Not to apply feature extraction</em>
                                                    </MenuItem>
                                                    <hr/>
                                                    <MenuItem value={1}>Principal Component Analysis (PCA)</MenuItem>
                                                    <MenuItem value={2}>Linear Discriminant Analysis (LDA)</MenuItem>
                                                    <MenuItem value={3}>Autoencoder</MenuItem>
                                                    <MenuItem value={4}>Singular Value Decomposition (SVD)</MenuItem>


                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        {
                                            state.algorithmFeatureExtractionSelected.algorithm !== 0 && state.algorithmFeatureExtractionSelected.algorithm !== "" &&
                                            <Grid item xs={2}>
                                                <TextFieldStyled
                                                    variant="filled"
                                                    fullWidth
                                                    size="small"
                                                    name="parameter"
                                                    type="number"
                                                    label={getLabelName()}
                                                    placeholder=""
                                                    value={state.algorithmFeatureExtractionSelected.parameter}
                                                    onChange={(e) => setState({
                                                        ...state,
                                                        algorithmFeatureExtractionSelected: {
                                                            ...state.algorithmFeatureExtractionSelected,
                                                            parameter: e.target.value
                                                        }
                                                    })}
                                                    InputLabelProps={{
                                                        shrink: true,
                                                    }}

                                                />
                                            </Grid>
                                        }
                                    </Grid>
                                </Grid>
                                <Grid item xs={12} sx={{mt: '30px'}}>
                                    <LoadingButton
                                        disabled={state.algorithmFeatureExtractionSelected.algorithm === '' || (state.algorithmFeatureExtractionSelected.algorithm !== 0 && state.algorithmFeatureExtractionSelected.parameter === '')}
                                        loading={state.loadingFeatureExtraction}
                                        onClick={handleApplyFeatureExtraction} fullWidth size="small"
                                        color="success" variant="contained"
                                        sx={{borderRadius: '28px', fontWeight: 'bold'}}>
                                        Apply
                                    </LoadingButton>
                                </Grid>


                            </Grid>
                        </Grid>

                    </Grid>

                }
                <FullSizeDialog
                    open={state.openLogDialog}
                    handleClose={() => setState({...state, openLogDialog: false, textError: ''})}
                    title="Log"
                >
                    <div style={{marginLeft: '10px'}}>
                        <pre style={{overflowX: 'scroll'}}>{state.textError}</pre>
                    </div>

                </FullSizeDialog>

            </Grid>


        </Grid>
    )
}

export default DatasetProcessing