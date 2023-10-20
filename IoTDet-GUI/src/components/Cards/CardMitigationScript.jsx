import {useState} from "react";
import {Box, Card, CardActions, CardContent, CircularProgress, Container, Grid} from "@mui/material";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CodeIcon from "@mui/icons-material/Code.js";
import InfoSharpIcon from "@mui/icons-material/InfoSharp.js";
import LinkIcon from "@mui/icons-material/Link.js";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload.js";
import DoneSharpIcon from "@mui/icons-material/DoneSharp.js";
import CancelSharpIcon from "@mui/icons-material/CancelSharp.js";
import VerifiedSharpIcon from "@mui/icons-material/VerifiedSharp.js";
import HourglassEmptySharpIcon from "@mui/icons-material/HourglassEmptySharp.js";
import {
    downloadMitigationScript,
    downloadMonitoringScript, getCodeFromMitigationScript,
    getCodeFromMonitoringScript
} from "../../services/FileRequests.js";
import DialogURL from "../Dialog/DialogURL.jsx";
import FullSizeDialog from "../Dialog/FullSizeDialog.jsx";
import DialogMitigationScriptDisabled from "../Dialog/DialogMitigationScriptDisabled.jsx";

const CardMitigationScript = ({
                                  mitigation_script_id,
                                  name,
                                  filename,
                                  is_validated,
                                  description,
                                  uploaded_by,
                                  parameters,
                                  can_validate,
                                  handleValidate,
                                  handleInvalidate
                              }) => {


    const [state, setState] = useState({
        openDialogCode: false,
        openDialogInfo: false,
        loadingCode: false,
        code: '',
        openDialogURL: false,
        openSnackbarValidate: false,
        openSnackbarInvalidate: false
    })

    const handleClickDownloadMitigationScript = () => {
        downloadMitigationScript(mitigation_script_id)
            .then(response => {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', filename);

                document.body.appendChild(link);
                link.click();
            })
    }

    const handleOpenDialogCode = () => {
        setState({
            ...state,
            openDialogCode: true,
            loadingCode: true
        })

        getCodeFromMitigationScript(mitigation_script_id)
            .then(response => {
                setState({
                    ...state,
                    openDialogCode: true,
                    loadingCode: false,
                    code: response.data
                })
            })


    }


    return (
        <>
            <Card
                sx={{
                    maxWidth: 350,
                    borderRadius: '28px',
                    backgroundColor: '#3B3B3B !important'
                }}
            >
                <CardContent sx={{padding: '16px 16px 0px 16px'}}>

                    <Typography sx={{color: 'white', fontWeight: 'bold'}} variant="h6"
                                component="div">
                        {name}
                    </Typography>
                    <Typography variant="body2" sx={{color: 'wheat !important'}}>
                        Uploaded by: {uploaded_by}
                    </Typography>


                </CardContent>


                <CardActions sx={{padding: '0px 8px 8px 8px'}} disableSpacing>
                    <IconButton
                        aria-label="add to favorites" onClick={handleOpenDialogCode}

                    >
                        <CodeIcon sx={{color: 'white'}}/>
                    </IconButton>
                    <IconButton
                        aria-label="add to favorites" onClick={() => setState({...state, openDialogInfo: true})}>
                        <InfoSharpIcon sx={{color: 'white'}}/>
                    </IconButton>
                    <IconButton
                        aria-label="add to favorites"
                        sx={{color: 'white'}}
                        onClick={() => setState({...state, openDialogURL: true})}>
                        <LinkIcon/>
                    </IconButton>

                    <IconButton
                        aria-label="add to favorites" sx={{color: 'white'}}
                        onClick={handleClickDownloadMitigationScript}>
                        <CloudDownloadIcon/>
                    </IconButton>

                    {
                        can_validate &&
                        <IconButton sx={{
                            marginLeft: 'auto',
                            color: 'white',
                            '&.Mui-disabled': {
                                color: 'rgba(0, 0, 0, 0.26) !important'
                            }
                        }} disabled={is_validated} onClick={() => handleValidate(mitigation_script_id)}>
                            <DoneSharpIcon/>
                        </IconButton>
                    }
                    {
                        can_validate &&
                        <IconButton disabled={!is_validated}
                                    aria-label="add to favorites" sx={{
                            color: 'white',
                            '&.Mui-disabled': {
                                color: 'rgba(0, 0, 0, 0.26) !important'
                            }
                        }}
                                    onClick={() => handleInvalidate(mitigation_script_id)}>
                            <CancelSharpIcon/>
                        </IconButton>
                    }

                    {
                        !can_validate && is_validated &&
                        <IconButton sx={{marginLeft: 'auto'}} disabled
                                    aria-label="add to favorites">
                            <VerifiedSharpIcon sx={{color: '#828181'}}/>
                        </IconButton>
                    }
                    {
                        !can_validate && !is_validated &&

                        <IconButton sx={{marginLeft: 'auto'}} disabled
                                    aria-label="add to favorites">
                            <HourglassEmptySharpIcon sx={{color: '#828181'}}/>
                        </IconButton>
                    }
                </CardActions>

            </Card>

            <FullSizeDialog open={state.openDialogCode} title={`Code of ${name}`}
                            handleClose={() => setState({...state, openDialogCode: false, code: ''})}>
                <Container sx={{
                    marginLeft: `100px`,
                    marginTop: '30px',
                    marginRight: "100px",
                }}>
                    {
                        state.loadingCode ?

                            <Box sx={{
                                position: 'absolute',
                                left: '50%',
                                top: '50%',
                            }}>
                                <CircularProgress sx={{color: 'white'}}/>
                            </Box>
                            :
                            <Grid container>
                                <Grid item xs={12}>
                                            <textarea disabled spellCheck="false"
                                                      defaultValue={state.code}
                                                      style={{

                                                          fontSize: '14px',
                                                          color: 'white',
                                                          outline: 'none',
                                                          resize: 'none',
                                                          backgroundColor: 'transparent',
                                                          border: 'none',
                                                          position: 'fixed',
                                                          top: '65px',
                                                          left: '5px',
                                                          right: 0,
                                                          bottom: 0,
                                                      }} rows={50}/>

                                </Grid>
                            </Grid>

                    }

                </Container>
            </FullSizeDialog>
            <DialogMitigationScriptDisabled is_validated={is_validated} open={state.openDialogInfo}
                                            description={description} parameters={parameters} name={name}
                                            handleClose={() => setState({...state, openDialogInfo: false})}/>
            <DialogURL title="Link to download the mitigation script"
                       endpoint={`https://iotdet.eu.loclx.io/file/mitigation_script/${mitigation_script_id}/download/device`}
                       open={state.openDialogURL} handleClose={() => setState({
                ...state,
                openDialogURL: false
            })}/>

        </>
    )
}

export default CardMitigationScript