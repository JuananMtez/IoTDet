import {DialogActions, DialogContent, DialogContentText, DialogTitle, Dialog, Button} from '@mui/material';

const AlertDialogOneButton = ({title, description, open, handleClose}) => {

    return (
        <Dialog
            open={open}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            PaperProps={{
                style: {
                    backgroundColor: '#676767',
                    color: 'white',
                    fontWeight: 'bold',
                    borderRadius: '20px'
                }
            }}
        >
            <DialogTitle sx={{fontWeight: 'bold'}} id="alert-dialog-title">
                {title}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description" sx={{color: "white"}}>
                    {description}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={handleClose}
                        sx={{borderRadius: '28px', fontWeight: 'bold'}}>Accept</Button>

            </DialogActions>
        </Dialog>
    )
}

export default AlertDialogOneButton