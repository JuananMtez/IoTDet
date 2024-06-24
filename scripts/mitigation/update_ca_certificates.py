import subprocess
import sys
import glob
import os
import requests
import time

SCN = "/sys/class/net"
min_idx = 65535
arphrd_ether = 1
ifdev = None
MAC = None

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

subprocess.run(["sudo", "apt-get", "update", "-y"])
subprocess.run(["sudo", "apt", "install", "--reinstall", "ca-certificates"])


while True:
    try:
        response = requests.get(f"https://iotdet.eu.loclx.io/scenario/monitoring/device/mitigation/finish?mac_address={MAC}")

        if response.status_code == 204 or response.status_code == 404:
            sys.exit()
    except requests.ConnectionError:
        time.sleep(2)

