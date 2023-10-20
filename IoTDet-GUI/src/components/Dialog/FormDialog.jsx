import {DialogActions, DialogContent, DialogTitle, Dialog, Button, Grid, Box} from '@mui/material'
import {forwardRef} from 'react'
import Slide from '@mui/material/Slide';
import TextFieldStyled from '../TextFieldStyled/TextFieldStyled.jsx'
import LoadingButton from '@mui/lab/LoadingButton'


const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const getTextField = (element, onChange, value, name) => {
    if (element === 'Password')
        return <TextFieldStyled name={name} value={value} label={element} type="password" onChange={onChange} fullWidth
                                variant="filled"/>
    else
        return <TextFieldStyled name={name} onChange={onChange} value={value} label={element} fullWidth
                                variant="filled"/>

}
const FormDialog = ({
                        title,
                        open,
                        handleClose,
                        fields,
                        handleClick,
                        values,
                        onChange,
                        loading,
                        names,
                        showError,
                        errorText
                    }) => {
    return (
        <Dialog
            open={open}
            TransitionComponent={Transition}
            keepMounted
            maxWidth="sm"
            fullWidth
            aria-describedby="alert-dialog-slide-description"
            PaperProps={{
                style: {
                    backgroundColor: '#676767',
                    color: 'white',
                    fontWeight: 'bold',
                    borderRadius: '25px'
                }
            }}
        >
            <DialogTitle sx={{fontWeight: 'bold'}}>{title}</DialogTitle>
            <DialogContent>
                <Grid container spacing={2}>
                    {
                        fields.map((element, index) => (
                            <Grid key={index} item xs={12}>
                                {getTextField(element, onChange, values[index], names[index])}
                            </Grid>
                        ))
                    }
                    {
                        showError &&
                        <Grid item xs={12}>
                            <Box component="span" sx={{color: "#fc6060", fontSize: "1rem", fontWeight: "bold"}}>
                                {errorText}
                            </Box>
                        </Grid>
                    }

                </Grid>


            </DialogContent>
            <DialogActions>
                <LoadingButton disabled={values.filter(el => el === '').length > 0} loading={loading} size="small"
                               variant="contained" onClick={handleClick}
                               sx={{borderRadius: '28px', fontWeight: 'bold'}}>Accept</LoadingButton>
                <Button size="small" color="error" variant="contained" onClick={handleClose}
                        sx={{borderRadius: '28px', fontWeight: 'bold'}}>Cancel</Button>

            </DialogActions>
        </Dialog>
    )
}

export default FormDialog