import React, {useState} from "react";
import Slide from "@mui/material/Slide";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle, FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Stack
} from "@mui/material";
import TextFieldStyled from "../TextFieldStyled/TextFieldStyled.jsx";
import Button from "@mui/material/Button";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import AddIcon from "@mui/icons-material/Add";
import LoadingButton from "@mui/lab/LoadingButton";
import RemoveIcon from "@mui/icons-material/Remove";
import {uploadMitigationScript} from "../../services/FileRequests.js";


const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const DialogNewMitigationScript = ({handleSuccess, open, handleCloseDialog}) => {

    const [state, setState] = useState({
        name: '',
        parameters: [],
        description: '',
        file: null,
        loading: false,
        showError: false,
        textError: ''
    })

    const onChangeUploadFile = (event) => {
        setState({
            ...state, file: event.target.files[0]
        })
        event.target.value = ''
    }


    const addParameter = () => {
        setState({
            ...state,
            parameters: [...state.parameters, {name: '', description: '', datatype: ''}]
        })
    }

    const removeParameter = (indexParameter) => {
        const parameter = state.parameters
        parameter.splice(indexParameter, 1)
        setState({
            ...state,
            parameters: parameter
        })

    }

    const handleChangeParameter = (e, indexParameter, type) => {
        const parameters = state.parameters

        if (type === "name" && !e.target.value.includes(' '))
            parameters[indexParameter].name = e.target.value


        else if (type === "description") {
            parameters[indexParameter].description = e.target.value
        }
        else {
            parameters[indexParameter].datatype = e.target.value
        }

        setState({
            ...state,
            parameters: parameters
        })
    }

    const disabledButtonUpload = () => {
        if (state.name === "")
            return true

        if (state.file === null)
            return true

        for (let i = 0; i < state.parameters.length; i++) {
            if (state.parameters[i].name === "" || state.parameters[i].description === "" || state.parameters[i].datatype === "")
                return true
        }
        return false
    }


    const handleUploadMitigationScript = () => {
        setState({
            ...state,
            loading: true
        })
        uploadMitigationScript(state.name, state.description, state.parameters, state.file)
            .then(response => {

                setState({
                    name: '',
                    description: '',
                    file: null,
                    parameters: [],
                    loading: false,
                    showError: false,
                    textError: '',
                })
                handleSuccess(response.data)
            })

            .catch(error => {
                console.log(error)
                setState({
                    ...state,
                    name: '',
                    loading: false,
                    showError: true,
                    textError: error.response.data.detail
                })

            })
    }


    return (
        <Dialog
            open={open}
            TransitionComponent={Transition}
            keepMounted

            maxWidth="md"
            fullWidth
            aria-describedby="alert-dialog-slide-description"
            PaperProps={{
                style: {
                    backgroundColor: '#676767',
                    color: 'white',
                    fontWeight: 'bold',
                    borderRadius: '25px',
                    maxHeight: '100%'
                }
            }}
        >
            <DialogTitle sx={{fontWeight: 'bold'}}>
                Uploading new mitigation script
                {
                    <IconButton
                        aria-label="close"
                        onClick={() => {
                            setState({
                                name: '',
                                file: null,
                                loading: false,
                                showError: false,
                                description: '',
                                textError: '',
                                parameters: []
                            })
                            handleCloseDialog()
                        }}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: 'white'
                        }}
                    >
                        <CloseIcon/>
                    </IconButton>}
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <a style={{color: 'inherit'}} href="mitigation_scripts/example" target="_blank">Example of a
                            mitigation script file format.</a>
                    </Grid>
                    <Grid item xs={12}>
                        <TextFieldStyled
                            name="name"
                            error={state.showError}
                            label="Name"
                            value={state.name}
                            size="small"
                            onChange={(e) => setState({
                                ...state, [e.target.name]: e.target.value
                            })}
                            fullWidth
                            inputProps={{maxLength: 50}}

                            variant="filled"

                        />
                        {
                            state.showError &&
                            <Grid item xs={12}>
                                <p style={{fontWeight: 'bold'}}>{state.textErrorName}</p>
                            </Grid>
                        }
                    </Grid>
                    <Grid item xs={12}>
                        <TextFieldStyled
                            name="description"
                            label="Description"
                            size="small"
                            value={state.description}
                            fullWidth
                            onChange={(e) => setState({...state, description: e.target.value})}
                            variant="filled"
                            multiline
                            inputProps={{maxLength: 255}}
                            rows={3}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <h3>Parameters</h3>
                        <hr/>
                    </Grid>

                    <Grid item xs={12}>
                        <Grid container spacing={2}>
                            {
                                state.parameters.map((parameter, indexParameter) => (
                                    <Grid key={indexParameter} item xs={12}>
                                        <Grid container spacing={1} alignItems="center">
                                            <Grid item xs={2}>
                                                <TextFieldStyled
                                                    name="name"
                                                    label="Name"
                                                    value={parameter.name}
                                                    size="small"
                                                    onChange={(e) => handleChangeParameter(e, indexParameter, "name")}
                                                    fullWidth
                                                    inputProps={{maxLength: 50}}

                                                    variant="filled"

                                                />
                                            </Grid>
                                            <Grid item xs={7}>
                                                <TextFieldStyled
                                                    name="name"
                                                    label="Description"
                                                    value={parameter.description}
                                                    size="small"
                                                    onChange={(e) => handleChangeParameter(e, indexParameter, "description")}
                                                    fullWidth
                                                    inputProps={{maxLength: 50}}

                                                    variant="filled"

                                                />
                                            </Grid>
                                            <Grid item xs={2}>
                                            <FormControl variant="filled" fullWidth>
                                                <InputLabel id="demo-simple-select-label" sx={{color: 'white'}}>
                                                    Datatype
                                                </InputLabel>
                                                <Select
                                                    size="small"
                                                    value={parameter.datatype}

                                                    label="Datatype"
                                                    sx={{color: 'white'}}
                                                    onChange={(e) => handleChangeParameter(e, indexParameter, "datatype")}

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

                                                    <MenuItem  value={"int"}>int</MenuItem>
                                                    <MenuItem  value={"str"}>str</MenuItem>
                                                    <MenuItem  value={"list[int]"}>list[int]</MenuItem>
                                                    <MenuItem  value={"list[str]"}>list[str]</MenuItem>





                                                </Select>
                                            </FormControl>
                                            </Grid>
                                            <Grid item xs={1}>
                                                <IconButton disabled={state.loading}
                                                            onClick={() => removeParameter(indexParameter)}>
                                                    <RemoveIcon sx={{fontSize: '3vh', color: 'white'}}/>
                                                </IconButton>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                ))

                            }
                        </Grid>


                    </Grid>
                    <Grid item xs={12}>
                        <Grid container justifyContent="center">
                            <Grid item>
                                <IconButton disabled={state.loading} onClick={() => addParameter()}>
                                    <AddIcon sx={{fontSize: '3vh', color: 'white'}}/>
                                </IconButton>
                            </Grid>
                        </Grid>

                    </Grid>


                    <Grid item xs={12}>
                        <Stack direction="row" spacing={2}
                               sx={{justifyContent: 'left', alignItems: 'center'}}>

                            <Button
                                startIcon={<AttachFileIcon/>}
                                size="small" color="success" variant="contained"
                                sx={{borderRadius: '28px', fontWeight: 'bold'}}
                                component="label">
                                Choose script
                                <input hidden type="file"
                                       onChange={onChangeUploadFile}/>
                            </Button>

                            <span
                                style={{fontWeight: 'normal'}}>{state.file === null ? 'No file chosen' : state.file.name}</span>
                        </Stack>
                    </Grid>
                </Grid>


            </DialogContent>
            <DialogActions>
                <LoadingButton
                    disabled={disabledButtonUpload()}
                    size="small" variant="contained"
                    onClick={() => handleUploadMitigationScript()}
                    loading={state.loading}
                    sx={{borderRadius: '28px', fontWeight: 'bold'}}>Upload</LoadingButton>

            </DialogActions>
        </Dialog>

    )

}

export default DialogNewMitigationScript