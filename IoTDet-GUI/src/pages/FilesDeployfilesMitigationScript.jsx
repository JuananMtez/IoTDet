import {useEffect, useState} from "react";
import {getAllDeployfilesMitigationScript} from "../services/FileRequests.js";
import {Alert, Button, CircularProgress, Grid, Snackbar} from "@mui/material";
import * as React from "react";
import DialogNewDeployfileMitigationScript from "../components/Dialog/DialogNewDeployfileMitigationScript.jsx";
import CardDeployfileMitigationScript from "../components/Cards/CardDeployfileMitigationScript.jsx";

const FilesDeployfilesMitigationScript = () => {

    const [state, setState] = useState({
        loading: true,
        deployfiles: [],
        openDialogUpload: false,
        showUploadSuccessfully: false
    })

    useEffect(() => {
        getAllDeployfilesMitigationScript()
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
                                    <CardDeployfileMitigationScript deployfile={el}/>
                                </Grid>
                            ))
                        }
                        <Grid item xs={12}>
                            <DialogNewDeployfileMitigationScript handleSuccess={handleUploadSuccessfully}
                                                                 open={state.openDialogUpload}
                                                                 handleCloseDialog={() => setState({
                                                                     ...state,
                                                                     openDialogUpload: false
                                                                 })}/>
                        </Grid>

                    </Grid>


            }
            <Snackbar anchorOrigin={{vertical: "bottom", horizontal: "right"}} open={state.showUploadSuccessfully}
                      autoHideDuration={2000} onClose={() => setState({...state, showUploadSuccessfully: false})}>
                <Alert onClose={() => setState({...state, showUploadSuccessfully: false})} severity="success"
                       sx={{width: '100%'}}>
                    The deployfile has been uploaded. Wait until an admin validates it!
                </Alert>
            </Snackbar>
        </Grid>
    )
}

export default FilesDeployfilesMitigationScript