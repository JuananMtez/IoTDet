import TextFieldStyled from "../TextFieldStyled/TextFieldStyled.jsx"
import {Grid, Box, Button} from "@mui/material"
import {useNavigate} from "react-router-dom";
import {useState} from "react";
import {getUserProfile, userLogin} from '../../services/UserRequests'

const FormLogin = () => {

    let navigate = useNavigate()

    const [showErrorLogin, setShowErrorLogin] = useState(false)
    const [form, setForm] = useState({user: "", password: ""})

    const handleClickRegister = () => {
        navigate('../register')
    }


    const handleChangeForm = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }

    const handleClickLogin = () => {
        userLogin(form.user, form.password)
            .then(responseLogin => {


                    localStorage.setItem('token', JSON.stringify(responseLogin.data.access_token));
                    getUserProfile()
                        .then(responseGetProfile => {
                            localStorage.setItem('user', JSON.stringify(responseGetProfile.data))
                            navigate('/home')
                        })


                }
            )
            .catch(() => setShowErrorLogin(true))
    }

    return (
        <Grid container sx={{mt: '2vh'}}>

            <Grid item xs={12}>
                <TextFieldStyled
                    fullWidth
                    variant="filled"
                    margin="normal"
                    error={showErrorLogin}
                    label="User"
                    onChange={handleChangeForm}
                    name="user"

                />
            </Grid>
            <Grid item xs={12}>
                <TextFieldStyled
                    fullWidth
                    variant="filled"

                    margin="normal"
                    label="Password"
                    error={showErrorLogin}
                    type="password"
                    onChange={handleChangeForm}
                    name="password"
                />
            </Grid>
            {showErrorLogin &&
                <Grid item xs={12}>
                    <Box component="span" sx={{color: "#C63637", fontSize: "1rem", fontWeight: "bold"}}>
                        The user or password are incorrects
                    </Box>
                </Grid>
            }
            <Grid item xs={12}>
                <Button
                    variant="contained"
                    fullWidth
                    disabled={form.user === "" || form.password === ""}
                    sx={{mt: '3vh', borderRadius: '28px', fontWeight: 'bold'}}
                    onClick={handleClickLogin}
                >
                    Login
                </Button>
                {
                    /*
                <Button
                    variant="text"
                    fullWidth
                    size='small'
                    onClick={handleClickRegister}
                    sx={{mt:'1vh', color:'#5D9B9B', borderRadius: '28px', fontWeight:'bold'}}
                >
                    Don't have an account? Sign Up
                </Button>
                */}

            </Grid>

        </Grid>

    )
}

export default FormLogin