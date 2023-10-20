import {useEffect, useState} from "react";
import {Outlet, useNavigate} from "react-router-dom";
import {Grid} from "@mui/material";
import TabsStyled from "../components/Tabs/TabsStyled.jsx";
import TabStyled from "../components/Tabs/TabStyled.jsx";
import * as React from "react";

const getTab = () => {
    const paths = location.pathname.split('/')
    if (paths.length === 3)
        return 0
    else {
        if (paths[3] === 'monitoring_script')
            return 0
        else if (paths[3] === 'malware')
            return 1
        else if (paths[3]=== "mitigation_script")
            return 2
        else
        return 3
    }
}

const RootFiles = () => {
    const [tab, setTab] = useState(getTab())
    const navigate = useNavigate()

    useEffect(() => {
        const paths = location.pathname.split("/")
        if (paths[3] === undefined)
            navigate('monitoring_script')
        else {
            if (paths[3] === 'monitoring_script')
                navigate('monitoring_script')
            else if (paths[3] === 'malware')
                navigate('malware')
            else if (paths[3] === 'mitigation_script')
                navigate('mitigation_script')
            else
                navigate('deployfile')

        }
    }, [])

    const handleChange = (event, newValue) => {
        setTab(newValue)

        switch (newValue) {
            case 0:
                navigate('monitoring_script')
                break
            case 1:
                navigate('malware')
                break
            case 2:
                navigate('mitigation_script')
                break
            case 3:
                navigate('deployfile')

        }
    }


    return (
        <Grid container>
            <Grid item xs={12}>

                <TabsStyled
                    onChange={handleChange}
                    value={tab}
                    TabIndicatorProps={{
                        style: {
                            backgroundColor: "gray",
                        }
                    }}
                    sx={{backgroundColor: 'rgba(0,0,0,0.1)'}}>
                    <TabStyled value={0} label="Monitoring script"/>
                    <TabStyled value={1} label="Malware"/>
                    <TabStyled value={2} label="Mitigation script"/>
                    <TabStyled value={3} label="Deployfile"/>

                </TabsStyled>
            </Grid>

            <Grid item xs={12}>
                <Outlet/>
            </Grid>
        </Grid>
    )
}

export default RootFiles