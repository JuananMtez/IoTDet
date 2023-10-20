import {Container} from "@mui/material"
import FormRegister from "../components/Forms/FormRegister.jsx"
import Logo from "../components/Logo/Logo.jsx"

const Register = () => {
    return (
        <Container
            maxWidth="sm"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginTop: '20vh'
            }}
        >
            <Logo/>
            <FormRegister/>
        </Container>
    )
}

export default Register