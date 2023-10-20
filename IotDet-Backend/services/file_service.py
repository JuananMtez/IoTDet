from datetime import datetime

from fastapi import UploadFile
from sqlalchemy.orm import Session

from exceptions.file_exception import UserNoPermission, FileNotFound, NotTwoMalwareFiles
from models.models import User, RoleEnum, MonitoringScript, ColumnMonitoring, DeployfileMonitoringScript, \
    MalwareExecutable, Malware, MalwareExecutableType, DeployfileMalware, ParameterMitigationScript, MitigationScript, \
    DeployfileMitigationScript
from repositories.file_repository import FileRepository
from schemas.file_schema import MonitoringScriptPost, MonitoringScriptResponse, DeployfileMonitoringScriptPost, \
    DeployfileMonitoringScriptResponse, DeployfileMalwareResponse, MalwareResponse, FilePost, DeployfileMalwarePost, \
    MitigationScriptPost, MitigationScriptResponse, DeployfileMitigationScriptResponse, DeployfileMitigationScriptPost


class FileService:
    def __init__(self, db: Session):
        self.file_repository = FileRepository(db)
        self.db = db

    def _create_file_name(self, file_type: str, filename: str):
        import os

        name, extension = os.path.splitext(filename)
        new_path = ''

        if file_type == 'monitoring_script':
            new_path = 'monitoring_scripts/monitoring_script_{}'.format(
                datetime.now().strftime("%Y_%m_%d-%I_%M_%S_%p"))
            while self.file_repository.exists_monitoring_script_by_path(new_path):
                new_path = 'monitoring_scripts/monitoring_scripts_{}'.format(
                    datetime.now().strftime("%Y_%m_%d-%I_%M_%S_%p"))

        if file_type == 'mitigation_script':
            new_path = 'mitigation_scripts/mitigation_script_{}'.format(
                datetime.now().strftime("%Y_%m_%d-%I_%M_%S_%p"))
            while self.file_repository.exists_mitigation_script_by_path(new_path):
                new_path = 'mitigation_scripts/mitigation_script_{}'.format(
                    datetime.now().strftime("%Y_%m_%d-%I_%M_%S_%p"))

        if file_type == 'deployfile':
            new_path = 'deployfiles/deployfile_{}'.format(
                datetime.now().strftime("%Y_%m_%d-%I_%M_%S_%p"))
            while self.file_repository.exists_deployfile_by_path(new_path):
                new_path = 'deployfiles/deployfile_{}'.format(
                    datetime.now().strftime("%Y_%m_%d-%I_%M_%S_%p"))

        if file_type == 'malware_executable' or file_type == 'malware_executable_cleaner':
            new_path = f'malware/{file_type}' + '_{}'.format(
                datetime.now().strftime("%Y_%m_%d-%I_%M_%S_%p"))
            while self.file_repository.exists_deployfile_by_path(new_path):
                new_path = f'malware/{file_type}' + '_{}'.format(
                    datetime.now().strftime("%Y_%m_%d-%I_%M_%S_%p"))

        if extension != '':
            return new_path + extension

        return new_path

    def get_all_monitoring_scripts(self):
        return self.file_repository.find_all_by_type('monitoring_script')

    def get_all_mitigation_scripts(self):
        return self.file_repository.find_all_by_type('mitigation_script')

    def get_all_validated_monitoring_scripts(self):
        return self.file_repository.find_validated_monitoring_scripts()

    def get_all_validated_mitigation_scripts(self):
        return self.file_repository.find_validated_mitigation_scripts()

    def get_all_validated_deployfiles_monitoring_scripts(self):
        return self.file_repository.find_validated_deployfiles_monitoring_script()

    def get_all_validated_deployfiles_mitigation_scripts(self):
        return self.file_repository.find_validated_deployfiles_mitigation_script()

    def get_all_validated_deployfiles_malware(self):
        return self.file_repository.find_validated_deployfiles_malware()

    def get_all_validated_malware(self):
        return self.file_repository.find_validated_malware()

    def validate_file(self, file_id: int, current_user: User):

        if current_user.role != RoleEnum.root and current_user.role != RoleEnum.admin:
            raise UserNoPermission

        file = self.file_repository.find_by_id(file_id)

        if file is None:
            raise FileNotFound

        file.is_validated = True

        return self.file_repository.save(file)

    def invalidate_file(self, file_id: int, current_user: User):

        if current_user.role != RoleEnum.root and current_user.role != RoleEnum.admin:
            raise UserNoPermission

        file = self.file_repository.find_by_id(file_id)

        if file is None:
            raise FileNotFound

        file.is_validated = False

        return self.file_repository.save(file)

    def upload_monitoring_script(self, file: UploadFile,
                                 monitoring_script_post: MonitoringScriptPost, user: User) -> MonitoringScriptResponse:

        if user.role == RoleEnum.read_only:
            raise UserNoPermission

        columns = monitoring_script_post.columns.replace(' ', '')
        columns = columns.split(',')
        columns_monitoring = []
        for column in columns:
            db_column = ColumnMonitoring(
                name=column,
                datatype="Unknown"
            )
            columns_monitoring.append(db_column)

        path = self._create_file_name('monitoring_script', file.filename)
        with open(path, 'wb+') as new_file:
            file_data = file.file.read().decode('utf-8')
            file_data = file_data.replace('\r', '')
            new_file.write(file_data.encode('utf-8'))

        import os

        name, extension = os.path.splitext(file.filename)

        monitoring_script = MonitoringScript(
            name=monitoring_script_post.name,
            description=monitoring_script_post.description,
            is_validated=False,
            path=path,
            filename=monitoring_script_post.name + extension,
            uploaded_by=user.name,
            columns=columns_monitoring
        )

        return self.file_repository.save(monitoring_script)

    def upload_mitigation_script(self, file: UploadFile,
                                 mitigation_script_post: MitigationScriptPost, user: User) -> MitigationScriptResponse:

        if user.role == RoleEnum.read_only:
            raise UserNoPermission

        path = self._create_file_name('mitigation_script', file.filename)
        with open(path, 'wb+') as new_file:
            file_data = file.file.read().decode('utf-8')
            file_data = file_data.replace('\r', '')
            new_file.write(file_data.encode('utf-8'))

        import os

        name, extension = os.path.splitext(file.filename)

        mitigation_script = MitigationScript(
            name=mitigation_script_post.name,
            description=mitigation_script_post.description,
            is_validated=False,
            path=path,
            filename=mitigation_script_post.name + extension,
            uploaded_by=user.name,
            parameters=[]
        )

        for parameter in mitigation_script_post.parameters:
            mitigation_script.parameters.append(ParameterMitigationScript(
                name=parameter.name,
                description=parameter.description,
                datatype=parameter.datatype
            ))

        return self.file_repository.save(mitigation_script)

    def find_monitoring_script_by_id_download(self, monitoring_script_id: int) -> dict[str, str]:
        import os
        monitoring_script = self.file_repository.find_by_id(monitoring_script_id)

        if monitoring_script is None:
            raise FileNotFound

        file_name, file_extension = os.path.splitext(monitoring_script.path)

        return {'filename': monitoring_script.name + file_extension, 'path': monitoring_script.path}

    def find_mitigation_script_by_id_download(self, mitigation_script_id: int) -> dict[str, str]:
        import os
        mitigation_script = self.file_repository.find_by_id(mitigation_script_id)

        if mitigation_script is None:
            raise FileNotFound

        file_name, file_extension = os.path.splitext(mitigation_script.path)

        return {'filename': mitigation_script.name + file_extension, 'path': mitigation_script.path}



    def find_deployfile_by_id_download(self, deployfile_id: int) -> dict[str, str]:
        import os
        deployfile = self.file_repository.find_by_id(deployfile_id)

        if deployfile is None:
            raise FileNotFound

        file_name, file_extension = os.path.splitext(deployfile.path)

        return {'filename': deployfile.name + file_extension, 'path': deployfile.path}

    def get_code_monitoring_script(self, monitoring_script_id: int) -> str:
        monitoring_script = self.file_repository.find_by_id(monitoring_script_id)

        if monitoring_script is None:
            raise FileNotFound

        code = ''
        with open(monitoring_script.path, "r") as file:
            code = code + file.read()

        return code

    def get_code_mitigation_script(self, mitigation_script_id: int) -> str:
        mitigation_script = self.file_repository.find_by_id(mitigation_script_id)

        if mitigation_script is None:
            raise FileNotFound

        code = ''
        with open(mitigation_script.path, "r") as file:
            code = code + file.read()

        return code

    def get_code_deployfile(self, deployfile_id: int) -> str:
        deployfile = self.file_repository.find_by_id(deployfile_id)

        if deployfile is None:
            raise FileNotFound

        code = ''
        with open(deployfile.path, "r") as file:
            code = code + file.read()

        return code

    def upload_deployfile_for_monitoring_script(self, file, deployfile_post: DeployfileMonitoringScriptPost,
                                                user: User) -> DeployfileMonitoringScriptResponse:

        monitoring_script = self.file_repository.find_by_id(deployfile_post.monitoring_script_id)

        if monitoring_script is None:
            raise FileNotFound

        path = self._create_file_name('deployfile', file.filename)
        with open(path, 'wb+') as new_file:
            file_data = file.file.read().decode('utf-8')
            file_data = file_data.replace('\r', '')
            new_file.write(file_data.encode('utf-8'))

        import os

        name, extension = os.path.splitext(file.filename)

        deployfile = DeployfileMonitoringScript(
            name=deployfile_post.name,
            description=deployfile_post.description,
            is_validated=False,
            uploaded_by=user.user,
            monitoring_script=monitoring_script,
            filename=deployfile_post.name + extension,
            path=path
        )

        return self.file_repository.save(deployfile)

    def upload_deployfile_for_mitigation_script(self, file, deployfile_post: DeployfileMitigationScriptPost,
                                                user: User) -> DeployfileMitigationScriptResponse:

        mitigation_script = self.file_repository.find_by_id(deployfile_post.mitigation_script_id)

        if mitigation_script is None:
            raise FileNotFound

        path = self._create_file_name('deployfile', file.filename)
        with open(path, 'wb+') as new_file:
            file_data = file.file.read().decode('utf-8')
            file_data = file_data.replace('\r', '')
            new_file.write(file_data.encode('utf-8'))

        import os

        name, extension = os.path.splitext(file.filename)

        deployfile = DeployfileMitigationScript(
            name=deployfile_post.name,
            description=deployfile_post.description,
            is_validated=False,
            uploaded_by=user.user,
            mitigation_script=mitigation_script,
            filename=deployfile_post.name + extension,
            path=path
        )

        return self.file_repository.save(deployfile)

    def get_all_deployfiles_monitoring_script(self) -> list[DeployfileMonitoringScriptResponse]:
        deployfiles = self.file_repository.find_all_deployfiles_by_type('deployfile_monitoring_script')
        return deployfiles

    def get_all_deployfiles_malware(self) -> list[DeployfileMalwareResponse]:
        deployfiles = self.file_repository.find_all_deployfiles_by_type('deployfile_malware')
        return deployfiles

    def get_all_deployfiles_mitigation_script(self) -> list[DeployfileMitigationScriptResponse]:
        deployfiles = self.file_repository.find_all_deployfiles_by_type('deployfile_mitigation_script')
        return deployfiles

    def upload_malware(self, files: list[UploadFile], malware_post: FilePost, user: User) -> MalwareResponse:

        if user.role == RoleEnum.read_only:
            raise UserNoPermission

        if len(files) != 2:
            raise NotTwoMalwareFiles

        path_1 = self._create_file_name('malware_executable', files[0].filename)
        path_2 = self._create_file_name('malware_executable_cleaner', files[1].filename)

        with open(path_1, 'wb+') as new_file:
            file_data = files[0].file.read().decode('utf-8')
            file_data = file_data.replace('\r', '')
            new_file.write(file_data.encode('utf-8'))

        with open(path_2, 'wb+') as new_file:
            file_data = files[1].file.read().decode('utf-8')
            file_data = file_data.replace('\r', '')
            new_file.write(file_data.encode('utf-8'))

        import os

        name_executable, extension_executable = os.path.splitext(files[0].filename)

        malware_executable = MalwareExecutable(
            path=path_1,
            type=MalwareExecutableType.executable,
            filename=malware_post.name + '_executable' + extension_executable
        )
        name_cleaner, extension_cleaner = os.path.splitext(files[1].filename)

        malware_executable_cleaner = MalwareExecutable(
            path=path_2,
            type=MalwareExecutableType.cleaner,
            filename=malware_post.name + '_cleaner' + extension_cleaner
        )

        malware = Malware(
            name=malware_post.name,
            description=malware_post.description,
            uploaded_by=user.user,
            is_validated=False,
            malware_executable_cleaner=malware_executable_cleaner,
            malware_executable=malware_executable
        )
        return self.file_repository.save(malware)

    def find_all_malware(self) -> list[Malware]:
        return self.file_repository.find_all_by_type('malware')

    def find_malware_by_id(self, malware_id: int) -> Malware:
        malware = self.file_repository.find_by_id(malware_id)
        if malware is None:
            raise FileNotFound
        return malware

    def get_code_malware(self, malware_id: int, type: str) -> str:
        malware = self.file_repository.find_by_id(malware_id)

        if malware is None:
            raise FileNotFound

        code = ''
        path = ''
        if type == 'executable':
            path = malware.malware_executable.path
        else:
            path = malware.malware_executable_cleaner.path

        with open(path, "r") as file:
            code = code + file.read()

        return code

    def malware_download_by_type(self, malware_id: int, type: str) -> dict[str, str]:
        import os
        malware = self.file_repository.find_by_id(malware_id)

        if malware is None:
            raise FileNotFound

        if type == 'executable':

            file_name, file_extension = os.path.splitext(malware.malware_executable.path)
            return {'filename': malware.malware_executable.filename + file_extension,
                    'path': malware.malware_executable.path}
        else:
            file_name, file_extension = os.path.splitext(malware.malware_executable_cleaner.path)
            return {'filename': malware.malware_executable_cleaner.filename + file_extension,
                    'path': malware.malware_executable_cleaner.path}

    def upload_deployfile_for_malware(self, file: UploadFile, deployfile_post: DeployfileMalwarePost, user: User):
        malware = self.file_repository.find_by_id(deployfile_post.malware_id)

        if malware is None:
            raise FileNotFound

        path = self._create_file_name('deployfile', file.filename)
        with open(path, 'wb+') as new_file:
            file_data = file.file.read().decode('utf-8')
            file_data = file_data.replace('\r', '')
            new_file.write(file_data.encode('utf-8'))

        import os

        name, extension = os.path.splitext(file.filename)

        deployfile = DeployfileMalware(
            name=deployfile_post.name,
            description=deployfile_post.description,
            is_validated=False,
            uploaded_by=user.user,
            malware=malware,
            filename=deployfile_post.name + extension,
            path=path
        )

        return self.file_repository.save(deployfile)
