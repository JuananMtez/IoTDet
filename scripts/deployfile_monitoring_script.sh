#!/bin/bash

set -e

while IFS=: read -r username _ _ _ _ homedir _; do
    if [[ "$homedir" == "/home/"* ]]; then
        break
    fi
done < /etc/passwd


wget -q  "https://iotdet.eu.loclx.io/file/monitoring_script/3/download/device" -O "/home/$username/monitoring_script.py"

nohup python3 /home/$username/monitoring_script.py > /dev/null 2>> /home/$username/error.log &