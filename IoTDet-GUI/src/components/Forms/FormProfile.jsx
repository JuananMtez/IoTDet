import {Alert, Button, Container, Grid, Snackbar, Stack} from '@mui/material'
import TextFieldStyled from '../TextFieldStyled/TextFieldStyled'
import logoMender from '../../assets/mender-logo.png'
import {useState} from 'react'
import FormDialog from '../Dialog/FormDialog'
import {changePassword} from '../../services/UserRequests'
import {RoleEnum} from "../../enums.js";


const FormProfile = () => {

    const user = JSON.parse(localStorage.getItem('user'))

    const [showDialogChangePassword, setShowDialogChangePassword] = useState(false)
    const [newPassword, setNewPassword] = useState("")
    const [loadingChangePassword, setLoadingChangePassword] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)


    const handleOpenShowSuccess = () => {
        setShowSuccess(true)
    }

    const handleCloseShowSuccess = () => {
        setShowSuccess(false)
    }

    const handleOpenDialogChangePassword = () => {
        setShowDialogChangePassword(true)
    }


    const handleCloseDialogChangePassword = () => {
        setShowDialogChangePassword(false)
        setNewPassword("")
    }

    const handleSendChangePassword = () => {
        setLoadingChangePassword(true)
        changePassword(newPassword)
            .then(() => {
                setLoadingChangePassword(false)
                handleCloseDialogChangePassword()
                handleOpenShowSuccess()
            })

    }

    const handleChangePassword = (e) => {
        setNewPassword(e.target.value)
    }


    return (
        <Container
            maxWidth="false"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',

            }}
        >
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <h2>Account info</h2>
                    <hr/>
                </Grid>
                <Grid item xs={4}>

                    <TextFieldStyled
                        fullWidth
                        name="name"
                        variant="filled"
                        label="Name"
                        value={user.name}
                        InputProps={{
                            readOnly: true,
                        }}
                    />
                </Grid>
                <Grid item xs={2}>

                </Grid>
                <Grid item xs={4}>
                    <TextFieldStyled
                        fullWidth
                        name="role"
                        variant="filled"
                        label="Role"
                        value={RoleEnum[user.role].value}
                        InputProps={{
                            readOnly: true,
                        }}
                    />
                </Grid>


                <Grid item xs={4}>

                    <TextFieldStyled
                        fullWidth
                        name="user"
                        label="Username"
                        variant="filled"
                        InputProps={{
                            readOnly: true,
                        }}
                        value={user.user}
                    />
                </Grid>
                <Grid item xs={2}></Grid>
                <Grid item xs={6}>
                    <Stack direction="row" spacing={5} alignItems="center">
                        <h3>Change password</h3>

                        <Button size="small" variant="contained" sx={{
                            color: 'white',
                            backgroundColor: '#C63637',
                            borderRadius: '28px',
                            fontWeight: 'bold',
                            '&:hover': {backgroundColor: '#9d292a'}
                        }} onClick={handleOpenDialogChangePassword}>Reset password</Button>

                    </Stack>

                </Grid>


            </Grid>
            <FormDialog
                open={showDialogChangePassword}
                handleClose={handleCloseDialogChangePassword}
                title={'Change password'}
                fields={['Password']}
                values={[newPassword]}
                names={['newPassword']}
                onChange={handleChangePassword}
                loading={loadingChangePassword}
                handleClick={handleSendChangePassword}
                showError={false}
            />

            <Snackbar anchorOrigin={{vertical: "bottom", horizontal: "right"}} open={showSuccess}
                      autoHideDuration={3000} onClose={handleCloseShowSuccess}>
                <Alert onClose={handleCloseShowSuccess} severity="success" sx={{width: '100%'}}>
                    The password has been updated successfully!
                </Alert>
            </Snackbar>
        </Container>

    )
}

export default FormProfile