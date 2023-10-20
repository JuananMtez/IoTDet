import {
    Area,
    AreaChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";
import {useState} from "react";
import {Box, CircularProgress, Grid} from "@mui/material";


const AreaChartRecharts = ({data, datakey}) => {


    return (
        <ResponsiveContainer height={300} width="100%" aspect={0}>

            <AreaChart height={30}
                data={data}

            >
                {
                    data.length === 0
                        ?
                        <>
                            <YAxis tick={false} domain={[0, 100]} width={45} stroke="white"/>
                            <XAxis domain={[0, 180]} reversed={true} width={45} stroke="white"/>

                        </>
                        :
                        <>
                            <YAxis width={45} stroke="white"/>
                            <XAxis width={45} reversed={true} stroke="white"/>
                        </>


                }

                <Legend/>
                <Area type="monotone" dataKey={datakey} stroke="wheat" fill="wheat" isAnimationActive={false}/>
            </AreaChart>
        </ResponsiveContainer>
    )
}

export default AreaChartRecharts