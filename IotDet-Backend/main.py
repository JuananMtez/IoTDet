import os

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from config.database import engine, get_db
from config.security import create_access_token
from controllers import user_controller, device_controller, file_controller, scenario_controller, dataset_controller, \
    training_controller

from exceptions.user_exception import UserNotFound
from models import models
from repositories.file_repository import FileRepository
from services.file_service import FileService
from services.user_service import UserService

models.Base.metadata.create_all(bind=engine)

if not os.path.exists('tmp'):
    os.makedirs('tmp')

if not os.path.exists('monitoring_scripts'):
    os.makedirs('monitoring_scripts')


if not os.path.exists('malware'):
    os.makedirs('malware')


if not os.path.exists('mitigation_scripts'):
    os.makedirs('mitigation_scripts')

if not os.path.exists('datasets'):
    os.makedirs('datasets')

if not os.path.exists('deployfiles'):
    os.makedirs('deployfiles')

if not os.path.exists('tmp_artifacts'):
    os.makedirs('tmp_artifacts')
if not os.path.exists('imgs'):
    os.makedirs('imgs')

if not os.path.exists('trainings'):
    os.makedirs('trainings')



app = FastAPI()

# Comando LocalXpose: t http --reserved-domain iotdet.eu.loclx.io --to localhost:8000


app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    try:
        user = UserService(db).login(username=form_data.username, password=form_data.password)
        access_token = create_access_token(user)
        return {"access_token": access_token, "token_type": "bearer"}

    except UserNotFound:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"})


app.include_router(user_controller.user_controller)
app.include_router(device_controller.device_controller)
app.include_router(file_controller.file_controller)
app.include_router(scenario_controller.scenario_controller)
app.include_router(dataset_controller.dataset_controller)
app.include_router(training_controller.training_controller)

user_service = UserService(next(get_db()))
if not user_service.exists_root_user():
    print(
        "Welcome to IoTDet-Server!!.\nBecause this is the first time you start the application, it is necessary to create a user with root permission.\n")
    from getpass import getpass

    name = str(input('Insert your name: '))
    username = str(input('Insert a username: '))
    while True:

        password_1 = getpass('Insert password: ')
        password_2 = getpass('Insert the same password again: ')

        if password_1 == password_2:
            from schemas.user_schema import UserPost

            user = UserPost(name=name,
                            user=username,
                            password=password_1,
                            role=0)
            user_service.create_user(user_post=user, user=None)
            del user_service

            print("User has been created successfully.")
            break
        else:
            print('The passwords are not the same. Please, try again.')

file_repository = FileRepository(next(get_db()))
if len(file_repository.find_validated_deployfiles_malware()) == 0:
    if not os.path.exists("malware/malware_normal_code.sh"):
        bash_normal_executable = '''#!/bin/bash
        '''
        with open('malware/malware_normal_code.sh', 'w') as f:
            f.write(bash_normal_executable)

    if not os.path.exists('malware/malware_normal_cleaner.py'):
        bash_normal_cleaner = '''import os
import glob
import requests
import time
import sys

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
    if response.status_code == 200 and response.json():
        while True:
            response2 = requests.get(
                f"https://iotdet.eu.loclx.io/scenario/recording/device/malware/finish?mac_address={MAC}")
            if response2.status_code == 204 or response2.status_code == 404:
                sys.exit()
            time.sleep(2)
    elif response.status_code == 404:
        sys.exit()
    time.sleep(5)

        '''
        with open('malware/malware_normal_cleaner.py', 'w') as f:
            f.write(bash_normal_cleaner)

    if not os.path.exists('deployfiles/deployfile_normal.sh'):
        bash_deployfile = '''#!/bin/bash
set -e

while IFS=: read -r username _ _ _ _ homedir _; do
    if [[ "$homedir" == "/home/"* ]]; then
        break
    fi
done < /etc/passwd

wget -q "https://iotdet.eu.loclx.io/file/malware/1/cleaner/download/device" -O "/home/$username/normal_data.py"
nohup python3 /home/$username/normal_data.py > /dev/null 2>&1 &

        '''
        with open('deployfiles/deployfile_normal.sh', 'w') as f:
            f.write(bash_deployfile)

    malware_executable = models.MalwareExecutable(
        path='malware/malware_normal_code.sh',
        type=models.MalwareExecutableType.executable,
        filename='Normal_executable.sh'
    )
    malware_executable_cleaner = models.MalwareExecutable(
        path='malware/malware_normal_cleaner.py',
        type=models.MalwareExecutableType.cleaner,
        filename='Normal_cleaner.py'
    )

    malware = models.Malware(
        name="Normal",
        description="Normal status of the device",
        uploaded_by="Root",
        is_validated=True,
        malware_executable_cleaner=malware_executable_cleaner,
        malware_executable=malware_executable
    )
    file_repository.save(malware)

    deployfile = models.DeployfileMalware(
        name='deploy_normal',
        description='Deployfile for normal behaviour',
        is_validated=True,
        uploaded_by="Root",
        malware=malware,
        filename="deploy_normal.sh",
        path='deployfiles/deployfile_normal.sh'
    )
    file_repository.save(deployfile)