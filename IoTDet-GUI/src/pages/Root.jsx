import {Outlet, useLocation, useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {Grid} from "@mui/material";
import TabsStyled from "../components/Tabs/TabsStyled.jsx";
import TabStyled from "../components/Tabs/TabStyled.jsx";

const Root = () => {


    const location = useLocation()
    const navigate = useNavigate()

    const getTab = () => {
        switch (location.pathname.split('/')[2]) {
            case 'users':
                return 0
            case 'files':
                return 1
            default:
                return 0
        }
    }

    const [state, setState] = useState({tab: getTab()})


    useEffect(() => {
        if (location.pathname.split('/')[2] === undefined)
            navigate('users')
    }, [])

    const handleChange = (event, newValue) => {
        setState({
            ...state,
            tab: newValue
        });

        switch (newValue) {
            case 0:
                navigate('users')
                break
            case 1:
                navigate('files')
                break


        }

    }

    return (
        <Grid container>

            <Grid item xs={12}>
                <TabsStyled
                    value={state.tab}

                    onChange={handleChange}
                    TabIndicatorProps={{
                        style: {
                            backgroundColor: "gray",
                            height: '3px'
                        }
                    }}
                >
                    <TabStyled label="Users"/>
                    <TabStyled label="Files"/>
                </TabsStyled>
                <hr style={{margin: 'auto'}}/>

            </Grid>
            <Grid item xs={12} >
                <Outlet/>
            </Grid>
        </Grid>


    )
}

export default Root
