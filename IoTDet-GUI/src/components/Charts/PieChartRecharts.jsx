import {
    Area,
    AreaChart, Bar, BarChart,
    CartesianGrid, Cell, Label,
    Legend, Pie, PieChart,

    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";
import "./PieChartRecharts.css"
import {Toll} from "@mui/icons-material";

const COLORS = [
    "#C8BE71",
    "#D3C790",
    "#B9AD61",
    "#E4DFAE",
    "#D0C695",
    "#B6A763",
    "#C6B876",
    "#DBD2A9",
    "#CDC093",
    "#B3A161",
    "#AFA200",
    "#E8E1C5",
    "#DCD2A3",
    "#C2B77B",
    "#E2DDB9",
    "#CCC39C",
    "#B3A963",
    "#BAB36F",
    "#AFA200",
    "#D8CC7F"
];



const PieChartRecharts = ({data, datakey}) => {


    return (

        <ResponsiveContainer height={310} width="100%" aspect={0}>

            <PieChart width={400}>
                {
                    data.length === 0
                    ?
                        <Pie
                            startAngle={0}
                            endAngle={360}
                            data={[{name: "nothing", value: 1}]}
                            cx="50%"
                            cy="50%"
                            isAnimationActive={false}
                            outerRadius={100}

                            fill="wheat"
                            dataKey="value"
                            className="disable-click"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[(index + 10) % COLORS.length]}/>
                            ))}
                        </Pie>
                        :
                        <>
                            <Pie
                                startAngle={0}
                                endAngle={360}
                                data={data}
                                cx="50%"
                                cy="50%"
                                isAnimationActive={false}
                                outerRadius={100}
                                label
                                fill="#8884d8"
                                dataKey="value"
                                className="disable-click"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[(index + 10) % COLORS.length]}/>
                                ))}
                            </Pie>
                            <Legend align="center"/>

                            <Tooltip/>
                        </>
                }

            </PieChart>

        </ResponsiveContainer>


    )
}

export default PieChartRecharts