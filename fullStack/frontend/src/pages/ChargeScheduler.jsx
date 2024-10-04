import React from "react";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios"
import { BASE_URL } from "../config";

import Header from "../components/Header"
import Footer from "../components/Footer"

const ChargeScheduler = () => {
    const [isToggled, setIsToggled] = useState(false)
    const handleToggle = () => {
        setIsToggled((prevState) => !prevState)
    }

    const [isPlugged, setIsPlugged] = useState(false)
    const [chargingStatus, setChargingStatus] = useState('')
    
    const [pluginTiming1, setPluginTiming1] = useState("")
    const [pluginDuration1, setPluginDuration1] = useState("")
    const [powerConsumption1, setPowerConsumption1] = useState("")
    const [chargingTime1, setChargingTime1] = useState("")
    const [distance1, setDistance1] = useState("")
    const [optimizedCost1, setOptimizedCost1] = useState("")
    const [optimizedSlot1, setOptimizedSlot1] = useState("")
    const [unOptimizedCost1, setUnOptimizedCost1] = useState("")
    const [unOptimizedSlot1, setUnOptimizedSlot1] = useState("")
    const [savings1, setSavings1] = useState("")
    const [notes1, setNotes1] = useState("")

    const [pluginTiming2, setPluginTiming2] = useState("")
    const [chargingTime2, setChargingTime2] = useState("")
    const [distance2, setDistance2] = useState("")
    const [optimizedCost2, setOptimizedCost2] = useState("")
    const [optimizedSlot2, setOptimizedSlot2] = useState("")
    const [unOptimizedCost2, setUnOptimizedCost2] = useState("")
    const [unOptimizedSlot2, setUnOptimizedSlot2] = useState("")
    const [savings2, setSavings2] = useState("")
    const [notes2, setNotes2] = useState("")

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

    function convertMinutesToHrs(minutes){
        const totalHours = Math.floor(minutes/60)
        const mins = minutes % 60
        return `${totalHours.toString()} hrs ${mins.toString().padStart(2, '0')} min`
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
                    setIsPlugged(true)
                    if (isCurrentTimeInSlot){
                        setChargingStatus("Charging")
                    } else {
                        if ( currentDateTime > lastSlotEndTime){
                            setChargingStatus("Charged")
                        } else {
                            setChargingStatus("Hold")
                        }
                    }
                } else {
                    setIsPlugged(false)
                    setChargingStatus("noData")
                }
                if (isPlugged) {
                    setPluginTiming1(data[0].plugin_timing)
                    setPluginDuration1(convertMinutesToHrs(data[0].main_session_data.duration))
                    setPowerConsumption1(data[0].main_session_data.demand)
                    setChargingTime1(convertMinutesToHrs(data[0].charging_time))
                    setDistance1(data[0].distance)
                    setOptimizedCost1(data[0].optimized_slot.cost)
                    setOptimizedSlot1(data[0].optimized_slot.slots)
                    setUnOptimizedCost1(data[0].unOptimized_slot.cost)
                    setUnOptimizedSlot1(data[0].unOptimized_slot.slots)
                    setSavings1(data[0].savings)
                    setNotes1(data[0].notes)

                    setPluginTiming2(data[1].plugin_timing)
                    setChargingTime2(convertMinutesToHrs(data[1].charging_time))
                    setDistance2(data[1].distance)
                    setOptimizedCost2(data[1].optimized_slot.cost)
                    setOptimizedSlot2(data[1].optimized_slot.slots)
                    setUnOptimizedCost2(data[1].unOptimized_slot.cost)
                    setUnOptimizedSlot2(data[1].unOptimized_slot.slots)
                    setSavings2(data[1].savings)
                    setNotes2(data[1].notes)
                } else {
                    setPluginTiming2(data[0].plugin_timing)
                    setChargingTime2(convertMinutesToHrs(data[0].charging_time))
                    setDistance2(data[0].distance)
                    setOptimizedCost2(data[0].optimized_slot.cost)
                    setOptimizedSlot2(data[0].optimized_slot.slots)
                    setUnOptimizedCost2(data[0].unOptimized_slot.cost)
                    setUnOptimizedSlot2(data[0].unOptimized_slot.slots)
                    setSavings2(data[0].savings)
                    setNotes2(data[0].notes)
                }
            } catch (err) {
                toast.error("Current Status: Failed to connect to the server. Or No record available")
            }
        }; fetchCurrentStatus();
    }, [isPlugged, chargingStatus]);
    
    const [isCurrToggled, setIsCurrToggled] = useState(false)
    const handleCurrToggle = () => {
        setIsCurrToggled((prevState) => !prevState)
    }
    const [isPrevToggled, setIsPrevToggled] = useState(false)
    const handlePrevToggle = () => {
        setIsPrevToggled((prevState) => !prevState)
    }

    return <>
        <Header/>
        <div className="min-h-screen flex flex-col">
            <div className="flex-grow flex justify-center">
                <div className="flex flex-col w-[768px] gap-4 items-center mt-4">
                    <div className="container">
                        <div className="small__box flex justify-around py-[10px]">
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
                    {isPlugged &&
                        <div className="container" onClick={handleCurrToggle}>
                            <div className="small__box flex-col flex justify-around py-[10px] text-[14px] gap-[6px] sm:gap-3 font-medium">
                            <div className="text-[20px] ml-[20px] font-bold mt-1">Current Charging Session</div>
                                {!isCurrToggled && (
                                    <div>
                                        <div className="small__box flex mb-[10px] items-center justify-evenly">
                                            <div className="text-[24px] font-medium p-[10px] pb-0 text-center">You 'll be<br/>Saved</div>
                                            <div className="flex items-baseline">
                                                <div className="text-[58px] font-semibold">{Math.ceil(((parseFloat(unOptimizedCost1) - parseFloat(optimizedCost1))/((parseFloat(unOptimizedCost1)+parseFloat(optimizedCost1))/2)) * 100)}</div>
                                                <div className="text-[35px]">%</div>
                                            </div>
                                        </div>
                                        <p className="ml-[20px]">Click for more info</p>
                                    </div>
                                )}
                                {isCurrToggled && (
                                    <div className="flex flex-col gap-[6px]">
                                        <div className="flex justify-between mx-[20px] items-center">
                                            <p>Plug in Timing</p>
                                            <p className="rounded-[18px] w-[100px] text-center bg-accentColorLightBlue p-[2px]">{pluginTiming1}</p>
                                        </div>
                                        <div className="flex justify-between mx-[20px] items-center">
                                            <p>Predicted Plug in Duration</p>
                                            <p className="rounded-[18px] w-[100px] text-center bg-accentColorLightBlue p-[2px]">{pluginDuration1}</p>
                                        </div>
                                        <div className="flex justify-between mx-[20px] items-center">
                                            <p>Predicted Power Consumption</p>
                                            <p className="rounded-[18px] w-[100px] text-center bg-accentColorLightBlue p-[2px]">{powerConsumption1} Kwh</p>
                                        </div>
                                        <div className="flex justify-between mx-[20px] items-center">
                                            <p>Predicted Charging Time</p>
                                            <p className="rounded-[18px] w-[100px] text-center bg-accentColorLightBlue p-[2px]">{chargingTime1}</p>
                                        </div>
                                        <div className="flex justify-between mx-[20px] items-center">
                                            <p>Predicted Driving Distance</p>
                                            <p className="rounded-[18px] w-[100px] text-center bg-accentColorLightBlue p-[2px]">{distance1} Km</p>
                                        </div>
                                        <div className=" bg-mainColor rounded-[18px] text-accentColorWhite flex-col flex justify-around mx-[10px] max-w-full py-[10px] text-[14px] gap-[6px] font-medium">
                                            <div className="flex justify-between mx-[20px] items-center">
                                                <p>Optimized Slot</p>
                                                <p className="text-center ">Cost: ${optimizedCost1}</p>
                                            </div>
                                            <p className="rounded-[18px] mx-[20px] max-w-full text-center text-secondaryColor bg-accentColorLightBlue p-[2px]">
                                            {Object.entries(optimizedSlot1).map(([key, value], index) => (
                                                <span key={key}>
                                                {value}
                                                <br />
                                                </span>
                                            ))}
                                            </p>
                                            <div className="flex justify-between mx-[20px] items-center">
                                                <p>UnOptimized Slot</p>
                                                <p className="text-center ">Cost: ${unOptimizedCost1}</p>
                                            </div>
                                            <p className="rounded-[18px] mx-[20px] max-w-full text-center text-secondaryColor bg-accentColorLightBlue p-[2px]">
                                            {Object.entries(unOptimizedSlot1).map(([key, value], index) => (
                                                <span key={key}>
                                                {value}
                                                <br />
                                                </span>
                                            ))}
                                            </p>
                                        </div>
                                        <div className="flex justify-between mx-[20px] items-center">
                                            <p>Savings</p>
                                            <p className="rounded-[18px] w-[100px] text-center bg-accentColorLightBlue p-[2px]">${savings1}</p>
                                        </div>
                                        {notes1 !== "" &&  (
                                            <div className="flex flex-col mx-[20px]">
                                                <p>Notes:</p>
                                                <p className="indent-5 text-[13px]">{notes1}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className=" border border-mainColor rounded-[18px] flex-col flex justify-around mx-[10px] max-w-full py-[10px] text-[14px] gap-[6px] font-medium">
                                    <div className="flex justify-between mx-[10px] items-center">
                                        <p>Charging Settings</p>
                                        <div onClick={handleToggle} className="relative small__box w-[150px] bg-accentColorBlue p-[2px] flex justify-between cursor-pointer items-center">
                                            <div className={`flex-none absolute h-[100%] rounded-[18px] bg-mainColor transition-none ${isToggled ? 'w-[51px] ml-[46px] translate-x-[100%]' : 'w-[110px] ml-[-2px] translate-x-0'}`}></div>
                                            <span className={`z-10 ml-[12px] ${!isToggled ? 'text-accentColorWhite' : 'text-secondaryColor'}`}>
                                                Daily Driven
                                            </span>
                                            <span className={`z-10 mr-[12px] ${isToggled ? 'text-accentColorWhite' : 'text-secondaryColor'}`}>
                                                Full
                                            </span>
                                        </div>
                                    </div>
                                    <p className="indent-5 mx-[10px] text-[13px]">** This system charges the vehicle with respect to the daily driven range. Toggle to change.</p>
                                </div>
                            </div>
                        </div>
                    }
                    <div onClick={handlePrevToggle} className="container">
                        <div className="small__box flex-col flex justify-around py-[10px] text-[14px] gap-[6px] sm:gap-3 font-medium">
                        <div className="text-[20px] ml-[20px] font-bold mt-1">Previous Charging Session</div>
                            {!isPrevToggled && (
                                <div>
                                    <div className="small__box flex mb-[10px] items-center justify-evenly">
                                        <div className="text-[24px] font-medium p-[10px] pb-0 text-center">You have<br/>Saved</div>
                                        <div className="flex items-baseline">
                                            <div className="text-[58px] font-semibold">{Math.ceil(((parseFloat(unOptimizedCost2) - parseFloat(optimizedCost2))/((parseFloat(unOptimizedCost2)+parseFloat(optimizedCost2))/2)) * 100)}</div>
                                            <div className="text-[35px]">%</div>
                                        </div>
                                    </div>
                                    <p className="ml-[20px]">Click for more info</p>
                                </div>
                            )}
                            {isPrevToggled && (
                                <div className="flex flex-col gap-[6px]">
                                    <div className="flex justify-between mx-[20px] items-center">
                                        <p>Plug in Timing</p>
                                        <p className="rounded-[18px] w-[100px] text-center bg-accentColorLightBlue p-[2px]">{pluginTiming2}</p>
                                    </div>
                                    <div className="flex justify-between mx-[20px] items-center">
                                        <p>Predicted Charging Time</p>
                                        <p className="rounded-[18px] w-[100px] text-center bg-accentColorLightBlue p-[2px]">{chargingTime2}</p>
                                    </div>
                                    <div className="flex justify-between mx-[20px] items-center">
                                        <p>Predicted Driving Distance</p>
                                        <p className="rounded-[18px] w-[100px] text-center bg-accentColorLightBlue p-[2px]">{distance2} Km</p>
                                    </div>
                                    <div className=" bg-mainColor rounded-[18px] text-accentColorWhite flex-col flex justify-around mx-[10px] max-w-full py-[10px] text-[14px] gap-[6px] font-medium">
                                        <div className="flex justify-between mx-[20px] items-center">
                                            <p>Optimized Slot</p>
                                            <p className="text-center ">Cost: ${optimizedCost2}</p>
                                        </div>
                                        <p className="rounded-[18px] mx-[20px] max-w-full text-center text-secondaryColor bg-accentColorLightBlue p-[2px]">
                                            {Object.entries(optimizedSlot2).map(([key, value], index) => (
                                                <span key={key}>
                                                {value}
                                                <br />
                                                </span>
                                            ))}
                                            </p>
                                        <div className="flex justify-between mx-[20px] items-center">
                                            <p>UnOptimized Slot</p>
                                            <p className="text-center ">Cost: ${unOptimizedCost2}</p>
                                        </div>
                                        <p className="rounded-[18px] mx-[20px] max-w-full text-center text-secondaryColor bg-accentColorLightBlue p-[2px]">
                                            {Object.entries(unOptimizedSlot2).map(([key, value], index) => (
                                                <span key={key}>
                                                {value}
                                                <br />
                                                </span>
                                            ))}
                                            </p>
                                    </div>
                                    <div className="flex justify-between mx-[20px] items-center">
                                        <p>Savings</p>
                                        <p className="rounded-[18px] w-[100px] text-center bg-accentColorLightBlue p-[2px]">${savings2}</p>
                                    </div>
                                    {notes2 !== "" &&  (
                                        <div className="flex flex-col mx-[20px]">
                                            <p>Notes:</p>
                                            <p className="indent-5 text-[13px]">{notes2}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer/>
        </div>
    </>
};

export default ChargeScheduler;