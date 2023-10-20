import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';

import Divider from '@mui/material/Divider';

import {styled} from "@mui/material/styles";
import {CircularProgress} from "@mui/material";

const TemporalSidebar = ({loading, open, handleClose, children}) => {


    const DrawerHeader = styled('div')(({theme}) => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: theme.spacing(0, 1),
        // necessary for content to be below app bar
        ...theme.mixins.toolbar,
    }));


    return (
        <Box sx={{display: 'flex'}}>
            <Drawer
                anchor={'right'}
                open={open}
                onClose={handleClose}
                variant="temporary"
                sx={{
                    '& .MuiDrawer-paper': {
                        backgroundColor: '#525558',
                        width: '1000px',

                    },
                }}
            >
                <DrawerHeader/>
                <Divider/>
                {loading
                    ?
                    (
                        <Box sx={{
                            position: 'absolute',
                            left: '50%',
                            top: '50%',


                        }}>
                            <CircularProgress sx={{color: 'white'}}/>

                        </Box>
                    )
                    :
                    children

                }

            </Drawer>

        </Box>
    );
}

export default TemporalSidebar