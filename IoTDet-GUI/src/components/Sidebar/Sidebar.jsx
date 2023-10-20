import * as React from 'react';
import {styled, useTheme} from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import {Outlet, useLocation} from 'react-router-dom';

import Item from './Item.jsx'
import {useState} from "react";



const drawerWidth = 200;


const Main = styled('main', {shouldForwardProp: (prop) => prop !== 'open'})(
    ({theme, open}) => ({
        flexGrow: 1,
        padding: theme.spacing(),
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        marginLeft: `100px`,
        marginTop: '30px',
        marginRight: "100px",


        ...(open && {
            transition: theme.transitions.create('margin', {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            }),
            marginLeft: "100px",
            marginRight: "100px"
        }),
    }),
);

const openedMixin = (theme) => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme) => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(10)} + 1px)`,
    },
});

const DrawerHeader = styled('div')(({theme}) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({theme, open}) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const Drawer = styled(MuiDrawer, {shouldForwardProp: (prop) => prop !== 'open'})(
    ({theme, open}) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        ...(open && {
            ...openedMixin(theme),
            '& .MuiDrawer-paper': openedMixin(theme),
        }),
        ...(!open && {
            ...closedMixin(theme),
            '& .MuiDrawer-paper': closedMixin(theme),
        }),
    }),
);


const Sidebar = () => {
    const theme = useTheme();

    const [stateSidebar, setStateSidebar] = useState({open: false})
    const location = useLocation()
    const path = location.pathname.split('/')[1]

    const user = JSON.parse(localStorage.getItem('user'))
    const handleDrawerOpen = () => {
        setStateSidebar({
            ...stateSidebar,
            open: true
        });
    };


    const handleDrawerClose = () => {
        setStateSidebar({
            ...stateSidebar,
            open: false
        });
    };

    return (
        <Box sx={{display: 'flex'}}>
            <CssBaseline/>
            <AppBar position="fixed" open={stateSidebar.open} sx={{backgroundColor: '#525558'}}>
                <Toolbar>
                    <IconButton

                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        edge="start"
                        sx={{
                            marginRight: 5,
                            ...(stateSidebar.open && {display: 'none'}),
                        }}
                    >
                        <MenuIcon sx={{color: "white", fontSize: "2.5rem"}}/>
                    </IconButton>

                </Toolbar>
            </AppBar>
            <Drawer
                variant="permanent"
                open={stateSidebar.open}
                sx={{
                    width: drawerWidth,
                    variant: 'persistent',
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        backgroundColor: '#525558'
                    },
                }}

            >
                <DrawerHeader>
                    <IconButton onClick={handleDrawerClose} sx={{color: "white"}}>
                        {theme.direction === 'rtl' ? <ChevronRightIcon sx={{fontSize: "10rem"}}/> :
                            <ChevronLeftIcon sx={{fontSize: "2.5rem"}}/>}
                    </IconButton>
                </DrawerHeader>
                <Divider/>
                <List>

                    <Item title={'Home'} open={stateSidebar.open} selected={path === 'home'} key={0}/>
                    <Item title={'Profile'} open={stateSidebar.open} selected={path === 'profile'} key={1}/>
                    <Item title={'Devices'} open={stateSidebar.open} selected={path === 'devices'} key={2}/>
                    <Item title={'Files'} open={stateSidebar.open} selected={path === 'files'} key={3}/>
                    <Item title={'Scenarios'} open={stateSidebar.open}
                          selected={path === 'scenarios' || path === 'scenario'} key={4}/>
                    <Item title={'Monitoring'} open={stateSidebar.open} selected={path === 'monitoring'} key={6}/>


                    <Item title={'Datasets'} open={stateSidebar.open}
                          selected={path === 'datasets' || path === "dataset"} key={5}/>
                    <Item title={'Models'} open={stateSidebar.open} selected={path === 'models' || path === "model"}
                          key={7}/>


                </List>
                <Divider/>
                <List>
                    {user.role === 0 &&

                        <Item title={'Root'} open={stateSidebar.open} selected={path === 'root'} key={8}/>


                    }
                    {user.role === 1 &&
                        <Item title={'Admin'} open={stateSidebar.open} selected={path === 'root'} key={10}/>
                    }

                    <Item title={'Logout'} open={stateSidebar.open} selected={path === 'logout'} key={11}/>
                </List>
            </Drawer>
            <Main open={stateSidebar.open}>
                <DrawerHeader/>
                <Outlet/>
            </Main>

        </Box>
    );
}
export default Sidebar