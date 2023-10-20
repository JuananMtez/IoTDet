import {useOutletContext} from "react-router-dom";
import {useEffect, useState} from "react";
import {
    Alert,
    CircularProgress,
    FormControl,
    Grid,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select,
    Snackbar
} from "@mui/material";
import * as React from "react";
import {
    getAllPlotsByDataset,
    getColumnsFromDataset,
    getMalwareFromDataset,
    plotDataset, removePlot
} from "../services/DatasetRequests.js";
import LoadingButton from "@mui/lab/LoadingButton";
import TextFieldStyled from "../components/TextFieldStyled/TextFieldStyled.jsx";
import CardImg from "../components/Cards/CardImg.jsx";

const DatasetPlots = () => {
    const [state, setState] = useState({
        plots: [],
        plotSelected: '',
        bins: 0,
        x_axis: '',
        y_axis: '',
        malware: '',
        loading: true,
        columns_dataset: [],
        malware_dataset: [],
        loadingPlotting: false,
        openSuccessPlot: false,
        openSuccessRemove: false
    })
    const [dataset] = useOutletContext()

    useEffect(() => {

        getColumnsFromDataset(dataset.id)

            .then(response => {
                getMalwareFromDataset(dataset.id)
                    .then(response2 => {
                        getAllPlotsByDataset(dataset.id)
                            .then(response3 => {
                                setState({
                                    ...state,
                                    columns_dataset: response.data,
                                    malware_dataset: response2.data,
                                    plots: response3.data,
                                    loading: false
                                })
                            })

                    })

            })
    }, [])

    const handleBtnPlot = () => {
        setState({
            ...state,
            loadingPlotting: true
        })
        let request = null
        switch (state.plotSelected) {
            case 'box_plot':
                request = {
                    x_axis_variable: state.x_axis,
                    malware: state.malware
                }
                break
            case 'hist_plot':
                request = {
                    x_axis_variable: state.x_axis,
                    bins: state.bins,
                    malware: state.malware
                }
                break
            case 'scatter_plot':
                request = {
                    x_axis_variable: state.x_axis,
                    y_axis_variable: state.y_axis,
                    malware: state.malware
                }
                break
        }

        plotDataset(dataset.id, request)
            .then(response => {
                setState({
                    ...state,
                    loadingPlotting: false,
                    openSuccessPlot: true,
                    plots: [...state.plots, response.data],
                    plotSelected: '',
                    bins: 0,
                    x_axis: '',
                    y_axis: '',
                    malware: '',

                })
            })


    }

    const handleRemovePlot = (id) => {
        removePlot(dataset.id, id)
            .then(response => {
                setState({
                    ...state,
                    openSuccessRemove: true,
                    plots: state.plots.filter(el => el.id !== id)
                })
            })
    }

    return (
        <Grid container spacing={2}>

            {
                state.loading
                    ?
                    <Grid container justifyContent="center"
                          alignItems="center">


                        <Grid item sx={{mt: '50px'}}>
                            <CircularProgress sx={{color: 'white'}}/>
                        </Grid>
                    </Grid>
                    :
                    <Grid item xs={12}>
                        <Grid container spacing={2} sx={{mt: '40px'}}>
                            <Grid item xs={2}>
                                <FormControl variant="filled" fullWidth>
                                    <InputLabel id="demo-simple-select-label"
                                                sx={{color: 'white'}}>Plot</InputLabel>
                                    <Select
                                        size="small"
                                        value={state.plotSelected}

                                        label="Plot"
                                        sx={{color: 'white'}}
                                        onChange={(e) => setState({
                                            ...state,
                                            plotSelected: e.target.value,
                                            x_axis: '',
                                            y_axis: '',
                                            malware: '',
                                            bins: 0
                                        })}
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
                                        <MenuItem value={'box_plot'}>Box plot</MenuItem>
                                        <MenuItem value={'scatter_plot'}>Scatter plot</MenuItem>
                                        <MenuItem value={'hist_plot'}>Histogram plot</MenuItem>

                                    </Select>
                                </FormControl>
                            </Grid>
                            {
                                state.plotSelected === 'box_plot' &&
                                <>
                                    <Grid item xs={2}>
                                        <FormControl variant="filled" fullWidth>
                                            <InputLabel id="demo-simple-select-label"
                                                        sx={{color: 'white'}}>X Axis</InputLabel>
                                            <Select
                                                size="small"
                                                value={state.x_axis}

                                                label="X Axis"
                                                sx={{color: 'white'}}
                                                onChange={(e) => setState({
                                                    ...state,
                                                    x_axis: e.target.value

                                                })}
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
                                                {
                                                    state.columns_dataset.map((column, indexColumn) => (
                                                        <MenuItem key={indexColumn}
                                                                  value={column.name}>{column.name}</MenuItem>

                                                    ))

                                                }


                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={2}>
                                        <FormControl variant="filled" fullWidth>
                                            <InputLabel id="demo-simple-select-label"
                                                        sx={{color: 'white'}}>Malware</InputLabel>
                                            <Select
                                                size="small"
                                                value={state.malware}

                                                label="Malware"
                                                sx={{color: 'white'}}
                                                onChange={(e) => setState({
                                                    ...state,
                                                    malware: e.target.value

                                                })}
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
                                                {
                                                    state.malware_dataset.map((malware, malwareColumn) => (
                                                        <MenuItem key={malwareColumn}
                                                                  value={malware.name}>{malware.name}</MenuItem>

                                                    ))

                                                }


                                            </Select>
                                        </FormControl>

                                    </Grid>
                                </>


                            }
                            {
                                state.plotSelected === 'scatter_plot' &&
                                <>
                                    <Grid item xs={2}>
                                        <FormControl variant="filled" fullWidth>
                                            <InputLabel id="demo-simple-select-label"
                                                        sx={{color: 'white'}}>X Axis</InputLabel>
                                            <Select
                                                size="small"
                                                value={state.x_axis}

                                                label="X Axis"
                                                sx={{color: 'white'}}
                                                onChange={(e) => setState({
                                                    ...state,
                                                    x_axis: e.target.value

                                                })}
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
                                                {
                                                    state.columns_dataset.map((column, indexColumn) => (
                                                        <MenuItem key={indexColumn}
                                                                  value={column.name}>{column.name}</MenuItem>

                                                    ))

                                                }


                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={2}>
                                        <FormControl variant="filled" fullWidth>
                                            <InputLabel id="demo-simple-select-label"
                                                        sx={{color: 'white'}}>Y Axis</InputLabel>
                                            <Select
                                                size="small"
                                                value={state.y_axis}

                                                label="Y Axis"
                                                sx={{color: 'white'}}
                                                onChange={(e) => setState({
                                                    ...state,
                                                    y_axis: e.target.value

                                                })}
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
                                                {
                                                    state.columns_dataset.map((column, indexColumn) => (
                                                        <MenuItem key={indexColumn}
                                                                  value={column.name}>{column.name}</MenuItem>

                                                    ))

                                                }


                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={2}>
                                        <FormControl variant="filled" fullWidth>
                                            <InputLabel id="demo-simple-select-label"
                                                        sx={{color: 'white'}}>Malware</InputLabel>
                                            <Select
                                                size="small"
                                                value={state.malware}

                                                label="Malware"
                                                sx={{color: 'white'}}
                                                onChange={(e) => setState({
                                                    ...state,
                                                    malware: e.target.value

                                                })}
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
                                                {
                                                    state.malware_dataset.map((malware, malwareColumn) => (
                                                        <MenuItem key={malwareColumn}
                                                                  value={malware.name}>{malware.name}</MenuItem>

                                                    ))

                                                }


                                            </Select>
                                        </FormControl>

                                    </Grid>
                                </>
                            }
                            {
                                state.plotSelected === 'hist_plot' &&
                                <>
                                    <Grid item xs={2}>
                                        <FormControl variant="filled" fullWidth>
                                            <InputLabel id="demo-simple-select-label"
                                                        sx={{color: 'white'}}>X Axis</InputLabel>
                                            <Select
                                                size="small"
                                                value={state.x_axis}

                                                label="X Axis"
                                                sx={{color: 'white'}}
                                                onChange={(e) => setState({
                                                    ...state,
                                                    x_axis: e.target.value

                                                })}
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
                                                {
                                                    state.columns_dataset.map((column, indexColumn) => (
                                                        <MenuItem key={indexColumn}
                                                                  value={column.name}>{column.name}</MenuItem>

                                                    ))

                                                }


                                            </Select>
                                        </FormControl>

                                    </Grid>
                                    <Grid item xs={2}>
                                        <TextFieldStyled
                                            variant="filled"
                                            fullWidth
                                            size="small"
                                            name="bins"
                                            type="number"
                                            label="Bins"
                                            placeholder=""
                                            value={state.bins}
                                            onChange={(e) => setState({
                                                ...state,
                                                bins: e.target.value
                                            })}
                                            InputLabelProps={{
                                                shrink: true,
                                            }}

                                        />
                                    </Grid>
                                    <Grid item xs={2}>
                                        <FormControl variant="filled" fullWidth>
                                            <InputLabel id="demo-simple-select-label"
                                                        sx={{color: 'white'}}>Malware</InputLabel>
                                            <Select
                                                size="small"
                                                value={state.malware}

                                                label="Malware"
                                                sx={{color: 'white'}}
                                                onChange={(e) => setState({
                                                    ...state,
                                                    malware: e.target.value

                                                })}
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
                                                {
                                                    state.malware_dataset.map((malware, malwareColumn) => (
                                                        <MenuItem key={malwareColumn}
                                                                  value={malware.name}>{malware.name}</MenuItem>

                                                    ))

                                                }


                                            </Select>
                                        </FormControl>

                                    </Grid>
                                </>
                            }
                            <Grid item xs={12}

                                  sx={{mt: '15px'}}>
                                <LoadingButton
                                    loading={state.loadingPlotting}
                                    disabled={
                                    state.plotSelected === "" ||
                                    (state.plotSelected === 'scatter_plot' && (state.x_axis === '' || state.y_axis === '' || state.malware === '')) ||
                                    (state.plotSelected === 'hist_plot' && (state.x_axis === '' || state.malware === '' || state.bins === '')) ||
                                    (state.plotSelected === 'box_plot' && (state.x_axis === '' || state.malware === '')) ||
                                    state.loadingPlotting || dataset.status === 2 || dataset.status === 4
                                } size="small" fullWidth variant="contained"
                                               onClick={handleBtnPlot}
                                               sx={{fontWeight: 'bold', borderRadius: '28px'}}>Plot</LoadingButton>
                            </Grid>
                            <Grid item xs={12} sx={{mt: '15px'}}>
                                <hr/>
                            </Grid>
                            <Grid item xs={12}>
                                <Grid container spacing={2}>
                                    {
                                        state.plots.map((plot, indexPlot) => (
                                            <Grid key={indexPlot} item xs={12} lg={4} sm={6}>
                                                <CardImg handleRemove={handleRemovePlot} data={plot.data} id={plot.id}/>
                                            </Grid>
                                        ))
                                    }
                                </Grid>
                            </Grid>


                        </Grid>


                    </Grid>

            }
            <Grid item xs={12}>
                <Snackbar anchorOrigin={{vertical: "bottom", horizontal: "right"}} open={state.openSuccessPlot}
                          autoHideDuration={3000} onClose={() => setState({...state, openSuccessPlot: false})}>
                    <Alert onClose={() => setState({...state, openSuccessPlot: false})} severity="success"
                           sx={{width: '100%'}}>
                        Plot generated successfully!
                    </Alert>
                </Snackbar>
            </Grid>
            <Grid item xs={12}>
                <Snackbar anchorOrigin={{vertical: "bottom", horizontal: "right"}} open={state.openSuccessRemove}
                          autoHideDuration={3000} onClose={() => setState({...state, openSuccessRemove: false})}>
                    <Alert onClose={() => setState({...state, openSuccessRemove: false})} severity="success"
                           sx={{width: '100%'}}>
                        Plot removed successfully!
                    </Alert>
                </Snackbar>
            </Grid>

        </Grid>
    )
}
export default DatasetPlots