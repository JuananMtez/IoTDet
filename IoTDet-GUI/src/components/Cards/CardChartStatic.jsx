import {Box, Card, CardContent, CircularProgress, Grid} from "@mui/material";
import Typography from "@mui/material/Typography";
import AreaChartRecharts from "../Charts/AreaChartRecharts.jsx";
import PieChartRecharts from "../Charts/PieChartRecharts.jsx";
import {styled} from "@mui/material/styles";
import {useEffect, useState} from "react";
import {getDataFromDatasetOffline, getDataFromDatasetOnline} from "../../services/DatasetRequests.js";


const CustomCard = styled(Card)(({theme}) => ({
    borderRadius: "28px",
    backgroundColor: "#555555",
    maxWidth: "100%",
    margin: "auto",
    marginTop: theme.spacing(2),
}));




const CardChartStatic = ({datasetId, featureName, featureDatatype}) => {
    const [state, setState] = useState({loading: true, data: []})

    useEffect(() => {
        getDataFromDatasetOffline(datasetId, featureName)
            .then(response => {
                setState(prevState => ({
                    loading: false,
                    data: response.data
                }))
            })
    }, [])

    const getComponentChart = () => {
        if (state.loading || featureDatatype === 'Unknown') {
            return (
                <Box sx={{width: '100%'}}>
                    <Grid container justifyContent="center" alignItems="center" style={{height: '300px'}}>
                        <CircularProgress sx={{color: 'white'}}/>
                    </Grid>
                </Box>
            )
        }

        if (featureDatatype === 'int' || featureDatatype === 'float')
            return (<AreaChartRecharts data={state.data} datakey={featureName}/>
            )
        else
            return (<PieChartRecharts data={state.data} datakey={featureName}/>)

    }

    return (


        <CustomCard>
            <CardContent sx={{paddingBottom: "10px !important"}}>

                <Typography sx={{ml:'10px', color: 'white', fontWeight: 'bold', mb:'10px'}}
                            component="div">
                    {featureName}
                </Typography>
                {getComponentChart()}

            </CardContent>
        </CustomCard>


    )
}

export default CardChartStatic