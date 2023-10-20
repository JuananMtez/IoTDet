import requests
from requests import Response


class MenderService:

    def __init__(self):
        import base64

        token = base64.b64encode(bytes('juanantonio.martinezl@um.es:IirfPeSvmfSHibNN', 'utf-8'))
        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/jwt',
            'Authorization': f'Basic {token.decode("utf-8")}'
        }
        response = requests.post('https://mender.federatedlearning.inf.um.es/api/management/v1/useradm/auth/login',
                                 headers=headers)

        if response.status_code == 200:
            self.token_jwt = response.text
        else:
            self.token_jwt = None

    def __del__(self):
        if self.token_jwt is not None:
            headers = {
                'Accept': 'application/json',
                'Authorization': f'Bearer {self.token_jwt}'
            }

            requests.post('https://mender.federatedlearning.inf.um.es/api/management/v1/useradm/auth/logout',
                          headers=headers)

    def check_if_user_exists(self) -> bool:
        return self.token_jwt is not None

    def get_number_devices_accepted(self) -> Response:
        payload = {
            "page": 1,
            "per_page": 9999999,
            "attributes": [
                {
                    "scope": "identity",
                    "attribute": "name"
                }
            ],
            "filters": [
                {
                    "scope": "identity",
                    "attribute": "status",
                    "type": "$eq",
                    "value": "accepted"
                }
            ]
        }
        headers = {
            "Accept": "application/json",
            "Authorization": f"Bearer {self.token_jwt}"
        }

        return requests.post("https://mender.federatedlearning.inf.um.es/api/management/v2/inventory/filters/search",
                             json=payload,
                             headers=headers)

    def get_all_devices_per_page(self, page: int, amount: int) -> Response:
        payload = {
            "page": page,
            "per_page": amount,
            "attributes": [
                {
                    "scope": "identity",
                    "attribute": "mac"
                },
                {
                    "scope": "tags",
                    "attribute": "name"
                },

                {
                    "scope": "inventory",
                    "attribute": "device_type"
                },
                {
                    "scope": "inventory",
                    "attribute": "hostname"
                },
                {
                    "scope": "inventory",
                    "attribute": "geo-city"
                },
                {
                    "scope": "inventory",
                    "attribute": "geo-country"
                },
                {
                    "scope": "inventory",
                    "attribute": "kernel"
                },
                {
                    "scope": "inventory",
                    "attribute": "os"
                },
                {
                    "scope": "system",
                    "attribute": "group"
                },

                {
                    "scope": "inventory",
                    "attribute": "cpu_model"
                },
            ],
            "filters": [
                {
                    "scope": "identity",
                    "attribute": "status",
                    "type": "$eq",
                    "value": "accepted"
                }
            ]
        }
        headers = {
            "Accept": "application/json",
            "Authorization": f"Bearer {self.token_jwt}"
        }

        return requests.post("https://mender.federatedlearning.inf.um.es/api/management/v2/inventory/filters/search",
                             json=payload, headers=headers)

    def get_all_devices_per_page_filtered_by_mender_id(self, mender_ids: []) -> Response:

        list_filters = []
        for mender_id in mender_ids:
            list_filters.append({'scope': 'identity', 'attribute': 'id', 'type': '$eq', 'value': mender_id})

        payload = {
            "page": 1,
            "per_page": 99999,
            "attributes": [
                {
                    "scope": "identity",
                    "attribute": "mac"
                },
                {
                    "scope": "tags",
                    "attribute": "name"
                },

                {
                    "scope": "inventory",
                    "attribute": "device_type"
                },
                {
                    "scope": "inventory",
                    "attribute": "hostname"
                },
                {
                    "scope": "inventory",
                    "attribute": "geo-city"
                },
                {
                    "scope": "inventory",
                    "attribute": "geo-country"
                },
                {
                    "scope": "inventory",
                    "attribute": "kernel"
                },
                {
                    "scope": "inventory",
                    "attribute": "os"
                },
                {
                    "scope": "system",
                    "attribute": "group"
                },

                {
                    "scope": "inventory",
                    "attribute": "cpu_model"
                },
            ],
            "filters": list_filters
        }
        headers = {
            "Accept": "application/json",
            "Authorization": f"Bearer {self.token_jwt}"
        }

        return requests.post("https://mender.federatedlearning.inf.um.es/api/management/v2/inventory/filters/search",
                             json=payload, headers=headers)

    def get_device_attributes(self, device_mender_id: str) -> Response:
        headers = {
            "Accept": "application/json",
            "Authorization": f"Bearer {self.token_jwt}"
        }

        return requests.get(
            f"https://mender.federatedlearning.inf.um.es/api/management/v1/inventory/devices/{device_mender_id}",
            headers=headers)

    def is_device_connected(self, device_mender_id: str) -> bool:
        headers = {
            "Accept": "application/json",
            "Authorization": f"Bearer {self.token_jwt}"
        }

        response = requests.get(
            f"https://mender.federatedlearning.inf.um.es/api/management/v1/deviceconnect/devices/{device_mender_id}",
            headers=headers)

        if response.status_code == 200:
            match (response.json()['status']):
                case 'connected':
                    return True
                case 'disconnected':
                    return False
                case _:
                    return False
        return False

    def upload_artifact(self, artifact_path: str) -> Response:
        import os
        headers = {
            "Accept": "application/json",
            "Authorization": f"Bearer {self.token_jwt}"
        }


        with open(artifact_path, "rb") as f:
            files = {"artifact": f}
            return requests.post(
                f"https://mender.federatedlearning.inf.um.es/api/management/v1/deployments/artifacts", params={
                    "size": os.path.getsize(artifact_path),
                    "description": ""
                }, files=files, headers=headers)



    def init_deployment(self, mender_id: str, artifact_name: str) -> Response:
        headers = {
            "Accept": "application/json",
            "Authorization": f"Bearer {self.token_jwt}"
        }

        return requests.post(
            f"https://mender.federatedlearning.inf.um.es/api/management/v1/deployments/deployments",
            json={"all_devices": False, "artifact_name": artifact_name, "devices": [mender_id], "name": mender_id},
            headers=headers)


    def get_status_deployment_by_device(self, deployment_id: str) -> Response:
        headers = {
            "Accept": "application/json",
            "Authorization": f"Bearer {self.token_jwt}"
        }

        return requests.get(
            f"https://mender.federatedlearning.inf.um.es/api/management/v1/deployments/deployments/{deployment_id}/devices/list?page=1&per_page=99",
            headers=headers)


    def abort_deployment(self, deployment_id: str):
        headers = {
            "Accept": "application/json",
            "Authorization": f"Bearer {self.token_jwt}"
        }

        requests.put(
            f"https://mender.federatedlearning.inf.um.es/api/management/v1/deployments/deployments/{deployment_id}/status",
            json={"status": "aborted"},
            headers=headers)

    def remove_artifact(self, mender_artifact_id: str):
        headers = {
            "Accept": "application/json",
            "Authorization": f"Bearer {self.token_jwt}"
        }

        requests.delete(
            f"https://mender.federatedlearning.inf.um.es/api/management/v1/deployments/artifacts/{mender_artifact_id}",
            headers=headers)


    def get_log_deployment(self, deployment_id: str, device_id: str):
        headers = {
            "Accept": "application/json",
            "Authorization": f"Bearer {self.token_jwt}"
        }
        return requests.get(
            f"https://mender.federatedlearning.inf.um.es/api/management/v1/deployments/deployments/{deployment_id}/devices/{device_id}/log",
            headers=headers)

