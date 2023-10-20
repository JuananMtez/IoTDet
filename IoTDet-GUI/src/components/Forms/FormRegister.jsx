import {Alert, Box, Grid, Snackbar} from "@mui/material"
import LoadingButton from '@mui/lab/LoadingButton';
import {useState} from "react"
import TextFieldStyled from "../TextFieldStyled/TextFieldStyled.jsx"
import {userRegister} from "../../services/UserRequests";
import {useNavigate} from "react-router-dom";
import AlertDialogOneButton from "../Dialog/AlertDialogOneButton.jsx"

const FormRegister = () => {
    let navigate = useNavigate()


    const [form, setForm] = useState({name: "", user: "", password: "", menderUser: "", menderPassword: ""})
    const [showErrorNotValidUser, setShowErrorNotValidUser] = useState(false)
    const [loadingRegister, setLoadingRegister] = useState(false)
    const [openSnackBar, setOpenSnackBar] = useState(false)

    const handleChangeForm = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }

    const handleOpenDialog = () => setOpenSnackBar(true)
    const handleCloseSnackBar = () => {
        setOpenSnackBar(false)
        navigate('../login')
    }


    const handleRegister = () => {
        setLoadingRegister(true)
        userRegister(form.name, form.user, form.password, false, form.menderUser, form.menderPassword)
            .then(() => {
                handleOpenDialog()
            }).catch((error) => {
            if (error.response.status === 409)
                setShowErrorNotValidUser(true)
        }).finally(() => setLoadingRegister(false))


    }

    return (
        <Grid container spacing={1}>
            <Grid item xs={12}>
                <TextFieldStyled
                    fullWidth
                    variant="filled"

                    margin="normal"
                    label="Name"
                    value={form.name}
                    onChange={handleChangeForm}
                    name="name"
                />
            </Grid>

            <Grid item xs={12}>
                <TextFieldStyled
                    fullWidth
                    variant="filled"

                    margin="normal"
                    label="User"
                    error={showErrorNotValidUser}
                    value={form.user}
                    onChange={handleChangeForm}
                    name="user"
                />
                {showErrorNotValidUser &&
                    <Grid item xs={12}>
                        <Box component="span" sx={{color: "#C63637", fontSize: "1rem", fontWeight: "bold"}}>
                            The user is already registered
                        </Box>
                    </Grid>
                }
            </Grid>
            <Grid item xs={12}>
                <TextFieldStyled
                    fullWidth
                    variant="filled"

                    type="password"
                    margin="normal"
                    label="Password"
                    value={form.password}
                    onChange={handleChangeForm}
                    name="password"
                />
            </Grid>

            <Grid item xs={12} sx={{mt: '5vh'}}>
                <LoadingButton
                    disabled={form.name === "" || form.user === "" || form.password === ""}
                    fullWidth
                    variant="contained"
                    sx={{borderRadius: '28px'}}
                    color="success"
                    loading={loadingRegister}
                    onClick={handleRegister}
                >
                    Register
                </LoadingButton>
            </Grid>


            <Snackbar anchorOrigin={{vertical: "bottom", horizontal: "right"}} open={openSnackBar}
                      autoHideDuration={2000} onClose={handleCloseSnackBar}>
                <Alert severity="success" sx={{width: '100%'}}>
                    The user was registered successfully. Redirecting...
                </Alert>
            </Snackbar>


        </Grid>
    )
}
export default FormRegister