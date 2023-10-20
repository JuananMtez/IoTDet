import * as React from "react";
import {Alert, Button, CircularProgress, Grid, Snackbar} from "@mui/material";
import {useEffect, useState} from "react";
import {findAllMonitoringScripts} from "../services/FileRequests.js";
import CardMonitoringScript from "../components/Cards/CardMonitoringScript.jsx";
import DialogNewMonitoringScript from "../components/Dialog/DialogNewMonitoringScript.jsx";


const FilesMonitoringScripts = () => {
    const [state, setState] = useState({
        loading: true,
        monitoringScripts: [],
        openDialogNewMonitoringScript: false,
        openSuccessUploadMonitoringScript: false
    })

    useEffect(() => {
        findAllMonitoringScripts()
            .then(response => {
                    setState({
                        ...state,
                        loading: false,
                        monitoringScripts: response.data,
                        openSuccessUploadMonitoringScript: false
                    })
                }
            )
    }, [])


    const handleSuccessUploadMonitoringScript = (el) => {
        setState({
            ...state,
            monitoringScripts: [...state.monitoringScripts, el],
            openDialogNewMonitoringScript: false,
            openSuccessUploadMonitoringScript: true

        })
    }
    return (


        <Grid container>
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
                        <Grid container justifyContent="flex-end" sx={{mt: '50px', mb: '30px'}}
                        >
                            <Button disabled={JSON.parse(localStorage.getItem("user")).role === 3}
                                    onClick={() => setState({...state, openDialogNewMonitoringScript: true})}
                                    size="small" variant="contained" sx={{borderRadius: '28px', fontWeight: 'bold'}}
                                    color="success">Upload monitoring script</Button>
                        </Grid>

                        {
                            state.monitoringScripts.map((element, index) => (
                                <Grid item key={index} xs={12} md={4} lg={3}>
                                    <CardMonitoringScript
                                        monitoring_script_id={element.id}
                                        name={element.name}
                                        description={element.description}
                                        is_validated={element.is_validated}
                                        uploaded_by={element.uploaded_by}
                                        columns={element.columns}
                                        filename={element.filename}
                                        can_validate={false}
                                    />
                                </Grid>
                            ))
                        }

                        <DialogNewMonitoringScript handleSuccess={handleSuccessUploadMonitoringScript}
                                                   open={state.openDialogNewMonitoringScript}
                                                   handleCloseDialog={() => setState({
                                                       ...state,
                                                       openDialogNewMonitoringScript: false
                                                   })}/>
                        <Snackbar anchorOrigin={{vertical: "bottom", horizontal: "right"}}
                                  open={state.openSuccessUploadMonitoringScript} autoHideDuration={3000}
                                  onClose={() => setState({...state, openSuccessUploadMonitoringScript: false})}>
                            <Alert onClose={() => setState({...state, openSuccessUploadMonitoringScript: false})}
                                   severity="success" sx={{width: '100%'}}>
                                The monitoring script has been uploaded successfully. Wait until an admin validates it!
                            </Alert>
                        </Snackbar>
                    </Grid>
            }

        </Grid>
    )
}

export default FilesMonitoringScripts