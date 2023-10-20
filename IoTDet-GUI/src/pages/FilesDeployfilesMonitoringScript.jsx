import {Alert, Button, CircularProgress, Dialog, Grid, Snackbar} from "@mui/material";
import * as React from "react";
import {useEffect, useState} from "react";
import {getAllDeployfilesMonitoringScript} from "../services/FileRequests.js";
import DialogNewDeployfileMonitoringScript from "../components/Dialog/DialogNewDeployfileMonitoringScript.jsx";
import CardDeployfileMonitoringScript from "../components/Cards/CardDeployfileMonitoringScript.jsx";


const FilesDeployfilesMonitoringScript = () => {
    const [state, setState] = useState({
        loading: true,
        deployfiles: [],
        openDialogUpload: false,
        showUploadSuccessfully: false
    })

    useEffect(() => {
        getAllDeployfilesMonitoringScript()
            .then(response => {
                setState({
                    ...state,
                    loading: false,
                    deployfiles: response.data,
                })
            })
    }, [])


    const handleUploadSuccessfully = (deployfile) => {

        setState(prevState => ({
            ...prevState,
            deployfiles: [...prevState.deployfiles, deployfile],
            showUploadSuccessfully: true,
            openDialogUpload: false
        }));
    }


    return (

        <Grid container sx={{mt: '50px'}}>
            {
                state.loading
                    ?
                    <Grid item xs={12}>
                        <Grid container alignItems="center" justifyContent="center">
                            <CircularProgress sx={{color: 'white'}}/>
                        </Grid>
                    </Grid>

                    :
                    <Grid container spacing={2}>
                        <Grid container justifyContent="flex-end" sx={{mb: '30px'}}>
                            <Button onClick={() => setState({...state, openDialogUpload: true})}
                                    disabled={JSON.parse(localStorage.getItem("user")).role === 3} size="small"
                                    variant="contained" sx={{borderRadius: '28px', fontWeight: 'bold'}}
                                    color="success">Upload deployfile</Button>
                        </Grid>
                        {
                            state.deployfiles.map((el, index) => (
                                <Grid key={index} item xs={3}>
                                    <CardDeployfileMonitoringScript deployfile={el}/>
                                </Grid>
                            ))
                        }
                        <Grid item xs={12}>
                            <DialogNewDeployfileMonitoringScript handleSuccess={handleUploadSuccessfully}
                                                                 open={state.openDialogUpload}
                                                                 handleCloseDialog={() => setState({
                                                                     ...state,
                                                                     openDialogUpload: false
                                                                 })}/>
                        </Grid>

                    </Grid>


            }
            <Snackbar anchorOrigin={{vertical: "bottom", horizontal: "right"}}
                      open={state.showUploadSuccessfully} autoHideDuration={3000}
                      onClose={() => setState({...state, showUploadSuccessfully: false})}>
                <Alert onClose={() => setState({...state, showUploadSuccessfully: false})} severity="success"
                       sx={{width: '100%'}}>
                    The deployfile has been uploaded successfully. Wait until an admin validates it!
                </Alert>
            </Snackbar>


        </Grid>
    )
}

export default FilesDeployfilesMonitoringScript