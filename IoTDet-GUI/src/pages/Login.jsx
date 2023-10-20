import {Box, Container} from "@mui/material"
import FormLogin from "../components/Forms/FormLogin.jsx"
import Logo from "../components/Logo/Logo.jsx"
import {useEffect} from "react"

const Login = () => {

    useEffect(() => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")

    }, [])

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginTop: '20vh'
                }}
            >

                <Logo/>

                <FormLogin/>


            </Box>
        </Container>

    )


}

export default Login