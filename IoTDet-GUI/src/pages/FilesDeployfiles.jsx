import {useEffect, useState} from "react";
import {Grid} from "@mui/material";
import * as React from "react";
import {Outlet, useNavigate, useOutletContext} from "react-router-dom";
import TabsStyled from "../components/Tabs/TabsStyled.jsx";
import TabStyled from "../components/Tabs/TabStyled.jsx";


const getTab = () => {
    const paths = location.pathname.split('/')
    if (paths.length === 3)
        return 0
    else {
        if (paths[3] === 'monitoring_script')
            return 0
        else
            return 1
    }
}

const FilesDeployfiles = () => {


    const [tab, setTab] = useState(getTab())
    const navigate = useNavigate()
    useEffect(() => {
        const paths = location.pathname.split("/")
        if (paths[3] === undefined)
            navigate('monitoring_script')
        else {
            if (paths[3] === 'monitoring_script')
                navigate('monitoring_script')
            else if (paths[3] === "malware")
                navigate('malware')
            else
                navigate("mitigation_script")

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
                            height: '3px',

                        }
                    }}
                    sx={{backgroundColor: 'rgba(0,0,0,0.1)', '& .MuiTabs-flexContainer': {justifyContent: "flex-end"}}}>
                    <TabStyled value={0} label="Monitoring script"/>
                    <TabStyled value={1} label="Malware"/>
                    <TabStyled value={2} label="Mitigation script"/>
                </TabsStyled>
            </Grid>

            <Grid item xs={12}>
                <Outlet/>
            </Grid>

        </Grid>
    )
}

export default FilesDeployfiles