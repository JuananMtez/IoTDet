import React, {useEffect, useState} from "react";
import {findAllMitigationScripts, invalidateFile, validateFile} from "../services/FileRequests.js";
import {Alert, CircularProgress, Grid, Snackbar} from "@mui/material";
import CardMitigationScript from "../components/Cards/CardMitigationScript.jsx";

const RootFilesMitigationScripts = () => {

    const [state, setState] = useState({
        loading: true,
        files: [],
    })


    useEffect(() => {
        findAllMitigationScripts()
            .then(response => {
                setState({
                    ...state, loading: false, files: response.data
                })
            })
    }, [])


    const handleValidateFile = (fileId) => {
        validateFile(fileId)
            .then(response => {
                let list = state.files
                for (let i = 0; i < list.length; i++) {
                    if (list[i].id === fileId) {
                        list[i] = response.data
                        break
                    }
                }
                setState({
                    ...state,
                    files: list,
                    openSnackbarValidate: true
                })
            })
    }

    const handleInvalidateFile = (fileId) => {
        invalidateFile(fileId)
            .then(response => {
                let list = state.files
                for (let i = 0; i < list.length; i++) {
                    if (list[i].id === fileId) {
                        list[i] = response.data
                        break
                    }
                }
                setState({
                    ...state,
                    files: list,
                    openSnackbarInvalidate: true
                })
            })
    }

    return (
        <Grid container spacing={2} sx={{mt: '50px'}}>
            {
                state.loading ?
                    <Grid item xs={12}>
                        <Grid container alignItems="center" justifyContent="center">
                            <CircularProgress sx={{color: 'white'}}/>
                        </Grid>
                    </Grid>
                    :

                    <Grid item xs={12}>
                        <Grid container spacing={2}>
                            {
                                state.files.map((element, indexFile) => (
                                    <Grid item key={indexFile} xs={12} md={4} lg={3}>
                                        <CardMitigationScript
                                            mitigation_script_id={element.id}
                                            name={element.name}
                                            description={element.description}
                                            is_validated={element.is_validated}
                                            uploaded_by={element.uploaded_by}
                                            parameters={element.parameters}
                                            filename={element.filename}
                                            can_validate={true}
                                            handleValidate={handleValidateFile}
                                            handleInvalidate={handleInvalidateFile}
                                        />
                                    </Grid>
                                ))
                            }
                        </Grid>
                    </Grid>
            }
            <Grid item xs={12}>
                <Snackbar anchorOrigin={{vertical: "bottom", horizontal: "right"}}
                          open={state.openSnackbarValidate} autoHideDuration={3000}
                          onClose={() => setState({...state, openSnackbarValidate: false})}>
                    <Alert onClose={() => setState({...state, openSnackbarValidate: false})}
                           severity="success" sx={{width: '100%'}}>
                        Mitigation script validated!
                    </Alert>
                </Snackbar>
            </Grid>
            <Grid item xs={12}>
                <Snackbar anchorOrigin={{vertical: "bottom", horizontal: "right"}}
                          open={state.openSnackbarInvalidate} autoHideDuration={3000}
                          onClose={() => setState({...state, openSnackbarInvalidate: false})}>
                    <Alert onClose={() => setState({...state, openSnackbarInvalidate: false})}
                           severity="success" sx={{width: '100%'}}>
                        Mitigation script invalidated!
                    </Alert>
                </Snackbar>
            </Grid>
        </Grid>
    )

}

export default RootFilesMitigationScripts