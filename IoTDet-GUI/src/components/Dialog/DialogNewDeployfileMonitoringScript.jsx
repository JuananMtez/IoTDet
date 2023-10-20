import React, {useEffect, useState} from "react";
import Slide from "@mui/material/Slide";
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
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import TextFieldStyled from "../TextFieldStyled/TextFieldStyled.jsx";
import {
    getAllValidatedMonitoringScripts,
    uploadDeployfileForMonitoringScript
} from "../../services/FileRequests.js";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LoadingButton from "@mui/lab/LoadingButton";
import Button from "@mui/material/Button";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import ExpandMore from "../Expand/ExpandMore.jsx";


const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});
const DialogNewDeployfileMonitoringScript = ({open, handleCloseDialog, handleSuccess}) => {
    const [stateDialog, setStateDialog] = useState({
        name: '',
        description: '',
        loading_upload: false,
        monitoring_scripts: [],
        monitoring_script_id_selected: '',
        monitoring_script_description: '',
        monitoring_script_columns: '',
        expanded: false,
        file: null,
        showError: false,
        textError: ''
    })

    const cleanDialog = () => {
        setStateDialog({
            name: '',
            description: '',
            loading_upload: false,
            monitoring_scripts: [],
            monitoring_script_id_selected: '',
            monitoring_script_description: '',
            monitoring_script_columns: '',
            expanded: false,
            file: null,
            showError: false,
            textError: ''

        })
        handleCloseDialog()
    }


    const onClickUpload = () => {
        setStateDialog({
            ...stateDialog,
            loading_upload: true
        })


        uploadDeployfileForMonitoringScript(stateDialog.name, stateDialog.description, stateDialog.monitoring_scripts[stateDialog.monitoring_script_id_selected].id, stateDialog.file)
            .then(response => {
                cleanDialog()
                handleSuccess(response.data)
            })
            .catch(error => {
                setStateDialog({
                    ...stateDialog,
                    showError: true,
                    textError: error.response.data.detail,
                    loading_upload: false,
                    name: ''
                })
            })

    }

    const onChangeFieldsArea = (e) => {
        setStateDialog({
            ...stateDialog, [e.target.name]: e.target.value
        })

    }

    const onChangeUploadFile = (event) => {
        setStateDialog({
            ...stateDialog, file: event.target.files[0]
        })
        event.target.value = ''
    }

    useEffect(() => {
        if (open)


            getAllValidatedMonitoringScripts()
                .then(response => {

                    setStateDialog({
                        ...stateDialog,
                        monitoring_scripts: response.data
                    })
                })
    }, [open])

    const handleChangeMonitoringScript = (event) => {

        let initialValue = ''
        const returned = stateDialog.monitoring_scripts[event.target.value].columns.reduce((acc, currentValue) => acc + currentValue.name + ', ', initialValue)


        setStateDialog({
            ...stateDialog,
            monitoring_script_id_selected: event.target.value,
            monitoring_script_description: stateDialog.monitoring_scripts[event.target.value].description,
            monitoring_script_columns: returned.slice(0, -2)
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
                Uploading deployfile for monitoring script
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
                        <a style={{color:'inherit'}} href="monitoring_script/example" target="_blank">Example of a deployfile for monitoring script format.</a>
                    </Grid>
                    <Grid item xs={12}>
                        <TextFieldStyled
                            name="name"
                            label="Name"
                            onChange={onChangeFieldsArea}
                            value={stateDialog.name}
                            size="small"
                            fullWidth
                            inputProps={{maxLength: 50}}

                            variant="filled"

                        />
                        {
                            stateDialog.showError &&
                            <Grid item xs={12}>
                                <p style={{fontWeight: 'bold'}}>{stateDialog.textError}</p>
                            </Grid>
                        }
                    </Grid>
                    <Grid item xs={12}>
                        <TextFieldStyled
                            name="description"
                            label="Description"
                            onChange={onChangeFieldsArea}
                            value={stateDialog.description}
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
                                style={{fontWeight: 'normal'}}>{stateDialog.file === null ? 'No file chosen' : stateDialog.file.name}</span>
                        </Stack>


                    </Grid>
                    <Grid item xs={6}>
                        <Stack direction="row" spacing={1}>
                            <FormControl variant="filled" fullWidth>
                                <InputLabel id="demo-simple-select-label" sx={{color: 'white'}}>Monitoring
                                    script</InputLabel>
                                <Select
                                    size="small"
                                    value={stateDialog.monitoring_script_id_selected}

                                    label="Monitoring script"
                                    sx={{color: 'white'}}
                                    onChange={handleChangeMonitoringScript}

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
                                        stateDialog.monitoring_scripts.map((el, index) => (

                                            <MenuItem key={index} value={index}>{el.name}</MenuItem>

                                        ))
                                    }


                                </Select>
                            </FormControl>
                            {
                                stateDialog.monitoring_script_id_selected !== '' &&
                                <ExpandMore
                                    expand={stateDialog.expanded}
                                    onClick={() => setStateDialog({...stateDialog, expanded: !stateDialog.expanded})}
                                    aria-label="show more"
                                >
                                    <ExpandMoreIcon/>
                                </ExpandMore>
                            }

                        </Stack>

                    </Grid>
                    <Grid item xs={12}>
                        <Collapse in={stateDialog.expanded} timeout="auto" unmountOnExit>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextFieldStyled
                                        name="description"
                                        InputLabelProps={{shrink: true}}
                                        label="Description"
                                        size="small"
                                        value={stateDialog.monitoring_script_description}
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
                                    <TextFieldStyled
                                        name="columns"
                                        InputLabelProps={{shrink: true}}

                                        label="Columns"
                                        size="small"
                                        value={stateDialog.monitoring_script_columns}
                                        fullWidth
                                        variant="filled"
                                        InputProps={{
                                            readOnly: true
                                        }}

                                        multiline
                                        rows={4}
                                    />
                                </Grid>
                            </Grid>
                        </Collapse>
                    </Grid>


                </Grid>
            </DialogContent>
            <DialogActions>
                <LoadingButton
                    disabled={stateDialog.name === "" || stateDialog.description === "" || stateDialog.monitoring_script_id_selected === "" || stateDialog.file === null}
                    size="small" variant="contained"
                    loading={stateDialog.loading_upload}
                    onClick={onClickUpload}
                    sx={{borderRadius: '28px', fontWeight: 'bold'}}>Upload</LoadingButton>
            </DialogActions>

        </Dialog>

    )
}

export default DialogNewDeployfileMonitoringScript