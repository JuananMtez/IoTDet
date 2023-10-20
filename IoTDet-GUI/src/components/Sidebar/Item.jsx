import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import {Link} from 'react-router-dom'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import * as React from 'react'
import HomeSharpIcon from '@mui/icons-material/HomeSharp'
import PersonSharpIcon from '@mui/icons-material/PersonSharp'
import RadioIcon from '@mui/icons-material/Radio'
import WbCloudySharpIcon from '@mui/icons-material/WbCloudySharp'
import LogoutSharpIcon from '@mui/icons-material/LogoutSharp';
import AdminPanelSettingsSharpIcon from '@mui/icons-material/AdminPanelSettingsSharp';
import DescriptionIcon from '@mui/icons-material/Description';
import SupervisorAccountSharpIcon from '@mui/icons-material/SupervisorAccountSharp';
import DatasetSharpIcon from '@mui/icons-material/DatasetSharp';
import BarChartSharpIcon from '@mui/icons-material/BarChartSharp';
import PsychologySharpIcon from '@mui/icons-material/PsychologySharp';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';
const Item = ({title, open, selected}) => {
    const getIcon = (path) => {

        switch (path) {
            case 'Home':
                return <HomeSharpIcon sx={{color: 'white', fontSize: "2.5rem"}}/>
            case 'Profile':
                return <PersonSharpIcon sx={{color: 'white', fontSize: "2.5rem"}}/>
            case 'Devices':
                return <RadioIcon sx={{color: 'white', fontSize: "2.5rem"}}/>
            case 'Files':
                return <DescriptionIcon sx={{color: 'white', fontSize: "2.5rem"}}/>

            case 'Root':
                return <AdminPanelSettingsSharpIcon sx={{color: "white", fontSize: "2.5rem"}}/>
            case 'Admin':
                return <SupervisorAccountSharpIcon sx={{color: "white", fontSize: "2.5rem"}}/>
            case 'Datasets':
                return <DatasetSharpIcon sx={{color: "white", fontSize: "2.5rem"}}/>
            case 'Monitoring':
                return <BarChartSharpIcon sx={{color: "white", fontSize: "2.5rem"}}/>
            case 'Models':
                return <PsychologySharpIcon sx={{color: "white", fontSize: "2.5rem"}}/>
            case 'Scenarios':
                return <DeviceHubIcon sx={{color: "white", fontSize: "2.5rem"}}/>

            case 'Logout':
                return <LogoutSharpIcon sx={{color: "#C63637", fontSize: "2.5rem"}}/>
            default:
                break;
        }
    }

    return (
        <ListItem key={title} disablePadding sx={{display: 'block'}}>
            <ListItemButton
                component={Link}
                to={`/${title.toLowerCase()}`}
                state={{sidebar: open}}
                selected={selected}
                sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,


                    '&.Mui-selected': {
                        backgroundColor: "#5c728996"
                    }
                }}
            >
                <ListItemIcon
                    sx={{
                        minWidth: 0,
                        mr: open ? 3 : 'auto',
                        justifyContent: 'center',

                    }}
                >
                    {getIcon(title)}
                </ListItemIcon>
                <ListItemText disableTypography={true} primary={title}
                              sx={{opacity: open ? 1 : 0, fontWeight: 'bold !important', color: 'white'}}/>
            </ListItemButton>
        </ListItem>
    )
}

export default Item