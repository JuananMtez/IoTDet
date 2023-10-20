import {LineChart, Legend, ResponsiveContainer, XAxis, YAxis, Line} from "recharts";

const LineChartRecharts = ({data, malware}) => {

    malware.unshift("")
    malware.push(" ")



    const padding = 0
    const fontSize = 10
    const maxLength = Math.max(...malware.map(label => label.length));
    const yAxisWidth = maxLength * fontSize + padding;

    return (
        <ResponsiveContainer height={300} width="100%" aspect={0}>

            <LineChart height={30}
                       data={data}

            >

                <YAxis type="category" domain={malware} width={yAxisWidth} stroke="white"/>
                <XAxis width={100} stroke="white"/>


                <Line dot={false} type="monotone" dataKey="value" stroke="wheat" isAnimationActive={false}/>
            </LineChart>
        </ResponsiveContainer>
    )

}
export default LineChartRecharts