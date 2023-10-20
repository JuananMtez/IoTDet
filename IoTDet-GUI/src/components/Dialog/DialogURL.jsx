import {Button, Dialog, DialogContent, DialogTitle, InputAdornment} from "@mui/material";
import React from "react";
import Slide from "@mui/material/Slide";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import TextFieldStyled from "../TextFieldStyled/TextFieldStyled.jsx";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});


const DialogURL = ({open, handleClose, endpoint, title}) => {
    return (
        <Dialog
            open={open}
            TransitionComponent={Transition}
            keepMounted

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
                {title}
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
                <TextFieldStyled
                    name="name"
                    InputLabelProps={{shrink: true}}
                    value={endpoint}
                    size="small"
                    fullWidth
                    variant="filled"
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <Button onClick={() => {
                                    navigator.clipboard.writeText(`${endpoint}`)
                                }}
                                        size="small" variant="contained">Copy</Button>
                            </InputAdornment>
                        )

                    }}

                />
            </DialogContent>

        </Dialog>
    )
}
export default DialogURL