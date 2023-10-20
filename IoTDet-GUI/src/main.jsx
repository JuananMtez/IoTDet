import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom'
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import Profile from "./pages/Profile.jsx";
import Devices from "./pages/Devices.jsx";
import Sidebar from "./components/Sidebar/Sidebar.jsx";
import PrivateRoute from "./routes/PrivateRoute.jsx";
import Root from "./pages/Root.jsx";
import Files from "./pages/Files.jsx";
import FilesMonitoringScripts from "./pages/FilesMonitoringScripts.jsx";
import FilesMalware from "./pages/FilesMalware.jsx";
import Admin from "./pages/Admin.jsx";
import MonitoringScriptExample from "./pages/MonitoringScriptExample.jsx";
import FilesDeployfiles from "./pages/FilesDeployfiles.jsx";
import FilesDeployfilesMonitoringScript from "./pages/FilesDeployfilesMonitoringScript.jsx";
import FilesDeployfilesMalware from "./pages/FilesDeployfilesMalware.jsx";
import Scenarios from "./pages/Scenarios.jsx";
import Datasets from "./pages/Datasets.jsx";
import Charts from "./pages/Charts.jsx";
import Models from "./pages/Models.jsx";
import ScenarioRecordingCreation from "./pages/ScenarioRecordingCreation.jsx";
import ScenarioRecording from "./pages/ScenarioRecording.jsx";
import ChartDevice from "./pages/ChartDevice.jsx";
import ScenarioRecordingRedeploy from "./pages/ScenarioRecordingRedeploy.jsx";
import Dataset from "./pages/Dataset.jsx";
import DatasetInfo from "./pages/DatasetInfo.jsx";
import DatasetData from "./pages/DatasetData.jsx";

import DatasetProcessing from "./pages/DatasetProcessing.jsx";
import DatasetPlots from "./pages/DatasetPlots.jsx";
import ModelsCreation from "./pages/ModelsCreation.jsx";
import Model from "./pages/Model.jsx";
import ScenarioMonitoringCreation from "./pages/ScenarioMonitoringCreation.jsx";
import ScenarioMonitoring from "./pages/ScenarioMonitoring.jsx";
import ScenarioMonitoringRedeploy from "./pages/ScenarioMonitoringRedeploy.jsx";
import RootUsers from "./pages/RootUsers.jsx";
import RootFiles from "./pages/RootFiles.jsx";
import AdminUsers from "./pages/AdminUsers.jsx";
import RootFilesMonitoringScripts from "./pages/RootFilesMonitoringScripts.jsx";
import RootFilesMalware from "./pages/RootFilesMalware.jsx";
import RootFilesDeployfiles from "./pages/RootFilesDeployfiles.jsx";
import RootFilesDeployfilesMalware from "./pages/RootFilesDeployfilesMalware.jsx";
import RootFilesDeployfilesMonitoringScripts from "./pages/RootFilesDeployfilesMonitoringScripts.jsx";
import MalwareCleanerExample from "./pages/MalwareCleanerExample.jsx";
import DeployfileMonitoringScriptExample from "./pages/DeployfileMonitoringScriptExample.jsx";
import DeployfileMalwareExample from "./pages/DeployfileMalwareExample.jsx";
import FilesMitigationScripts from "./pages/FilesMitigationScripts.jsx";
import FilesDeployfilesMitigationScript from "./pages/FilesDeployfilesMitigationScript.jsx";
import RootFilesMitigationScripts from "./pages/RootFilesMitigationScripts.jsx";
import RootFilesDeployfilesMitigationScripts from "./pages/RootFilesDeployfilesMitigationScripts.jsx";
import MitigationScriptExample from "./pages/MitigationScriptExample.jsx";
import DeployfileMitigationScriptExample from "./pages/DeployfileMitigationScriptExample.jsx";

