import React from "react";
import { RiRobot3Line } from "react-icons/ri";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { BASE_URL } from "../config";

import Header from "../components/Header"
import Footer from "../components/Footer"

const Report = () => {

    const [loading, setLoading] = useState(true)
    const [report, setReport] = useState("")

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const userData = JSON.parse(localStorage.getItem('userData'))
                const username = userData.username
                const response = await axios.get(`${BASE_URL}/report/${username}`)
                setReport(response.data.report)
                setLoading(false)
            } catch (err) {
                setLoading(false)
                toast.error(err, "Failed to connect to the server. Or No record available")
            }
        }; fetchReport();
    }, [])

    return <>
        <Header/>
        <div className="min-h-screen flex flex-col">
            <div className="flex-grow flex justify-center">
                <div className="flex flex-col w-[768px] gap-4 items-center mt-4">
                    <div className="container">
                        <div className="small__box">
                            <div className="btn rounded-[18px] w-full flex justify-between">
                                <div className="text-[20px] font-medium w-[180px]">Get your AI report</div>
                                <RiRobot3Line className="w-8 h-8 cursor-pointer text-accentColorWhite"/>
                            </div>
                        </div>
                    </div>
                    <div className="container">
                        <div className="small__box flex-col flex justify-around py-[10px] text-[14px] gap-[6px] font-medium">
                            <div className="text-[20px] ml-[20px] font-bold mt-1">Personalized Report</div>
                            <div className="text-[14px] mx-[20px] mt-1">{loading ? 'Loading...' : <div dangerouslySetInnerHTML = {{ __html: report}}/>}</div>
                            <div className="text-[12px] ml-[20px] mt-1">AI generated content might have uncertainties</div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer/>
        </div>
    </>
};

export default Report;