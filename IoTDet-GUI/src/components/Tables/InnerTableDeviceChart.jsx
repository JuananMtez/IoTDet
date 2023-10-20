import {Paper, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";
import Table from "@mui/material/Table";
import React from "react";
import {createTheme, ThemeProvider} from "@mui/material";
import {OpenInBrowser} from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import {useNavigate} from "react-router-dom";

const getInnerMuiTheme = () => createTheme({
    components: {

        MuiTableRow: {
            styleOverrides: {
                head: {
                    backgroundColor: '#5a5a5a',
                    color:'white'
                }
            }
        },
        MuiTableCell: {
            styleOverrides: {
                head: {
                    color:'white',
                    fontWeight: 'bold',
                    padding:'10px 15px 10px 15px'
                },
                body: {
                    color:'white',
                    padding:'5px 15px 5px 15px'

                }
            }
        },
        MuiTableBody: {
            styleOverrides: {
                root: {
                    backgroundColor: '#5a5a5a'
                }
            }
        }
    }
});


const InnerTableDeviceChart = ({scenarioId, rows}) => {

    const navigate = useNavigate()





    return (
        <ThemeProvider theme={getInnerMuiTheme()}>
            <tr>
                <td colSpan={5}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{width:'2.5%'}}></TableCell>
                                    <TableCell sx={{width:'17.5%'}}>Device ID</TableCell>
                                    <TableCell sx={{width:'35%'}}>MAC Address</TableCell>
                                    <TableCell sx={{width:'10%'}}></TableCell>

                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {
                                    rows.map((row, indexRow) => (
                                        <TableRow key={indexRow}>
                                            <TableCell></TableCell>

                                            <TableCell>{row.id_mender}</TableCell>
                                            <TableCell>{row.mac_address}</TableCell>
                                            <TableCell >
                                                <IconButton onClick={() => navigate(`/monitoring/scenario/${scenarioId}/device/${row.mac_address}`)} sx={{color:'white'}}>
                                                    <OpenInBrowser sx={{fontSize: '5vh'}}/>
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>


                                    ))
                                }


                            </TableBody>
                        </Table>
                    </TableContainer>
                </td>
            </tr>

        </ThemeProvider>
    )
}

export default InnerTableDeviceChart