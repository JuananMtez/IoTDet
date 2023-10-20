import {Card, CardActions, CardContent} from "@mui/material";
import * as React from "react";
import CodeIcon from "@mui/icons-material/Code.js";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from '@mui/icons-material/Delete';

const CardImg = ({id, data, handleRemove}) => {




    return (
        <Card elevation={6} variant="elevation" sx={{
            borderRadius: '28px',
            backgroundColor: '#555555 !important',
        }}>
            <CardContent sx={{padding: '16px 16px 0px 16px'}}>
                <img style={{
                    maxWidth: '100%',
                    height: 'auto',
                    borderRadius:'28px'
                }} src={`data:image/jpeg;base64,${data}`} alt=""/>
                <hr/>
            </CardContent>

            <CardActions sx={{padding: '0px 8px 0px 8px'}} disableSpacing>

                <IconButton
                    sx={{marginLeft:'auto'}}
                    aria-label="add to favorites"
                    onClick={() => handleRemove(id)}
                >
                    <DeleteIcon sx={{color: 'white'}}/>
                </IconButton>
            </CardActions>
        </Card>
    )
}
export default CardImg