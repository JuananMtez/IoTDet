import {styled} from '@mui/material/styles';
import TextField from '@mui/material/TextField';


const TextFieldStyled = styled(TextField)({

    input: {
        color: 'white',

    },
    label: {
        color: '#ffffff',
    },
    '& label.Mui-focused': {
        color: 'white',
    },

    '& .MuiFilledInput-underline:before': { borderBottomColor: 'white' },
    '& .MuiFilledInput-root': {
        color: 'white'
    },

    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            borderColor: '#398bac',
        },

        '&:hover fieldset': {
            borderColor: '#398bac',
        },
        '&.Mui-focused fieldset': {
            borderColor: '#398bac',
        },
        '& .MuiOutlinedInput-input': {
            color: 'white',
            borderRadius: '28px'
        }

    },
});

export default TextFieldStyled;