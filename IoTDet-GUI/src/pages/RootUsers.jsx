import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle, FormControl,
    Grid,
    InputLabel, MenuItem, Select, Snackbar
} from "@mui/material";
import React, {forwardRef, useEffect, useState} from "react";
import {RoleEnum} from "../enums.js";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import Table from "../components/Tables/Table.jsx";
import {changeRole, getAllUsers, removeUser, userRegister} from "../services/UserRequests.js";
import DriveFileRenameOutlineSharpIcon from "@mui/icons-material/DriveFileRenameOutlineSharp";
import Slide from "@mui/material/Slide";
import TextFieldStyled from "../components/TextFieldStyled/TextFieldStyled.jsx";
import LoadingButton from "@mui/lab/LoadingButton";

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});
const RootUsers = () => {

    const [state, setState] = useState({
        userSelectedIndex: '',
        loading: true,
        users: [],
        openDialogCreateUser: false,
        openDialogChangeRole: false,
        loadingChangeRole: false,
        loadingAddUser: false,
        newName: '',
        newUser: '',
        showSuccessRemove: false,
        newPassword: '',
        newRole: '',
        showErrorUser: false,
        showSnackBackCreateUser: false,
        showSnackBackModifyUser: false

    })

    const options = {
        search: true,
        download: false,
        rowsPerPageOptions: [5, 10, 30, 50, 100],
        print: false,
        tableBodyHeight: '100%',
        selectableRows: 'none',
        viewColumns: false,
        responsive: 'vertical',
        filter: false,
        filterType: "dropdown",
        selectableRowsHeader: false,
        textLabels: {
            body: {
                noMatch: state.loading ?
                    <CircularProgress sx={{color: 'white'}}/> : 'Sorry, no users found'
            }
        }, selectToolbarPlacement: 'none',

    };
    const columns = [
        {
            name: "name",
            label: "Name",
            options: {
                filter: false,
                sort: false,
                setCellProps: () => ({
                    style: {
                        width: "20%",
                    },
                }),
            },

        },
        {
            name: "user",
            label: "User",
            options: {
                filter: false,
                sort: false,
                setCellProps: () => ({
                    style: {
                        width: "20%",
                    },
                }),
            }
        },

        {
            name: "role",
            label: "Role",
            options: {
                filter: false,
                sort: false,
                customBodyRenderLite: (dataIndex, rowIndex) => {
                    return RoleEnum[state.users[dataIndex].role].value
                },
                setCellProps: () => ({
                    style: {
                        width: "60%",
                    },
                }),
            }
        },
        {
            name: "",
            label: "",
            options: {
                filter: false,
                sort: false,
                customBodyRenderLite: (dataIndex, rowIndex) => {
                    return (
                        <IconButton disabled={state.users[dataIndex].role === 0} onClick={() => setState({...state, openDialogChangeRole: true, userSelectedIndex: dataIndex,  newRole: state.users[dataIndex].role})}>
                            <DriveFileRenameOutlineSharpIcon sx={{fontSize: '5vh'}}/>
                        </IconButton>
                    )
                }
            }
        },


        {
            name: "",
            label: "",
            options: {
                filter: false,
                sort: false,
                customBodyRenderLite: (dataIndex, rowIndex) => {
                    return (
                        <IconButton disabled={state.users[dataIndex].role === 0}
                                    onClick={() => handleRemoveUser(dataIndex)}
                        >
                            <DeleteIcon sx={{fontSize: '5vh'}}/>
                        </IconButton>
                    )
                }
            }
        },
    ]

    useEffect(() => {
        getAllUsers()
            .then(response => {
                setState({
                    ...state,
                    loading: false,
                    users: response.data
                })
            })
    }, [])


    const handleCreateUser = () => {
        setState({
            ...state,
            loadingAddUser: true
        })
        userRegister(state.newName, state.newUser, state.newPassword, state.newRole)
            .then(response => {
                let newUser = state.users
                newUser.push(response.data)

                setState({
                    ...state,
                    openDialogCreateUser: false,
                    users: newUser,
                    newUser: '',
                    newRole: '',
                    newPassword: '',
                    newName: '',
                    showSnackBackCreateUser: true,
                    loadingAddUser: false,

                })
            })
            .catch(error => {
                if (error.response.status === 409)
                    setState({
                        ...state,
                        showErrorUser: true,
                        loadingAddUser: false
                    })
            })

    }

    const handleRemoveUser = (indexUser) => {
        removeUser(state.users[indexUser].id)
            .then(response => {
                let list = [...state.users]
                list.splice(indexUser, 1)
                setState({
                    ...state,
                    users: list,
                    showSuccessRemove: true
                })

            })

    }
    const handleModifyRole = () => {
        setState({
            ...state,
            loadingChangeRole: true
        })

        changeRole(state.users[state.userSelectedIndex].id, state.newRole)
            .then(response=> {
                let list = state.users
                list[state.userSelectedIndex] = response.data
                setState({
                    ...state,
                    newRole: '',
                    loadingChangeRole: false,
                    showSnackBackModifyUser: true,
                    userSelectedIndex: '',
                    openDialogChangeRole: false,
                    users: list

                })
            })
    }


    return (
        <Grid container spacing={3} sx={{mt: '20px'}}>
            <Grid item xs={12}>
                <Grid item xs={12}>
                    <Table title={"Users"} columns={columns} data={state.users}
                           options={options}/>
                </Grid>
            </Grid>
            <Grid item xs={12}>
                <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    onClick={() => setState({...state, openDialogCreateUser: true})}
                    sx={{
                        borderRadius: '28px',
                        fontWeight: 'bold'
                    }}>
                    Add user
                </Button>
            </Grid>
            <Dialog open={state.openDialogCreateUser}

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
                <DialogTitle sx={{fontWeight: 'bold'}}>Add user</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextFieldStyled
                                autoFocus
                                id="name"
                                label="Name"
                                disabled={state.loadingAddUser}

                                value={state.newName}
                                fullWidth
                                variant="filled"
                                onChange={(e) => setState({...state, newName: e.target.value})}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextFieldStyled
                                disabled={state.loadingAddUser}
                                id="user"
                                error={state.showErrorUser}
                                label="User"
                                value={state.newUser}
                                fullWidth
                                variant="filled"
                                onChange={(e) => setState({...state, newUser: e.target.value})}
                            />
                            {state.showErrorUser &&
                                <Grid item xs={12}>
                                    <span style={{color: "#C63637", fontSize: "1rem", fontWeight: "bold"}}>
                                        User already exists.
                                    </span>
                                </Grid>
                            }
                        </Grid>
                        <Grid item xs={12}>
                            <TextFieldStyled
                                disabled={state.loadingAddUser}
                                id="password"
                                label="Password"
                                value={state.newPassword}
                                fullWidth
                                type="password"
                                variant="filled"
                                onChange={(e) => setState({...state, newPassword: e.target.value})}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl variant="filled" fullWidth>
                                <InputLabel id="demo-simple-select-label" sx={{color: 'white'}}>
                                    Role
                                </InputLabel>
                                <Select
                                    size="small"
                                    value={state.newRole}
                                    disabled={state.loadingAddUser}

                                    label="Role"
                                    sx={{color: 'white'}}
                                    onChange={(e) => setState({...state, newRole: e.target.value})}

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
                                    <MenuItem value={0} disabled>Root</MenuItem>

                                    <MenuItem value={1}>Admin</MenuItem>
                                    <MenuItem value={2}>Standard</MenuItem>
                                    <MenuItem value={3}>Read-Only</MenuItem>


                                </Select>
                            </FormControl>
                        </Grid>


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
                        disabled={state.loadingAddUser}

                        onClick={() => setState({
                            ...state,
                            userSelectedIndex: '',
                            openDialogCreateUser: false,
                            newRole: '',
                            newUser: '',
                            newName: '',
                            newPassword: ''

                        })}>Cancel</Button>
                    <LoadingButton
                        loading={state.loadingAddUser}
                        size="small"
                        disabled={state.loadingAddUser || state.newUser === '' || state.newName === '' || state.newRole === '' || state.newPassword === ''}
                        color="success"
                        onClick={handleCreateUser}
                        sx={{
                            borderRadius: '28px',
                            fontWeight: 'bold'
                        }}
                        variant="contained"
                    >Create</LoadingButton>
                </DialogActions>
            </Dialog>




            <Dialog open={state.openDialogChangeRole}
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
                <DialogTitle sx={{fontWeight: 'bold'}}>Change role</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextFieldStyled
                                disabled
                                id="user"
                                label="User"
                                fullWidth
                                value={state.userSelectedIndex === '' ? '': state.users[state.userSelectedIndex].name}
                                variant="filled"
                                InputLabelProps={{shrink: true}}

                            />

                        </Grid>
                        <Grid item xs={12}>
                            <FormControl variant="filled" fullWidth>
                                <InputLabel id="demo-simple-select-label" sx={{color: 'white'}}>
                                    Role
                                </InputLabel>
                                <Select
                                    size="small"
                                    value={state.newRole}
                                    disabled={state.loadingChangeRole}

                                    label="Role"
                                    sx={{color: 'white'}}
                                    onChange={(e) => setState({...state, newRole: e.target.value})}

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
                                    <MenuItem value={0} disabled>Root</MenuItem>

                                    <MenuItem value={1}>Admin</MenuItem>
                                    <MenuItem value={2}>Standard</MenuItem>
                                    <MenuItem value={3}>Read-Only</MenuItem>


                                </Select>
                            </FormControl>

                        </Grid>
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
                        disabled={state.loadingChangeRole}
                        onClick={() => setState({
                            ...state,
                            userSelectedIndex: '',
                            openDialogChangeRole: false,
                            loadingChangeRole: false,
                            newRole: '',

                        })}>Cancel</Button>

                    <LoadingButton
                        disabled={state.loadingChangeRole}
                        size="small"
                        color="success"
                        sx={{
                            borderRadius: '28px',
                            fontWeight: 'bold'
                        }}
                        onClick={handleModifyRole}
                        variant="contained">Modify</LoadingButton>
                </DialogActions>


            </Dialog>
            <Snackbar anchorOrigin={{vertical: "bottom", horizontal: "right"}} open={state.showSnackBackCreateUser}
                      autoHideDuration={2000} onClose={() => setState({...state, showSnackBackCreateUser: false})}>
                <Alert onClose={() => setState({...state, showSnackBackCreateUser: false})} severity="success"
                       sx={{width: '100%'}}>
                    User created!
                </Alert>
            </Snackbar>
            <Snackbar anchorOrigin={{vertical: "bottom", horizontal: "right"}} open={state.showSuccessRemove}
                      autoHideDuration={2000} onClose={() => setState({...state, showSuccessRemove: false})}>
                <Alert onClose={() => setState({...state, showSuccessRemove: false})} severity="success"
                       sx={{width: '100%'}}>
                    User removed!
                </Alert>
            </Snackbar>
            <Snackbar anchorOrigin={{vertical: "bottom", horizontal: "right"}} open={state.showSnackBackModifyUser}
                      autoHideDuration={2000} onClose={() => setState({...state, showSnackBackModifyUser: false})}>
                <Alert onClose={() => setState({...state, showSnackBackModifyUser: false})} severity="success"
                       sx={{width: '100%'}}>
                    User role updated!
                </Alert>
            </Snackbar>

        </Grid>
    )
}

export default RootUsers