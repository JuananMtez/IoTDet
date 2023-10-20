import React, {useEffect, useState} from "react";
import Slide from "@mui/material/Slide";
import {
    getAllValidatedMitigationScripts,
    uploadDeployfileForMitigationScript,

} from "../../services/FileRequests.js";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import {
    Collapse,
    Dialog, DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Stack
} from "@mui/material";
import TextFieldStyled from "../TextFieldStyled/TextFieldStyled.jsx";
import Button from "@mui/material/Button";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import ExpandMore from "../Expand/ExpandMore.jsx";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LoadingButton from "@mui/lab/LoadingButton";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});
const DialogNewDeployfileMitigationScript = ({open, handleCloseDialog, handleSuccess}) => {

    const [state, setState] = useState({
        name: '',
        description: '',
        loading_upload: false,
        mitigation_scripts: [],
        mitigation_script_id_selected: '',
        mitigation_script_description: '',
        mitigation_script_parameters: [],
        expanded: false,
        file: null,
        showError: false,
        textError: ''
    })

    const cleanDialog = () => {
        setState({
            name: '',
            description: '',
            loading_upload: false,
            mitigation_scripts: [],
            mitigation_script_id_selected: '',
            mitigation_script_description: '',
            mitigation_script_parameters: [],
            expanded: false,
            file: null,
            showError: false,
            textError: ''

        })
        handleCloseDialog()
    }

    const onChangeUploadFile = (event) => {
        setState({
            ...state, file: event.target.files[0]
        })
        event.target.value = ''
    }


    useEffect(() => {
        if (open)


            getAllValidatedMitigationScripts()
                .then(response => {

                    setState({
                        ...state,
                        mitigation_scripts: response.data
                    })
                })
    }, [open])


    const onChangeFieldsArea = (e) => {
        setState({
            ...state, [e.target.name]: e.target.value
        })

    }

    const handleChangeMitigationScript = (event) => {

        setState({
            ...state,
            mitigation_script_id_selected: event.target.value,
            mitigation_script_description: state.mitigation_scripts[event.target.value].description,
            mitigation_script_parameters: state.mitigation_scripts[event.target.value].parameters
        })
    }


    const onClickUpload = () => {
        setState({
            ...state,
            loading_upload: true
        })


        uploadDeployfileForMitigationScript(state.name, state.description, state.mitigation_scripts[state.mitigation_script_id_selected].id, state.file)
            .then(response => {
                cleanDialog()
                handleSuccess(response.data)
            })
            .catch(error => {
                setState({
                    ...state,
                    showError: true,
                    textError: error.response.data.detail,
                    loading_upload: false,
                    name: ''
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
                Uploading deployfile for mitigation script
                {<IconButton
                    aria-label="close"
                    onClick={cleanDialog}
                    sx={{
                        position: 'absolute', right: 8, top: 8, color: 'white'
                    }}
                >
                    <CloseIcon/>
                </IconButton>}
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{justifyContent: 'left', alignItems: 'center'}}>
                    <Grid item xs={12}>
                        <a style={{color:'inherit'}} href="mitigation_script/example" target="_blank">Example of a deployfile for mitigation script format.</a>
                    </Grid>
                    <Grid item xs={12}>
                        <TextFieldStyled
                            name="name"
                            label="Name"
                            onChange={onChangeFieldsArea}
                            value={state.name}
                            size="small"
                            fullWidth
                            inputProps={{maxLength: 50}}

                            variant="filled"

                        />
                        {
                            state.showError &&
                            <Grid item xs={12}>
                                <p style={{fontWeight: 'bold'}}>{state.textError}</p>
                            </Grid>
                        }
                    </Grid>
                    <Grid item xs={12}>
                        <TextFieldStyled
                            name="description"
                            label="Description"
                            onChange={onChangeFieldsArea}
                            value={state.description}
                            size="small"
                            fullWidth
                            multiline
                            inputProps={{maxLength: 255}}
                            rows={3}
                            variant="filled"
                        />
                    </Grid>

                    <Grid item xs={6}>
                        <Stack direction="row" spacing={2}
                               sx={{justifyContent: 'left', alignItems: 'center'}}>

                            <Button
                                startIcon={<AttachFileIcon/>}
                                size="small" color="success" variant="contained"
                                sx={{borderRadius: '28px', fontWeight: 'bold'}}
                                component="label">
                                Choose deployfile
                                <input hidden type="file"
                                       onChange={onChangeUploadFile}/>
                            </Button>

                            <span
                                style={{fontWeight: 'normal'}}>{state.file === null ? 'No file chosen' : state.file.name}</span>
                        </Stack>


                    </Grid>

                    <Grid item xs={6}>
                        <Stack direction="row" spacing={1}>
                            <FormControl variant="filled" fullWidth>
                                <InputLabel id="demo-simple-select-label" sx={{color: 'white'}}>Mitigation
                                    script</InputLabel>
                                <Select
                                    size="small"
                                    value={state.mitigation_script_id_selected}

                                    label="Mitigation script"
                                    sx={{color: 'white'}}
                                    onChange={handleChangeMitigationScript}

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
                                        state.mitigation_scripts.map((el, index) => (

                                            <MenuItem key={index} value={index}>{el.name}</MenuItem>

                                        ))
                                    }


                                </Select>
                            </FormControl>
                            {
                                state.mitigation_script_id_selected !== '' &&
                                <ExpandMore
                                    expand={state.expanded}
                                    onClick={() => setState({...state, expanded: !state.expanded})}
                                    aria-label="show more"
                                >
                                    <ExpandMoreIcon/>
                                </ExpandMore>
                            }

                        </Stack>

                    </Grid>
                    <Grid item xs={12}>
                        <Collapse in={state.expanded} timeout="auto" unmountOnExit>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextFieldStyled
                                        name="description"
                                        InputLabelProps={{shrink: true}}
                                        label="Description"
                                        size="small"
                                        value={state.mitigation_script_description}
                                        fullWidth
                                        variant="filled"
                                        multiline
                                        InputProps={{
                                            readOnly: true
                                        }}

                                        rows={3}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <h3>Parameters</h3>
                                </Grid>
                                <Grid item xs={12}>
                                    {
                                        state.mitigation_script_parameters.map((parameter, indexParameter) => (
                                            <Grid key={indexParameter} container spacing={2} justifyContent="center">

                                                <Grid item xs={3}>
                                                    <TextFieldStyled
                                                        name="name"
                                                        InputLabelProps={{shrink: true}}

                                                        label="Name"
                                                        size="small"
                                                        value={parameter.name}
                                                        fullWidth
                                                        variant="filled"
                                                        InputProps={{
                                                            readOnly: true
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid item xs={9}>
                                                    <TextFieldStyled
                                                        name="description"
                                                        InputLabelProps={{shrink: true}}

                                                        label="Description"
                                                        size="small"
                                                        value={parameter.description}
                                                        fullWidth
                                                        variant="filled"
                                                        InputProps={{
                                                            readOnly: true
                                                        }}
                                                    />
                                                </Grid>
                                            </Grid>

                                        ))
                                    }
                                </Grid>

                            </Grid>
                        </Collapse>

                    </Grid>


                </Grid>

            </DialogContent>
            <DialogActions>
                <LoadingButton
                    disabled={state.name === "" || state.description === "" || state.mitigation_script_id_selected === "" || state.file === null}
                    size="small" variant="contained"
                    loading={state.loading_upload}
                    onClick={onClickUpload}
                    sx={{borderRadius: '28px', fontWeight: 'bold'}}>Upload</LoadingButton>
            </DialogActions>


        </Dialog>
    )

}

export default DialogNewDeployfileMitigationScript