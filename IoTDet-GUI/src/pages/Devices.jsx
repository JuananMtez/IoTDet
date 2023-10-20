import Table from "../components/Tables/Table.jsx";
import {Chip, CircularProgress, Container, Grid, Stack} from "@mui/material";
import React, {useEffect, useState} from "react";
import {getAttributesDeviceMender, getDevicesMender} from "../services/DeviceRequests.js";
import TemporalSidebar from "../components/Sidebar/TemporalSidebar.jsx";

import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import IconButton from "@mui/material/IconButton";

const Devices = () => {


    const [stateTable, setStateTable] = useState({loading: true, data: []})

    const [infoDevice, setInfoDevice] = useState({openSidebar: false, dataDevice: {}, loading: false})

    const getAll = (scope) => {

        if (Object.keys(infoDevice.dataDevice).length !== 0) return infoDevice.dataDevice.attributes.filter(el => el.scope === scope)
        return []

    }

    const getNameDevice = () => {
        if (Object.keys(infoDevice.dataDevice).length !== 0) {
            let listCopy = infoDevice.dataDevice.attributes.filter(el => el.name === 'name')
            if (listCopy.length > 0) return listCopy[0].value
        }
        return 'unknown'

    }

    const handleCloseSidebar = () => {
        setInfoDevice({
            openSidebar: false, dataDevice: {}, loading: false
        })

    }


    const handleOpenSidebar = (id) => {

        setInfoDevice({
            ...infoDevice, openSidebar: true, loading: true

        })
        getAttributesDeviceMender(stateTable.data[id].id_device)
            .then(response => {
                setInfoDevice({
                    openSidebar: true, dataDevice: response.data, loading: false
                })
            })


    }


    useEffect(() => {
        getDevicesMender(1, 99999)
            .then(response => setStateTable({data: response.data, loading: false}))
    }, [])


    const columns = [{
        name: "id_device", label: "Device ID", options: {
            filter: false, sort: false
        }
    },
        {
            name: "name", label: "Name", options: {
                filter: false, sort: false,
            }
        }, {
            name: "mac", label: "MAC Address", options: {
                filter: false, sort: false,
            }
        }, {
            name: "device_type", label: "Device Type", options: {
                filter: true, sort: false,
            }
        }, {
            name: "hostname", label: "Hostname", options: {
                filter: false, sort: false, display: 'excluded',
            }
        }, {
            name: "geo_city", label: "City", options: {
                filter: true, sort: false, display: 'excluded',
            }
        }, {
            name: "geo_country", label: "Country", options: {
                filter: true, sort: false, display: 'excluded',
            }
        }, {
            name: "kernel", label: "Kernel", options: {
                filter: true, sort: false, display: 'excluded',
            }
        }, {
            name: "os", label: "Operative System", options: {
                filter: true, sort: false, display: 'excluded',
            }
        }, {
            name: "group", label: "Group", options: {
                filter: true, sort: false,
            }
        }, {
            name: "cpu_model", label: "CPU Model", options: {
                filter: false, sort: false, display: 'excluded',
            }
        },

        {
            name: "", label: "", options: {
                filter: false, sort: false, viewColumns: false, customBodyRenderLite: (dataIndex) => {

                    return (
                        <IconButton onClick={() => handleOpenSidebar(dataIndex)}>
                            <KeyboardArrowLeftIcon sx={{fontSize: '5vh'}}/>
                        </IconButton>)
                }

            }
        },];


    const options = {
        search: true, download: false, rowsPerPageOptions: [5, 10, 30, 50, 100], print: false, tableBodyHeight: '100%',

        selectableRows: 'none', viewColumns: false, responsive: 'vertical', filter: true, filterType: "dropdown",

        selectableRowsHeader: false,

        textLabels: {
            body: {
                noMatch: stateTable.loading ?
                    <CircularProgress sx={{color: 'white'}}/> : 'Sorry, no matching devices found'
            }
        }, selectToolbarPlacement: 'none',

    };


    return (<Grid container spacing={2}>

            <Grid item xs={12}>
                <Table title={"All devices stored in Mender"} columns={columns} data={stateTable.data}
                       options={options}/>
            </Grid>
            <Grid item xs={12}>
                <TemporalSidebar loading={infoDevice.loading} open={infoDevice.openSidebar}
                                 handleClose={handleCloseSidebar}>
                    <Container maxWidth="false" sx={{
                        //marginLeft: `10px`,
                        marginTop: '10px',

                    }}>
                        <Grid container spacing={3} alignItems='center'>
                            <Grid item xs={12}>
                                <h2>Device: {infoDevice.dataDevice.id}</h2>
                                <hr/>
                            </Grid>
                            <Grid item xs={12}>

                                <Stack direction="row"
                                       justifyContent="flex-start"
                                       alignItems="center"
                                       spacing={1}>

                                    <h3>name</h3>
                                    <Chip
                                        label={getNameDevice()}
                                        sx={{
                                            fontSize: '15px', fontWeight: 'bold', color:'#cfcfcf'
                                        }}
                                    />
                                </Stack>
                            </Grid>


                            <Grid item xs={12} sx={{mt: '30px'}}>
                                <h2>Information</h2>
                                <hr/>
                            </Grid>
                            {getAll('identity').map((at, index) => (<Grid item xs={4} key={index}>
                                <Stack direction="row"
                                       justifyContent="flex-start"
                                       alignItems="center"
                                       spacing={1}>

                                    <h3>{at.name}</h3>
                                    <Chip
                                        label={at.value}
                                        sx={{
                                            fontSize: '15px', fontWeight: 'bold', color:'#cfcfcf'
                                        }}
                                    />
                                </Stack>
                            </Grid>))}
                            <Grid item xs={2}/>
                            {getAll('inventory').map((at, index) =>
                                <Grid item xs={6} key={index}>

                                    <Stack direction="row"
                                           justifyContent="flex-start"
                                           alignItems="center"
                                           spacing={1}>

                                        <h3>{at.name}</h3>
                                        {Array.isArray(at.value) ?

                                            at.value.map((el, index) => (

                                            <Chip
                                                label={el}
                                                key={index}
                                                sx={{
                                                    height: 'auto', fontSize: '15px', fontWeight: 'bold', '& .MuiChip-label': {
                                                        display: 'block',
                                                        whiteSpace: 'normal', color:'#cfcfcf'
                                                    },
                                                }}
                                            />)) : <Chip
                                            label={at.value}
                                            sx={{
                                                height: 'auto',fontSize: '15px', fontWeight: 'bold',  '& .MuiChip-label': {
                                                    display: 'block',
                                                    whiteSpace: 'normal', color:'#cfcfcf'
                                                },
                                            }}
                                        />}

                                    </Stack>
                                </Grid>)

                            }

                        </Grid>
                    </Container>
                </TemporalSidebar>
            </Grid>
        </Grid>

    )
}

export default Devices