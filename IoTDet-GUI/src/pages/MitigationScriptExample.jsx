import {Grid} from "@mui/material";

const MitigationScriptExample = () => {
    return (
        <Grid container sx={{ml: '1%'}}>
            <Grid item xs={12}>
                <pre>
                    <code style={{color: 'white', tabSize: 4}}>

                        # Code example written in Python<br/><br/>

                        import os<br/>
                        import sys<br/>
                        import requests<br/><br/>
                        def get_mac_address(): # Function that shall return the mac address of the device in the format 'XX:XX:XX:XX'<br/>
                        &emsp;&emsp;...<br/>
                        &emsp;&emsp;return mac_address<br/><br/>

                        MAC = get_mac_address()<br/>
                        server='https://iotdet.eu.loclx.io'<br/><br/>
                        arg1 = sys.argv[1]<br/>

                        subprocess.run(...) # Bash commands to mitigate malware<br/><br/>

                        while True:<br/><br/>
                        &emsp;&emsp;response = requests.get(f"&#123;server&#125;/scenario/monitoring/device/mitigation/finish?mac_address=&#123;MAC&#125;")<br/>
                        &emsp;&emsp;if response.status_code == 204 or response.status_code == 404:<br/>
                        &emsp;&emsp;&emsp;&emsp;sys.exit()<br/>



                    </code>
                </pre>
            </Grid>
        </Grid>

    )
}

export default MitigationScriptExample