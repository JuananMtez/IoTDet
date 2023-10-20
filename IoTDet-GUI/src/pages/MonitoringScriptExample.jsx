import {Grid} from "@mui/material";

const MonitoringScriptExample = () => {
    return (
        <Grid container sx={{ml: '1%'}}>
            <Grid item xs={12}>
                <pre>
                    <code style={{color: 'white', tabSize: 4}}>

                        # Code example written in Python<br/><br/>

                        import os<br/>
                        import requests<br/><br/>
                        def get_mac_address(): # Function that shall return the mac address of the device in the format 'XX:XX:XX:XX'<br/>
                        &emsp;&emsp;...<br/>
                        &emsp;&emsp;return mac_address<br/><br/>

                        MAC = get_mac_address()<br/>
                        server='https://iotdet.eu.loclx.io'<br/><br/>

                        while True<br/><br/>
                        &emsp;&emsp;response = requests.get(f"&#123;server&#125;/scenario/recording/device/can_send_data/check?mac_address=&#123;MAC&#125;")<br/>
                        &emsp;&emsp;if response.status_code == 200:<br/>
                        &emsp;&emsp;&emsp;&emsp;if response.json()<br/><br/>

                        &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;cpu=Code to get cpu metrics<br/>
                        &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;ram=Code to get ram metrics<br/>
                        &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;...  #Rest of resources<br/><br/>

                        &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;# Metrics resources must be included in the json in the same order you include the columns during the submission of the script<br/><br/>


                        &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;data = &#123;<br/>
                        &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;"name": 'NAME OF THE MONITORING'<br/>
                        &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;"mac_address": MAC,<br/>
                        &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;"data": [cpu, ram, ...]<br/>
                        &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&#125;<br/><br/>

                        &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;response2 = requests.post(f"&#123;server&#125;/device/recording/data/store", headers=&#123;"Content-Type": "application/json"&#125;, json=data)<br/><br/>
                        &emsp;&emsp;&emsp;&emsp;else:<br/>
                        &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;sys.exit()<br/>
                        &emsp;&emsp;elif response.status_code == 404:<br/>
                        &emsp;&emsp;&emsp;&emsp;sys.exit()<br/>

                    </code>
                </pre>
            </Grid>
        </Grid>

    )
}

export default MonitoringScriptExample