import {
    Button,
    Checkbox,
    createTheme, Dialog, DialogActions, DialogContent, DialogTitle, Grid, InputAdornment,
    TableBody,
    TableCell,
    TableContainer,
    TableHead, TablePagination,
    TableRow,
    ThemeProvider
} from "@mui/material";
import {useNavigate} from "react-router-dom";
import React, {forwardRef, useState} from "react";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from '@mui/icons-material/Delete';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import OpenInBrowserIcon from '@mui/icons-material/OpenInBrowser';
import Table from "@mui/material/Table";
import {deleteDataset, modifyNameDataset} from "../../services/DatasetRequests.js";
import TextFieldStyled from "../TextFieldStyled/TextFieldStyled.jsx";
import LoadingButton from "@mui/lab/LoadingButton";
import Slide from "@mui/material/Slide";
import {DatasetStatusEnum} from "../../enums.js";

const getInnerMuiTheme = () => createTheme({
    components: {

        MuiTableRow: {
            styleOverrides: {
                head: {
                    backgroundColor: '#6d6c6c',
                    color: 'white'
                }
            }
        },
        MuiTableCell: {
            styleOverrides: {
                head: {
                    color: 'white',
                    fontWeight: 'bold',
                    padding: '10px 15px 10px 15px'
                },
                body: {
                    color: 'white',
                    padding: '5px 15px 5px 15px'

                }
            }
        },
        MuiTableBody: {
            styleOverrides: {
                root: {
                    backgroundColor: '#5a5a5a'
                }
            }
        },
        MuiTablePagination: {
            styleOverrides: {
                root: {
                    backgroundColor: '#6d6c6c'
                }
            }
        }
    }
});

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});
const InnerTableDatasets = ({rows, rowsChecked, handleDelete, parentIndex}) => {


    const [state, setState] = useState({
        page: 0, rowsPerPage: 5,
        openDialog: false,
        datasetSelectedIndex: "",
        newNameDataset: '',
        loadingChangeName: false,
        showErrorModifyName: false
    })

    const navigate = useNavigate()

    const handleChangePage = (event, newPage) => {
        setState({
            ...state,
            page: newPage
        })
    };

    const handleChangeRowsPerPage = (event) => {
        setState({
            ...state,
            rowsPerPage: parseInt(event.target.value, 10),
            page: 0
        })

    };

    const startIndex = state.page * state.rowsPerPage;
    const endIndex = startIndex + state.rowsPerPage;
    const pageRows = rows.slice(startIndex, endIndex);




    const handleModifyName = () => {
        setState({
            ...state,
            loadingChangeName: true
        })
        modifyNameDataset(pageRows[state.datasetSelectedIndex].id, state.newNameDataset + '.csv')
            .then(response => {
                pageRows[state.datasetSelectedIndex].name = state.newNameDataset + '.csv'

                setState({
                    ...state,
                    openDialog: false,
                    datasetSelectedIndex: "",
                    newNameDataset: '',
                    loadingChangeName: false,
                    openSnackBarModify: true
                })
            })
            .catch(error => {
                setState({
                    ...state,
                    newNameDataset: '',
                    loadingChangeName: false,
                    showErrorModifyName: true

                })
            })
    }


    return (

        <ThemeProvider theme={getInnerMuiTheme()}>
            <tr>
                <td colSpan={10}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{width: '0%'}}></TableCell>
                                    <TableCell sx={{width: '0%'}}></TableCell>
                                    <TableCell sx={{width: '30%'}}>Name</TableCell>
                                    <TableCell sx={{width: '20%'}}>Used for</TableCell>
                                    <TableCell sx={{width:'80%'}}>Status</TableCell>
                                    <TableCell sx={{width: '0%'}}></TableCell>
                                    <TableCell sx={{width: '0%'}}></TableCell>
                                    <TableCell sx={{width: '0%'}}></TableCell>




                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {
                                    pageRows.map((el, index) => (
                                        <TableRow key={index}>
                                            <TableCell></TableCell>
                                            <TableCell></TableCell>

                                            <TableCell>{el.name}</TableCell>
                                            <TableCell>{el.used_for}</TableCell>
                                            <TableCell>{DatasetStatusEnum[el.status].value}</TableCell>
                                            <TableCell>
                                                <IconButton  onClick={() => navigate(`/dataset/${el.id}`)} sx={{color: 'white'}}>
                                                    <OpenInBrowserIcon sx={{fontSize: '5vh'}}/>
                                                </IconButton>

                                            </TableCell>
                                            <TableCell>
                                                <IconButton onClick={() => setState({
                                                    ...state,
                                                    datasetSelectedIndex: index,
                                                    openDialog: true
                                                })} sx={{color: 'white'}}>
                                                    <AutoFixHighIcon sx={{fontSize: '5vh'}}/>
                                                </IconButton>
                                            </TableCell>


                                            <TableCell>
                                                <IconButton disabled={el.status === 2 || el.status === 4} onClick={() => handleDelete(parentIndex, el)}
                                                            sx={{color: 'white'}}>
                                                    <DeleteIcon sx={{fontSize: '5vh'}}/>
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                }
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={rows.length}
                        rowsPerPage={state.rowsPerPage}
                        page={state.page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />

                </td>
            </tr>
            <Dialog open={state.openDialog}

                    PaperProps={{
                        style: {
                            backgroundColor: '#676767',
                            color: 'white',
                            fontWeight: 'bold',
                            borderRadius: '25px'
                        }
                    }}
                    TransitionComponent={Transition}
                    keepMounted
                    maxWidth="sm"
                    fullWidth
            >
                <DialogTitle sx={{fontWeight: 'bold'}}>Modify name of the dataset</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextFieldStyled
                                disabled
                                id="name"
                                label="Actual name"
                                type="name"
                                value={state.datasetSelectedIndex === "" ? "" : pageRows[state.datasetSelectedIndex].name}
                                fullWidth
                                variant="filled"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextFieldStyled
                                autoFocus
                                id="name"
                                label="Name"
                                type="name"
                                value={state.newNameDataset}
                                fullWidth
                                variant="filled"
                                InputProps={{

                                    endAdornment: (
                                        <InputAdornment
                                            position="end" style={{color: 'white'}}>.csv</InputAdornment>
                                    )

                                }}
                                onChange={(e) => {
                                    setState({...state, newNameDataset: e.target.value})
                                }}
                            />

                        </Grid>
                        {
                            state.showErrorModifyName &&
                            <Grid item xs={12}>
                                <span>The name is not available</span>

                            </Grid>
                        }

                    </Grid>


                </DialogContent>
                <DialogActions>
                    <Button
                        size="small"
                        color="error"
                        sx={{
                            borderRadius: '28px',
                            fontWeight: 'bold'
                        }}
                        variant="contained"
                        onClick={() => setState({
                            ...state,
                            openDialog: false,
                            datasetSelectedIndex: "",
                            newNameDataset: '',
                            loadingChangeName: false

                        })}>Cancel</Button>

                    <LoadingButton
                        loading={state.loadingChangeName}
                        size="small"
                        color="success"
                        sx={{
                            borderRadius: '28px',
                            fontWeight: 'bold'
                        }}
                        variant="contained"
                        onClick={() => handleModifyName(state.datasetSelectedIndex)}>Modify</LoadingButton>
                </DialogActions>
            </Dialog>
        </ThemeProvider>
    )
}

export default InnerTableDatasets