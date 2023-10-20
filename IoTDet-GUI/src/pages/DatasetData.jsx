import {CircularProgress, Grid, TableFooter, Paper} from "@mui/material";
import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import {TableVirtuoso} from 'react-virtuoso';
import {useEffect, useState} from "react";
import {getDataFromDataset} from "../services/DatasetRequests.js";
import {useOutletContext, useParams} from "react-router-dom";


const VirtuosoTableComponents = {
    Scroller: React.forwardRef((props, ref) => (
        <TableContainer component={Paper} {...props} ref={ref} sx={{borderRadius: '28px', backgroundColor:'#3d4144'}}/>
    )),
    Table: (props) => (
        <Table {...props} sx={{borderCollapse: 'separate', tableLayout: 'fixed'}}/>
    ),
    TableHead,
    TableRow: ({item: _item, ...props}) => <TableRow {...props} />,
    TableBody: React.forwardRef((props, ref) => <TableBody {...props} ref={ref}/>),

};


const DatasetData = () => {


    const [state, setState] = useState({loading: true, columns: [], data: []})
    const [dataset] = useOutletContext()


    useEffect(() => {
        getDataFromDataset(dataset.id)
            .then(response => {
                let list_columns = response.data.columns.map(el => (
                    {
                        width: 100,
                        label: el,
                        dataKey: el
                    }
                ));
                setState({
                    ...state,
                    loading: false,
                    columns: list_columns,
                    data: response.data.rows
                })

            })
    }, [])


    function fixedHeaderContent() {
        return (
            <TableRow sx={{backgroundColor: '#3B3B3B !important'}}>

                {state.columns.map((column) => (

                    <TableCell
                        key={column.dataKey}
                        variant="head"

                        style={{width: column.width}}
                        sx={{
                            color: 'white',
                            fontWeight: 'bold'
                        }}
                    >
                        {column.label}
                    </TableCell>
                ))}
            </TableRow>
        );
    }

    function rowContent(_index, row) {
        return (
            <React.Fragment>
                {state.columns.map((column) => (
                    <TableCell
                        sx={{backgroundColor: '#3d4144', color: 'white'}}
                        key={column.dataKey}
                    >
                        {row[column.dataKey]}
                    </TableCell>
                ))}
            </React.Fragment>
        );
    }



    return (
        <Grid container justifyContent="center"
              alignItems="center">
            {
                state.loading
                    ?
                    <Grid item sx={{mt: '20px'}}>
                        <CircularProgress sx={{color: 'white'}}/>
                    </Grid>
                    :
                    <Grid item xs={12} sx={{mt:'40px', height: '500px'}}>

                        <TableVirtuoso
                            data={state.data}
                            components={VirtuosoTableComponents}
                            fixedHeaderContent={fixedHeaderContent}
                            itemContent={rowContent}
                        />
                    </Grid>
            }

        </Grid>
    )
}

export default DatasetData