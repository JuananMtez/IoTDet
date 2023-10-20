import {Grid} from "@mui/material";

const DeployfileMitigationScriptExample = () => {
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

                        if ! command -v jq &&gt; /dev/null; then<br/>
                        &emsp;&emsp;sudo apt-get update<br/>
                        &emsp;&emsp;sudo apt-get install -y jq<br/><br/>

                        get_mac_address()<br/>
                        &emsp;&emsp;...<br/>
                        &emsp;&emsp;MAC=xxx<br/><br/>

                        wget -q  "https://iotdet.eu.loclx.io/file/mitigation_script/13/download/device" -O "/home/$username/mitigation_script.py"<br/><br/>
                        json_data=$(curl -s "https://iotdet.eu.loclx.io/scenario/monitoring/device/mitigation/args?mac_address=$MAC")<br/>
                        arg1=$(echo "$json_data" | jq -r '.arg1')<br/>
                        arg2=$(echo "$json_data" | jq -r '.arg2')<br/><br/>


                        nohup python3 /home/$username/mitigation_script.py arg1 arg2 &gt; /dev/null 2&gt;&gt; /home/$username/error.log &<br/>


                    </code>
                </pre>
            </Grid>
        </Grid>

    )
}

export default DeployfileMitigationScriptExample