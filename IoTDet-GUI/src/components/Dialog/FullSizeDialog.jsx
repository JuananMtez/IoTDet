import {AppBar, Dialog} from "@mui/material";
import Slide from "@mui/material/Slide";
import Typography from "@mui/material/Typography";
import CloseIcon from '@mui/icons-material/Close';
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import React from "react";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});
const FullSizeDialog = ({title, children, open, handleClose}) => {
    return (
        <Dialog
            open={open}
            fullScreen
            onClose={handleClose}
            TransitionComponent={Transition}
            PaperProps={{
                style: {
                    backgroundColor: '#676767',
                    color: 'white',
                    fontWeight: 'bold',
                    overflow: 'hidden',
                }
            }}

        >
            <AppBar sx={{position: 'relative', backgroundColor: '#525558'}}>
                <Toolbar>
                    <IconButton
                        edge="start"
                        sx={{color: 'white'}}
                        onClick={handleClose}
                        aria-label="close"

                    >
                        <CloseIcon/>
                    </IconButton>
                    <Typography sx={{ml: 2, flex: 1}} variant="h6" component="div">
                        {title}
                    </Typography>
                </Toolbar>
            </AppBar>
            {children}
        </Dialog>
    )
}

export default FullSizeDialog