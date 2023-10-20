import {Grid} from "@mui/material";

const DeployfileMonitoringScriptExample = () => {
    return (
        <Grid container sx={{ml: '1%'}}>
            <Grid item xs={12}>
                <pre>
                    <code style={{color: 'white', tabSize: 4}}>

                        # Code example written in Bash<br/><br/>

                        #!/bin/bash<br/><br/>

                        set -e<br/><br/>
                        while IFS=: read -r username _ _ _ _ homedir _; do<br/>
                        &emsp;&emsp;if [[ "$homedir" == "/home/"* ]]; then<br/>
                        &emsp;&emsp;&emsp;&emsp;break<br/>
                        &emsp;&emsp;fi<br/><br/>
                        done &lt; /etc/passwd<br/><br/>

                        wget -q  "https://iotdet.eu.loclx.io/file/monitoring_script/3/download/device" -O "/home/$username/monitoring_script.py"<br/><br/>
                        nohup python3 /home/$username/monitoring_script.py &gt; /dev/null 2&gt;&gt; /home/$username/error.log &<br/>


                    </code>
                </pre>
            </Grid>
        </Grid>

    )
}

export default DeployfileMonitoringScriptExample