import {styled} from "@mui/material/styles";
import {Box, Card, CardContent, CircularProgress, Grid} from "@mui/material";
import {useEffect, useState} from "react";
import AreaChartRecharts from "../Charts/AreaChartRecharts.jsx";
import PieChartRecharts from "../Charts/PieChartRecharts.jsx";
import LineChartRecharts from "../Charts/LineChartRecharts.jsx";
import Typography from "@mui/material/Typography";
import {
    getDataFromDatasetOnline,
    getDataFromDatasetPredictionOnline,
    getMalwareFromDataset
} from "../../services/DatasetRequests.js";

const CustomCard = styled(Card)(({theme}) => ({
    borderRadius: "28px",
    backgroundColor: "#555555",
    maxWidth: "100%",
    margin: "auto",
    marginTop: theme.spacing(2)
}));

const CardChartStaticPrediction = ({datasetId, predictionType}) => {
    const [state, setState] = useState({loading: true, data: [], uniqueMalware: []})

    useEffect(() => {
        getDataFromDatasetPredictionOnline(datasetId, predictionType)
            .then(response => {
                if (predictionType === "classification") {
                    getMalwareFromDataset(datasetId)
                        .then(response2 => {
                            setState(prevState => ({
                                loading: false,
                                data: response.data,
                                uniqueMalware: response2.data
                            }))
                        })
                } else {
                    setState(prevState => ({
                        ...prevState,
                        loading: false,
                        data: response.data,

                    }))
                }


            })
    }, [])


    const getComponentChart = () => {
        if (state.loading) {
            return (
                <Box sx={{width: '100%'}}>
                    <Grid container justifyContent="center" alignItems="center" style={{height: '300px'}}>
                        <CircularProgress sx={{color: 'white'}}/>
                    </Grid>
                </Box>
            )
        }

        if (predictionType === "classification")
            return (<LineChartRecharts data={state.data} malware={state.uniqueMalware.map(el => el.name)}/>)
        return (<LineChartRecharts data={state.data} malware={["Normal", "Abnormal"]}/>)

    }
    return (
        <CustomCard>
            <CardContent sx={{paddingTop: '25px !important', paddingBottom: "10px !important"}}>
                <Typography sx={{ml: '10px', color: 'white', fontWeight: 'bold', mb: '10px'}}
                            component="div">
                    {predictionType === "classification" ? "Classification" : "Anomaly detection"}
                </Typography>
                {getComponentChart()}
            </CardContent>
        </CustomCard>
    )
}
export default CardChartStaticPrediction