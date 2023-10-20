import {Grid, Stack} from "@mui/material";
import logoMender from "../assets/mender-logo.png";

const Home = () => {

    return (

        <Grid container spacing={2}>
            <Grid item xs={12}>
                <h2>Introduction</h2>
                <hr/>
            </Grid>

            <Grid item xs={12}>
                <span style={{
                    color: 'white',
                    display: 'inline-block !important',
                    wordWrap: 'break-word',
                    maxWidth: '100vh',

                }}>
IotDet is an application that allows researchers to create models trained by artificial intelligence to detect and classify malware. These models are created from data obtained from custom monitoring scripts (uploaded by IotDet users') installed on the devices.<br/><br/>
IotDet allows the user to perform each of the artificial intelligence steps (data acquisition, preprocessing, feature extraction and ML/DL techniques), as well as providing the most useful techniques found in the literature. Additionally, the application provides useful information to be able to study the obtained data and models by means of graphs and tables. <br/><br/>
Finally, monitoring scenarios can be created where the user can monitor the state of the devices using the previously created models and in case of finding any unusual state, mitigation techniques selected by the user are applied<br/><br/>
</span>
            </Grid>
            <Grid item xs={12}>
                <h2>Integration</h2>
                <hr/>
            </Grid>
            <Grid item xs={12}>
                <Grid container direction="row" alignItems="center">
                    <Grid item xs={1}>
                        <img src={logoMender} alt="mender logo" width="105px" height="95px"/>
                    </Grid>
                    <Grid item xs={11}>
                        <Stack direction="column">
                            <span style={{color: 'white', fontSize: '2.5vh'}}>Mender</span>
                            <span style={{
                                color: 'white',
                                display: 'inline-block !important',
                                wordWrap: 'break-word',
                                maxWidth: '100vh',
                                fontSize: '1.5vh'
                            }}>Mender is a secure and robust software update system designed to handle large number of devices. It has a simple client/server architecture allowing central management of deployments to all devices.<br/>Reference: <a
                                style={{color: 'white'}} href="https://docs.mender.io/overview/introduction"
                                target="_blank">Mender Introduction</a>.</span>
                        </Stack>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>

    )
}


export default Home