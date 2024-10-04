'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const BarChartComponent = ({savingsData}) => {
    return <div className="w-full h-[200px] sm:h-[300px]">
        <ResponsiveContainer>
            <BarChart margin={{right: 20}} data={savingsData}>
                <CartesianGrid strokeDasharray="4 4"/>
                <XAxis dataKey="name"/>
                <YAxis/>
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="savings" fill="#24293d"/>
            </BarChart>
        </ResponsiveContainer>
    </div>
}

export default BarChartComponent

const CustomTooltip = ({active, payload, label}) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-[10px] bg-accentColorBlue text-secondaryColor flex flex-col gap-[2px] rounded-[18px]">
                <p className="font-medium text-md">{label}</p>
                <p className="text-sm">
                    Savings:<span className="ml-2">${payload[0].value}</span>
                </p>
            </div>
        )
    }
    return null
}