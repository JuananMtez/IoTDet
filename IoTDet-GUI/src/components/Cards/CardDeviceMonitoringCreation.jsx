import {
    Card, CardActions,
    CardContent, Checkbox,
    CircularProgress,
    FormControl,
    FormControlLabel,
    Grid,
    InputLabel,
    MenuItem,
    Select
} from "@mui/material";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import React from "react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import DeleteIcon from "@mui/icons-material/Delete";
import TextFieldStyled from "../TextFieldStyled/TextFieldStyled.jsx";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

const CardDeviceMonitoringCreation = ({
                                          device,
                                          deviceCopy,
                                          indexDevice,
                                          handleChangeSelectDeployfilesMonitoringScript,
                                          allDeployfilesMonitoringScript,
                                          allDeployfilesMitigationScript,
                                          loading,
                                          handleChangeSelectClassificationModel,
                                          handleChangeSelectAnomalyDetectionModel,
                                          handleChangeActivateMitigation,
                                          handleAddMitigationMechanism,
                                          handleChangeDeployfileMitigationScript,
                                          handleRemoveMitigationMechanism,
                                          handleChangeParameterJson,
                                          handleChangeActiveTicks,
                                          handleChangeTicks,
                                          handleChangeActivateTruePrediction,
                                          handleBtnCopy,
                                          handleBtnPaste,
                                          handleRemoveSelectedDevice

                                      }) => {

    return (

        <Card elevation={6} variant="elevation" sx={{
            borderRadius: '28px',
            backgroundColor: '#555555 !important',
        }}>
            <CardContent sx={{color: 'white', padding: '16px 12px 16px 12px'}}>
                <Typography sx={{fontWeight: 'bold'}} variant="h7" component="div">
                    Mender ID: {device.mender_id}
                </Typography>
                <Typography sx={{fontWeight: 'bold', color: 'wheat', mb: 0, fontSize: '14px'}}>
                    MAC Address: {device.mac_address}
                </Typography>
                <hr/>
                <Grid container spacing={1}>
                    <Grid item xs={12}>
                        <Typography sx={{fontStyle: 'italic'}} variant="h7" component="div">
                            Deployfile for monitoring scripts
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Grid container direction="row" justifyContent="center"
                              alignItems="center" spacing={1}
                              sx={{padding: '10px 10px 10px 10px'}}>
                            <Grid item xs={12}>
                                <FormControl variant="filled" fullWidth
                                             disabled={loading}>
                                    <InputLabel id="demo-simple-select-label"
                                                sx={{color: 'white'}}>Deployfile</InputLabel>
                                    <Select
                                        size="small"
                                        value={device.deployfileMonitoringScriptIdSelected}
                                        disableUnderline={false}
                                        label="Deployfile"
                                        onChange={(e) => handleChangeSelectDeployfilesMonitoringScript(e, indexDevice)}
                                        sx={{color: 'white'}}

                                        inputProps={{
                                            MenuProps: {
                                                MenuListProps: {
                                                    sx: {
                                                        backgroundColor: '#525558', color: 'white'

                                                    }
                                                }
                                            }
                                        }}

                                    >
                                        {
                                            allDeployfilesMonitoringScript.map((el, index) => (

                                                <MenuItem key={index} value={el.id}>{el.name}</MenuItem>

                                            ))
                                        }


                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Grid>
                    {
                        device.deployfileMonitoringScriptIdSelected !== "" &&
                        <Grid item xs={12}>
                            <hr/>
                            <Grid container direction="row" spacing={2}>
                                <Grid item xs={12}>
                                    <Typography sx={{fontStyle: 'italic'}} variant="h7" component="div">
                                        Models
                                    </Typography>
                                </Grid>
                                {
                                    device.loadingModels ?
                                        <Grid item xs={12}>
                                            <Grid container justifyContent="center" alignItems="center">
                                                <Grid item>
                                                    <CircularProgress sx={{color: 'white'}}/>

                                                </Grid>
                                            </Grid>
                                        </Grid>
                                        :
                                        <Grid item xs={12}>
                                            <Grid container direction="row" justifyContent="center"
                                                  alignItems="center" spacing={2}
                                                  sx={{padding: '0px 10px 10px 10px'}}>
                                                <Grid item xs={12}>
                                                    <FormControl variant="filled" fullWidth
                                                                 disabled={loading}>
                                                        <InputLabel id="demo-simple-select-label"
                                                                    sx={{color: 'white'}} shrink>Classification
                                                            model</InputLabel>
                                                        <Select
                                                            size="small"
                                                            value={device.classificationModelSelected}
                                                            label="Classification model"
                                                            displayEmpty
                                                            sx={{color: 'white'}}
                                                            onChange={(e) => handleChangeSelectClassificationModel(e, indexDevice)}


                                                            inputProps={{
                                                                MenuProps: {
                                                                    MenuListProps: {
                                                                        sx: {
                                                                            backgroundColor: '#525558',
                                                                            color: 'white'

                                                                        }
                                                                    }
                                                                }
                                                            }}

                                                        >
                                                            <MenuItem value=''><em>None</em></MenuItem>
                                                            {
                                                                device.classificationModelsAvailable.map((el, index) => (

                                                                    <MenuItem key={index}
                                                                              value={el.id}>{el.name}</MenuItem>

                                                                ))
                                                            }


                                                        </Select>
                                                    </FormControl>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    {
                                                        device.isActivatedMitigation &&
                                                        <Grid container spacing={2}>
                                                            {
                                                                device.classificationMalware.map((malware, indexMalware) => (
                                                                    <Grid key={indexMalware} item xs={12}>
                                                                        <Grid container spacing={1}>
                                                                            <Grid item xs={5}>
                                                                                <TextFieldStyled

                                                                                    id="malware_name"
                                                                                    label="Class"
                                                                                    size="small"
                                                                                    value={malware.malware}
                                                                                    fullWidth
                                                                                    variant="filled"
                                                                                    disabled

                                                                                />
                                                                            </Grid>

                                                                            <Grid item xs={7}>
                                                                                {
                                                                                    device.isActivatedConfigureTicks &&
                                                                                    <TextFieldStyled

                                                                                        id="malware_name"
                                                                                        label="Consecutive ticks to assume device is infected"
                                                                                        size="small"
                                                                                        type="number"
                                                                                        value={malware.cont}
                                                                                        fullWidth
                                                                                        variant="filled"
                                                                                        onChange={(e) => handleChangeTicks(e, indexDevice, indexMalware)}

                                                                                    />

                                                                                }

                                                                            </Grid>
                                                                            <Grid item xs={12} sx={{mt: '20px'}}>
                                                                                <Grid container spacing={4}>
                                                                                    {
                                                                                        malware.mitigationMechanisms.map((mitigation, indexMitigation) => (
                                                                                            <Grid key={indexMitigation}
                                                                                                  item
                                                                                                  xs={12}>
                                                                                                <Grid

                                                                                                    container
                                                                                                    spacing={2}
                                                                                                    alignItems="center">
                                                                                                    <Grid item xs={5}>
                                                                                                        <FormControl
                                                                                                            variant="filled"
                                                                                                            fullWidth
                                                                                                            disabled={loading}>
                                                                                                            <InputLabel
                                                                                                                id="demo-simple-select-label"
                                                                                                                sx={{color: 'white'}}>Deployfile
                                                                                                                for
                                                                                                                mitigation</InputLabel>
                                                                                                            <Select
                                                                                                                size="small"
                                                                                                                value={mitigation.deployfileMitigationScriptSelected}
                                                                                                                onChange={(e) => handleChangeDeployfileMitigationScript(e, indexDevice, indexMalware, indexMitigation)}
                                                                                                                disableUnderline={false}
                                                                                                                label="Deployfile"
                                                                                                                sx={{color: 'white'}}

                                                                                                                inputProps={{
                                                                                                                    MenuProps: {
                                                                                                                        MenuListProps: {
                                                                                                                            sx: {
                                                                                                                                backgroundColor: '#525558',
                                                                                                                                color: 'white'

                                                                                                                            }
                                                                                                                        }
                                                                                                                    }
                                                                                                                }}

                                                                                                            >
                                                                                                                {
                                                                                                                    allDeployfilesMitigationScript.map((el, index) => (

                                                                                                                        <MenuItem
                                                                                                                            key={index}
                                                                                                                            value={el.id}>{el.name}</MenuItem>

                                                                                                                    ))
                                                                                                                }


                                                                                                            </Select>
                                                                                                        </FormControl>

                                                                                                    </Grid>
                                                                                                    {

                                                                                                    }

                                                                                                    <Grid item xs={6}>
                                                                                                        {
                                                                                                            mitigation.deployfileMitigationScriptSelected !== "" &&
                                                                                                            <TextFieldStyled

                                                                                                                id="malware_name"
                                                                                                                label="Description"
                                                                                                                size="small"
                                                                                                                value={allDeployfilesMitigationScript.filter(el => el.id === mitigation.deployfileMitigationScriptSelected)[0].description}
                                                                                                                fullWidth
                                                                                                                variant="filled"
                                                                                                                disabled

                                                                                                            />
                                                                                                        }


                                                                                                    </Grid>
                                                                                                    <Grid item xs={1}>

                                                                                                        <IconButton
                                                                                                            sx={{color: 'white'}}
                                                                                                            onClick={() => handleRemoveMitigationMechanism(indexDevice, indexMalware, indexMitigation)}>
                                                                                                            <RemoveIcon/>
                                                                                                        </IconButton>

                                                                                                    </Grid>


                                                                                                    <Grid item xs={12}>
                                                                                                        {
                                                                                                            mitigation.deployfileMitigationScriptSelected !== "" && allDeployfilesMitigationScript.filter(el => el.id === mitigation.deployfileMitigationScriptSelected)[0].mitigation_script.parameters.length > 0 &&
                                                                                                            <TextFieldStyled

                                                                                                                id="json"
                                                                                                                label="Parameters"
                                                                                                                size="small"
                                                                                                                value={mitigation.json}
                                                                                                                fullWidth
                                                                                                                onChange={(e) => handleChangeParameterJson(e, indexDevice, indexMalware, indexMitigation)}
                                                                                                                variant="filled"
                                                                                                                multiline
                                                                                                                rows={6}

                                                                                                            />
                                                                                                        }

                                                                                                    </Grid>

                                                                                                </Grid>
                                                                                            </Grid>
                                                                                        ))
                                                                                    }
                                                                                </Grid>
                                                                            </Grid>


                                                                            <Grid item xs={12}>
                                                                                <Grid container justifyContent="center">
                                                                                    <Grid item>
                                                                                        <IconButton
                                                                                            sx={{color: "white"}}
                                                                                            onClick={() => handleAddMitigationMechanism(indexDevice, indexMalware)}>
                                                                                            <AddIcon/>
                                                                                        </IconButton>
                                                                                    </Grid>
                                                                                </Grid>
                                                                            </Grid>


                                                                        </Grid>

                                                                    </Grid>
                                                                ))
                                                            }
                                                        </Grid>


                                                    }
                                                </Grid>


                                                <Grid item xs={12}>
                                                    <FormControl variant="filled" fullWidth
                                                                 disabled={loading}>
                                                        <InputLabel id="demo-simple-select-label"
                                                                    sx={{color: 'white'}} shrink>Anomaly
                                                            detection model</InputLabel>
                                                        <Select
                                                            size="small"
                                                            value={device.anomalyDetectionModelSelected}
                                                            label="Anomaly detection model"
                                                            sx={{color: 'white'}}
                                                            displayEmpty
                                                            onChange={(e) => handleChangeSelectAnomalyDetectionModel(e, indexDevice)}


                                                            inputProps={{
                                                                MenuProps: {
                                                                    MenuListProps: {
                                                                        sx: {
                                                                            backgroundColor: '#525558',
                                                                            color: 'white'

                                                                        }
                                                                    }
                                                                }
                                                            }}

                                                        >
                                                            <MenuItem value=''><em>None</em></MenuItem>
                                                            {
                                                                device.anomalyDetectionModelsAvailable.map((el, index) => (

                                                                    <MenuItem key={index}
                                                                              value={el.id}>{el.name}</MenuItem>

                                                                ))
                                                            }


                                                        </Select>
                                                    </FormControl>

                                                </Grid>

                                            </Grid>
                                            <hr/>
                                            <Grid container direction="row" spacing={1}>
                                                <Grid item xs={12}>
                                                    <Typography sx={{fontStyle: 'italic'}} variant="h7" component="div">
                                                        Mitigation mechanisms config
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Grid container spacing={0} sx={{padding: '0px 10px 10px 10px'}}>
                                                        <Grid item xs={12}>
                                                            <FormControlLabel
                                                                disabled={device.classificationModelSelected === ""}
                                                                control={<Checkbox
                                                                    onChange={(e) => handleChangeActivateMitigation(e, indexDevice)}
                                                                    sx={{
                                                                        color: 'white', '&.Mui-checked': {
                                                                            color: 'white',
                                                                        },
                                                                    }}
                                                                    checked={device.isActivatedMitigation}/>}
                                                                label="Activate mitigation mechanisms."/>
                                                        </Grid>
                                                        <Grid item xs={12}>
                                                            <FormControlLabel disabled={!device.isActivatedMitigation}
                                                                              control={<Checkbox
                                                                                  onChange={(e) => handleChangeActiveTicks(e, indexDevice)}
                                                                                  sx={{
                                                                                      color: 'white', '&.Mui-checked': {
                                                                                          color: 'white',
                                                                                      },
                                                                                  }}
                                                                                  checked={device.isActivatedConfigureTicks}/>}
                                                                              label="Modify ticks value (Default 1)."/>


                                                        </Grid>
                                                        <Grid item xs={12}>
                                                            <FormControlLabel
                                                                disabled={!device.isActivatedMitigation || (device.isActivatedMitigation && device.anomalyDetectionModelSelected === "")}
                                                                control={<Checkbox
                                                                    onChange={(e) => handleChangeActivateTruePrediction(e, indexDevice)}
                                                                    sx={{
                                                                        color: 'white', '&.Mui-checked': {
                                                                            color: 'white',
                                                                        },
                                                                    }}
                                                                    checked={device.isActivatedClassificationAndAnomaly}/>}
                                                                label="Increment tick when classifier and anomaly detector predict infected"/>
                                                        </Grid>

                                                    </Grid>
                                                </Grid>

                                            </Grid>
                                        </Grid>


                                }


                            </Grid>
                        </Grid>


                    }


                </Grid>
            </CardContent>
            <CardActions sx={{padding: '0px 8px 3px 8px', borderTop: '1px solid white'}} disableSpacing>
                <IconButton
                    disabled={loading}
                    onClick={() => handleBtnCopy(indexDevice)}

                    aria-label="add to favorites"
                    sx={{
                        color: 'white',
                        '&.Mui-disabled': {
                            color: 'rgba(0, 0, 0, 0.26) !important'
                        }
                    }}
                >
                    <ContentCopyIcon/>
                </IconButton>
                <IconButton
                    aria-label="add to favorites"
                    onClick={() => handleBtnPaste(indexDevice)}
                    disabled={loading || deviceCopy === null}

                    sx={{
                        color: 'white',
                        '&.Mui-disabled': {
                            color: 'rgba(0, 0, 0, 0.26) !important'
                        }
                    }}
                >
                    <ContentPasteIcon/>
                </IconButton>
                <IconButton
                    disabled={loading}
                    onClick={() => handleRemoveSelectedDevice(indexDevice)}
                    sx={{
                        color: 'white',
                        '&.Mui-disabled': {
                            color: 'rgba(0, 0, 0, 0.26) !important'
                        }
                    }}
                    aria-label="add to favorites"
                >
                    <DeleteIcon/>
                </IconButton>

            </CardActions>

        </Card>


    )
}

export default CardDeviceMonitoringCreation