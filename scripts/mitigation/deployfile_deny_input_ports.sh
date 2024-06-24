#!/bin/bash

set -e



while IFS=: read -r username _ _ _ _ homedir _; do
    if [[ "$homedir" == "/home/"* ]]; then
        break
    fi
done < /etc/passwd




if ! command -v jq &> /dev/null; then
    sudo apt-get update -y
    sudo apt-get install -y jq
fi


SCN=/sys/class/net
min=65535
arphrd_ether=1
ifdev=

# find iface with lowest ifindex, skip non ARPHRD_ETHER types (lo, sit ...)
for dev in $SCN/*; do
    if [ ! -f "$dev/type" ]; then
        continue
    fi

    iftype=$(cat $dev/type)
    if [ $iftype -ne $arphrd_ether ]; then
        continue
    fi

    # Skip dummy interfaces
    if echo "$dev" | grep -q "$SCN/dummy" 2>/dev/null; then
    continue
    fi

    idx=$(cat $dev/ifindex)
    if [ $idx -lt $min ]; then
        min=$idx
        ifdev=$dev
    fi
done

if [ -z "$ifdev" ]; then
    echo "no suitable interfaces found" >&2
    exit 1
else
     # grab MAC address
     MAC=$(cat $ifdev/address)
fi

wget -q  "https://iotdet.eu.loclx.io/file/mitigation_script/7/download/device" -O "/home/$username/deny_input_ports.py"

json_data=$(curl -s "https://iotdet.eu.loclx.io/scenario/monitoring/device/mitigation/args?mac_address=$MAC")
ports=$(echo "$json_data" | jq -r '.ports')


nohup python3 /home/$username/deny_ports.py $ports> /dev/null 2> /home/$username/deny_ports.log &
