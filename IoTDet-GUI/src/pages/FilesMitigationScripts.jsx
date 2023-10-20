import {useEffect, useState} from "react";
import {findAllMitigationScripts} from "../services/FileRequests.js";
import {Alert, Button, CircularProgress, Grid, Snackbar} from "@mui/material";
import DialogNewMitigationScript from "../components/Dialog/DialogNewMitigationScript.jsx";
import CardMitigationScript from "../components/Cards/CardMitigationScript.jsx";
import * as React from "react";

const FilesMitigationScripts = () => {

    const [state, setState] = useState({
        loading: true,
        mitigationScripts: [],
        openDialogNewMitigationScript: false,
        openSuccessUploadMitigationScript: false

    })

        useEffect(() => {
            findAllMitigationScripts()
                .then(response => {
                        setState({
                            ...state,
                            loading: false,
                            mitigationScripts: response.data,
                            openSuccessUploadMitigationScript: false
                        })
                    }
                )
        }, [])




    const handleSuccessUploadMitigationScript = (el) => {
        setState({
            ...state,
            mitigationScripts: [...state.mitigationScripts, el],
            openDialogNewMitigationScript: false,
            openSuccessUploadMitigationScript: true

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
                                    onClick={() => setState({...state, openDialogNewMitigationScript: true})}
                                    size="small" variant="contained" sx={{borderRadius: '28px', fontWeight: 'bold'}}
                                    color="success">Upload Mitigation script</Button>
                        </Grid>

                        {

                            state.mitigationScripts.map((element, index) => (
                                <Grid item key={index} xs={12} md={4} lg={3}>
                                    <CardMitigationScript
                                        mitigation_script_id={element.id}
                                        name={element.name}
                                        description={element.description}
                                        is_validated={element.is_validated}
                                        uploaded_by={element.uploaded_by}
                                        parameters={element.parameters}
                                        filename={element.filename}
                                        can_validate={false}
                                    />
                                </Grid>
                            ))
                        }
                    </Grid>
            }
            <DialogNewMitigationScript
                handleSuccess={handleSuccessUploadMitigationScript}
                open={state.openDialogNewMitigationScript}
                handleCloseDialog={() => setState({...state, openDialogNewMitigationScript: false})}

            />
            <Snackbar anchorOrigin={{vertical: "bottom", horizontal: "right"}} open={state.openSuccessUploadMitigationScript}
                      autoHideDuration={2000} onClose={() => setState({...state, openSuccessUploadMitigationScript: false})}>
                <Alert onClose={() => setState({...state, openSuccessUploadMitigationScript: false})} severity="success"
                       sx={{width: '100%'}}>
                    The deployfile has been uploaded. Wait until an admin validates it!
                </Alert>
            </Snackbar>
        </Grid>
    )
}

export default FilesMitigationScripts