import React from "react";
import MUIDataTable from "mui-datatables";
import {createTheme, ThemeProvider} from "@mui/material";


const getMuiTheme = () =>
    createTheme({
        components: {

            MUIDataTable: {
                styleOverrides: {
                    paper: {
                        borderRadius: '20px !important',
                        backgroundColor: '#3B3B3B !important'
                    },
                    tableRoot: {
                        overflow: 'hidden'
                    }
                }
            },
            MUIDataTableFilter: {
                styleOverrides: {
                    root: {
                        backgroundColor: '#525558'
                    },
                    title: {
                        color: 'white'
                    },
                    resetLink: {
                        color: '#C63637 !important',
                        fontSize: '15px !important'
                    }
                }
            },
            FilterList: {
                styleOverrides: {
                    root: {
                        backgroundColor: '#3B3B3B'
                    }
                }
            },
            MUIDataTableToolbar: {
                styleOverrides: {
                    titleText: {
                        color: 'white',
                        fontWeight: 'bold',

                    }
                }
            },
            MUIDataTableHeadCell: {
                styleOverrides: {
                    fixedHeader: {
                        backgroundColor: '#3B3B3B !important',
                        fontWeight: 'bold !important',
                    }

                }
            },
            MUIDataTableBodyCell: {
                styleOverrides: {
                    stackedCommon: {
                        color: 'white',
                        whiteSpace:'pre-line'

                    }
                }
            },
            MuiTableRow: {
                styleOverrides: {
                    head: {
                        backgroundColor: '#3B3B3B !important',
                        fontWeight: 'bold !important',

                    }
                }
            },
            MuiTableCell: {
                styleOverrides: {
                    root: {
                        color: 'white',
                        fontSize: '0.875rem',
                        padding: '0px 0px 0px 16px'
                    },
                    footer: {
                        borderBottom: '0px'
                    },
                    head: {
                        backgroundColor: '#3B3B3B',
                        borderBottom: '3px solid'

                    },
                    body: {
                        backgroundColor: '#3d4144',
                        fontSize: '0.875rem',


                    }
                }
            },
            MUIDataTableViewCol: {
                styleOverrides: {
                    root: {
                        padding: '16px 24px 16px 24px !important',
                        backgroundColor: '#525558'
                    },
                    title: {
                        color: 'white'
                    },
                    label: {
                        color: 'white'
                    }
                }
            },
            MuiInputLabel: {
                styleOverrides: {
                    root: {
                        color: 'white'
                    }
                }
            },
            MuiInputBase: {
                styleOverrides: {
                    input: {
                        color: 'white'

                    }
                }
            },
            MuiTablePagination: {
                styleOverrides: {
                    selectLabel: {
                        color: 'white'
                    }
                }
            },

            MuiCheckbox: {
                styleOverrides: {
                    root: {
                        color: 'white',
                        '&.Mui-checked': {
                            color: 'white'
                        },
                        '&.Mui-disabled': {
                            color: 'rgba(0, 0, 0, 0.26)'
                        },
                    },
                }
            },
            MuiChip: {
                styleOverrides: {
                    root: {
                        color: 'white',
                        height:'auto',
                        '& .MuiChip-label': {
                            display: 'block',
                            whiteSpace: 'normal'
                        }
                    },
                    deleteIcon: {
                        color:'white'
                    }
                },

            },
            MuiMenu: {
                styleOverrides: {
                    list: {
                        color: 'white',
                        backgroundColor: '#525558'
                    }
                }
            },

            MuiIconButton: {
                styleOverrides: {
                    root: {
                        color: 'white'
                    }
                }
            },
            MUIDataTableSelectCell: {
                styleOverrides: {
                    headerCell: {
                        backgroundColor: '#3B3B3B'
                    }
                }
            }

        }
    })


const Table = ({title, columns, data, options}) => {


    return (
        <ThemeProvider theme={getMuiTheme()}>
            <MUIDataTable
                title={title}
                data={data}
                columns={columns}
                options={options}
            />
        </ThemeProvider>
    );
};

export default Table;
