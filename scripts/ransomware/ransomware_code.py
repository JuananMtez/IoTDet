import os
import glob
import requests
import time
import sys
import signal
import subprocess

with open('/etc/passwd', 'r') as file:
    for line in file:
        fields = line.strip().split(':')
        username = fields[0]
        homedir = fields[5]

        if homedir.startswith("/home/"):
            break


def get_mac_address():
    SCN = "/sys/class/net"
    min_idx = 65535
    arphrd_ether = 1
    ifdev = None

    # find iface with lowest ifindex, skip non ARPHRD_ETHER types (lo, sit ...)
    for dev in glob.glob(os.path.join(SCN, "*")):
        type_file = os.path.join(dev, "type")

        if not os.path.isfile(type_file):
            continue

        with open(type_file, 'r') as f:
            iftype = int(f.read().strip())

        if iftype != arphrd_ether:
            continue

        # Skip dummy interfaces
        if "dummy" in dev:
            continue

        with open(os.path.join(dev, "ifindex"), 'r') as f:
            idx = int(f.read().strip())

        if idx < min_idx:
            min_idx = idx
            ifdev = dev

    if ifdev is None:
        print("no suitable interfaces found")
        exit(1)
    else:
        # grab MAC address
        with open(os.path.join(ifdev, "address"), 'r') as f:
            MAC = f.read().strip()
        return MAC


MAC = get_mac_address()

while True:
    response = requests.get(
        f"https://iotdet.eu.loclx.io/scenario/recording/device/malware/time/finished/check?mac_address={MAC}")
    if response.status_code == 200:
        if response.json():
            while True:
                response2 = requests.get(
                    f"https://iotdet.eu.loclx.io/scenario/recording/device/malware/finish?mac_address={MAC}")
                if response2.status_code == 204 or response2.status_code == 404:
                    sys.exit()
                time.sleep(2)
        else:
            subprocess.run(['python3', f"/home/{username}/ransomware/main.py", '-p', f"/home/{username}/encriptar", '-e'])
            time.sleep(60)
            subprocess.run(['python3', f"/home/{username}/ransomware/main.py", '-p', f"/home/{username}/encriptar", '-d'])
    elif response.status_code == 404:
        sys.exit()
    else:
        time.sleep(5)


