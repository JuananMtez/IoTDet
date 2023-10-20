import {Box, Card, CardActions, CardContent, CircularProgress, Container, Grid} from "@mui/material";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CodeIcon from "@mui/icons-material/Code.js";
import InfoSharpIcon from "@mui/icons-material/InfoSharp.js";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload.js";
import VerifiedSharpIcon from "@mui/icons-material/VerifiedSharp.js";
import HourglassEmptySharpIcon from "@mui/icons-material/HourglassEmptySharp.js";
import {useState} from "react";
import {downloadDeployfile, getCodeFromDeployfile} from "../../services/FileRequests.js";
import FullSizeDialog from "../Dialog/FullSizeDialog.jsx";
import DoneSharpIcon from "@mui/icons-material/DoneSharp";
import CancelSharpIcon from "@mui/icons-material/CancelSharp";
import DialogDeployfileMitigationScriptDisabled from "../Dialog/DialogDeployfileMitigationScriptDisabled.jsx";

const CardDeployfileMitigationScript = ({deployfile, can_validate, handleValidate, handleInvalidate}) => {

    const [code, setCode] = useState({openDialog: false, loading: false, code: ''})
    const [openDialogInfo, setOpenDialogInfo] = useState(false)

    const handleShowCode = () => {
        setCode({
            ...code,
            loading: true,
        })

        getCodeFromDeployfile(deployfile.id)
            .then(response => {
                setCode({
                    openDialog: true,
                    code: response.data,
                    loading: false,
                })
            })
    }
    const handleDownload = () => {
        downloadDeployfile(deployfile.id)
            .then(response => {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', deployfile.filename);

                document.body.appendChild(link);
                link.click();
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
                        {deployfile.name}
                    </Typography>
                    <Typography variant="body3" sx={{color: 'wheat'}}>
                        Mitigation script deployed: {deployfile.mitigation_script.name}
                    </Typography>
                    <Typography variant="body2" sx={{color: 'wheat !important'}}>
                        Uploaded by: {deployfile.uploaded_by}
                    </Typography>

                </CardContent>
                <CardActions sx={{padding: '0px 8px 8px 8px'}} disableSpacing>
                    <IconButton onClick={handleShowCode}
                                aria-label="add to favorites"
                    >
                        <CodeIcon sx={{color: 'white'}}/>
                    </IconButton>
                    <IconButton
                        aria-label="add to favorites" onClick={() => setOpenDialogInfo(true)}>
                        <InfoSharpIcon sx={{color: 'white'}}/>
                    </IconButton>


                    <IconButton
                        aria-label="add to favorites"
                        sx={{color:'white'}}
                        onClick={handleDownload}>
                        <CloudDownloadIcon/>
                    </IconButton>

                    {
                        !can_validate && deployfile.is_validated &&
                        <IconButton disabled
                                    sx={{color: '#828181', marginLeft: 'auto'}}
                                    aria-label="add to favorites">
                            <VerifiedSharpIcon/>
                        </IconButton>
                    }
                    {
                        !can_validate && !deployfile.is_validated &&
                        <IconButton disabled
                                    sx={{color: '#828181', marginLeft: 'auto'}}
                                    aria-label="add to favorites">
                            <HourglassEmptySharpIcon/>
                        </IconButton>
                    }
                    {
                        can_validate &&
                        <IconButton sx={{
                            marginLeft: 'auto',
                            color: 'white',
                            '&.Mui-disabled': {
                                color: 'rgba(0, 0, 0, 0.26) !important'
                            }
                        }} disabled={deployfile.is_validated} onClick={() => handleValidate(deployfile.id)}>
                            <DoneSharpIcon/>
                        </IconButton>
                    }
                    {
                        can_validate &&
                        <IconButton disabled={!deployfile.is_validated}
                                    aria-label="add to favorites" sx={{
                            color: 'white',
                            '&.Mui-disabled': {
                                color: 'rgba(0, 0, 0, 0.26) !important'
                            }
                        }}
                                    onClick={() => handleInvalidate(deployfile.id)}>
                            <CancelSharpIcon/>
                        </IconButton>
                    }
                </CardActions>
            </Card>
            <FullSizeDialog open={code.openDialog} title={`Code of ${deployfile.name}`}
                            handleClose={() => setCode({...code, openDialog: false, code: ''})}>
                <Container sx={{
                    marginLeft: `100px`,
                    marginTop: '30px',
                    marginRight: "100px",
                }}>
                    {
                        code.loading ?

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
                                                      defaultValue={code.code}
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
            <DialogDeployfileMitigationScriptDisabled open={openDialogInfo} deployfile={deployfile}
                                                      handleClose={() => setOpenDialogInfo(false)}/>
        </>
    )
}

export default CardDeployfileMitigationScript