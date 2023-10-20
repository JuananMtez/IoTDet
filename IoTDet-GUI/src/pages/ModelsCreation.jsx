import React, {useEffect, useState} from "react";
import {getAllDatasetsFeaturesExtracted, getMalwareFromDataset} from "../services/DatasetRequests.js";
import {
    CircularProgress,
    Grid,
    Card,
    CardContent,
    CardActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem, InputAdornment, Stack, Box, Chip, Checkbox, ListItemText, Tooltip
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from "@mui/material/IconButton";
import Table from "../components/Tables/Table.jsx";
import AddIcon from "@mui/icons-material/Add";
import Typography from "@mui/material/Typography";
import TextFieldStyled from "../components/TextFieldStyled/TextFieldStyled.jsx";
import RemoveIcon from '@mui/icons-material/Remove';
import LoadingButton from "@mui/lab/LoadingButton";
import {useNavigate} from "react-router-dom";
import {createModels} from "../services/ModelRequests.js";
import InfoIcon from '@mui/icons-material/Info';

const ModelsCreation = () => {

    const [state, setState] = useState({
        loading: true,
        allDatasets: [],
        datasetListAux: [],
        datasetsSelected: [],
        loadingCreation: false
    })

    const navigate = useNavigate()


    useEffect(() => {
        getAllDatasetsFeaturesExtracted()
            .then(response => {
                setState({
                    ...state,
                    loading: false,
                    allDatasets: response.data
                })
            })
    }, [])

    const handleClickAddDataset = (index) => {

        const dataset = state.allDatasets[index]
        const listDatasetAux = state.datasetListAux

        getMalwareFromDataset(dataset.id)
            .then(response => {
                listDatasetAux.push(dataset)
                setState({
                    ...state,
                    allDatasets: state.allDatasets.filter((_, index_array) => index_array !== index),
                    datasetListAux: listDatasetAux,
                    datasetsSelected: [...state.datasetsSelected, {
                        id: dataset.id,
                        datasetName: dataset.name,
                        monitoringScriptName: dataset.monitoring_script_name,
                        device: dataset.device_mender_id,
                        models: [{
                            algorithm: '',
                            type: dataset.used_for === 'Classifier' ? 'Classifier' : 'Anomaly Detection',
                            hyperparameters: {},
                            hyperparametersTuning: 'manual',
                            evaluationMetric: '',
                            folds: 5,
                            iterations: 10,
                            labels: [],
                            method: 'ml'
                        }],
                        allLabels: response.data,


                    }]
                })

            })


    }

    const handleRemoveDataset = (indexDataset) => {
        const dataset = state.datasetListAux[indexDataset]
        setState({
            ...state,
            allDatasets: [...state.allDatasets, dataset],
            datasetsSelected: state.datasetsSelected.filter((_, index_array) => index_array !== indexDataset),
            datasetListAux: state.datasetListAux.filter((_, index_array) => index_array !== indexDataset)
        })
    }

    const handleDeleteModel = (indexDataset, indexModel) => {

        const list = [...state.datasetsSelected]
        list[indexDataset].models.splice(indexModel, 1)

        setState({
            ...state,
            datasetsSelected: list
        })


    }

    const handleChangeLabel = (e, indexDataset, indexModel) => {
        const {
            target: {value},
        } = e;
        const list = [...state.datasetsSelected]

        if (value.indexOf('All classes') > -1)
            list[indexDataset].models[indexModel].labels = ['All classes']
        else
            list[indexDataset].models[indexModel].labels = typeof value === 'string' ? value.split(',') : value

        setState({
            ...state,
            datasetsSelected: list
        })

    }
    const handleChangeAlgorithmManualParameters = (e, indexDataset, indexModel) => {

        const list = [...state.datasetsSelected]

        const hyperparameters = {}


        switch (e.target.value) {
            case 'gnb':
                break
            case 'knn':
                hyperparameters.knn_n_neighbors = 5
                break;
            case 'svm':
                hyperparameters.C = 1.0
                hyperparameters.kernel = 'rbf'
                hyperparameters.gamma = 'scale'
                break;
            case 'sgd':
                hyperparameters.loss = 'hinge'
                hyperparameters.penalty = 'l2'
                hyperparameters.alpha = 0.0001
                hyperparameters.learning_rate = 'optimal'

                break;
            case 'dt':
                hyperparameters.max_depth = ''
                hyperparameters.min_samples_split = 2.0

                break;
            case 'rf':
                hyperparameters.n_estimators = 100
                hyperparameters.max_depth = ''
                hyperparameters.min_samples_split = 2
                break;
            case 'lof':
                hyperparameters.lof_n_neighbors = 20
                hyperparameters.lof_contamination = 0.1

                break;
            case 'ocsvm':
                hyperparameters.kernel = 'rbf'
                hyperparameters.gamma = 'scale'
                hyperparameters.nu = 0.1
                break;
            case 'if':
                hyperparameters.n_estimators = 100
                hyperparameters.if_contamination = 0.1
                break;

        }
        list[indexDataset].models[indexModel] = {
            algorithm: e.target.value,
            type: list[indexDataset].models[indexModel].type,
            hyperparametersTuning: list[indexDataset].models[indexModel].hyperparametersTuning,
            hyperparameters: hyperparameters,
            folds: 0,
            iterations: 0,
            labels: [...list[indexDataset].models[indexModel].labels],
            method: list[indexDataset].models[indexModel].method,
            evaluationMetric: list[indexDataset].models[indexModel].evaluationMetric
        }


        setState({
            ...state,
            datasetsSelected: list
        })

    }

    const handleChangeAlgorithmParametersTuning = (e, indexDataset, indexModel) => {

        const list = [...state.datasetsSelected]

        const hyperparameters = {}

        switch (e.target.value) {
            case 'gnb':
                break
            case 'knn':
                hyperparameters.knn_n_neighbors = ''
                break;
            case 'svm':
                hyperparameters.C = ''
                hyperparameters.kernel = []
                hyperparameters.gamma = ''
                break;
            case 'sgd':
                hyperparameters.loss = []
                hyperparameters.penalty = []
                hyperparameters.alpha = ''
                hyperparameters.learning_rate = []
                break;
            case 'dt':
                hyperparameters.max_depth = ''
                hyperparameters.min_samples_split = ''

                break;
            case 'rf':
                hyperparameters.n_estimators = ''
                hyperparameters.max_depth = ''
                hyperparameters.min_samples_split = ''
                break;
            case 'lof':
                hyperparameters.lof_n_neighbors = ''
                hyperparameters.lof_contamination = ''


                break;
            case 'ocsvm':
                hyperparameters.kernel = []
                hyperparameters.gamma = ''
                hyperparameters.nu = ''
                break;
            case 'if':
                hyperparameters.n_estimators = ''
                hyperparameters.if_contamination = ''
                break;

        }

        list[indexDataset].models[indexModel] = {
            algorithm: e.target.value,
            type: list[indexDataset].models[indexModel].type,
            hyperparameters: hyperparameters,
            folds: list[indexDataset].models[indexModel].folds,
            iterations: list[indexDataset].models[indexModel].iterations,
            labels: [...list[indexDataset].models[indexModel].labels],
            hyperparametersTuning: list[indexDataset].models[indexModel].hyperparametersTuning,
            method: list[indexDataset].models[indexModel].method,
            evaluationMetric: list[indexDataset].models[indexModel].evaluationMetric
        }


        setState({
            ...state,
            datasetsSelected: list
        })

    }

    const handleChangeMethod = (e, indexDataset, indexModel) => {

        const list = [...state.datasetsSelected]
        list[indexDataset].models[indexModel].method = e.target.value
        list[indexDataset].models[indexModel].hyperparametersTuning = "manual"
        list[indexDataset].models[indexModel].evaluationMetric = ""

        if (e.target.value === "dl") {
            list[indexDataset].models[indexModel].algorithm = {
                layers: [{name: "input", layer: {shape: ""}}],
                optimizer: "",
                loss: "",
                epochs: 0,
                learning_rate: 0,
                batch_size: 0,
                threshold: 0


            }

        } else {
            list[indexDataset].models[indexModel].algorithm = ""
        }
        setState({
            ...state,
            datasetsSelected: list
        })

    }

    const handleChangeHyperparametersTuning = (e, indexDataset, indexModel) => {

        const list = [...state.datasetsSelected]
        list[indexDataset].models[indexModel].hyperparametersTuning = e.target.value


        if (list[indexDataset].models[indexModel].method === "ml") {
            list[indexDataset].models[indexModel].algorithm = ""
            if (e.target.value !== 'manual')
                list[indexDataset].models[indexModel].evaluationMetric = "AUC"

        } else {
            if (e.target.value === "manual") {
                list[indexDataset].models[indexModel].algorithm = {
                    layers: [{name: "input", layer: {shape: ""}}],
                    optimizer: "",
                    loss: "",
                    epochs: 0,
                    learning_rate: 0,
                    batch_size: 0,


                }

            } else {
                list[indexDataset].models[indexModel].algorithm = {
                    layers: [{name: "input", layer: {shape: ""}}],
                    optimizers: [],
                    loss: '',
                    epochs: '',
                    learning_rates: '',
                    batch_sizes: '',
                    thresholds: ''


                }

            }


        }
        list[indexDataset].models[indexModel].folds = 5
        list[indexDataset].models[indexModel].iterations = 10
        list[indexDataset].models[indexModel].hyperparameters = {}


        setState({
            ...state,
            datasetsSelected: list
        })

    }

    const handleChangeEvaluationMetric = (e, indexDataset, indexModel) => {
        const list = [...state.datasetsSelected]

        list[indexDataset].models[indexModel].evaluationMetric = e.target.value
        setState({
            ...state,
            datasetsSelected: list
        })
    }

    const handleChangeFolds = (e, indexDataset, indexModel) => {

        const list = [...state.datasetsSelected]
        list[indexDataset].models[indexModel].folds = e.target.value


        setState({
            ...state,
            datasetsSelected: list
        })

    }
    const handleChangeIterations = (e, indexDataset, indexModel) => {

        const list = [...state.datasetsSelected]
        list[indexDataset].models[indexModel].iterations = e.target.value


        setState({
            ...state,
            datasetsSelected: list
        })

    }

    const handleChangeForm = (e, indexDataset, indexModel, hyperparameter) => {
        const list = [...state.datasetsSelected]
        list[indexDataset].models[indexModel].hyperparameters[hyperparameter] = e.target.value
        setState({
            ...state,
            datasetsSelected: list
        })


    }

    const handleAddModel = (indexDataset) => {
        const list = [...state.datasetsSelected]

        list[indexDataset].models.push({
            algorithm: '',
            type: state.datasetListAux[indexDataset].used_for === 'Classifier' ? 'Classifier' : 'Anomaly Detection',
            hyperparameters: {},
            hyperparametersTuning: "manual",
            evaluationMetric: '',

            labels: [],
            method: "ml"

        })
        setState({
            ...state,
            datasetsSelected: list
        })
    }

    const disableCreateModels = () => {

        if (state.datasetsSelected.length === 0)
            return true
        for (let i = 0; i < state.datasetsSelected.length; i++) {
            for (let j = 0; j < state.datasetsSelected[i].models.length; j++) {

                if (state.datasetsSelected[i].models[j].algorithm === '' ||
                    state.datasetsSelected[i].models[j].method === '' ||
                    state.datasetsSelected[i].models[j].hyperparametersTuning === '' ||
                    state.datasetsSelected[i].models[j].folds === '' ||
                    (state.datasetsSelected[i].models[j].hyperparametersTuning === 'randomsearch' && state.datasetsSelected[i].models[j].iterations === '') ||
                    state.datasetsSelected[i].models[j].labels.length === 0 ||

                    (state.datasetsSelected[i].models[j].hyperparametersTuning === "manual" && state.datasetsSelected[i].models[j].method === "dl" && state.datasetsSelected[i].models[j].algorithm.epochs === "") ||
                    (state.datasetsSelected[i].models[j].hyperparametersTuning === "manual" && state.datasetsSelected[i].models[j].method === "dl" && state.datasetsSelected[i].models[j].algorithm.epochs <= 0) ||

                    (state.datasetsSelected[i].models[j].hyperparametersTuning === "manual" && state.datasetsSelected[i].models[j].method === "dl" && state.datasetsSelected[i].models[j].algorithm.loss === "") ||
                    (state.datasetsSelected[i].models[j].hyperparametersTuning === "manual" && state.datasetsSelected[i].models[j].method === "dl" && state.datasetsSelected[i].models[j].algorithm.optimizer === "") ||
                    (state.datasetsSelected[i].models[j].hyperparametersTuning === "manual" && state.datasetsSelected[i].models[j].method === "dl" && state.datasetsSelected[i].models[j].algorithm.threshold === "") ||
                    (state.datasetsSelected[i].models[j].hyperparametersTuning === "manual" && state.datasetsSelected[i].models[j].method === "dl" && state.datasetsSelected[i].models[j].algorithm.threshold < 0) ||
                    (state.datasetsSelected[i].models[j].hyperparametersTuning === "manual" && state.datasetsSelected[i].models[j].method === "dl" && state.datasetsSelected[i].models[j].algorithm.threshold > 100) ||
                    (state.datasetsSelected[i].models[j].hyperparametersTuning === "manual" && state.datasetsSelected[i].models[j].method === "dl" && state.datasetsSelected[i].models[j].algorithm.learning_rate === "") ||
                    (state.datasetsSelected[i].models[j].hyperparametersTuning === "manual" && state.datasetsSelected[i].models[j].method === "dl" && state.datasetsSelected[i].models[j].algorithm.learning_rate < 0) ||
                    (state.datasetsSelected[i].models[j].hyperparametersTuning === "manual" && state.datasetsSelected[i].models[j].method === "dl" && state.datasetsSelected[i].models[j].algorithm.learning_rate > 100) ||
                    (state.datasetsSelected[i].models[j].hyperparametersTuning === "manual" && state.datasetsSelected[i].models[j].method === "dl" && state.datasetsSelected[i].models[j].algorithm.batch_size === "") ||
                    (state.datasetsSelected[i].models[j].hyperparametersTuning === "manual" && state.datasetsSelected[i].models[j].method === "dl" && state.datasetsSelected[i].models[j].algorithm.batch_size < 0) ||

                    ((state.datasetsSelected[i].models[j].hyperparametersTuning === "exhaustivesearch" || state.datasetsSelected[i].models[j].hyperparametersTuning === "randomsearch") && state.datasetsSelected[i].models[j].method === "dl" && (state.datasetsSelected[i].models[j].algorithm.epochs === "" || !state.datasetsSelected[i].models[j].algorithm.epochs.split(',').every(el => {
                        return !isNaN(parseInt(el.trim(), 10))
                    }))) ||
                    ((state.datasetsSelected[i].models[j].hyperparametersTuning === "exhaustivesearch" || state.datasetsSelected[i].models[j].hyperparametersTuning === "randomsearch") && state.datasetsSelected[i].models[j].method === "dl" && (state.datasetsSelected[i].models[j].algorithm.loss === "")) ||
                    ((state.datasetsSelected[i].models[j].hyperparametersTuning === "exhaustivesearch" || state.datasetsSelected[i].models[j].hyperparametersTuning === "randomsearch") && state.datasetsSelected[i].models[j].method === "dl" && (state.datasetsSelected[i].models[j].algorithm.optimizers.length === 0)) ||
                    ((state.datasetsSelected[i].models[j].hyperparametersTuning === "exhaustivesearch" || state.datasetsSelected[i].models[j].hyperparametersTuning === "randomsearch") && state.datasetsSelected[i].models[j].method === "dl" && (state.datasetsSelected[i].models[j].algorithm.learning_rates === "" || !state.datasetsSelected[i].models[j].algorithm.learning_rates.split(',').every(el => {
                        return !isNaN(parseFloat(el.trim()))
                    }))) ||
                    ((state.datasetsSelected[i].models[j].hyperparametersTuning === "exhaustivesearch" || state.datasetsSelected[i].models[j].hyperparametersTuning === "randomsearch") && state.datasetsSelected[i].models[j].method === "dl" && (state.datasetsSelected[i].models[j].algorithm.batch_sizes === "" || !state.datasetsSelected[i].models[j].algorithm.batch_sizes.split(',').every(el => {
                        return !isNaN(parseInt(el.trim(), 10))
                    }))) ||
                    ((state.datasetsSelected[i].models[j].hyperparametersTuning === "exhaustivesearch" || state.datasetsSelected[i].models[j].hyperparametersTuning === "randomsearch") && state.datasetsSelected[i].models[j].method === "dl" && (state.datasetsSelected[i].models[j].algorithm.thresholds === "" || !state.datasetsSelected[i].models[j].algorithm.thresholds.split(',').every(el => {
                        return !isNaN(parseInt(el.trim(), 10))
                    }))) ||


                    (state.datasetsSelected[i].models[j].hyperparametersTuning === "manual" && state.datasetsSelected[i].models[j].method === 'ml' && state.datasetsSelected[i].models[j].algorithm === 'knn' && state.datasetsSelected[i].models[j].hyperparameters.knn_n_neighbors === '') ||
                    (state.datasetsSelected[i].models[j].hyperparametersTuning === "manual" && state.datasetsSelected[i].models[j].method === 'ml' && state.datasetsSelected[i].models[j].algorithm === 'svm' && (state.datasetsSelected[i].models[j].hyperparameters.C === '' || state.datasetsSelected[i].models[j].hyperparameters.kernel === '' || (state.datasetsSelected[i].models[j].hyperparameters.gamma === '' || (state.datasetsSelected[i].models[j].hyperparameters.gamma !== 'auto' && state.datasetsSelected[i].models[j].hyperparameters.gamma !== 'scale' && isNaN(parseFloat(state.datasetsSelected[i].models[j].hyperparameters.gamma.trim())))))) ||
                    (state.datasetsSelected[i].models[j].hyperparametersTuning === "manual" && state.datasetsSelected[i].models[j].method === 'ml' && state.datasetsSelected[i].models[j].algorithm === 'sgd' && (state.datasetsSelected[i].models[j].hyperparameters.loss === '' || state.datasetsSelected[i].models[j].hyperparameters.penalty === '' || state.datasetsSelected[i].models[j].hyperparameters.alpha === '' || state.datasetsSelected[i].models[j].hyperparameters.learning_rate === '')) ||
                    (state.datasetsSelected[i].models[j].hyperparametersTuning === "manual" && state.datasetsSelected[i].models[j].method === 'ml' && state.datasetsSelected[i].models[j].algorithm === 'dt' && (state.datasetsSelected[i].models[j].hyperparameters.min_samples_split === '')) ||
                    (state.datasetsSelected[i].models[j].hyperparametersTuning === "manual" && state.datasetsSelected[i].models[j].method === 'ml' && state.datasetsSelected[i].models[j].algorithm === 'rf' && (state.datasetsSelected[i].models[j].hyperparameters.n_estimators === '' || state.datasetsSelected[i].models[j].hyperparameters.min_samples_split === '')) ||
                    (state.datasetsSelected[i].models[j].hyperparametersTuning === "manual" && state.datasetsSelected[i].models[j].method === 'ml' && state.datasetsSelected[i].models[j].algorithm === 'lof' && (state.datasetsSelected[i].models[j].hyperparameters.lof_n_neighbors === '' || state.datasetsSelected[i].models[j].hyperparameters.lof_contamination === '')) ||
                    (state.datasetsSelected[i].models[j].hyperparametersTuning === "manual" && state.datasetsSelected[i].models[j].method === 'ml' && state.datasetsSelected[i].models[j].algorithm === 'ocsvm' && (state.datasetsSelected[i].models[j].hyperparameters.gamma === '' || (state.datasetsSelected[i].models[j].hyperparameters.gamma !== 'auto' && state.datasetsSelected[i].models[j].hyperparameters.gamma !== 'scale' && isNaN(parseFloat(state.datasetsSelected[i].models[j].hyperparameters.gamma.trim()))) || state.datasetsSelected[i].models[j].hyperparameters.kernel === '' || state.datasetsSelected[i].models[j].hyperparameters.nu === '')) ||
                    (state.datasetsSelected[i].models[j].hyperparametersTuning === "manual" && state.datasetsSelected[i].models[j].method === 'ml' && state.datasetsSelected[i].models[j].algorithm === 'if' && (state.datasetsSelected[i].models[j].hyperparameters.n_estimators === '' || state.datasetsSelected[i].models[j].hyperparameters.if_contamination === '')) ||

                    ((state.datasetsSelected[i].models[j].hyperparametersTuning === "exhaustivesearch" || state.datasetsSelected[i].models[j].hyperparametersTuning === "randomsearch") && state.datasetsSelected[i].models[j].method === 'ml' && state.datasetsSelected[i].models[j].algorithm === 'knn' && (state.datasetsSelected[i].models[j].hyperparameters.knn_n_neighbors === '' || !state.datasetsSelected[i].models[j].hyperparameters.knn_n_neighbors.split(',').every(el => {
                        return !isNaN(parseInt(el.trim(), 10))
                    }))) ||
                    ((state.datasetsSelected[i].models[j].hyperparametersTuning === "exhaustivesearch" || state.datasetsSelected[i].models[j].hyperparametersTuning === "randomsearch") && state.datasetsSelected[i].models[j].method === 'ml' && state.datasetsSelected[i].models[j].algorithm === 'svm' && (state.datasetsSelected[i].models[j].hyperparameters.C === '' || !state.datasetsSelected[i].models[j].hyperparameters.C.split(',').every(el => {
                        return !isNaN(parseFloat(el.trim()))
                    }))) ||
                    ((state.datasetsSelected[i].models[j].hyperparametersTuning === "exhaustivesearch" || state.datasetsSelected[i].models[j].hyperparametersTuning === "randomsearch") && state.datasetsSelected[i].models[j].method === 'ml' && state.datasetsSelected[i].models[j].algorithm === 'svm' && (state.datasetsSelected[i].models[j].hyperparameters.kernel.length === 0)) ||
                    ((state.datasetsSelected[i].models[j].hyperparametersTuning === "exhaustivesearch" || state.datasetsSelected[i].models[j].hyperparametersTuning === "randomsearch") && state.datasetsSelected[i].models[j].method === 'ml' && state.datasetsSelected[i].models[j].algorithm === 'svm' && (!state.datasetsSelected[i].models[j].hyperparameters.gamma.split(',').every(el => {
                        return !isNaN(parseFloat(el.trim())) || el === "auto" || el === "scale"
                    }))) ||
                    ((state.datasetsSelected[i].models[j].hyperparametersTuning === "exhaustivesearch" || state.datasetsSelected[i].models[j].hyperparametersTuning === "randomsearch") && state.datasetsSelected[i].models[j].method === 'ml' && state.datasetsSelected[i].models[j].algorithm === 'sgd' && (state.datasetsSelected[i].models[j].hyperparameters.loss.length === 0)) ||
                    ((state.datasetsSelected[i].models[j].hyperparametersTuning === "exhaustivesearch" || state.datasetsSelected[i].models[j].hyperparametersTuning === "randomsearch") && state.datasetsSelected[i].models[j].method === 'ml' && state.datasetsSelected[i].models[j].algorithm === 'sgd' && (state.datasetsSelected[i].models[j].hyperparameters.penalty.length === 0)) ||
                    ((state.datasetsSelected[i].models[j].hyperparametersTuning === "exhaustivesearch" || state.datasetsSelected[i].models[j].hyperparametersTuning === "randomsearch") && state.datasetsSelected[i].models[j].method === 'ml' && state.datasetsSelected[i].models[j].algorithm === 'sgd' && (state.datasetsSelected[i].models[j].hyperparameters.learning_rate.length === 0)) ||
                    ((state.datasetsSelected[i].models[j].hyperparametersTuning === "exhaustivesearch" || state.datasetsSelected[i].models[j].hyperparametersTuning === "randomsearch") && state.datasetsSelected[i].models[j].method === 'ml' && state.datasetsSelected[i].models[j].algorithm === 'sgd' && (state.datasetsSelected[i].models[j].hyperparameters.alpha === '' || !state.datasetsSelected[i].models[j].hyperparameters.alpha.split(',').every(el => {
                        return !isNaN(parseFloat(el.trim()))
                    }))) ||
                    ((state.datasetsSelected[i].models[j].hyperparametersTuning === "exhaustivesearch" || state.datasetsSelected[i].models[j].hyperparametersTuning === "randomsearch") && state.datasetsSelected[i].models[j].method === 'ml' && state.datasetsSelected[i].models[j].algorithm === 'dt' && (state.datasetsSelected[i].models[j].hyperparameters.max_depth === '' || !state.datasetsSelected[i].models[j].hyperparameters.max_depth.split(',').every(el => {
                        return !isNaN(parseInt(el.trim(), 10)) || el === "None"
                    }))) ||
                    ((state.datasetsSelected[i].models[j].hyperparametersTuning === "exhaustivesearch" || state.datasetsSelected[i].models[j].hyperparametersTuning === "randomsearch") && state.datasetsSelected[i].models[j].method === 'ml' && state.datasetsSelected[i].models[j].algorithm === 'dt' && (state.datasetsSelected[i].models[j].hyperparameters.min_samples_split === '' || state.datasetsSelected[i].models[j].hyperparameters.min_samples_split.split(',').map((number) => parseInt(number.trim(), 10)).find(el => isNaN(el)) !== undefined)) ||
                    ((state.datasetsSelected[i].models[j].hyperparametersTuning === "exhaustivesearch" || state.datasetsSelected[i].models[j].hyperparametersTuning === "randomsearch") && state.datasetsSelected[i].models[j].method === 'ml' && state.datasetsSelected[i].models[j].algorithm === 'rf' && (state.datasetsSelected[i].models[j].hyperparameters.n_estimators === '' || !state.datasetsSelected[i].models[j].hyperparameters.n_estimators.split(',').every(el => {
                        return !isNaN(parseInt(el.trim(), 10))
                    }))) ||
                    ((state.datasetsSelected[i].models[j].hyperparametersTuning === "exhaustivesearch" || state.datasetsSelected[i].models[j].hyperparametersTuning === "randomsearch") && state.datasetsSelected[i].models[j].method === 'ml' && state.datasetsSelected[i].models[j].algorithm === 'rf' && (state.datasetsSelected[i].models[j].hyperparameters.min_samples_split === '' || !state.datasetsSelected[i].models[j].hyperparameters.min_samples_split.split(',').every(el => {
                        return !isNaN(parseInt(el.trim(), 10))
                    }))) ||
                    ((state.datasetsSelected[i].models[j].hyperparametersTuning === "exhaustivesearch" || state.datasetsSelected[i].models[j].hyperparametersTuning === "randomsearch") && state.datasetsSelected[i].models[j].method === 'ml' && state.datasetsSelected[i].models[j].algorithm === 'rf' && (state.datasetsSelected[i].models[j].hyperparameters.max_depth === '' || !state.datasetsSelected[i].models[j].hyperparameters.max_depth.split(',').every(el => {
                        return !isNaN(parseInt(el.trim(), 10)) || el === "None"
                    }))) ||
                    ((state.datasetsSelected[i].models[j].hyperparametersTuning === "exhaustivesearch" || state.datasetsSelected[i].models[j].hyperparametersTuning === "randomsearch") && state.datasetsSelected[i].models[j].method === 'ml' && state.datasetsSelected[i].models[j].algorithm === 'lof' && (state.datasetsSelected[i].models[j].hyperparameters.lof_n_neighbors === '' || !state.datasetsSelected[i].models[j].hyperparameters.lof_n_neighbors.split(',').every(el => {
                        return !isNaN(parseInt(el.trim(), 10))
                    }) || !state.datasetsSelected[i].models[j].hyperparameters.lof_contamination.split(',').every(el => {
                        return !isNaN(parseFloat(el.trim()))
                    }))) ||

                    ((state.datasetsSelected[i].models[j].hyperparametersTuning === "exhaustivesearch" || state.datasetsSelected[i].models[j].hyperparametersTuning === "randomsearch") && state.datasetsSelected[i].models[j].method === 'ml' && state.datasetsSelected[i].models[j].algorithm === 'ocsvm' && (state.datasetsSelected[i].models[j].hyperparameters.kernel.length === 0 || !state.datasetsSelected[i].models[j].hyperparameters.gamma.split(',').every(el => {
                        return !isNaN(parseFloat(el.trim())) || el === "auto" || el === "scale"
                    })|| !state.datasetsSelected[i].models[j].hyperparameters.nu.split(',').every(el => {
                        return !isNaN(parseFloat(el.trim()))
                    }))) ||

                    ((state.datasetsSelected[i].models[j].hyperparametersTuning === "exhaustivesearch" || state.datasetsSelected[i].models[j].hyperparametersTuning === "randomsearch") && state.datasetsSelected[i].models[j].method === 'ml' && state.datasetsSelected[i].models[j].algorithm === 'if' && (state.datasetsSelected[i].models[j].hyperparameters.n_estimators === '' || !state.datasetsSelected[i].models[j].hyperparameters.n_estimators.split(',').every(el => {
                        return !isNaN(parseInt(el.trim(), 10))
                    }) || !state.datasetsSelected[i].models[j].hyperparameters.if_contamination.split(',').every(el => {
                        return !isNaN(parseFloat(el.trim()))
                    })))


                )
                    return true


                if (state.datasetsSelected[i].models[j].method === 'dl') {
                    for (let k = 0; k < state.datasetsSelected[i].models[j].algorithm.layers.length; k++) {
                        if (
                            state.datasetsSelected[i].models[j].algorithm.layers[k].name === "" ||
                            (state.datasetsSelected[i].models[j].algorithm.layers[k].name === "input" && state.datasetsSelected[i].models[j].algorithm.layers[k].layer.shape === "") ||
                            (state.datasetsSelected[i].models[j].algorithm.layers[k].name === "dense" && state.datasetsSelected[i].models[j].algorithm.layers[k].layer.units === "") ||
                            (state.datasetsSelected[i].models[j].algorithm.layers[k].name === "dense" && state.datasetsSelected[i].models[j].algorithm.layers[k].layer.units < 0) ||
                            (state.datasetsSelected[i].models[j].algorithm.layers[k].name === "dense" && state.datasetsSelected[i].models[j].algorithm.layers[k].layer.activation === "") ||
                            (state.datasetsSelected[i].models[j].algorithm.layers[k].name === "lstm" && state.datasetsSelected[i].models[j].algorithm.layers[k].layer.units === "") ||
                            (state.datasetsSelected[i].models[j].algorithm.layers[k].name === "lstm" && state.datasetsSelected[i].models[j].algorithm.layers[k].layer.units < 0) ||
                            (state.datasetsSelected[i].models[j].algorithm.layers[k].name === "lstm" && state.datasetsSelected[i].models[j].algorithm.layers[k].layer.activation === "") ||
                            (state.datasetsSelected[i].models[j].algorithm.layers[k].name === "lstm" && state.datasetsSelected[i].models[j].algorithm.layers[k].layer.return_sequences === "") ||
                            (state.datasetsSelected[i].models[j].algorithm.layers[k].name === "gru" && state.datasetsSelected[i].models[j].algorithm.layers[k].layer.units === "") ||
                            (state.datasetsSelected[i].models[j].algorithm.layers[k].name === "gru" && state.datasetsSelected[i].models[j].algorithm.layers[k].layer.units < 0) ||
                            (state.datasetsSelected[i].models[j].algorithm.layers[k].name === "gru" && state.datasetsSelected[i].models[j].algorithm.layers[k].layer.activation === "") ||
                            (state.datasetsSelected[i].models[j].algorithm.layers[k].name === "gru" && state.datasetsSelected[i].models[j].algorithm.layers[k].layer.return_sequences === "") ||
                            (state.datasetsSelected[i].models[j].algorithm.layers[k].name === "repeat_vector" && state.datasetsSelected[i].models[j].algorithm.layers[k].layer.n === "") ||
                            (state.datasetsSelected[i].models[j].algorithm.layers[k].name === "repeat_vector" && state.datasetsSelected[i].models[j].algorithm.layers[k].layer.n < 0) ||
                            (state.datasetsSelected[i].models[j].algorithm.layers[k].name === "conv_1D" && state.datasetsSelected[i].models[j].algorithm.layers[k].layer.filters === "") ||
                            (state.datasetsSelected[i].models[j].algorithm.layers[k].name === "conv_1D" && state.datasetsSelected[i].models[j].algorithm.layers[k].layer.filters < 0) ||
                            (state.datasetsSelected[i].models[j].algorithm.layers[k].name === "conv_1D" && state.datasetsSelected[i].models[j].algorithm.layers[k].layer.activation === "") ||
                            (state.datasetsSelected[i].models[j].algorithm.layers[k].name === "conv_1D" && state.datasetsSelected[i].models[j].algorithm.layers[k].layer.kernel_size === "") ||
                            (state.datasetsSelected[i].models[j].algorithm.layers[k].name === "conv_1D" && state.datasetsSelected[i].models[j].algorithm.layers[k].layer.kernel_size < 0) ||
                            (state.datasetsSelected[i].models[j].algorithm.layers[k].name === "dropout" && state.datasetsSelected[i].models[j].algorithm.layers[k].layer.rate < 0) ||
                            (state.datasetsSelected[i].models[j].algorithm.layers[k].name === "dropout" && state.datasetsSelected[i].models[j].algorithm.layers[k].layer.rate === "") ||
                            (state.datasetsSelected[i].models[j].algorithm.layers[k].name === "max_pooling_1D" && state.datasetsSelected[i].models[j].algorithm.layers[k].layer.pool_size < 0) ||
                            (state.datasetsSelected[i].models[j].algorithm.layers[k].name === "max_pooling_1D" && state.datasetsSelected[i].models[j].algorithm.layers[k].layer.pool_size === "")


                        )
                            return true

                    }
                }


            }
        }
        return false

    }

    const handleChangeModelDLHyperparameters = (e, indexDataset, indexModel, hyperparameter) => {
        let list = [...state.datasetsSelected]
        list[indexDataset].models[indexModel].algorithm[hyperparameter] = e.target.value

        setState({
            ...state,
            datasetsSelected: list
        })

    }
    const handleClickCreateModels = () => {
        setState({
            ...state, loadingCreation: true
        })

        const request = {models: []}

        for (let i = 0; i < state.datasetsSelected.length; i++) {
            for (let j = 0; j < state.datasetsSelected[i].models.length; j++) {

                let algorithm = {}


                switch (state.datasetsSelected[i].models[j].algorithm) {
                    case 'gnb':
                        break
                    case 'knn':
                        if (state.datasetsSelected[i].models[j].hyperparametersTuning === "manual")
                            algorithm.knn_n_neighbors = state.datasetsSelected[i].models[j].hyperparameters.knn_n_neighbors
                        else
                            algorithm.search_knn_n_neighbors = state.datasetsSelected[i].models[j].hyperparameters.knn_n_neighbors.split(',').map((number) => parseInt(number.trim(), 10));
                        break;
                    case 'svm':
                        if (state.datasetsSelected[i].models[j].hyperparametersTuning === "manual") {
                            algorithm.svm_C = state.datasetsSelected[i].models[j].hyperparameters.C
                            algorithm.svm_kernel = state.datasetsSelected[i].models[j].hyperparameters.kernel
                            algorithm.svm_gamma = state.datasetsSelected[i].models[j].hyperparameters.gamma
                        } else {
                            algorithm.search_svm_C = state.datasetsSelected[i].models[j].hyperparameters.C.split(',').map((number) => parseFloat(number.trim()))
                            algorithm.search_svm_kernel = state.datasetsSelected[i].models[j].hyperparameters.kernel
                            algorithm.search_svm_gamma = state.datasetsSelected[i].models[j].hyperparameters.gamma.split('')
                        }


                        break;
                    case 'sgd':
                        if (state.datasetsSelected[i].models[j].hyperparametersTuning === "manual") {
                            algorithm.sgd_loss = state.datasetsSelected[i].models[j].hyperparameters.loss
                            algorithm.sgd_penalty = state.datasetsSelected[i].models[j].hyperparameters.penalty
                            algorithm.sgd_alpha = state.datasetsSelected[i].models[j].hyperparameters.alpha
                            algorithm.sgd_learning_rate = state.datasetsSelected[i].models[j].hyperparameters.learning_rate
                        } else {
                            algorithm.search_sgd_loss = state.datasetsSelected[i].models[j].hyperparameters.loss
                            algorithm.search_sgd_penalty = state.datasetsSelected[i].models[j].hyperparameters.penalty
                            algorithm.search_sgd_alpha = state.datasetsSelected[i].models[j].hyperparameters.alpha.split(',').map((number) => parseFloat(number.trim()))
                            algorithm.search_sgd_learning_rate = state.datasetsSelected[i].models[j].hyperparameters.learning_rate
                        }


                        break;
                    case 'dt':
                        if (state.datasetsSelected[i].models[j].hyperparametersTuning === "manual") {
                            algorithm.dt_max_depth = state.datasetsSelected[i].models[j].hyperparameters.max_depth
                            algorithm.dt_min_samples_split = state.datasetsSelected[i].models[j].hyperparameters.min_samples_split
                        } else {
                            algorithm.search_dt_max_depth = state.datasetsSelected[i].models[j].hyperparameters.max_depth.split(',')
                            algorithm.search_dt_min_samples_split = state.datasetsSelected[i].models[j].hyperparameters.min_samples_split.split(',').map((number) => parseInt(number.trim(), 10));
                        }


                        break;
                    case 'rf':
                        if (state.datasetsSelected[i].models[j].hyperparametersTuning === "manual") {
                            algorithm.rf_n_estimators = state.datasetsSelected[i].models[j].hyperparameters.n_estimators
                            algorithm.rf_max_depth = state.datasetsSelected[i].models[j].hyperparameters.max_depth
                            algorithm.rf_min_samples_split = state.datasetsSelected[i].models[j].hyperparameters.min_samples_split
                        } else {
                            algorithm.search_rf_n_estimators = state.datasetsSelected[i].models[j].hyperparameters.n_estimators.split(',').map((number) => parseInt(number.trim(), 10));
                            algorithm.search_rf_max_depth = state.datasetsSelected[i].models[j].hyperparameters.max_depth.split(',')
                            algorithm.search_rf_min_samples_split = state.datasetsSelected[i].models[j].hyperparameters.min_samples_split.split(',').map((number) => parseInt(number.trim(), 10));
                        }

                        break;
                    case 'lof':
                        if (state.datasetsSelected[i].models[j].hyperparametersTuning === "manual") {
                            algorithm.lof_n_neighbors = state.datasetsSelected[i].models[j].hyperparameters.lof_n_neighbors
                            algorithm.lof_contamination = state.datasetsSelected[i].models[j].hyperparameters.lof_contamination
                        } else {
                            algorithm.search_lof_n_neighbors = state.datasetsSelected[i].models[j].hyperparameters.lof_n_neighbors.split(',').map((number) => parseInt(number.trim(), 10));
                            algorithm.search_lof_contamination = state.datasetsSelected[i].models[j].hyperparameters.lof_contamination.split(',').map(number => parseFloat(number.trim()))


                        }


                        break;
                    case 'ocsvm':
                        if (state.datasetsSelected[i].models[j].hyperparametersTuning === "manual") {
                            algorithm.ocsvm_kernel = state.datasetsSelected[i].models[j].hyperparameters.kernel
                            algorithm.ocsvm_gamma = state.datasetsSelected[i].models[j].hyperparameters.gamma
                            algorithm.ocsvm_nu = state.datasetsSelected[i].models[j].hyperparameters.nu


                        } else {
                            algorithm.search_ocsvm_kernel = state.datasetsSelected[i].models[j].hyperparameters.kernel
                            algorithm.search_ocsvm_gamma = state.datasetsSelected[i].models[j].hyperparameters.gamma.split(',')
                            algorithm.search_ocsvm_nu = state.datasetsSelected[i].models[j].hyperparameters.nu.split(",").map((number) => parseFloat(number.trim()))


                        }
                        break;
                    case 'if':
                        if (state.datasetsSelected[i].models[j].hyperparametersTuning === "manual") {
                            algorithm.if_n_estimators = state.datasetsSelected[i].models[j].hyperparameters.n_estimators
                            algorithm.if_contamination = state.datasetsSelected[i].models[j].hyperparameters.if_contamination

                        } else {
                            algorithm.search_if_n_estimators = state.datasetsSelected[i].models[j].hyperparameters.n_estimators.split(',').map((number) => parseInt(number.trim(), 10));
                            algorithm.search_if_contamination = state.datasetsSelected[i].models[j].hyperparameters.if_contamination.split(',').map(number => parseFloat(number.trim()))

                        }

                        break;
                    default:
                        algorithm = {...state.datasetsSelected[i].models[j].algorithm}
                        if (state.datasetsSelected[i].models[j].hyperparametersTuning !== "manual") {

                            algorithm.epochs = algorithm.epochs.split(",").map((number) => parseInt(number.trim(), 10))
                            algorithm.learning_rates = algorithm.learning_rates.split(",").map((number) => parseFloat(number.trim()))
                            algorithm.batch_sizes = algorithm.batch_sizes.split(",").map((number) => parseFloat(number.trim()))
                            algorithm.thresholds = algorithm.thresholds.split(",").map((number) => parseFloat(number.trim()))


                        }


                }
                request.models.push({
                    dataset_id: state.datasetsSelected[i].id,
                    device_mender_id: state.datasetsSelected[i].device,
                    monitoring_script_name: state.datasetsSelected[i].monitoringScriptName,
                    algorithm: algorithm,
                    hyperparameters_tuning: state.datasetsSelected[i].models[j].hyperparametersTuning,
                    folds: state.datasetsSelected[i].models[j].hyperparameters_tuning !== "manual" ? state.datasetsSelected[i].models[j].folds : 0,
                    iterations: state.datasetsSelected[i].models[j].hyperparametersTuning === "randomsearch" ? state.datasetsSelected[i].models[j].iterations : 0,
                    labels: state.datasetsSelected[i].models[j].labels,
                    type: state.datasetsSelected[i].models[j].type,
                    method: state.datasetsSelected[i].models[j].method,
                    evaluation_metric: state.datasetsSelected[i].models[j].evaluationMetric

                })


            }
        }

        createModels(request)
            .then(() => {
                navigate('/models')
            })
            .catch(() => {
                setState({...state, loadingCreation: false})
            })


    }

    const handleChangeLayerName = (e, indexDataset, indexModel, indexLayer) => {
        let list = [...state.datasetsSelected]
        const new_obj = {}

        switch (e.target.value) {
            case 'input':
                new_obj.shape = ""
                break
            case 'dense':
                new_obj.units = 0
                new_obj.activation = ""
                break
            case 'lstm':
                new_obj.units = 0
                new_obj.activation = ""
                new_obj.return_sequences = ""

                break
            case 'gru':
                new_obj.units = 0
                new_obj.activation = ""
                new_obj.return_sequences = ""
                break
            case 'repeat_vector':
                new_obj.n = 0
                break
            case 'conv_1D':
                new_obj.filters = 0
                new_obj.activation = ""
                new_obj.kernel_size = ""
                break
            case 'max_pooling_1D':
                new_obj.pool_size = ""
                break
            case 'flatten':
                break
        }


        list[indexDataset].models[indexModel].algorithm.layers[indexLayer].name = e.target.value
        list[indexDataset].models[indexModel].algorithm.layers[indexLayer].layer = new_obj

        setState({
            ...state,
            datasetsSelected: list
        })
    }

    const handleRemoveLayer = (indexDataset, indexModel, indexLayer) => {
        let list = [...state.datasetsSelected]
        list[indexDataset].models[indexModel].algorithm.layers.splice(indexLayer, 1)
        setState({
            ...state,
            datasetsSelected: list
        })
    }

    const handleChangeFormDL = (e, indexDataset, indexModel, indexLayer, hyperparameter) => {

        if (!e.target.value.includes(' ')) {
            let list = [...state.datasetsSelected]

            list[indexDataset].models[indexModel].algorithm.layers[indexLayer].layer[hyperparameter] = e.target.value

            setState({
                ...state, datasetsSelected: list
            })
        }

    }

    const handleAddLayer = (indexDataset, indexModel) => {
        let list = [...state.datasetsSelected]
        list[indexDataset].models[indexModel].algorithm.layers.push({
            name: "",
            layer: {}
        })
        setState({
            ...state,
            datasetsSelected: list
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
                    <CircularProgress
                        sx={{color: 'white'}}/> : 'Sorry, no datasets found with feature extraction applied.'
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
            name: "used_for",
            label: "Used for",
            options: {
                filter: true,
                sort: false,

            }
        },
        {
            name: "scenario_name",
            label: "Scenario",
            options: {
                filter: true,
                sort: false,
            }
        },
        {
            name: "device_mender_id",
            label: "Device",
            options: {
                filter: true,
                sort: false,

            }
        },
        {
            name: "monitoring_script_name",
            label: "Monitoring Script",
            options: {
                filter: true,
                sort: false,

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
                        <IconButton disabled={state.loadingCreation}
                                    onClick={() => handleClickAddDataset(dataIndex)}>
                            <AddIcon sx={{fontSize: '5vh'}}/>
                        </IconButton>
                    )
                }
            }
        },
    ]
    return (
        <Grid container spacing={2}>
            <Grid item xs={12} sx={{mb: 5}}>
                <Table title={"Datasets"} columns={columns} data={state.allDatasets}
                       options={options}/>
            </Grid>
            {
                state.datasetsSelected.map((dataset, datasetIndex) => (
                    <Grid key={datasetIndex} item xs={12}>
                        <Card elevation={6} variant="elevation" sx={{
                            borderRadius: '28px',
                            backgroundColor: '#555555 !important',
                        }}>
                            <CardContent sx={{color: 'white', padding: '16px 12px 16px 12px'}}>
                                <Typography sx={{fontWeight: 'bold'}} variant="h7" component="div">
                                    Dataset: {dataset.datasetName}
                                </Typography>
                                <hr/>
                                <Grid item xs={12}>
                                    {
                                        dataset.models.map((model, indexModel) => (
                                                <Grid key={indexModel} container alignItems="center" spacing={1}
                                                      sx={{mt: '10px'}}>
                                                    <Grid item xs={12}>
                                                        <Stack direction="row" spacing={0} alignItems="center">
                                                            <span>Model {indexModel + 1}</span>
                                                            {
                                                                indexModel !== 0 &&
                                                                <IconButton
                                                                    onClick={() => handleDeleteModel(datasetIndex, indexModel)}>
                                                                    <RemoveIcon sx={{color: 'white'}}/>
                                                                </IconButton>
                                                            }


                                                        </Stack>
                                                    </Grid>
                                                    <Grid item xs={2}>
                                                        <TextFieldStyled
                                                            name="count"
                                                            InputLabelProps={{shrink: true}}
                                                            label="Type"
                                                            value={model.type}
                                                            size="small"
                                                            fullWidth
                                                            InputProps={{
                                                                readOnly: true
                                                            }}
                                                            variant="filled"

                                                        />
                                                    </Grid>

                                                    {
                                                        model.type !== '' &&
                                                        <Grid item xs={2}>
                                                            <FormControl variant="filled" fullWidth>
                                                                <InputLabel id="demo-simple-select-label"
                                                                            sx={{color: 'white'}}>Method</InputLabel>
                                                                <Select
                                                                    size="small"
                                                                    value={model.method}
                                                                    onChange={(e) => handleChangeMethod(e, datasetIndex, indexModel)}
                                                                    label="Method"
                                                                    disabled={state.loadingCreation}
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
                                                                    <MenuItem value={'ml'}>Machine learning</MenuItem>
                                                                    <MenuItem value={'dl'}>Deep learning</MenuItem>


                                                                </Select>
                                                            </FormControl>
                                                        </Grid>

                                                    }
                                                    {
                                                        model.type === "Anomaly Detection" && model.method === "dl" &&
                                                        <Grid item xs={1}>
                                                            <Tooltip title={"Only autoencoder available"} placement="top"
                                                                     arrow>
                                                                <IconButton disableRipple={true}>
                                                                    <InfoIcon/>
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Grid>
                                                    }
                                                    <Grid item xs={2}>

                                                        <FormControl variant="filled" fullWidth>
                                                            <InputLabel id="demo-simple-select-label"
                                                                        sx={{color: 'white'}}>Hyperarameters
                                                                Tuning</InputLabel>
                                                            <Select
                                                                size="small"
                                                                onChange={(e) => handleChangeHyperparametersTuning(e, datasetIndex, indexModel)}
                                                                value={model.hyperparametersTuning}
                                                                label="Parameters"
                                                                disabled={state.loadingCreation}
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

                                                                <MenuItem value={'manual'}>Manual</MenuItem>

                                                                <MenuItem value={'exhaustivesearch'}>Exhaustive
                                                                    Search</MenuItem>
                                                                <MenuItem value={'randomsearch'}>Random
                                                                    Search</MenuItem>


                                                            </Select>
                                                        </FormControl>


                                                    </Grid>

                                                    {
                                                        model.type === "Classifier" && model.hyperparametersTuning === "manual" &&
                                                        <Grid item xs={6}/>
                                                    }


                                                    {
                                                        model.type === "Classifier" && model.hyperparametersTuning !== "manual" &&

                                                        <Grid item xs={2}>
                                                            <TextFieldStyled
                                                                variant="filled"
                                                                fullWidth
                                                                size="small"
                                                                name="n"
                                                                type="number"
                                                                onChange={(e) => handleChangeFolds(e, datasetIndex, indexModel)}


                                                                label="Folds"
                                                                placeholder=""
                                                                value={model.folds}

                                                                InputLabelProps={{
                                                                    shrink: true,
                                                                }}
                                                                InputProps={{
                                                                    min: 0,
                                                                    inputMode: 'numeric', pattern: '+[0-9]*',


                                                                }}
                                                            />

                                                        </Grid>
                                                    }
                                                    {
                                                        model.type === "Classifier" && model.hyperparametersTuning === "exhaustivesearch" &&
                                                        <Grid item xs={4}/>
                                                    }

                                                    {
                                                        model.hyperparametersTuning === "randomsearch" &&

                                                        <Grid item xs={2}>
                                                            <TextFieldStyled
                                                                variant="filled"
                                                                fullWidth
                                                                size="small"
                                                                name="n"
                                                                type="number"
                                                                onChange={(e) => handleChangeIterations(e, datasetIndex, indexModel)}


                                                                label="Iterations"
                                                                placeholder=""
                                                                value={model.iterations}

                                                                InputLabelProps={{
                                                                    shrink: true,
                                                                }}
                                                                InputProps={{
                                                                    min: 0,
                                                                    inputMode: 'numeric', pattern: '+[0-9]*',


                                                                }}
                                                            />

                                                        </Grid>
                                                    }
                                                    {
                                                        model.type === "Anomaly Detection" && model.method === "ml" && (model.hyperparametersTuning === "exhaustivesearch" || model.hyperparametersTuning === "randomsearch") &&


                                                        <Grid item xs={2}>

                                                            <FormControl variant="filled" fullWidth>
                                                                <InputLabel id="demo-simple-select-label"
                                                                            sx={{color: 'white'}}>Evaluation
                                                                    Metric</InputLabel>
                                                                <Select
                                                                    size="small"
                                                                    onChange={(e) => handleChangeEvaluationMetric(e, datasetIndex, indexModel)}
                                                                    value={model.evaluationMetric}
                                                                    label="Parameters"
                                                                    disabled={state.loadingCreation}
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


                                                                    <MenuItem value={'AUC'}>AUC scores</MenuItem>
                                                                    <MenuItem value={'average'}>TNR and TPR
                                                                        average</MenuItem>


                                                                </Select>
                                                            </FormControl>


                                                        </Grid>
                                                    }
                                                    {
                                                        model.type === "Anomaly Detection" && (model.hyperparametersTuning === "exhaustivesearch" || model.hyperparametersTuning === "manual") &&
                                                        <Grid item xs={3}/>
                                                    }
                                                    {
                                                        model.type === "Anomaly Detection" && model.hyperparametersTuning === "randomsearch" &&
                                                        <Grid item xs={2}/>
                                                    }

                                                    {
                                                        model.type !== '' && model.method === 'ml' && model.hyperparametersTuning === "manual" &&
                                                        <Grid item xs={4}>
                                                            <FormControl variant="filled" fullWidth>
                                                                <InputLabel id="demo-simple-select-label"
                                                                            sx={{color: 'white'}}>Algorithm</InputLabel>
                                                                <Select
                                                                    size="small"
                                                                    disabled={state.loadingCreation}
                                                                    value={model.algorithm}
                                                                    onChange={(e) => handleChangeAlgorithmManualParameters(e, datasetIndex, indexModel)}
                                                                    label="Plot"
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
                                                                    {
                                                                        model.type === 'Classifier' ? (
                                                                                [
                                                                                    <MenuItem key={0} value={'gnb'}>Gaussian
                                                                                        Naive Bayes
                                                                                        (GNB)</MenuItem>,
                                                                                    <MenuItem key={1} value={'knn'}>K-Nearest
                                                                                        Neighbors
                                                                                        (KNN)</MenuItem>,
                                                                                    <MenuItem key={2} value={'svm'}>Support
                                                                                        Vector
                                                                                        Machine
                                                                                        (SVM)</MenuItem>,
                                                                                    <MenuItem key={4} value={'sgd'}>Stochastic
                                                                                        Gradient
                                                                                        Descent (SGD)</MenuItem>,
                                                                                    <MenuItem key={5} value={'dt'}>Decision
                                                                                        tree
                                                                                        learning</MenuItem>,
                                                                                    <MenuItem key={6} value={'rf'}>Random
                                                                                        Forest
                                                                                        (RF)</MenuItem>


                                                                                ])
                                                                            :
                                                                            (
                                                                                [
                                                                                    <MenuItem key={7} value={'lof'}>Local
                                                                                        Outlier
                                                                                        Factor
                                                                                        (LOF)</MenuItem>,
                                                                                    <MenuItem key={8} value={'ocsvm'}>One
                                                                                        Class
                                                                                        Support
                                                                                        Vector Machine
                                                                                        (OCSVM)</MenuItem>,
                                                                                    <MenuItem key={9} value={'if'}>Isolation
                                                                                        Forest
                                                                                        (IF)</MenuItem>
                                                                                ]
                                                                            )


                                                                    }


                                                                </Select>
                                                            </FormControl>
                                                        </Grid>
                                                    }

                                                    {
                                                        model.type !== '' && model.method === 'ml' && model.hyperparametersTuning !== "manual" &&
                                                        <Grid item xs={4}>
                                                            <FormControl variant="filled" fullWidth>
                                                                <InputLabel id="demo-simple-select-label"
                                                                            sx={{color: 'white'}}>Algorithm</InputLabel>
                                                                <Select
                                                                    size="small"
                                                                    disabled={state.loadingCreation}
                                                                    value={model.algorithm}
                                                                    onChange={(e) => handleChangeAlgorithmParametersTuning(e, datasetIndex, indexModel)}
                                                                    label="Plot"
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
                                                                    {
                                                                        model.type === 'Classifier' ? (
                                                                                [

                                                                                    <MenuItem key={1} value={'knn'}>K-Nearest
                                                                                        Neighbors
                                                                                        (KNN)</MenuItem>,
                                                                                    <MenuItem key={2} value={'svm'}>Support
                                                                                        Vector
                                                                                        Machine
                                                                                        (SVM)</MenuItem>,
                                                                                    <MenuItem key={4} value={'sgd'}>Stochastic
                                                                                        Gradient
                                                                                        Descent (SGD)</MenuItem>,
                                                                                    <MenuItem key={5} value={'dt'}>Decision
                                                                                        tree
                                                                                        learning</MenuItem>,
                                                                                    <MenuItem key={6} value={'rf'}>Random
                                                                                        Forest
                                                                                        (RF)</MenuItem>


                                                                                ])
                                                                            :
                                                                            (
                                                                                [
                                                                                    <MenuItem key={7} value={'lof'}>Local
                                                                                        Outlier
                                                                                        Factor
                                                                                        (LOF)</MenuItem>,
                                                                                    <MenuItem key={8} value={'ocsvm'}>One
                                                                                        Class
                                                                                        Support
                                                                                        Vector Machine
                                                                                        (OCSVM)</MenuItem>,
                                                                                    <MenuItem key={9} value={'if'}>Isolation
                                                                                        Forest
                                                                                        (IF)</MenuItem>
                                                                                ]
                                                                            )


                                                                    }


                                                                </Select>
                                                            </FormControl>
                                                        </Grid>
                                                    }


                                                    {
                                                        model.method === 'ml' && model.algorithm === 'knn' && model.hyperparametersTuning === "manual" &&
                                                        <Grid item xs={3}>
                                                            <TextFieldStyled
                                                                variant="filled"
                                                                disabled={state.loadingCreation}
                                                                fullWidth
                                                                size="small"
                                                                name="n"
                                                                type="number"
                                                                onChange={(e) => handleChangeForm(e, datasetIndex, indexModel, 'knn_n_neighbors')}
                                                                label="Number of neighbors"
                                                                placeholder=""
                                                                value={model.hyperparameters.knn_n_neighbors}

                                                                InputLabelProps={{
                                                                    shrink: true,
                                                                }}
                                                                InputProps={{
                                                                    min: 0,
                                                                    inputMode: 'numeric', pattern: '+[0-9]*',


                                                                }}
                                                            />
                                                        </Grid>
                                                    }

                                                    {
                                                        model.method === 'ml' && model.algorithm === 'knn' && model.hyperparametersTuning !== "manual" &&
                                                        <Grid item xs={3}>
                                                            <TextFieldStyled
                                                                variant="filled"
                                                                disabled={state.loadingCreation}
                                                                fullWidth
                                                                size="small"
                                                                name="n"
                                                                onChange={(e) => handleChangeForm(e, datasetIndex, indexModel, 'knn_n_neighbors')}
                                                                label="Number of neighbors"
                                                                placeholder="Integers separated by comma"
                                                                value={model.hyperparameters.knn_n_neighbors}

                                                                InputLabelProps={{
                                                                    shrink: true,
                                                                }}

                                                            />
                                                        </Grid>
                                                    }
                                                    {
                                                        model.algorithm === 'svm' && model.hyperparametersTuning === "manual" &&
                                                        <Grid item xs={8}>
                                                            <Grid container spacing={2}>
                                                                <Grid item xs={3}>
                                                                    <TextFieldStyled
                                                                        variant="filled"
                                                                        fullWidth
                                                                        size="small"
                                                                        disabled={state.loadingCreation}
                                                                        name="n"
                                                                        type="number"
                                                                        onChange={(e) => handleChangeForm(e, datasetIndex, indexModel, 'C')}
                                                                        label="C"
                                                                        placeholder=""
                                                                        value={model.hyperparameters.C}

                                                                        InputLabelProps={{
                                                                            shrink: true,
                                                                        }}
                                                                        InputProps={{
                                                                            min: 0,
                                                                            inputMode: 'numeric', pattern: '+[0-9]*',


                                                                        }}
                                                                    />
                                                                </Grid>
                                                                <Grid item xs={3}>
                                                                    <FormControl variant="filled" fullWidth>
                                                                        <InputLabel id="demo-simple-select-label"
                                                                                    sx={{color: 'white'}}>Kernel</InputLabel>
                                                                        <Select
                                                                            size="small"
                                                                            value={model.hyperparameters.kernel}
                                                                            onChange={(e) => handleChangeForm(e, datasetIndex, indexModel, 'kernel')}
                                                                            label="Kernel"
                                                                            disabled={state.loadingCreation}
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
                                                                            <MenuItem value={'rbf'}>rbf</MenuItem>
                                                                            <MenuItem
                                                                                value={'sigmoid'}>sigmoid</MenuItem>
                                                                            <MenuItem value={'linear'}>linear</MenuItem>
                                                                            <MenuItem value={'poly'}>poly</MenuItem>

                                                                        </Select>
                                                                    </FormControl>
                                                                </Grid>
                                                                <Grid item xs={3}>
                                                                    <TextFieldStyled
                                                                        variant="filled"
                                                                        disabled={state.loadingCreation}
                                                                        fullWidth
                                                                        size="small"
                                                                        name="gamma"
                                                                        onChange={(e) => handleChangeForm(e, datasetIndex, indexModel, 'gamma')}
                                                                        label="Gamma"
                                                                        placeholder="auto, scale or float"
                                                                        value={model.hyperparameters.gamma}

                                                                        InputLabelProps={{
                                                                            shrink: true,
                                                                        }}

                                                                    />
                                                                </Grid>
                                                            </Grid>
                                                        </Grid>

                                                    }
                                                    {
                                                        model.algorithm === 'svm' && model.hyperparametersTuning !== "manual" &&
                                                        <Grid item xs={8}>
                                                            <Grid container spacing={2}>
                                                                <Grid item xs={3}>
                                                                    <TextFieldStyled
                                                                        variant="filled"
                                                                        fullWidth
                                                                        size="small"
                                                                        disabled={state.loadingCreation}
                                                                        name="n"
                                                                        onChange={(e) => handleChangeForm(e, datasetIndex, indexModel, 'C')}
                                                                        label="C"
                                                                        placeholder="Floats separated by comma"
                                                                        value={model.hyperparameters.C}

                                                                        InputLabelProps={{
                                                                            shrink: true,
                                                                        }}

                                                                    />
                                                                </Grid>
                                                                <Grid item xs={3}>
                                                                    <FormControl variant="filled" fullWidth>
                                                                        <InputLabel id="demo-simple-select-label"
                                                                                    sx={{color: 'white'}}>Kernel</InputLabel>
                                                                        <Select
                                                                            size="small"
                                                                            value={model.hyperparameters.kernel}
                                                                            onChange={(e) => handleChangeForm(e, datasetIndex, indexModel, 'kernel')}
                                                                            label="Kernel"
                                                                            disabled={state.loadingCreation}
                                                                            multiple
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
                                                                            renderValue={(selected) => (
                                                                                <Box sx={{
                                                                                    display: 'flex',
                                                                                    flexWrap: 'wrap',
                                                                                    gap: 0.5
                                                                                }}>
                                                                                    {selected.map((value) => (
                                                                                        <Chip size="small" key={value}
                                                                                              label={value}
                                                                                              sx={{color: 'white'}}/>
                                                                                    ))}
                                                                                </Box>
                                                                            )}

                                                                        >

                                                                            <MenuItem value={'rbf'}>
                                                                                <Checkbox
                                                                                    checked={model.hyperparameters.kernel.indexOf("rbf") > -1}/>
                                                                                <ListItemText primary={"rbf"}/>
                                                                            </MenuItem>
                                                                            <MenuItem value={'sigmoid'}>
                                                                                <Checkbox
                                                                                    checked={model.hyperparameters.kernel.indexOf("sigmoid") > -1}/>
                                                                                <ListItemText primary={"sigmoid"}/>
                                                                            </MenuItem>
                                                                            <MenuItem value={'linear'}>
                                                                                <Checkbox
                                                                                    checked={model.hyperparameters.kernel.indexOf("linear") > -1}/>
                                                                                <ListItemText primary={"linear"}/>
                                                                            </MenuItem>
                                                                            <MenuItem value={'poly'}>
                                                                                <Checkbox
                                                                                    checked={model.hyperparameters.kernel.indexOf("poly") > -1}/>
                                                                                <ListItemText primary={"poly"}/>
                                                                            </MenuItem>


                                                                        </Select>
                                                                    </FormControl>
                                                                </Grid>
                                                                <Grid item xs={3}>
                                                                    <TextFieldStyled
                                                                        variant="filled"
                                                                        disabled={state.loadingCreation}
                                                                        fullWidth
                                                                        size="small"
                                                                        name="gamma"
                                                                        onChange={(e) => handleChangeForm(e, datasetIndex, indexModel, 'gamma')}
                                                                        label="Gamma"
                                                                        placeholder="auto, scale or float"
                                                                        value={model.hyperparameters.gamma}

                                                                        InputLabelProps={{
                                                                            shrink: true,
                                                                        }}

                                                                    />
                                                                </Grid>
                                                            </Grid>
                                                        </Grid>

                                                    }

                                                    {
                                                        model.algorithm === 'sgd' && model.hyperparametersTuning === "manual" &&
                                                        <Grid item xs={8}>
                                                            <Grid container spacing={2}>
                                                                <Grid item xs={4}>
                                                                    <FormControl variant="filled" fullWidth>
                                                                        <InputLabel id="demo-simple-select-label"
                                                                                    sx={{color: 'white'}}>Loss</InputLabel>
                                                                        <Select
                                                                            size="small"
                                                                            value={model.hyperparameters.loss}
                                                                            onChange={(e) => handleChangeForm(e, datasetIndex, indexModel, 'loss')}
                                                                            label="Loss"
                                                                            disabled={state.loadingCreation}
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
                                                                            <MenuItem value={'hinge'}>hinge</MenuItem>
                                                                            <MenuItem
                                                                                value={'log_loss'}>log_loss</MenuItem>
                                                                            <MenuItem value={'log'}>log</MenuItem>
                                                                            <MenuItem
                                                                                value={'modified_huber'}>modified_huber</MenuItem>

                                                                            <MenuItem
                                                                                value={'squared_hinge'}>squared_hinge</MenuItem>
                                                                            <MenuItem
                                                                                value={'perceptron'}>perceptron</MenuItem>
                                                                            <MenuItem
                                                                                value={'squared_error'}>squared_error</MenuItem>
                                                                            <MenuItem value={'huber'}>huber</MenuItem>
                                                                            squared_epsilon_insensitive

                                                                            <MenuItem
                                                                                value={'epsilon_insensitive'}>epsilon_insensitive</MenuItem>
                                                                            <MenuItem
                                                                                value={'squared_epsilon_insensitive'}>squared_epsilon_insensitive</MenuItem>


                                                                        </Select>
                                                                    </FormControl>
                                                                </Grid>
                                                                <Grid item xs={2}>
                                                                    <FormControl variant="filled" fullWidth>
                                                                        <InputLabel id="demo-simple-select-label"
                                                                                    sx={{color: 'white'}}>Penalty</InputLabel>
                                                                        <Select
                                                                            size="small"
                                                                            value={model.hyperparameters.penalty}
                                                                            onChange={(e) => handleChangeForm(e, datasetIndex, indexModel, 'penalty')}
                                                                            label="Penalty"
                                                                            disabled={state.loadingCreation}
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
                                                                            <MenuItem
                                                                                value={'none'}>
                                                                                <em>None</em></MenuItem>
                                                                            <MenuItem value={'l1'}>l1</MenuItem>
                                                                            <MenuItem value={'l2'}>l2</MenuItem>
                                                                            <MenuItem
                                                                                value={'elasticnet'}>elasticnet</MenuItem>


                                                                        </Select>
                                                                    </FormControl>
                                                                </Grid>
                                                                <Grid item xs={3}>
                                                                    <TextFieldStyled
                                                                        variant="filled"
                                                                        disabled={state.loadingCreation}
                                                                        fullWidth
                                                                        size="small"
                                                                        name="alpha"
                                                                        type="number"
                                                                        onChange={(e) => handleChangeForm(e, datasetIndex, indexModel, 'alpha')}
                                                                        label="Alpha"
                                                                        placeholder=""
                                                                        value={model.hyperparameters.alpha}

                                                                        InputLabelProps={{
                                                                            shrink: true,
                                                                        }}
                                                                        InputProps={{
                                                                            min: 0,
                                                                            inputMode: 'numeric', pattern: '+[0-9]*',


                                                                        }}
                                                                    />

                                                                </Grid>
                                                                <Grid item xs={3}>
                                                                    <FormControl variant="filled" fullWidth>
                                                                        <InputLabel id="demo-simple-select-label"
                                                                                    sx={{color: 'white'}}>Learning
                                                                            rate</InputLabel>
                                                                        <Select
                                                                            size="small"
                                                                            value={model.hyperparameters.learning_rate}
                                                                            onChange={(e) => handleChangeForm(e, datasetIndex, indexModel, 'learning_rate')}
                                                                            label="Learning rate"
                                                                            sx={{color: 'white'}}
                                                                            disabled={state.loadingCreation}

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

                                                                            <MenuItem
                                                                                value={'constant'}>constant</MenuItem>
                                                                            <MenuItem
                                                                                value={'optimal'}>optimal</MenuItem>
                                                                            <MenuItem
                                                                                value={'invscaling'}>invscaling</MenuItem>
                                                                            <MenuItem
                                                                                value={'adaptive'}>adaptive</MenuItem>


                                                                        </Select>
                                                                    </FormControl>
                                                                </Grid>

                                                            </Grid>
                                                        </Grid>
                                                    }
                                                    {
                                                        model.algorithm === 'sgd' && model.hyperparametersTuning !== "manual" &&
                                                        <Grid item xs={8}>
                                                            <Grid container spacing={2}>
                                                                <Grid item xs={4}>
                                                                    <FormControl variant="filled" fullWidth>
                                                                        <InputLabel id="demo-simple-select-label"
                                                                                    sx={{color: 'white'}}>Loss</InputLabel>
                                                                        <Select
                                                                            size="small"
                                                                            value={model.hyperparameters.loss}
                                                                            onChange={(e) => handleChangeForm(e, datasetIndex, indexModel, 'loss')}
                                                                            label="Loss"
                                                                            disabled={state.loadingCreation}
                                                                            sx={{color: 'white'}}
                                                                            multiple
                                                                            renderValue={(selected) => (
                                                                                <Box sx={{
                                                                                    display: 'flex',
                                                                                    flexWrap: 'wrap',
                                                                                    gap: 0.5
                                                                                }}>
                                                                                    {selected.map((value) => (
                                                                                        <Chip size="small" key={value}
                                                                                              label={value}
                                                                                              sx={{color: 'white'}}/>
                                                                                    ))}
                                                                                </Box>
                                                                            )}

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

                                                                            <MenuItem value={'hinge'}>
                                                                                <Checkbox
                                                                                    checked={model.hyperparameters.loss.indexOf("hinge") > -1}/>
                                                                                <ListItemText primary={"hinge"}/>
                                                                            </MenuItem>
                                                                            <MenuItem value={'log_loss'}>
                                                                                <Checkbox
                                                                                    checked={model.hyperparameters.loss.indexOf("log_loss") > -1}/>
                                                                                <ListItemText primary={"log_loss"}/>
                                                                            </MenuItem>
                                                                            <MenuItem value={'log'}>
                                                                                <Checkbox
                                                                                    checked={model.hyperparameters.loss.indexOf("log") > -1}/>
                                                                                <ListItemText primary={"log"}/>
                                                                            </MenuItem>

                                                                            <MenuItem value={'modified_huber'}>
                                                                                <Checkbox
                                                                                    checked={model.hyperparameters.loss.indexOf("modified_huber") > -1}/>
                                                                                <ListItemText
                                                                                    primary={"modified_huber"}/>
                                                                            </MenuItem>
                                                                            <MenuItem value={'squared_hinge'}>
                                                                                <Checkbox
                                                                                    checked={model.hyperparameters.loss.indexOf("squared_hinge") > -1}/>
                                                                                <ListItemText
                                                                                    primary={"squared_hinge"}/>
                                                                            </MenuItem>
                                                                            <MenuItem value={'perceptron'}>
                                                                                <Checkbox
                                                                                    checked={model.hyperparameters.loss.indexOf("perceptron") > -1}/>
                                                                                <ListItemText primary={"perceptron"}/>
                                                                            </MenuItem>
                                                                            <MenuItem value={'squared_error'}>
                                                                                <Checkbox
                                                                                    checked={model.hyperparameters.loss.indexOf("squared_error") > -1}/>
                                                                                <ListItemText
                                                                                    primary={"squared_error"}/>
                                                                            </MenuItem>
                                                                            <MenuItem value={'huber'}>
                                                                                <Checkbox
                                                                                    checked={model.hyperparameters.loss.indexOf("huber") > -1}/>
                                                                                <ListItemText primary={"log_loss"}/>
                                                                            </MenuItem>
                                                                            <MenuItem
                                                                                value={'squared_epsilon_insensitive'}>
                                                                                <Checkbox
                                                                                    checked={model.hyperparameters.loss.indexOf("squared_epsilon_insensitive") > -1}/>
                                                                                <ListItemText
                                                                                    primary={"squared_epsilon_insensitive"}/>
                                                                            </MenuItem>
                                                                            <MenuItem value={'epsilon_insensitive'}>
                                                                                <Checkbox
                                                                                    checked={model.hyperparameters.loss.indexOf("epsilon_insensitive") > -1}/>
                                                                                <ListItemText
                                                                                    primary={"epsilon_insensitive"}/>
                                                                            </MenuItem>
                                                                            <MenuItem
                                                                                value={'squared_epsilon_insensitive'}>
                                                                                <Checkbox
                                                                                    checked={model.hyperparameters.loss.indexOf("squared_epsilon_insensitive") > -1}/>
                                                                                <ListItemText
                                                                                    primary={"squared_epsilon_insensitive"}/>
                                                                            </MenuItem>


                                                                        </Select>
                                                                    </FormControl>
                                                                </Grid>
                                                                <Grid item xs={2}>
                                                                    <FormControl variant="filled" fullWidth>
                                                                        <InputLabel id="demo-simple-select-label"
                                                                                    sx={{color: 'white'}}>Penalty</InputLabel>
                                                                        <Select
                                                                            size="small"
                                                                            value={model.hyperparameters.penalty}
                                                                            onChange={(e) => handleChangeForm(e, datasetIndex, indexModel, 'penalty')}
                                                                            label="Penalty"
                                                                            disabled={state.loadingCreation}
                                                                            sx={{color: 'white'}}
                                                                            multiple
                                                                            renderValue={(selected) => (
                                                                                <Box sx={{
                                                                                    display: 'flex',
                                                                                    flexWrap: 'wrap',
                                                                                    gap: 0.5
                                                                                }}>
                                                                                    {selected.map((value) => (
                                                                                        <Chip size="small" key={value}
                                                                                              label={value}
                                                                                              sx={{color: 'white'}}/>
                                                                                    ))}
                                                                                </Box>
                                                                            )}
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


                                                                            <MenuItem value={'none'}>
                                                                                <Checkbox
                                                                                    checked={model.hyperparameters.penalty.indexOf("none") > -1}/>
                                                                                <ListItemText primary={"None"}/>
                                                                            </MenuItem>
                                                                            <MenuItem value={'l1'}>
                                                                                <Checkbox
                                                                                    checked={model.hyperparameters.penalty.indexOf("l1") > -1}/>
                                                                                <ListItemText primary={"l1"}/>
                                                                            </MenuItem>
                                                                            <MenuItem value={'l2'}>
                                                                                <Checkbox
                                                                                    checked={model.hyperparameters.penalty.indexOf("l2") > -1}/>
                                                                                <ListItemText primary={"l2"}/>
                                                                            </MenuItem>
                                                                            <MenuItem value={'elasticnet'}>
                                                                                <Checkbox
                                                                                    checked={model.hyperparameters.penalty.indexOf("elasticnet") > -1}/>
                                                                                <ListItemText primary={"elasticnet"}/>
                                                                            </MenuItem>


                                                                        </Select>
                                                                    </FormControl>
                                                                </Grid>
                                                                <Grid item xs={3}>
                                                                    <TextFieldStyled
                                                                        variant="filled"
                                                                        disabled={state.loadingCreation}
                                                                        fullWidth
                                                                        size="small"
                                                                        name="alpha"
                                                                        onChange={(e) => handleChangeForm(e, datasetIndex, indexModel, 'alpha')}
                                                                        label="Alpha"
                                                                        placeholder="Floats separated by comma"
                                                                        value={model.hyperparameters.alpha}

                                                                        InputLabelProps={{
                                                                            shrink: true,
                                                                        }}

                                                                    />

                                                                </Grid>
                                                                <Grid item xs={3}>
                                                                    <FormControl variant="filled" fullWidth>
                                                                        <InputLabel id="demo-simple-select-label"
                                                                                    sx={{color: 'white'}}>Learning
                                                                            rate</InputLabel>
                                                                        <Select
                                                                            size="small"
                                                                            value={model.hyperparameters.learning_rate}
                                                                            onChange={(e) => handleChangeForm(e, datasetIndex, indexModel, 'learning_rate')}
                                                                            label="Learning rate"
                                                                            sx={{color: 'white'}}
                                                                            disabled={state.loadingCreation}
                                                                            multiple
                                                                            renderValue={(selected) => (
                                                                                <Box sx={{
                                                                                    display: 'flex',
                                                                                    flexWrap: 'wrap',
                                                                                    gap: 0.5
                                                                                }}>
                                                                                    {selected.map((value) => (
                                                                                        <Chip size="small" key={value}
                                                                                              label={value}
                                                                                              sx={{color: 'white'}}/>
                                                                                    ))}
                                                                                </Box>
                                                                            )}
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

                                                                            <MenuItem value={'constant'}>
                                                                                <Checkbox
                                                                                    checked={model.hyperparameters.learning_rate.indexOf("constant") > -1}/>
                                                                                <ListItemText primary={"constant"}/>
                                                                            </MenuItem>
                                                                            <MenuItem value={'optimal'}>
                                                                                <Checkbox
                                                                                    checked={model.hyperparameters.learning_rate.indexOf("optimal") > -1}/>
                                                                                <ListItemText primary={"optimal"}/>
                                                                            </MenuItem>
                                                                            <MenuItem value={'invscaling'}>
                                                                                <Checkbox
                                                                                    checked={model.hyperparameters.learning_rate.indexOf("invscaling") > -1}/>
                                                                                <ListItemText primary={"invscaling"}/>
                                                                            </MenuItem>
                                                                            <MenuItem value={'adaptive'}>
                                                                                <Checkbox
                                                                                    checked={model.hyperparameters.learning_rate.indexOf("adaptive") > -1}/>
                                                                                <ListItemText primary={"adaptive"}/>
                                                                            </MenuItem>


                                                                        </Select>
                                                                    </FormControl>
                                                                </Grid>

                                                            </Grid>
                                                        </Grid>
                                                    }
                                                    {
                                                        model.algorithm === 'dt' && model.hyperparametersTuning !== "manual" &&
                                                        <Grid item xs={8}>
                                                            <Grid container spacing={2}>
                                                                <Grid item xs={4}>
                                                                    <TextFieldStyled
                                                                        variant="filled"
                                                                        fullWidth
                                                                        disabled={state.loadingCreation}
                                                                        size="small"
                                                                        name="max_depth"
                                                                        onChange={(e) => handleChangeForm(e, datasetIndex, indexModel, 'max_depth')}
                                                                        label="Maximum depth of the tree"
                                                                        placeholder="None is available. 1,2,None,3"
                                                                        value={model.hyperparameters.max_depth}

                                                                        InputLabelProps={{
                                                                            shrink: true,
                                                                        }}

                                                                    />

                                                                </Grid>
                                                                <Grid item xs={4}>
                                                                    <TextFieldStyled
                                                                        variant="filled"
                                                                        fullWidth
                                                                        disabled={state.loadingCreation}
                                                                        size="small"
                                                                        name="min_samples_split"
                                                                        onChange={(e) => handleChangeForm(e, datasetIndex, indexModel, 'min_samples_split')}
                                                                        label="Minimum number of samples"
                                                                        placeholder="Integers separated by comma"
                                                                        value={model.hyperparameters.min_samples_split}

                                                                        InputLabelProps={{
                                                                            shrink: true,
                                                                        }}

                                                                    />

                                                                </Grid>
                                                            </Grid>
                                                        </Grid>
                                                    }
                                                    {
                                                        model.algorithm === 'dt' && model.hyperparametersTuning === "manual" &&
                                                        <Grid item xs={8}>
                                                            <Grid container spacing={2}>
                                                                <Grid item xs={4}>
                                                                    <TextFieldStyled
                                                                        variant="filled"
                                                                        fullWidth
                                                                        disabled={state.loadingCreation}
                                                                        size="small"
                                                                        name="max_depth"
                                                                        type="number"
                                                                        onChange={(e) => handleChangeForm(e, datasetIndex, indexModel, 'max_depth')}
                                                                        label="Maximum depth of the tree"
                                                                        placeholder="None is available"
                                                                        value={model.hyperparameters.max_depth}

                                                                        InputLabelProps={{
                                                                            shrink: true,
                                                                        }}
                                                                        InputProps={{
                                                                            min: 0,
                                                                            inputMode: 'numeric', pattern: '+[0-9]*',


                                                                        }}
                                                                    />

                                                                </Grid>
                                                                <Grid item xs={4}>
                                                                    <TextFieldStyled
                                                                        variant="filled"
                                                                        fullWidth
                                                                        disabled={state.loadingCreation}
                                                                        size="small"
                                                                        name="min_samples_split"
                                                                        type="number"
                                                                        onChange={(e) => handleChangeForm(e, datasetIndex, indexModel, 'min_samples_split')}
                                                                        label="Minimum number of samples"
                                                                        placeholder=""
                                                                        value={model.hyperparameters.min_samples_split}

                                                                        InputLabelProps={{
                                                                            shrink: true,
                                                                        }}
                                                                        InputProps={{
                                                                            min: 0,
                                                                            inputMode: 'numeric', pattern: '+[0-9]*',


                                                                        }}
                                                                    />

                                                                </Grid>
                                                            </Grid>
                                                        </Grid>
                                                    }
                                                    {
                                                        model.algorithm === 'rf' && model.hyperparametersTuning === "manual" &&
                                                        <Grid item xs={8}>
                                                            <Grid container spacing={2}>
                                                                <Grid item xs={3}>
                                                                    <TextFieldStyled
                                                                        variant="filled"
                                                                        disabled={state.loadingCreation}
                                                                        fullWidth
                                                                        size="small"
                                                                        name="n_estimators"
                                                                        type="number"
                                                                        onChange={(e) => handleChangeForm(e, datasetIndex, indexModel, 'n_estimators')}
                                                                        label="Number of trees in the forest"
                                                                        placeholder=""
                                                                        value={model.hyperparameters.n_estimators}

                                                                        InputLabelProps={{
                                                                            shrink: true,
                                                                        }}
                                                                        InputProps={{
                                                                            min: 0,
                                                                            inputMode: 'numeric', pattern: '+[0-9]*',


                                                                        }}
                                                                    />
                                                                </Grid>
                                                                <Grid item xs={3}>
                                                                    <TextFieldStyled
                                                                        variant="filled"
                                                                        fullWidth
                                                                        disabled={state.loadingCreation}
                                                                        size="small"
                                                                        name="max_depth"
                                                                        type="number"
                                                                        onChange={(e) => handleChangeForm(e, datasetIndex, indexModel, 'max_depth')}
                                                                        label="Maximum depth of the tree"
                                                                        placeholder="None is available"
                                                                        value={model.hyperparameters.max_depth}

                                                                        InputLabelProps={{
                                                                            shrink: true,
                                                                        }}
                                                                        InputProps={{
                                                                            min: 0,
                                                                            inputMode: 'numeric', pattern: '+[0-9]*',


                                                                        }}
                                                                    />
                                                                </Grid>
                                                                <Grid item xs={3}>
                                                                    <TextFieldStyled
                                                                        variant="filled"
                                                                        fullWidth
                                                                        size="small"
                                                                        name="min_samples"
                                                                        disabled={state.loadingCreation}
                                                                        type="number"
                                                                        onChange={(e) => handleChangeForm(e, datasetIndex, indexModel, 'min_samples_split')}
                                                                        label="Minimum number of samples"
                                                                        value={model.hyperparameters.min_samples_split}

                                                                        InputLabelProps={{
                                                                            shrink: true,
                                                                        }}
                                                                        InputProps={{
                                                                            min: 0,
                                                                            inputMode: 'numeric', pattern: '+[0-9]*',


                                                                        }}
                                                                    />
                                                                </Grid>

                                                            </Grid>
                                                        </Grid>
                                                    }
                                                    {
                                                        model.algorithm === 'rf' && model.hyperparametersTuning !== "manual" &&
                                                        <Grid item xs={8}>
                                                            <Grid container spacing={2}>
                                                                <Grid item xs={3}>
                                                                    <TextFieldStyled
                                                                        variant="filled"
                                                                        disabled={state.loadingCreation}
                                                                        fullWidth
                                                                        size="small"
                                                                        name="n_estimators"
                                                                        onChange={(e) => handleChangeForm(e, datasetIndex, indexModel, 'n_estimators')}
                                                                        label="Number of trees in the forest"
                                                                        placeholder="Integers separated by comma"
                                                                        value={model.hyperparameters.n_estimators}

                                                                        InputLabelProps={{
                                                                            shrink: true,
                                                                        }}

                                                                    />
                                                                </Grid>
                                                                <Grid item xs={3}>
                                                                    <TextFieldStyled
                                                                        variant="filled"
                                                                        fullWidth
                                                                        disabled={state.loadingCreation}
                                                                        size="small"
                                                                        name="max_depth"
                                                                        onChange={(e) => handleChangeForm(e, datasetIndex, indexModel, 'max_depth')}
                                                                        label="Maximum depth of the tree"
                                                                        placeholder="None is available. 1,2,None,3"
                                                                        value={model.hyperparameters.max_depth}

                                                                        InputLabelProps={{
                                                                            shrink: true,
                                                                        }}

                                                                    />
                                                                </Grid>
                                                                <Grid item xs={3}>
                                                                    <TextFieldStyled
                                                                        variant="filled"
                                                                        fullWidth
                                                                        size="small"
                                                                        name="min_samples"
                                                                        disabled={state.loadingCreation}
                                                                        onChange={(e) => handleChangeForm(e, datasetIndex, indexModel, 'min_samples_split')}
                                                                        label="Minimum number of samples"
                                                                        value={model.hyperparameters.min_samples_split}
                                                                        placeholder="Integers separated by comma"
                                                                        InputLabelProps={{
                                                                            shrink: true,
                                                                        }}

                                                                    />
                                                                </Grid>

                                                            </Grid>
                                                        </Grid>
                                                    }
                                                    {
                                                        model.algorithm === 'lof' && model.hyperparametersTuning === "manual" &&
                                                        <Grid item xs={8}>
                                                            <Grid container spacing={2}>
                                                                <Grid item xs={3}>
                                                                    <TextFieldStyled
                                                                        variant="filled"
                                                                        disabled={state.loadingCreation}
                                                                        fullWidth
                                                                        size="small"
                                                                        name="lof_n_neighbors"
                                                                        type="number"
                                                                        onChange={(e) => handleChangeForm(e, datasetIndex, indexModel, 'lof_n_neighbors')}
                                                                        label="Number of neighbors"
                                                                        placeholder=""
                                                                        value={model.hyperparameters.lof_n_neighbors}

                                                                        InputLabelProps={{
                                                                            shrink: true,
                                                                        }}
                                                                        InputProps={{
                                                                            min: 0,
                                                                            inputMode: 'numeric', pattern: '+[0-9]*',


                                                                        }}
                                                                    />
                                                                </Grid>
                                                                <Grid item xs={3}>
                                                                    <TextFieldStyled
                                                                        variant="filled"
                                                                        disabled={state.loadingCreation}
                                                                        fullWidth
                                                                        size="small"
                                                                        name="lof_contamination"
                                                                        type="number"
                                                                        onChange={(e) => handleChangeForm(e, datasetIndex, indexModel, 'lof_contamination')}
                                                                        label="Contamination"
                                                                        placeholder=""
                                                                        value={model.hyperparameters.lof_contamination}

                                                                        InputLabelProps={{
                                                                            shrink: true,
                                                                        }}
                                                                        InputProps={{
                                                                            min: 0,
                                                                            inputMode: 'numeric', pattern: '+[0-9]*',


                                                                        }}
                                                                    />
                                                                </Grid>
                                                            </Grid>
                                                        </Grid>
                                                    }
                                                    {
                                                        model.algorithm === 'lof' && model.hyperparametersTuning !== "manual" &&
                                                        <Grid item xs={8}>
                                                            <Grid container spacing={2}>
                                                                <Grid item xs={3}>
                                                                    <TextFieldStyled
                                                                        variant="filled"
                                                                        disabled={state.loadingCreation}
                                                                        fullWidth
                                                                        size="small"
                                                                        name="lof_n_neighbors"
                                                                        onChange={(e) => handleChangeForm(e, datasetIndex, indexModel, 'lof_n_neighbors')}
                                                                        label="Number of neighbors"
                                                                        placeholder="Integers separated by comma"
                                                                        value={model.hyperparameters.lof_n_neighbors}

                                                                        InputLabelProps={{
                                                                            shrink: true,
                                                                        }}

                                                                    />
                                                                </Grid>
                                                                <Grid item xs={3}>
                                                                    <TextFieldStyled
                                                                        variant="filled"
                                                                        disabled={state.loadingCreation}
                                                                        fullWidth
                                                                        size="small"
                                                                        name="lof_contamination"
                                                                        onChange={(e) => handleChangeForm(e, datasetIndex, indexModel, 'lof_contamination')}
                                                                        label="Contamination"
                                                                        placeholder="Floats separated by comma"
                                                                        value={model.hyperparameters.lof_contamination}

                                                                        InputLabelProps={{
                                                                            shrink: true,
                                                                        }}

                                                                    />
                                                                </Grid>
                                                            </Grid>
                                                        </Grid>
                                                    }
                                                    {
                                                        model.algorithm === 'ocsvm' && model.hyperparametersTuning === "manual" &&
                                                        <Grid item xs={8}>
                                                            <Grid container spacing={2}>
                                                                <Grid item xs={3}>
                                                                    <FormControl variant="filled" fullWidth>
                                                                        <InputLabel id="demo-simple-select-label"
                                                                                    sx={{color: 'white'}}>Kernel</InputLabel>
                                                                        <Select
                                                                            size="small"
                                                                            value={model.hyperparameters.kernel}
                                                                            onChange={(e) => handleChangeForm(e, datasetIndex, indexModel, 'kernel')}
                                                                            label="Kernel"
                                                                            disabled={state.loadingCreation}
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
                                                                            <MenuItem value={'rbf'}>rbf</MenuItem>
                                                                            <MenuItem
                                                                                value={'sigmoid'}>sigmoid</MenuItem>
                                                                            <MenuItem value={'linear'}>linear</MenuItem>
                                                                            <MenuItem value={'poly'}>poly</MenuItem>

                                                                        </Select>
                                                                    </FormControl>
                                                                </Grid>
                                                                <Grid item xs={3}>
                                                                    <TextFieldStyled
                                                                        variant="filled"
                                                                        disabled={state.loadingCreation}
                                                                        fullWidth
                                                                        size="small"
                                                                        name="gamma"
                                                                        onChange={(e) => handleChangeForm(e, datasetIndex, indexModel, 'gamma')}
                                                                        label="Gamma"
                                                                        placeholder="auto, scale or float"
                                                                        value={model.hyperparameters.gamma}

                                                                        InputLabelProps={{
                                                                            shrink: true,
                                                                        }}

                                                                    />
                                                                </Grid>
                                                                <Grid item xs={3}>
                                                                    <TextFieldStyled
                                                                        variant="filled"
                                                                        disabled={state.loadingCreation}
                                                                        fullWidth
                                                                        size="small"
                                                                        name="nu"
                                                                        type="number"
                                                                        onChange={(e) => handleChangeForm(e, datasetIndex, indexModel, 'nu')}
                                                                        label="Nu"
                                                                        placeholder=""
                                                                        value={model.hyperparameters.nu}

                                                                        InputLabelProps={{
                                                                            shrink: true,
                                                                        }}
                                                                        InputProps={{
                                                                            min: 0,
                                                                            inputMode: 'numeric', pattern: '+[0-9]*',


                                                                        }}
                                                                    />
                                                                </Grid>
                                                            </Grid>
                                                        </Grid>
                                                    }
                                                    {
                                                        model.algorithm === 'ocsvm' && model.hyperparametersTuning !== "manual" &&
                                                        <Grid item xs={8}>
                                                            <Grid container spacing={2}>
                                                                <Grid item xs={3}>
                                                                    <FormControl variant="filled" fullWidth>
                                                                        <InputLabel id="demo-simple-select-label"
                                                                                    sx={{color: 'white'}}>Kernel</InputLabel>
                                                                        <Select
                                                                            size="small"
                                                                            value={model.hyperparameters.kernel}
                                                                            onChange={(e) => handleChangeForm(e, datasetIndex, indexModel, 'kernel')}
                                                                            label="Kernel"
                                                                            disabled={state.loadingCreation}
                                                                            sx={{color: 'white'}}
                                                                            multiple
                                                                            renderValue={(selected) => (
                                                                                <Box sx={{
                                                                                    display: 'flex',
                                                                                    flexWrap: 'wrap',
                                                                                    gap: 0.5
                                                                                }}>
                                                                                    {selected.map((value) => (
                                                                                        <Chip size="small" key={value}
                                                                                              label={value}
                                                                                              sx={{color: 'white'}}/>
                                                                                    ))}
                                                                                </Box>
                                                                            )}
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
                                                                            <MenuItem value={'rbf'}>
                                                                                <Checkbox
                                                                                    checked={model.hyperparameters.kernel.indexOf("rbf") > -1}/>
                                                                                <ListItemText primary={"rbf"}/>
                                                                            </MenuItem>
                                                                            <MenuItem value={'sigmoid'}>
                                                                                <Checkbox
                                                                                    checked={model.hyperparameters.kernel.indexOf("sigmoid") > -1}/>
                                                                                <ListItemText primary={"sigmoid"}/>
                                                                            </MenuItem>
                                                                            <MenuItem value={'linear'}>
                                                                                <Checkbox
                                                                                    checked={model.hyperparameters.kernel.indexOf("linear") > -1}/>
                                                                                <ListItemText primary={"linear"}/>
                                                                            </MenuItem>
                                                                            <MenuItem value={'poly'}>
                                                                                <Checkbox
                                                                                    checked={model.hyperparameters.kernel.indexOf("poly") > -1}/>
                                                                                <ListItemText primary={"poly"}/>
                                                                            </MenuItem>

                                                                        </Select>
                                                                    </FormControl>
                                                                </Grid>
                                                                <Grid item xs={3}>
                                                                    <TextFieldStyled
                                                                        variant="filled"
                                                                        disabled={state.loadingCreation}
                                                                        fullWidth
                                                                        size="small"
                                                                        name="gamma"
                                                                        onChange={(e) => handleChangeForm(e, datasetIndex, indexModel, 'gamma')}
                                                                        label="Gamma"
                                                                        placeholder="Values separated by comma"
                                                                        value={model.hyperparameters.gamma}

                                                                        InputLabelProps={{
                                                                            shrink: true,
                                                                        }}

                                                                    />
                                                                </Grid>
                                                                <Grid item xs={3}>
                                                                    <TextFieldStyled
                                                                        variant="filled"
                                                                        disabled={state.loadingCreation}
                                                                        fullWidth
                                                                        size="small"
                                                                        name="nu"
                                                                        onChange={(e) => handleChangeForm(e, datasetIndex, indexModel, 'nu')}
                                                                        label="Nu"
                                                                        placeholder="Floats separated by comma"
                                                                        value={model.hyperparameters.nu}

                                                                        InputLabelProps={{
                                                                            shrink: true,
                                                                        }}

                                                                    />
                                                                </Grid>
                                                            </Grid>
                                                        </Grid>
                                                    }
                                                    {
                                                        model.algorithm === 'if' && model.hyperparametersTuning === "manual" &&
                                                        <Grid item xs={8}>
                                                            <Grid container spacing={2}>
                                                                <Grid item xs={3}>
                                                                    <TextFieldStyled
                                                                        variant="filled"
                                                                        fullWidth
                                                                        size="small"
                                                                        disabled={state.loadingCreation}
                                                                        name="n_estimators"
                                                                        type="number"
                                                                        onChange={(e) => handleChangeForm(e, datasetIndex, indexModel, 'n_estimators')}
                                                                        label="Number of base estimators"
                                                                        placeholder=""
                                                                        value={model.hyperparameters.n_estimators}

                                                                        InputLabelProps={{
                                                                            shrink: true,
                                                                        }}
                                                                        InputProps={{
                                                                            min: 0,
                                                                            inputMode: 'numeric', pattern: '+[0-9]*',


                                                                        }}
                                                                    />

                                                                </Grid>
                                                                <Grid item xs={3}>
                                                                    <TextFieldStyled
                                                                        variant="filled"
                                                                        fullWidth
                                                                        size="small"
                                                                        disabled={state.loadingCreation}
                                                                        name="if_contamination"
                                                                        type="number"
                                                                        onChange={(e) => handleChangeForm(e, datasetIndex, indexModel, 'if_contamination')}
                                                                        label="Contamination"
                                                                        placeholder=""
                                                                        value={model.hyperparameters.if_contamination}

                                                                        InputLabelProps={{
                                                                            shrink: true,
                                                                        }}
                                                                        InputProps={{
                                                                            min: 0,
                                                                            inputMode: 'numeric', pattern: '+[0-9]*',


                                                                        }}
                                                                    />

                                                                </Grid>
                                                            </Grid>
                                                        </Grid>
                                                    }
                                                    {
                                                        model.algorithm === 'if' && model.hyperparametersTuning !== "manual" &&
                                                        <Grid item xs={8}>
                                                            <Grid container spacing={2}>
                                                                <Grid item xs={3}>
                                                                    <TextFieldStyled
                                                                        variant="filled"
                                                                        fullWidth
                                                                        size="small"
                                                                        disabled={state.loadingCreation}
                                                                        name="n_estimators"
                                                                        onChange={(e) => handleChangeForm(e, datasetIndex, indexModel, 'n_estimators')}
                                                                        label="Number of base estimators"
                                                                        placeholder="Integers separated by comma"
                                                                        value={model.hyperparameters.n_estimators}

                                                                        InputLabelProps={{
                                                                            shrink: true,
                                                                        }}

                                                                    />

                                                                </Grid>
                                                                <Grid item xs={3}>
                                                                    <TextFieldStyled
                                                                        variant="filled"
                                                                        fullWidth
                                                                        size="small"
                                                                        disabled={state.loadingCreation}
                                                                        name="if_contamination"
                                                                        onChange={(e) => handleChangeForm(e, datasetIndex, indexModel, 'if_contamination')}
                                                                        label="Contamination"
                                                                        placeholder="Floats separated by comma"
                                                                        value={model.hyperparameters.if_contamination}

                                                                        InputLabelProps={{
                                                                            shrink: true,
                                                                        }}

                                                                    />

                                                                </Grid>
                                                            </Grid>
                                                        </Grid>
                                                    }
                                                    {
                                                        model.method === "dl" &&
                                                        <Grid item xs={12} sx={{mt: '20px'}}>
                                                            <Grid container spacing={2}>
                                                                {
                                                                    model.hyperparametersTuning === "manual" ?
                                                                        <Grid item xs={12}>
                                                                            <Grid container spacing={1}>
                                                                                <Grid item xs={2}>
                                                                                    <TextFieldStyled
                                                                                        variant="filled"
                                                                                        fullWidth
                                                                                        size="small"
                                                                                        disabled={state.loadingCreation}
                                                                                        name="epochs"
                                                                                        type="number"
                                                                                        label="Epochs"
                                                                                        placeholder=""
                                                                                        value={model.algorithm.epochs}
                                                                                        onChange={(e) => handleChangeModelDLHyperparameters(e, datasetIndex, indexModel, "epochs")}


                                                                                        InputLabelProps={{
                                                                                            shrink: true,
                                                                                        }}
                                                                                        InputProps={{
                                                                                            min: 0,
                                                                                            inputMode: 'numeric',
                                                                                            pattern: '+[0-9]*',


                                                                                        }}
                                                                                    />

                                                                                </Grid>
                                                                                <Grid item xs={3}>
                                                                                    <FormControl variant="filled"
                                                                                                 fullWidth>
                                                                                        <InputLabel
                                                                                            id="demo-simple-select-label"
                                                                                            sx={{color: 'white'}}>Loss</InputLabel>
                                                                                        <Select
                                                                                            size="small"
                                                                                            onChange={(e) => handleChangeModelDLHyperparameters(e, datasetIndex, indexModel, "loss")}
                                                                                            value={model.algorithm.loss}
                                                                                            disabled={state.loadingCreation}
                                                                                            label="Loss"
                                                                                            sx={{
                                                                                                color: 'white',
                                                                                            }}

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
                                                                                            {
                                                                                                model.type === 'Classifier' ? (
                                                                                                        [

                                                                                                            <MenuItem
                                                                                                                key={"sparse_categorical_crossentropy"}
                                                                                                                value={'sparse_categorical_crossentropy'}>Sparse
                                                                                                                Categorical
                                                                                                                Crossentropy</MenuItem>,
                                                                                                            <MenuItem
                                                                                                                key={"binary_crossentropy"}
                                                                                                                value={'binary_crossentropy'}>Binary
                                                                                                                Crossentropy</MenuItem>,

                                                                                                        ])
                                                                                                    : (
                                                                                                        [

                                                                                                            <MenuItem
                                                                                                                key={"mse"}
                                                                                                                value={'mse'}>Mean
                                                                                                                Squared
                                                                                                                Error</MenuItem>

                                                                                                        ]
                                                                                                    )


                                                                                            }


                                                                                        </Select>
                                                                                    </FormControl>

                                                                                </Grid>
                                                                                <Grid item xs={2}>
                                                                                    <FormControl variant="filled"
                                                                                                 fullWidth>
                                                                                        <InputLabel
                                                                                            id="demo-simple-select-label"
                                                                                            sx={{color: 'white'}}>Optimizer</InputLabel>
                                                                                        <Select
                                                                                            size="small"
                                                                                            onChange={(e) => handleChangeModelDLHyperparameters(e, datasetIndex, indexModel, "optimizer")}
                                                                                            value={model.algorithm.optimizer}
                                                                                            disabled={state.loadingCreation}
                                                                                            label="Optimizer"
                                                                                            sx={{
                                                                                                color: 'white',
                                                                                                '& .MuiSelect-root': {
                                                                                                    borderBottom: '2px solid #fff !important',
                                                                                                },

                                                                                            }}

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
                                                                                            <MenuItem
                                                                                                value={'adam'}>Adam</MenuItem>
                                                                                            <MenuItem
                                                                                                value={'sgd'}>SGD</MenuItem>


                                                                                        </Select>
                                                                                    </FormControl>

                                                                                </Grid>
                                                                                <Grid item xs={2}>
                                                                                    <TextFieldStyled
                                                                                        variant="filled"
                                                                                        fullWidth
                                                                                        size="small"
                                                                                        disabled={state.loadingCreation}
                                                                                        name="learning_rate"
                                                                                        type="number"
                                                                                        label="Learning rate"
                                                                                        placeholder=""
                                                                                        value={model.algorithm.learning_rate}
                                                                                        onChange={(e) => handleChangeModelDLHyperparameters(e, datasetIndex, indexModel, "learning_rate")}


                                                                                        InputLabelProps={{
                                                                                            shrink: true,
                                                                                        }}
                                                                                        InputProps={{
                                                                                            min: 0,
                                                                                            inputMode: 'numeric',
                                                                                            pattern: '+[0-9]*',


                                                                                        }}
                                                                                    />

                                                                                </Grid>
                                                                                <Grid item xs={2}>
                                                                                    <TextFieldStyled
                                                                                        variant="filled"
                                                                                        fullWidth
                                                                                        size="small"
                                                                                        disabled={state.loadingCreation}
                                                                                        name="batch_size"
                                                                                        type="number"
                                                                                        label="Batch size"
                                                                                        placeholder=""
                                                                                        value={model.algorithm.batch_size}
                                                                                        onChange={(e) => handleChangeModelDLHyperparameters(e, datasetIndex, indexModel, "batch_size")}


                                                                                        InputLabelProps={{
                                                                                            shrink: true,
                                                                                        }}
                                                                                        InputProps={{
                                                                                            min: 0,
                                                                                            inputMode: 'numeric',
                                                                                            pattern: '+[0-9]*',


                                                                                        }}
                                                                                    />

                                                                                </Grid>
                                                                                {
                                                                                    model.type === "Anomaly Detection" &&
                                                                                    <Grid item xs={2}>
                                                                                        <TextFieldStyled
                                                                                            variant="filled"
                                                                                            fullWidth
                                                                                            size="small"
                                                                                            disabled={state.loadingCreation}
                                                                                            name="threshold"
                                                                                            type="number"
                                                                                            label="MSE percentile (Threshold)"
                                                                                            placeholder=""
                                                                                            value={model.algorithm.threshold}
                                                                                            onChange={(e) => handleChangeModelDLHyperparameters(e, datasetIndex, indexModel, "threshold")}


                                                                                            InputLabelProps={{
                                                                                                shrink: true,
                                                                                            }}
                                                                                            InputProps={{
                                                                                                min: 0,
                                                                                                inputMode: 'numeric',
                                                                                                pattern: '+[0-9]*',
                                                                                                endAdornment: (
                                                                                                    <InputAdornment
                                                                                                        position="end"
                                                                                                        style={{color: 'white'}}>%</InputAdornment>
                                                                                                )


                                                                                            }}
                                                                                        />

                                                                                    </Grid>
                                                                                }


                                                                            </Grid>
                                                                        </Grid>
                                                                        :
                                                                        <Grid item xs={12}>
                                                                            <Grid container spacing={2}>
                                                                                <Grid item xs={2}>
                                                                                    <TextFieldStyled
                                                                                        variant="filled"
                                                                                        fullWidth
                                                                                        size="small"
                                                                                        disabled={state.loadingCreation}
                                                                                        name="epochs"

                                                                                        label="Epochs"
                                                                                        placeholder="Integers separated by comma"
                                                                                        value={model.algorithm.epochs}
                                                                                        onChange={(e) => handleChangeModelDLHyperparameters(e, datasetIndex, indexModel, "epochs")}


                                                                                        InputLabelProps={{
                                                                                            shrink: true,
                                                                                        }}

                                                                                    />

                                                                                </Grid>
                                                                                <Grid item xs={3}>
                                                                                    <FormControl variant="filled"
                                                                                                 fullWidth>
                                                                                        <InputLabel
                                                                                            id="demo-simple-select-label"
                                                                                            sx={{color: 'white'}}>Loss</InputLabel>
                                                                                        <Select
                                                                                            size="small"
                                                                                            onChange={(e) => handleChangeModelDLHyperparameters(e, datasetIndex, indexModel, "loss")}
                                                                                            value={model.algorithm.loss}
                                                                                            disabled={state.loadingCreation}
                                                                                            label="Loss"
                                                                                            sx={{
                                                                                                color: 'white',
                                                                                            }}

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
                                                                                            {
                                                                                                model.type === 'Classifier' ? (
                                                                                                        [

                                                                                                            <MenuItem
                                                                                                                key={"sparse_categorical_crossentropy"}
                                                                                                                value={'sparse_categorical_crossentropy'}>Sparse
                                                                                                                Categorical
                                                                                                                Crossentropy</MenuItem>,
                                                                                                            <MenuItem
                                                                                                                key={"binary_crossentropy"}
                                                                                                                value={'binary_crossentropy'}>Binary
                                                                                                                Crossentropy</MenuItem>,

                                                                                                        ])
                                                                                                    : (
                                                                                                        [

                                                                                                            <MenuItem
                                                                                                                key={"mse"}
                                                                                                                value={'mse'}>Mean
                                                                                                                Squared
                                                                                                                Error</MenuItem>

                                                                                                        ]
                                                                                                    )


                                                                                            }


                                                                                        </Select>
                                                                                    </FormControl>
                                                                                </Grid>
                                                                                <Grid item xs={2}>
                                                                                    <FormControl variant="filled"
                                                                                                 fullWidth>
                                                                                        <InputLabel
                                                                                            id="demo-simple-select-label"
                                                                                            sx={{color: 'white'}}>Optimizers</InputLabel>
                                                                                        <Select
                                                                                            size="small"
                                                                                            onChange={(e) => handleChangeModelDLHyperparameters(e, datasetIndex, indexModel, "optimizers")}
                                                                                            value={model.algorithm.optimizers}
                                                                                            disabled={state.loadingCreation}
                                                                                            label="Optimizers"
                                                                                            sx={{
                                                                                                color: 'white',
                                                                                                '& .MuiSelect-root': {
                                                                                                    borderBottom: '2px solid #fff !important',
                                                                                                },

                                                                                            }}
                                                                                            renderValue={(selected) => (
                                                                                                <Box sx={{
                                                                                                    display: 'flex',
                                                                                                    flexWrap: 'wrap',
                                                                                                    gap: 0.5
                                                                                                }}>
                                                                                                    {selected.map((value) => (
                                                                                                        <Chip
                                                                                                            size="small"
                                                                                                            key={value}
                                                                                                            label={value}
                                                                                                            sx={{color: 'white'}}/>
                                                                                                    ))}
                                                                                                </Box>
                                                                                            )}
                                                                                            multiple

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
                                                                                            <MenuItem
                                                                                                value={'adam'}>
                                                                                                <Checkbox
                                                                                                    checked={model.algorithm.optimizers.indexOf("adam") > -1}/>
                                                                                                <ListItemText
                                                                                                    primary={"Adam"}/>
                                                                                            </MenuItem>
                                                                                            <MenuItem
                                                                                                value={'sgd'}>
                                                                                                <Checkbox
                                                                                                    checked={model.algorithm.optimizers.indexOf("sgd") > -1}/>
                                                                                                <ListItemText
                                                                                                    primary={"SGD"}/>
                                                                                            </MenuItem>,


                                                                                        </Select>
                                                                                    </FormControl>

                                                                                </Grid>
                                                                                <Grid item xs={3}>
                                                                                    <TextFieldStyled
                                                                                        variant="filled"
                                                                                        fullWidth
                                                                                        size="small"
                                                                                        disabled={state.loadingCreation}
                                                                                        name="learning_rate"

                                                                                        label="Learning rates"
                                                                                        placeholder="Floats separated by comma"
                                                                                        value={model.algorithm.learning_rates}
                                                                                        onChange={(e) => handleChangeModelDLHyperparameters(e, datasetIndex, indexModel, "learning_rates")}


                                                                                        InputLabelProps={{
                                                                                            shrink: true,
                                                                                        }}
                                                                                    />

                                                                                </Grid>
                                                                                <Grid item xs={2}>
                                                                                    <TextFieldStyled
                                                                                        variant="filled"
                                                                                        fullWidth
                                                                                        size="small"
                                                                                        disabled={state.loadingCreation}
                                                                                        name="batch_size"
                                                                                        label="Batch sizes"
                                                                                        placeholder="Integers separated by comma"
                                                                                        value={model.algorithm.batch_sizes}
                                                                                        onChange={(e) => handleChangeModelDLHyperparameters(e, datasetIndex, indexModel, "batch_sizes")}


                                                                                        InputLabelProps={{
                                                                                            shrink: true,
                                                                                        }}

                                                                                    />

                                                                                </Grid>
                                                                                {
                                                                                    model.type === "Anomaly Detection" &&
                                                                                    <Grid item xs={2}>
                                                                                        <TextFieldStyled
                                                                                            variant="filled"
                                                                                            fullWidth
                                                                                            size="small"
                                                                                            disabled={state.loadingCreation}
                                                                                            name="thresholds"
                                                                                            label="MSE percentiles (Thresholds)"
                                                                                            placeholder="Percentages separated by comma"
                                                                                            value={model.algorithm.thresholds}
                                                                                            onChange={(e) => handleChangeModelDLHyperparameters(e, datasetIndex, indexModel, "thresholds")}


                                                                                            InputLabelProps={{
                                                                                                shrink: true,
                                                                                            }}
                                                                                            InputProps={{
                                                                                                endAdornment: (
                                                                                                    <InputAdornment
                                                                                                        position="end"
                                                                                                        style={{color: 'white'}}>%</InputAdornment>
                                                                                                )

                                                                                            }
                                                                                            }

                                                                                        />

                                                                                    </Grid>
                                                                                }


                                                                            </Grid>
                                                                        </Grid>

                                                                }
                                                            </Grid>


                                                        </Grid>
                                                    }

                                                    {
                                                        model.method === "dl" &&
                                                        <Grid item xs={12} sx={{mt: '20px'}}>
                                                            <Grid container spacing={2}>

                                                                {
                                                                    model.algorithm.layers.map((layer, indexLayer) => (
                                                                        <Grid key={indexLayer} item xs={12}>
                                                                            <Grid container spacing={1}>

                                                                                <Grid item xs={3}>
                                                                                    <FormControl variant="filled"
                                                                                                 fullWidth>
                                                                                        <InputLabel
                                                                                            id="demo-simple-select-label"
                                                                                            sx={{color: 'white'}}>Layer {indexLayer + 1}</InputLabel>
                                                                                        <Select
                                                                                            size="small"
                                                                                            value={layer.name}
                                                                                            onChange={(e) => handleChangeLayerName(e, datasetIndex, indexModel, indexLayer)}
                                                                                            label="Layer"
                                                                                            disabled={state.loadingCreation || indexLayer === 0}
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
                                                                                            <MenuItem
                                                                                                value={'input'}>Input</MenuItem>
                                                                                            <MenuItem
                                                                                                value={'dense'}>Dense</MenuItem>
                                                                                            <MenuItem
                                                                                                value={'lstm'}>LSTM</MenuItem>
                                                                                            <MenuItem
                                                                                                value={'gru'}>GRU</MenuItem>
                                                                                            <MenuItem
                                                                                                value={'repeat_vector'}>RepeatVector</MenuItem>
                                                                                            <MenuItem
                                                                                                value={'conv_1D'}>Conv1D</MenuItem>
                                                                                            <MenuItem
                                                                                                value={'dropout'}>Dropout</MenuItem>
                                                                                            <MenuItem
                                                                                                value={'max_pooling_1D'}>MaxPooling1D</MenuItem>
                                                                                            <MenuItem
                                                                                                value={'flatten'}>Flatten</MenuItem>


                                                                                        </Select>
                                                                                    </FormControl>
                                                                                </Grid>
                                                                                {
                                                                                    layer.name === "input" &&
                                                                                    <Grid item xs={8}>
                                                                                        <TextFieldStyled
                                                                                            variant="filled"
                                                                                            disabled={state.loadingCreation}
                                                                                            fullWidth
                                                                                            onChange={(e) => handleChangeFormDL(e, datasetIndex, indexModel, indexLayer, "shape")}
                                                                                            size="small"
                                                                                            name="shape"
                                                                                            label="Shape"
                                                                                            placeholder="Example: (1,2,3) or (1,)"
                                                                                            value={layer.layer.shape}

                                                                                            InputLabelProps={{
                                                                                                shrink: true,
                                                                                            }}
                                                                                            InputProps={{
                                                                                                pattern: '^\\(\\d+(,\\s*\\d+)*\\)$',

                                                                                            }}

                                                                                        />
                                                                                    </Grid>
                                                                                }
                                                                                {
                                                                                    layer.name === 'dense' &&
                                                                                    <Grid item xs={8}>
                                                                                        <Grid container spacing={2}>
                                                                                            <Grid item xs={6}>
                                                                                                <TextFieldStyled
                                                                                                    variant="filled"
                                                                                                    fullWidth
                                                                                                    size="small"
                                                                                                    disabled={state.loadingCreation}
                                                                                                    name="units"
                                                                                                    type="number"
                                                                                                    label="Units"
                                                                                                    placeholder=""
                                                                                                    value={layer.layer.units}
                                                                                                    onChange={(e) => handleChangeFormDL(e, datasetIndex, indexModel, indexLayer, "units")}


                                                                                                    InputLabelProps={{
                                                                                                        shrink: true,
                                                                                                    }}
                                                                                                    InputProps={{
                                                                                                        min: 0,
                                                                                                        inputMode: 'numeric',
                                                                                                        pattern: '+[0-9]*',


                                                                                                    }}
                                                                                                />
                                                                                            </Grid>

                                                                                            <Grid item xs={6}>

                                                                                                <FormControl
                                                                                                    variant="filled"
                                                                                                    fullWidth>
                                                                                                    <InputLabel
                                                                                                        id="demo-simple-select-label"
                                                                                                        sx={{color: 'white'}}>Activation</InputLabel>
                                                                                                    <Select
                                                                                                        size="small"
                                                                                                        value={layer.layer.activation}
                                                                                                        onChange={(e) => handleChangeFormDL(e, datasetIndex, indexModel, indexLayer, 'activation')}
                                                                                                        label="Kernel"
                                                                                                        disabled={state.loadingCreation}
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
                                                                                                        <MenuItem
                                                                                                            value={'relu'}>relu</MenuItem>
                                                                                                        <MenuItem
                                                                                                            value={'sigmoid'}>sigmoid</MenuItem>
                                                                                                        <MenuItem
                                                                                                            value={'softmax'}>softmax</MenuItem>
                                                                                                        <MenuItem
                                                                                                            value={'linear'}>linear</MenuItem>


                                                                                                    </Select>
                                                                                                </FormControl>


                                                                                            </Grid>
                                                                                        </Grid>

                                                                                    </Grid>
                                                                                }
                                                                                {
                                                                                    (layer.name === 'lstm' || layer.name === "gru") &&
                                                                                    <Grid item xs={8}>
                                                                                        <Grid container spacing={2}>
                                                                                            <Grid item xs={3}>
                                                                                                <TextFieldStyled
                                                                                                    variant="filled"
                                                                                                    fullWidth
                                                                                                    size="small"
                                                                                                    disabled={state.loadingCreation}
                                                                                                    name="units"
                                                                                                    type="number"
                                                                                                    label="Units"
                                                                                                    placeholder=""
                                                                                                    value={layer.layer.units}
                                                                                                    onChange={(e) => handleChangeFormDL(e, datasetIndex, indexModel, indexLayer, "units")}


                                                                                                    InputLabelProps={{
                                                                                                        shrink: true,
                                                                                                    }}
                                                                                                    InputProps={{
                                                                                                        min: 0,
                                                                                                        inputMode: 'numeric',
                                                                                                        pattern: '+[0-9]*',


                                                                                                    }}
                                                                                                />

                                                                                            </Grid>
                                                                                            <Grid item xs={4}>


                                                                                                <FormControl
                                                                                                    variant="filled"
                                                                                                    fullWidth>
                                                                                                    <InputLabel
                                                                                                        id="demo-simple-select-label"
                                                                                                        sx={{color: 'white'}}>Activation</InputLabel>
                                                                                                    <Select
                                                                                                        size="small"
                                                                                                        value={layer.layer.activation}
                                                                                                        onChange={(e) => handleChangeFormDL(e, datasetIndex, indexModel, indexLayer, 'activation')}
                                                                                                        label="Kernel"
                                                                                                        disabled={state.loadingCreation}
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
                                                                                                        <MenuItem
                                                                                                            value={'relu'}>relu</MenuItem>
                                                                                                        <MenuItem
                                                                                                            value={'sigmoid'}>sigmoid</MenuItem>
                                                                                                        <MenuItem
                                                                                                            value={'softmax'}>softmax</MenuItem>
                                                                                                        <MenuItem
                                                                                                            value={'linear'}>linear</MenuItem>


                                                                                                    </Select>
                                                                                                </FormControl>

                                                                                            </Grid>
                                                                                            <Grid item xs={5}>
                                                                                                <FormControl
                                                                                                    variant="filled"
                                                                                                    fullWidth>
                                                                                                    <InputLabel
                                                                                                        id="demo-simple-select-label"
                                                                                                        sx={{color: 'white'}}>Return
                                                                                                        sequences</InputLabel>
                                                                                                    <Select
                                                                                                        size="small"
                                                                                                        value={layer.layer.return_sequences}
                                                                                                        onChange={(e) => handleChangeFormDL(e, datasetIndex, indexModel, indexLayer, 'return_sequences')}
                                                                                                        label="Return sequences"
                                                                                                        disabled={state.loadingCreation}
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
                                                                                                        <MenuItem
                                                                                                            value={'yes'}>Yes</MenuItem>
                                                                                                        <MenuItem
                                                                                                            value={'no'}>No</MenuItem>


                                                                                                    </Select>
                                                                                                </FormControl>
                                                                                            </Grid>
                                                                                        </Grid>
                                                                                    </Grid>
                                                                                }
                                                                                {
                                                                                    layer.name === 'repeat_vector' &&
                                                                                    <Grid item xs={8}>


                                                                                        <TextFieldStyled
                                                                                            variant="filled"
                                                                                            fullWidth
                                                                                            size="small"
                                                                                            disabled={state.loadingCreation}
                                                                                            name=""
                                                                                            type="number"
                                                                                            label="Repetition factor"
                                                                                            placeholder=""
                                                                                            value={layer.layer.n}
                                                                                            onChange={(e) => handleChangeFormDL(e, datasetIndex, indexModel, indexLayer, "n")}


                                                                                            InputLabelProps={{
                                                                                                shrink: true,
                                                                                            }}
                                                                                            InputProps={{
                                                                                                min: 0,
                                                                                                inputMode: 'numeric',
                                                                                                pattern: '+[0-9]*',


                                                                                            }}
                                                                                        />


                                                                                    </Grid>
                                                                                }
                                                                                {
                                                                                    layer.name === 'conv_1D' &&
                                                                                    <Grid item xs={8}>
                                                                                        <Grid container spacing={2}>

                                                                                            <Grid item xs={4}>
                                                                                                <TextFieldStyled
                                                                                                    variant="filled"
                                                                                                    fullWidth
                                                                                                    size="small"
                                                                                                    disabled={state.loadingCreation}
                                                                                                    name=""
                                                                                                    type="number"
                                                                                                    label="Filters"
                                                                                                    placeholder=""
                                                                                                    value={layer.layer.n}
                                                                                                    onChange={(e) => handleChangeFormDL(e, datasetIndex, indexModel, indexLayer, "filters")}


                                                                                                    InputLabelProps={{
                                                                                                        shrink: true,
                                                                                                    }}
                                                                                                    InputProps={{
                                                                                                        min: 0,
                                                                                                        inputMode: 'numeric',
                                                                                                        pattern: '+[0-9]*',


                                                                                                    }}
                                                                                                />
                                                                                            </Grid>


                                                                                            <Grid item xs={4}>
                                                                                                <FormControl
                                                                                                    variant="filled"
                                                                                                    fullWidth>
                                                                                                    <InputLabel
                                                                                                        id="demo-simple-select-label"
                                                                                                        sx={{color: 'white'}}>Activation</InputLabel>
                                                                                                    <Select
                                                                                                        size="small"
                                                                                                        value={layer.layer.activation}
                                                                                                        onChange={(e) => handleChangeFormDL(e, datasetIndex, indexModel, indexLayer, 'activation')}
                                                                                                        label="Kernel"
                                                                                                        disabled={state.loadingCreation}
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
                                                                                                        <MenuItem
                                                                                                            value={'relu'}>relu</MenuItem>
                                                                                                        <MenuItem
                                                                                                            value={'sigmoid'}>sigmoid</MenuItem>
                                                                                                        <MenuItem
                                                                                                            value={'softmax'}>softmax</MenuItem>
                                                                                                        <MenuItem
                                                                                                            value={'linear'}>linear</MenuItem>


                                                                                                    </Select>
                                                                                                </FormControl>

                                                                                            </Grid>

                                                                                            <Grid item xs={4}>
                                                                                                <TextFieldStyled
                                                                                                    variant="filled"
                                                                                                    disabled={state.loadingCreation}
                                                                                                    fullWidth
                                                                                                    onChange={(e) => handleChangeFormDL(e, datasetIndex, indexModel, indexLayer, "kernel_size")}
                                                                                                    size="small"
                                                                                                    name="kernel_size"
                                                                                                    label="Kernel size"
                                                                                                    value={layer.layer.kernel_size}

                                                                                                    InputLabelProps={{
                                                                                                        shrink: true,
                                                                                                    }}

                                                                                                />
                                                                                            </Grid>


                                                                                        </Grid>
                                                                                    </Grid>
                                                                                }
                                                                                {
                                                                                    layer.name === 'dropout' &&
                                                                                    <Grid item xs={8}>

                                                                                        <TextFieldStyled
                                                                                            variant="filled"
                                                                                            disabled={state.loadingCreation}
                                                                                            fullWidth
                                                                                            onChange={(e) => handleChangeFormDL(e, datasetIndex, indexModel, indexLayer, "rate")}
                                                                                            size="small"
                                                                                            name="rate"
                                                                                            label="Rate"
                                                                                            value={layer.layer.rate}

                                                                                            InputLabelProps={{
                                                                                                shrink: true,
                                                                                            }}

                                                                                        />


                                                                                    </Grid>

                                                                                }
                                                                                {
                                                                                    layer.name === 'max_pooling_1D' &&
                                                                                    <Grid item xs={8}>

                                                                                        <TextFieldStyled
                                                                                            variant="filled"
                                                                                            disabled={state.loadingCreation}
                                                                                            fullWidth
                                                                                            onChange={(e) => handleChangeFormDL(e, datasetIndex, indexModel, indexLayer, "pool_size")}
                                                                                            size="small"
                                                                                            name="pool_size"
                                                                                            label="Pool size"
                                                                                            value={layer.layer.pool_size}

                                                                                            InputLabelProps={{
                                                                                                shrink: true,
                                                                                            }}

                                                                                        />


                                                                                    </Grid>

                                                                                }

                                                                                {
                                                                                    indexLayer !== 0 &&
                                                                                    <IconButton
                                                                                        onClick={() => handleRemoveLayer(datasetIndex, indexModel, indexLayer)}
                                                                                        sx={{color: 'white'}}>
                                                                                        <RemoveIcon/>
                                                                                    </IconButton>
                                                                                }
                                                                            </Grid>
                                                                        </Grid>

                                                                    ))

                                                                }
                                                            </Grid>
                                                            <Grid item xs={12}>
                                                                <Grid container justifyContent="center">
                                                                    <Grid item>
                                                                        <IconButton sx={{color: 'white'}}
                                                                                    onClick={() => handleAddLayer(datasetIndex, indexModel)}>
                                                                            <AddIcon/>
                                                                        </IconButton>

                                                                    </Grid>
                                                                </Grid>

                                                            </Grid>
                                                        </Grid>

                                                    }
                                                    {
                                                        model.type !== "" &&
                                                        <Grid item xs={12}>
                                                            <Grid container>
                                                                <Grid item xs={4}>
                                                                    <FormControl variant="filled" fullWidth>
                                                                        <InputLabel id="demo-simple-select-label"
                                                                                    sx={{color: 'white'}}>
                                                                            {
                                                                                model.type === 'Classifier' ?
                                                                                    <span>Classes to classifier</span> :
                                                                                    <span>Classes to validate</span>
                                                                            }

                                                                        </InputLabel>
                                                                        <Select
                                                                            labelId="demo-multiple-chip-label"
                                                                            id="demo-multiple-chip"
                                                                            size="small"
                                                                            multiple
                                                                            label={model.type === 'Classifier' ? "Classes" : "Classes to validate"}
                                                                            onChange={(e) => handleChangeLabel(e, datasetIndex, indexModel)}

                                                                            sx={{color: 'white'}}
                                                                            value={model.labels}
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
                                                                                        <Chip size="small" key={value}
                                                                                              label={value}
                                                                                              sx={{color: 'white'}}/>
                                                                                    ))}
                                                                                </Box>
                                                                            )}
                                                                        >
                                                                            <MenuItem
                                                                                value="All classes">
                                                                                <Checkbox
                                                                                    checked={model.labels.indexOf("All classes") > -1}/>
                                                                                <ListItemText primary="All classes"/>
                                                                            </MenuItem>
                                                                            <hr/>
                                                                            {
                                                                                dataset.allLabels.map((label, indexLabel) => (

                                                                                    <MenuItem
                                                                                        disabled={model.labels.filter(el => el === "All classes").length > 0}
                                                                                        key={indexLabel}
                                                                                        value={label.name}>
                                                                                        <Checkbox
                                                                                            checked={model.labels.indexOf(label.name) > -1}/>
                                                                                        <ListItemText
                                                                                            primary={label.name}/>

                                                                                    </MenuItem>
                                                                                ))
                                                                            }


                                                                        </Select>
                                                                    </FormControl>

                                                                </Grid>
                                                            </Grid>


                                                        </Grid>

                                                    }

                                                    <Grid item xs={12}>
                                                        <hr/>
                                                    </Grid>
                                                </Grid>
                                            )
                                        )
                                    }

                                    <Grid item xs={12}>
                                        <Grid container justifyContent="center" alignItems="center">
                                            <Grid item>
                                                <IconButton disabled={state.loadingCreation}
                                                            onClick={() => handleAddModel(datasetIndex)}>
                                                    <AddIcon sx={{fontSize: '5vh', color: 'white'}}/>
                                                </IconButton>
                                            </Grid>
                                        </Grid>
                                    </Grid>

                                </Grid>


                            </CardContent>
                            <CardActions sx={{padding: '0px 8px 3px 8px', borderTop: '1px solid white'}}
                                         disableSpacing>
                                <IconButton disabled={state.loadingCreation}
                                            onClick={() => handleRemoveDataset(datasetIndex)} sx={{color: 'white'}}>
                                    <DeleteIcon/>
                                </IconButton>


                            </CardActions>
                        </Card>
                    </Grid>
                ))
            }
            <Grid item xs={12}>
                <LoadingButton
                    disabled={disableCreateModels()}
                    loading={state.loadingCreation}
                    onClick={handleClickCreateModels}
                    fullWidth size="small"
                    color="success" variant="contained"
                    sx={{borderRadius: '28px', fontWeight: 'bold'}}>
                    Apply
                </LoadingButton>
            </Grid>
        </Grid>
    )
}

export default ModelsCreation