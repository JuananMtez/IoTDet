import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Stack,
} from "@mui/material";
import TextFieldStyled from "../TextFieldStyled/TextFieldStyled.jsx";
import Button from "@mui/material/Button";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import LoadingButton from "@mui/lab/LoadingButton";
import React, {useState} from "react";
import Slide from "@mui/material/Slide";
import {uploadMonitoringScript} from "../../services/FileRequests.js";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";


const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});


const DialogNewMonitoringScript = ({open, handleCloseDialog, handleSuccess}) => {
    const [stateDialog, setStateDialog] = useState({
        name: '',
        columns: '',
        description: '',
        file: null,
        loading: false,
        showErrorName: false,
        textErrorName: '',

    })


    const onChangeFieldsArea = (e) => {

        if (e.target.name === 'name' || e.target.name === 'description')
            setStateDialog({
                ...stateDialog, [e.target.name]: e.target.value
            })
        else if (!e.target.value.includes(' '))
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


    const handleUploadMonitoringScript = () => {
        setStateDialog({
            ...stateDialog,
            loading: true
        })
        uploadMonitoringScript(stateDialog.name, stateDialog.description, stateDialog.columns, stateDialog.file)
            .then(response => {

                setStateDialog({
                    name: '',
                    columns: '',
                    description: '',
                    file: null,
                    loading: false,
                    showErrorName: false,
                    textErrorName: '',
                })
                handleSuccess(response.data)
            })
            .catch(error => {
                setStateDialog({
                    ...stateDialog,
                    name: '',
                    loading: false,
                    showErrorName: true,
                    textErrorName: error.response.data.detail
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
                Uploading new monitoring script
                {<IconButton
                    aria-label="close"
                    onClick={() => {
                        setStateDialog({
                            name: '',
                            columns: '',
                            description: '',
                            file: null,
                            loading: false,
                            showErrorName: false,
                            textErrorName: '',
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
                        <a style={{color:'inherit'}} href="monitoring_scripts/example" target="_blank">Example of a monitoring script file format.</a>
                    </Grid>


                    <Grid item xs={12}>
                        <TextFieldStyled
                            name="name"
                            error={stateDialog.showErrorName}
                            label="Name"
                            value={stateDialog.name}
                            size="small"
                            onChange={onChangeFieldsArea}
                            fullWidth
                            inputProps={{maxLength: 50}}

                            variant="filled"

                        />
                        {
                            stateDialog.showErrorName &&
                            <Grid item xs={12}>
                                <p style={{fontWeight: 'bold'}}>{stateDialog.textErrorName}</p>
                            </Grid>
                        }
                    </Grid>


                    <Grid item xs={12}>
                        <TextFieldStyled
                            name="description"
                            label="Description"
                            size="small"
                            value={stateDialog.description}
                            fullWidth
                            onChange={onChangeFieldsArea}
                            variant="filled"
                            multiline
                            inputProps={{maxLength: 255}}
                            rows={3}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextFieldStyled
                            name="columns"
                            placeholder="Write features separated by commas in the same order the devices will include the metrics"
                            label="Features"
                            size="small"
                            value={stateDialog.columns}
                            fullWidth
                            onChange={onChangeFieldsArea}
                            variant="filled"
                            multiline

                            rows={4}
                        />
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
                                style={{fontWeight: 'normal'}}>{stateDialog.file === null ? 'No file chosen' : stateDialog.file.name}</span>
                        </Stack>


                    </Grid>


                </Grid>

            </DialogContent>
            <DialogActions>

                <LoadingButton
                    disabled={stateDialog.name === "" || stateDialog.description === "" || stateDialog.columns === "" || stateDialog.file === null}
                    size="small" variant="contained"
                    onClick={handleUploadMonitoringScript}
                    loading={stateDialog.loading}
                    sx={{borderRadius: '28px', fontWeight: 'bold'}}>Upload</LoadingButton>

            </DialogActions>
        </Dialog>
    )
}

export default DialogNewMonitoringScript