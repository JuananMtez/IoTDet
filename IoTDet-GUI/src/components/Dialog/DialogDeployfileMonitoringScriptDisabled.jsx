import {Collapse, Dialog, DialogContent, DialogTitle, Grid, Radio, Stack} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close.js";
import TextFieldStyled from "../TextFieldStyled/TextFieldStyled.jsx";
import React, {useState} from "react";
import Slide from "@mui/material/Slide";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore.js";
import ExpandMore from "../Expand/ExpandMore.jsx";


const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const DialogDeployfileMonitoringScriptDisabled = ({deployfile, open, handleClose}) => {
    const [stateDialog, setStateDialog] = useState({expanded: false})
    let initalValue = ''

    const returned = deployfile.monitoring_script.columns.reduce((acc, currentValue) => acc + currentValue.name + ', ', initalValue)
    const onClose = () => {
        setStateDialog({expanded: false})
        handleClose()
    }
    return (
        <Dialog
            open={open}
            TransitionComponent={Transition}
            keepMounted
            onClose={onClose}
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
                Information of {deployfile.name}
                {<IconButton
                    aria-label="close"
                    onClick={onClose}
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
                        <TextFieldStyled
                            name="name"
                            InputLabelProps={{shrink: true}}
                            label="Name"
                            value={deployfile.name}
                            size="small"
                            fullWidth
                            InputProps={{
                                readOnly: true
                            }}
                            variant="filled"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextFieldStyled
                            name="description"
                            InputLabelProps={{shrink: true}}
                            label="Description"
                            size="small"
                            value={deployfile.description}
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
                        <Stack direction="row" spacing={1} alignItems="center">
                            <span>Is the deployfile validated?</span>
                            {
                                deployfile.is_validated
                                    ?
                                    <Radio size="small" color="success" checked={true} sx={{

                                        '&.Mui-checked': {
                                            color: '#35c13c',
                                        },
                                    }}/>
                                    :
                                    <Radio size="small" checked={true} sx={{

                                        '&.Mui-checked': {
                                            color: '#e30000',
                                        },
                                    }}/>
                            }
                        </Stack>

                    </Grid>
                    <Grid item xs={12}>
                        <Stack direction="row" spacing={1}>
                            <TextFieldStyled
                                name="monitoring_script"
                                InputLabelProps={{shrink: true}}
                                label="Monitoring script"
                                value={deployfile.monitoring_script.name}
                                size="small"
                                fullWidth
                                InputProps={{
                                    readOnly: true
                                }}
                                variant="filled"
                            />
                            <ExpandMore
                                expand={stateDialog.expanded}
                                onClick={() => setStateDialog({expanded: !stateDialog.expanded})}
                                aria-label="show more"
                            >
                                <ExpandMoreIcon/>
                            </ExpandMore>
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
                                        value={deployfile.monitoring_script.description}
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
                                        value={returned.slice(0, -2)}
                                        fullWidth
                                        variant="filled"
                                        InputProps={{
                                            readOnly: true
                                        }}

                                        multiline
                                        rows={3}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <span>Is the monitoring script validated?</span>
                                        {
                                            deployfile.monitoring_script.is_validated
                                                ?
                                                <Radio size="small" color="success" checked={true} sx={{

                                                    '&.Mui-checked': {
                                                        color: '#35c13c',
                                                    },
                                                }}/>
                                                :
                                                <Radio size="small" checked={true} sx={{

                                                    '&.Mui-checked': {
                                                        color: '#e30000',
                                                    },
                                                }}/>
                                        }
                                    </Stack>

                                </Grid>
                            </Grid>
                        </Collapse>
                    </Grid>
                </Grid>
            </DialogContent>
        </Dialog>
    )
}

export default DialogDeployfileMonitoringScriptDisabled