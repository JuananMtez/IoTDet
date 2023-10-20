import {styled} from '@mui/material/styles';
import {Tab} from "@mui/material";

const TabStyled = styled(Tab)({
    fontSize: '15px',
    fontWeight: 'bold',
    color: '#6f6f77',
    '&.Mui-selected': {
        color: 'white',
    },
    '&.Mui-disabled': {
        color: 'rgba(0,0,0,0.2)'
    }
});

export default TabStyled;