import {CircularProgress, Grid} from "@mui/material";
import React, {useEffect, useState} from "react";
import {StatusScenarioEnum} from "../enums.js";
import Table from "../components/Tables/Table.jsx";
import {getAllScenarios} from "../services/ScenarioRequests.js";

import InnerTableDeviceChart from "../components/Tables/InnerTableDeviceChart.jsx";

const Charts = () => {

    const [state, setState] = useState({loading: true, scenarios: []})

    useEffect(() => {
        getAllScenarios()
            .then(response => {
                setState({...state, scenarios: response.data, loading: false})
            })
    }, [])

    const options = {
        search: true,
        download: false,
        rowsPerPageOptions: [5, 10, 30, 50, 100],
        print: false,
        tableBodyHeight: '100%',
        selectableRows: 'none',
        viewColumns: false,
        expandableRowsHeader: false,
        responsive: 'vertical',

        filter: true,
        expandableRows: true,
        renderExpandableRow: (rowData, rowMeta) => {
            return (
                <InnerTableDeviceChart scenarioId={state.scenarios[rowMeta.rowIndex].id} rows={state.scenarios[rowMeta.rowIndex].devices}/>
            )
        },
        filterType: "dropdown",
        selectableRowsHeader: false,
        textLabels: {
            body: {
                noMatch: state.loading ?
                    <CircularProgress sx={{color: 'white'}}/> : 'Sorry, no scenarios found'
            }
        }, selectToolbarPlacement: 'none',

    };

    const columns = [
        {
            name: "name",
            label: "Name",
            options: {
                filter: false,
                sort: false
            }
        },
        {
            name: "type",
            label: "Type",
            options: {
                filter: true,
                sort: false,
                customBodyRenderLite: (dataIndex) => {
                    return state.scenarios[dataIndex].type === "scenario_recording" ? "Recording" : "Monitoring"
                }
            }
        },
        {
            name: "status",
            label: "Status",
            options: {
                filter: false,
                sort: false,
                customBodyRenderLite: (dataIndex) => {
                    return StatusScenarioEnum[state.scenarios[dataIndex].status].value
                }
            }
        },

    ]



    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Table title={"Scenarios"} columns={columns} data={state.scenarios}
                       options={options}/>
            </Grid>

        </Grid>
    )
}

export default Charts