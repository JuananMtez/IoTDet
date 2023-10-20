class DeviceAlreadyAdded(Exception):
    pass


class DeviceNotFound(Exception):
    pass


class DeviceNotFoundInMender(Exception):
    pass


class DeviceNotDeployed(Exception):
    pass


class DeviceHasNotDeviceDeployment(Exception):
    pass


class DeviceIsDeployed(Exception):
    pass


class DeviceCannotGatherData(Exception):
    pass


class DeviceIsNotMonitoring(Exception):
    pass
