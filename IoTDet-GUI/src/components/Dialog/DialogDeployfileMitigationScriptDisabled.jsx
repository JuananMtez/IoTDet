import React, {useState} from "react";
import IconButton from "@mui/material/IconButton";
import {Collapse, Dialog, DialogContent, DialogTitle, Grid, Radio, Stack} from "@mui/material";
import TextFieldStyled from "../TextFieldStyled/TextFieldStyled.jsx";
import Slide from "@mui/material/Slide";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMore from "../Expand/ExpandMore.jsx";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const DialogDeployfileMitigationScriptDisabled = ({deployfile, open, handleClose}) => {

    const [state, setState] = useState({expanded: false})
    const onClose = () => {
        setState({expanded: false})
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
                                name="mitigation_script"
                                InputLabelProps={{shrink: true}}
                                label="Mitigation script"
                                value={deployfile.mitigation_script.name}
                                size="small"
                                fullWidth
                                InputProps={{
                                    readOnly: true
                                }}
                                variant="filled"
                            />
                            <ExpandMore
                                expand={state.expanded}
                                onClick={() => setState({expanded: !state.expanded})}
                                aria-label="show more"
                            >
                                <ExpandMoreIcon/>
                            </ExpandMore>
                        </Stack>
                    </Grid>
                    <Grid item xs={12}>
                        <Collapse in={state.expanded} timeout="auto" unmountOnExit>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextFieldStyled
                                        name="description"
                                        InputLabelProps={{shrink: true}}
                                        label="Description"
                                        size="small"
                                        value={deployfile.mitigation_script.description}
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
                                    <h3>Parameters</h3>
                                </Grid>
                                <Grid item xs={12}>
                                    {
                                        deployfile.mitigation_script.parameters.map((parameter, indexParameter) => (
                                            <Grid key={indexParameter} container spacing={2}>
                                                <Grid container spacing={2} justifyContent="center">
                                                    <Grid item xs={3}>
                                                        <TextFieldStyled
                                                            name="name"
                                                            InputLabelProps={{shrink: true}}
                                                            label="Name"
                                                            value={parameter.name}
                                                            size="small"
                                                            fullWidth
                                                            InputProps={{
                                                                readOnly: true
                                                            }}
                                                            variant="filled"
                                                        />
                                                    </Grid>
                                                    <Grid item xs={9}>
                                                        <TextFieldStyled
                                                            name="description"
                                                            InputLabelProps={{shrink: true}}
                                                            label="Description"
                                                            value={parameter.description}
                                                            size="small"
                                                            fullWidth
                                                            InputProps={{
                                                                readOnly: true
                                                            }}
                                                            variant="filled"
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        ))
                                    }
                                </Grid>

                            </Grid>
                        </Collapse>
                    </Grid>
                </Grid>


            </DialogContent>
        </Dialog>

    )

}

export default DialogDeployfileMitigationScriptDisabled