const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
    <BrowserRouter>
        <Routes>
            <Route exact path='/login' element={<Login/>}/>
            <Route path='/logout' element={<Navigate to="/login"/>}/>

            <Route path="files/monitoring_scripts/example" element={<PrivateRoute component={MonitoringScriptExample}/>}/>
            <Route path="files/mitigation_scripts/example" element={<PrivateRoute component={MitigationScriptExample}/>}/>

            <Route path="files/malware/cleaner/example" element={<PrivateRoute component={MalwareCleanerExample}/>}/>
            <Route path="files/deployfiles/monitoring_script/example" element={<PrivateRoute component={DeployfileMonitoringScriptExample}/>}/>
            <Route path="files/deployfiles/mitigation_script/example" element={<PrivateRoute component={DeployfileMitigationScriptExample}/>}/>

            <Route path="files/deployfiles/malware/example" element={<PrivateRoute component={DeployfileMalwareExample}/>}/>


            <Route exac path="/" element={<PrivateRoute component={Sidebar}/>}>
                <Route path='home' element={<Home/>}/>
                <Route path='profile' element={<Profile/>}/>
                <Route path='devices' element={<Devices/>}/>
                <Route path='files' element={<Files/>}>
                    <Route exac path='monitoring_scripts' element={<FilesMonitoringScripts/>}/>
                    <Route exac path='malware' element={<FilesMalware/>}/>
                    <Route exac path='mitigation_scripts' element={<FilesMitigationScripts/>}/>

                    <Route exac path='deployfiles' element={<FilesDeployfiles/>}>
                        <Route exac path='monitoring_script' element={<FilesDeployfilesMonitoringScript/>}/>
                        <Route exac path='malware' element={<FilesDeployfilesMalware/>}/>
                        <Route exac path='mitigation_script' element={<FilesDeployfilesMitigationScript/>}/>

                    </Route>

                </Route>

                <Route path="scenarios" element={<Scenarios/>}/>
                <Route path="scenario/recording/create" element={<ScenarioRecordingCreation/>}/>
                <Route path="scenario/recording/:scenarioId" element={<ScenarioRecording/>}/>
                <Route path="scenario/recording/:scenarioId/redeploy" element={<ScenarioRecordingRedeploy/>}/>

                <Route path="scenario/monitoring/create" element={<ScenarioMonitoringCreation/>}/>
                <Route path="scenario/monitoring/:scenarioId" element={<ScenarioMonitoring/>}/>
                <Route path="scenario/monitoring/:scenarioId/redeploy" element={<ScenarioMonitoringRedeploy/>}/>



                <Route path="datasets" element={<Datasets/>}/>
                <Route path="dataset/:datasetId" element={<Dataset/>}>
                    <Route exac path='info' element={<DatasetInfo/>}/>
                    <Route exac path='data' element={<DatasetData/>}/>
                    <Route exac path='processing' element={<DatasetProcessing/>}/>
                    <Route exac path='plots' element={<DatasetPlots/>}/>

                </Route>



                <Route path="monitoring" element={<Charts/>}/>
                <Route path="monitoring/scenario/:scenarioId/device/:deviceId" element={<ChartDevice/>}/>

                <Route path="models" element={<Models/>}/>
                <Route path="models/create" element={<ModelsCreation/>}/>
                <Route path="model/:datasetId" element={<Model/>}/>

                <Route path="root" element={<Root/>}>
                    <Route exac path='users' element={<RootUsers/>}/>
                    <Route exac path='files' element={<RootFiles/>}>
                        <Route exac path='monitoring_script' element={<RootFilesMonitoringScripts/>}/>
                        <Route exac path='malware' element={<RootFilesMalware/>}/>
                        <Route exac path='mitigation_script' element={<RootFilesMitigationScripts/>}/>

                        <Route exac path='deployfile' element={<RootFilesDeployfiles/>}>
                            <Route exac path='monitoring_script' element={<RootFilesDeployfilesMonitoringScripts/>}/>
                            <Route exac path='malware' element={<RootFilesDeployfilesMalware/>}/>
                            <Route exac path='mitigation_script' element={<RootFilesDeployfilesMitigationScripts/>}/>


                        </Route>

                    </Route>

                </Route>
                <Route path="admin" element={<Admin/>}>
                    <Route exac path='users' element={<AdminUsers/>}/>
                    <Route exac path='files' element={<RootFiles/>}>
                        <Route exac path='monitoring_script' element={<RootFilesMonitoringScripts/>}/>
                        <Route exac path='malware' element={<RootFilesMalware/>}/>
                        <Route exac path='mitigation_script' element={<RootFilesMitigationScripts/>}/>

                        <Route exac path='deployfile' element={<RootFilesDeployfiles/>}>
                            <Route exac path='monitoring_script' element={<RootFilesDeployfilesMonitoringScripts/>}/>
                            <Route exac path='malware' element={<RootFilesDeployfilesMalware/>}/>
                            <Route exac path='mitigation_script' element={<RootFilesDeployfilesMitigationScripts/>}/>

                        </Route>

                    </Route>
                </Route>

            </Route>

        </Routes>
    </BrowserRouter>
)