import {CircularProgress, Grid} from "@mui/material";
import Table from "../Tables/Table.jsx";
import React, {useEffect, useState} from "react";
import {getLogsFromDevice} from "../../services/ScenarioRequests.js";

const LogsMonitoringRealTime = ({deviceId}) => {

    const [state, setState] = useState({loading: true, data: []})

    useEffect(() => {
        getLogsFromDevice(deviceId)
            .then(response => {
                setState(() => ({
                    loading: false,
                    data: response.data
                }))
            })
    }, [])


    const columns = [

        {
            name: "date",
            label: "Date",
            options: {
                filter: false,
                sort: false
            }
        },
        {
            name: "model",
            label: "Model",
            options: {
                filter: true,
                sort: false
            }
        },
        {
            name: "description",
            label: "Description",
            options: {
                filter: false,
                sort: false
            }
        }

    ]
    const options = {
        search: true,
        download: false,
        rowsPerPageOptions: [5, 10, 30, 50, 100],
        print: false,
        tableBodyHeight: '100%',
        selectableRows: 'none',
        viewColumns: false,
        responsive: 'vertical',
        filter: true,
        filterType: "dropdown",
        selectableRowsHeader: false,
        textLabels: {
            body: {
                noMatch:  state.loading ? <CircularProgress sx={{color:'white'}}/>: 'No logs yet.'
            }
        }, selectToolbarPlacement: 'none',

    };
    return (
        <Grid container>
            <Grid item xs={12}>
                <Table title={""} columns={columns} data={state.data}
                       options={options}/>
            </Grid>


        </Grid>
    )
}

export default LogsMonitoringRealTime