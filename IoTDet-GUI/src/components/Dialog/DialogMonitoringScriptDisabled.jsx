import {
    Dialog,
    DialogContent,
    DialogTitle,

    Grid, Radio, Stack,

} from "@mui/material";
import TextFieldStyled from "../TextFieldStyled/TextFieldStyled.jsx";

import React from "react";
import Slide from "@mui/material/Slide";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const DialogMonitoringScriptDisabled = ({open, handleClose, name, description, is_validated, columns}) => {
    let initalValue = ''

    const returned = columns.reduce((acc, currentValue) => acc + currentValue.name + ', ', initalValue)


    return (
        <Dialog
            open={open}
            TransitionComponent={Transition}
            keepMounted
            onClose={handleClose}
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
                Information of {name}
                {<IconButton
                    aria-label="close"
                    onClick={handleClose}
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
                            value={name}
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
                            value={description}
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
                            rows={4}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <span>Is the monitoring script validated?</span>
                            {
                                is_validated
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
            </DialogContent>
        </Dialog>
    )
}
export default DialogMonitoringScriptDisabled