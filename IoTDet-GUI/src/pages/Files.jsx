import {Outlet, useLocation, useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {Grid} from "@mui/material";
import TabsStyled from "../components/Tabs/TabsStyled.jsx";
import TabStyled from "../components/Tabs/TabStyled.jsx";


const Files = () => {

    const location = useLocation()
    const navigate = useNavigate()


    const getTab = () => {
        switch (location.pathname.split('/')[2]) {
            case 'monitoring_scripts':
                return 0
            case 'malware':
                return 1
            case 'mitigation_scripts':
                return 2
            case 'deployfiles':
                return 3
            default:
                return 0
        }
    }

    const [stateFiles, setStateFiles] = useState({tab: getTab()})

    useEffect(() => {
        if (location.pathname.split('/')[2] === undefined)
            navigate('monitoring_scripts')
    }, [])


    const handleChange = (event, newValue) => {
        setStateFiles({
            ...stateFiles,
            tab: newValue
        });

        switch (newValue) {
            case 0:
                navigate('monitoring_scripts')
                break
            case 1:
                navigate('malware')
                break
            case 2:
                navigate('mitigation_scripts')
                break
            case 3:
                navigate('deployfiles')
                break

        }

    }

    return (
        <Grid container>
            <Grid item xs={12}>
                <TabsStyled
                    value={stateFiles.tab}

                    onChange={handleChange}
                    TabIndicatorProps={{
                        style: {
                            backgroundColor: "gray",
                            height: '3px'
                        }
                    }}
                >
                    <TabStyled label="Monitoring Scripts"/>
                    <TabStyled label="Malware"/>
                    <TabStyled label="Mitigation Scripts"/>
                    <TabStyled label="Deployfiles"/>
                </TabsStyled>
                <hr style={{margin: 'auto'}}/>

            </Grid>
            <Grid item xs={12} sx={{mt: '0px'}}>

                <Outlet/>
            </Grid>
        </Grid>
    )
}

export default Files