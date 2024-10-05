import React from "react";
import { RiRobot3Line } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { TbReceiptDollar } from "react-icons/tb";
import { useState, useEffect } from "react";
import axios from "axios"
import { BASE_URL } from "../config";
import Header from "../components/Header"
import Footer from "../components/Footer"
import BarChart from "../components/BarChart";
import { toast } from "react-toastify";

const dailySavingsData = Array(7).fill(0).map((_, i) => ({name:["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i], savings: 0}))
const monthlySavingsData = Array(12).fill(0).map((_, i) => ({ name: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i], savings: 0 }))

const Home = () => {
    const navigate = useNavigate();

    const [isToggled, setIsToggled] = useState(false)
    const handleToggle = () => {
        setIsToggled((prevState) => !prevState)
    }

    const [isPlugged, setIsPlugged] = useState(false)
    const [chargingStatus, setChargingStatus] = useState('')
    const [loading, setLoading] = useState(true)

    const [totalMonthlyChargingHours, setTotalMonthlyChargingHours] = useState(0)
    const [totalMonthlyPluggedInHours, setTotalMonthlyPluggedInHours] = useState(0)
    const [integer, setInteger] = useState('0')
    const [decimal, setDecimal] = useState('00')

    useEffect(() => {
        const fetchSessionData = async () => {
            try {
                const userData = JSON.parse(localStorage.getItem('userData'))
                const username = userData.username
                const response = await axios.get(`${BASE_URL}/sessions/${username}/all`)
                const sessionData = response.data
                const currentDate = new Date()
                const currentYear = currentDate.getFullYear()
                const currentWeekStart = new Date(currentDate)
                currentWeekStart.setDate(currentDate.getDate() - (currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1))
                const formatDate = (date) => {
                    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
                }

                sessionData.forEach(session => {
                    const session_date = new Date(session.datetime.split(":")[0])
                    session_date.setDate(session_date.getDate() + 1)
                    const formattedSessionDate = formatDate(session_date);
                    const formattedCurrentDate = formatDate(currentDate);
                    const formattedCurrentWeekStart = formatDate(currentWeekStart);
                    if (formattedSessionDate >= formattedCurrentWeekStart && formattedSessionDate <= formattedCurrentDate) {
                        const dayOfWeek = session_date.getDay() === 0 ? 6 : session_date.getDay() - 1
                        const dailySavings = parseFloat(session.savings) || 0
                        dailySavingsData[dayOfWeek].savings += dailySavings
                    }
                })

                sessionData.forEach(session => {
                    const session_date = new Date(session.datetime.split(":")[0])
                    session_date.setDate(session_date.getDate() + 1)
                    if (session_date.getFullYear() === currentYear){
                        const month = session_date.getMonth()
                        const monthlySavings = parseFloat(session.savings)
                        monthlySavingsData[month].savings += monthlySavings
                    }
                })

                const parseChargingTime = (timeString) => {
                    const [hours, minutes] = timeString.split(':').map(Number);
                    return hours + (minutes / 60);
                }
                const currentMonth = new Date().getMonth() + 1
                let totalSavings = 0
                let totalChargingHours = 0
                let totalPluggedInHours = 0
                sessionData.forEach((session, index) => {
                    totalSavings += parseFloat(session.savings || 0)
                    const sessionMonth = parseInt((session.datetime).split("-")[1])
                    console.log(`${index + 1}`, sessionMonth);
                    if (sessionMonth === currentMonth){
                        totalPluggedInHours += parseFloat(session.main_session_data["duration"] / 60|| 0)
                        totalChargingHours += parseFloat(session.charging_time / 6 || 0)
                    }
                })
                const formattedSavings = totalSavings.toFixed(2)
                const [integerPart, decimalPart] = formattedSavings.split('.')
                setInteger(integerPart)
                setDecimal(decimalPart)
                setTotalMonthlyChargingHours(Math.floor(totalChargingHours))
                setTotalMonthlyPluggedInHours(Math.ceil(totalPluggedInHours))
                setLoading(false)
            } catch (err) {
                setLoading(false)
                console.log("Failed to connect to the server. Or No record available")
            }
        }; fetchSessionData();
    }, [dailySavingsData, monthlySavingsData])

    function convertTo24hrs(time12h){
        const time = time12h.slice(0, -2)
        const period = time12h.slice(-2, -1)
        let [hours, mins] = time.split(":").map(Number)
        if (period === 'p'){
            hours += 12
        }
        const hoursStr = hours.toString().padStart(2, '0')
        const minutesStr = mins.toString().padStart(2, '0')
        return `${hoursStr}:${minutesStr}`            
    }

    useEffect(() => {
        const fetchCurrentStatus = async () => {
            try {
                const userData = JSON.parse(localStorage.getItem('userData'))
                const username = userData.username
                const response = await axios.get(`${BASE_URL}/sessions/${username}/last`)
                const data = response.data
    
                const lastSession = data[0]
                const lastSessionDateTime = lastSession.datetime
                const sessionDate = lastSessionDateTime.slice(0, 10)
                const currentDateTime = new Date()
    
                const pluginStartTime = new Date(lastSessionDateTime)
                const pluginEndTime = new Date(pluginStartTime.getTime() + lastSession.main_session_data.duration * 60000)
                 
                let isCurrentTimeInSlot = false
                let lastSlotEndTime = null
                for (const slot of lastSession.optimized_slot.slots) {
                    const [start, end] = slot.match(/\[(.*?)\]/)[1].split(" - ")
                    const startTime = new Date(`${sessionDate}T${convertTo24hrs(start)}`)
                    const endTime = new Date(`${sessionDate}T${convertTo24hrs(end)}`)
                    if (endTime < startTime){
                        endTime.setDate(endTime.getDate() + 1)
                    }
                    if (currentDateTime >= startTime && currentDateTime <=endTime){
                        isCurrentTimeInSlot = true
                    }
                    lastSlotEndTime = endTime
                }
                
                if (currentDateTime >= pluginStartTime && currentDateTime <= pluginEndTime) {
                    if (isCurrentTimeInSlot){
                        setIsPlugged(true)
                        setChargingStatus("Charging")
                    } else {
                        if ( currentDateTime > lastSlotEndTime){
                            setIsPlugged(true)
                            setChargingStatus("Charged")
                        } else {
                            setIsPlugged(true)
                            setChargingStatus("Hold")
                        }
                    }
                } else {
                    setIsPlugged(false)
                    setChargingStatus("noData")
                }  
            } catch (err) {
                console.log("Current Status: Failed to connect to the server. Or No Record available")
            }
        };
    
        fetchCurrentStatus();
    }, [isPlugged, chargingStatus]);

    return <>
        <Header/>
        <div className="min-h-screen flex flex-col">
            <div className="flex-grow flex justify-center">
                <div className="flex flex-col w-[768px] gap-4 items-center justify-between mt-4">
                    <div className="container">
                        <div className="small__box flex flex-col gap-2 py-[25px]">
                        <div className="flex justify-between mx-[20px] items-center">
                        <div className="text-[35px] font-bold mt-1">Savings</div>
                            <div onClick={handleToggle} className="relative small__box w-[150px] bg-accentColorBlue p-[2px] flex justify-between cursor-pointer items-center">
                                <div className={`flex-none absolute h-[100%] rounded-[18px] bg-mainColor transition-none ${isToggled ? 'w-[93px] ml-[-38px] translate-x-[100%]' : 'w-[65px] ml-[-2px] translate-x-0'}`}></div>
                                <span className={`z-10 ml-[12px] ${!isToggled ? 'text-accentColorWhite' : 'text-secondaryColor'}`}>
                                    Daily
                                </span>
                                <span className={`z-10 mr-[12px] ${isToggled ? 'text-accentColorWhite' : 'text-secondaryColor'}`}>
                                    Monthly
                                </span>
                            </div>
                        </div>
                            <BarChart savingsData={isToggled ? monthlySavingsData : dailySavingsData}/>
                        </div>
                    </div>
                    <div className="container">
                        <div onClick={() => navigate('/chargeScheduler')} className="small__box cursor-pointer flex justify-around py-[10px]">
                            <div className="text-[20px] font-bold mt-1">Current<br/>Status</div>
                            <div className="flex flex-col text-[14px] gap-2 my-[5px] w-[220px] ">
                                <div className="small__box bg-accentColorLightBlue p-[2px] flex justify-evenly">
                                    <p className={`${isPlugged ? 'text-secondaryColor text-opacity-100' : 'text-secondaryColor text-opacity-50'}`}>Plugged In</p>
                                    <p>/</p>
                                    <p className={`${!isPlugged ? 'text-secondaryColor text-opacity-100' : 'text-secondaryColor text-opacity-50'}`}>Un Plugged</p>
                                </div>
                                <div className="small__box bg-accentColorLightBlue p-[2px] flex justify-center gap-2">
                                    <p className={`${chargingStatus === 'Hold' ? 'text-secondaryColor text-opacity-100' : 'text-secondaryColor text-opacity-50'}`}>Hold</p>
                                    <p>/</p>
                                    <p className={`${chargingStatus === 'Charging' ? 'text-secondaryColor text-opacity-100' : 'text-secondaryColor text-opacity-50'}`}>Charging</p>
                                    <p>/</p>
                                    <p className={`${chargingStatus === 'Charged' ? 'text-secondaryColor text-opacity-100' : 'text-secondaryColor text-opacity-50'}`}>Charged</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="container">
                        <div className="small__box">
                            <button onClick={() => navigate('/report')} className="btn rounded-[18px] w-full flex justify-between">
                                <div className="text-[20px] font-medium w-[180px]">Get your AI report</div>
                                <RiRobot3Line className="w-8 h-8 cursor-pointer text-accentColorWhite"/>
                            </button>
                        </div>
                    </div>
                    <div className="container">
                        <div className="flex justify-around gap-2">
                            <div className="small__box flex flex-col items-center justify-center w-1/2">
                                <div className="text-[35px] font-medium p-[10px] pb-0 text-center">Total<br/>Savings</div>
                                <div className="flex items-baseline">
                                    <div className="flex-none text-[40px] font-medium">$</div>
                                    <div className="text-[48px] font-semibold">{loading ? '...' : integer}</div>
                                    <div className="text-[24px]">{loading ? '..' : `.${decimal}`}</div>
                                </div>
                            </div>
                            <div className="flex flex-col text-[14px] gap-2 w-1/2">
                                <div className="small__box flex flex-col items-center">
                                    <div className="text-[16px] font-semibold p-[10px] pb-0 text-center">Total Monthly<br/>Charging Hours</div>
                                    <div className="flex items-baseline">
                                        <div className="text-[36px] font-semibold">{loading ? '...' : totalMonthlyChargingHours}</div>
                                        <div className="text-[24px]">hrs</div>
                                    </div>
                                </div>
                                <div className="small__box flex flex-col items-center">
                                    <div className="text-[16px] font-semibold p-[10px] pb-0 text-center">Total Monthly<br/>Plugged In Hours</div>
                                    <div className="flex items-baseline">
                                        <div className="text-[36px] font-semibold">{loading ? '...' : totalMonthlyPluggedInHours}</div>
                                        <div className="text-[24px]">hrs</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="container">
                        <div className="small__box">
                            <button onClick={() => navigate('/newEV')} className="btn px-[40px] rounded-[18px] w-full flex justify-between items-center">
                                <div className="text-[14px] font-medium text-left ">Planning to buy a new<br/>Get your increase in electricity bill...</div>
                                <TbReceiptDollar className="w-9 h-9 cursor-pointer text-accentColorWhite"/>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        <Footer/>
        </div>
    </>
};

export default Home;
