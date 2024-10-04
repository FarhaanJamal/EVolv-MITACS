import React from "react";
import { useState } from "react";
import { TbReceiptDollar } from "react-icons/tb";
import axios from "axios"
import { BASE_URL } from "../config";
import { toast } from "react-toastify";

import Header from "../components/Header"
import Footer from "../components/Footer"

const NewEV = () => {
    const [formData, setFormData] = useState({
        homeType: "",
        area: 0,
        powerConsumption: 0,
        people: 0,
        tv: 0,
        dishWasher: 0,
        sauna: 0,
        cableBox: 0,
        coffeeMaker: 0,
        dryer: 0,
        freezer: 0,
        washer: 0,
        gameConsole: 0,
        oven: 0,
        refrigerator: 0,
        electricShower: 0,
        electricVehicle: 0,
    })

    const [addPower, setAddPower] = useState(0)
    const [integer, setInteger] = useState('0')
    const [decimal, setDecimal] = useState('00')
    const [loading, setLoading] = useState(false)
    
    const handleInputChange = (e) => {
        const {name, value} = e.target
        setFormData((prevData) => ({
            ...prevData,
            [name]: value === "" ? 0 : value
        }))
    };

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        formData.area = parseFloat(formData.area)
        formData.powerConsumption = parseFloat(formData.powerConsumption)
        console.log(formData)
        try {
            const response = await fetch(`${BASE_URL}/newEV`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(formData),
                mode: "cors"
            })
            if (response.ok){
                const result = await response.json()
                const [add_pow, add_cost] = result.message.split(",")
                const [integerPart, decimalPart] = add_cost.split('.')
                setInteger(integerPart)
                setDecimal(decimalPart.slice(0, 2))
                setAddPower(Math.ceil(parseInt(add_pow)))
            } else {
              toast.error("Failed to get a response from the server.");
            }
        } catch (err) {
            toast.error("Failed to connect to the server.")
        } finally {
            setLoading(false)
        }
    }

    return <>
        <Header/>
        <div className="min-h-screen flex flex-col">
            <div className="flex-grow flex justify-center">
                <div className="flex flex-col w-[768px] gap-4 items-center mt-4">
                    <div className="container">
                        <div className="small__box">
                            <div className="btn px-[20px] rounded-[18px] w-full flex justify-between items-center">
                                <div className="text-[14px] font-medium text-left ">Planning to buy a new<br/>Get your increase in electricity bill...</div>
                                <TbReceiptDollar className="w-9 h-9 cursor-pointer text-accentColorWhite"/>
                            </div>
                        </div>
                    </div>
                    <div className="container">
                        <div className="small__box flex-col flex justify-around py-[10px] text-[14px] gap-[6px] font-medium">
                            <div className="text-[20px] ml-[20px] font-bold mt-1">Provide some information to give  you more accurate prediction</div>
                            <form className="flex mx-[20px] flex-col gap-2" onSubmit={handleSubmit}>
                                <label className="flex items-center justify-between">
                                    <span>Home Type</span>
                                    <select name="homeType"  onChange={handleInputChange} className="focus:outline-none h-[25px] w-[125px] rounded-[18px] p-[2px] px-[4px] bg-accentColorLightBlue">
                                        <option value="">Select</option>
                                        <option value="singleFamily">Single Family</option>
                                        <option value="multiFamily">Multi Family</option>
                                    </select>
                                </label>
                                <div className="flex justify-between items-center">
                                    <label>Area (in sq.m)</label>
                                    <input type="number" value={formData.area} name="area" onChange={handleInputChange} className="rounded-[18px] w-[125px] text-center bg-accentColorLightBlue p-[2px]"/>
                                </div>
                                <div className="flex justify-between items-center">
                                    <label>Monthly Power Consumption</label>
                                    <input type="number" name="powerConsumption" value={formData.powerConsumption} step="0.01" onChange={handleInputChange} className="rounded-[18px] w-[125px] text-center bg-accentColorLightBlue p-[2px]"/>
                                </div>
                                <div className="text-[17px] font-semibold">Number Of ...</div>
                                <div className="flex justify-between">
                                    <div className="flex flex-col justify-between items-center">
                                        <label>People</label>
                                        <input type="number" name="people" value={formData.people} onChange={handleInputChange} className="rounded-[18px] w-[100px] text-center bg-accentColorLightBlue p-[2px]"/>
                                    </div>
                                    <div className="flex flex-col justify-between items-center">
                                        <label>TV</label>
                                        <input type="number" name="tv" value={formData.tv} onChange={handleInputChange} className="rounded-[18px] w-[100px] text-center bg-accentColorLightBlue p-[2px]"/>
                                    </div>
                                    <div className="flex flex-col justify-between items-center">
                                        <label>Dish Washer</label>
                                        <input type="number" name="dishWasher" value={formData.dishWasher} onChange={handleInputChange} className="rounded-[18px] w-[100px] text-center bg-accentColorLightBlue p-[2px]"/>
                                    </div>
                                </div>
                                <div className="flex justify-between">
                                    <div className="flex flex-col justify-between items-center">
                                        <label>Sauna</label>
                                        <input type="number" name="sauna" value={formData.sauna} onChange={handleInputChange} className="rounded-[18px] w-[100px] text-center bg-accentColorLightBlue p-[2px]"/>
                                    </div>
                                    <div className="flex flex-col justify-between items-center">
                                        <label>Cable Box</label>
                                        <input type="number" name="cableBox" value={formData.cableBox} onChange={handleInputChange} className="rounded-[18px] w-[100px] text-center bg-accentColorLightBlue p-[2px]"/>
                                    </div>
                                    <div className="flex flex-col justify-between items-center">
                                        <label>Coffee Maker</label>
                                        <input type="number" name="coffeeMaker" value={formData.coffeeMaker} onChange={handleInputChange} className="rounded-[18px] w-[100px] text-center bg-accentColorLightBlue p-[2px]"/>
                                    </div>
                                </div>
                                <div className="flex justify-between">
                                    <div className="flex flex-col justify-between items-center">
                                        <label>Dryer</label>
                                        <input type="number" name="dryer" value={formData.dryer} onChange={handleInputChange} className="rounded-[18px] w-[100px] text-center bg-accentColorLightBlue p-[2px]"/>
                                    </div>
                                    <div className="flex flex-col justify-between items-center">
                                        <label>Freezer</label>
                                        <input type="number" name="freezer" value={formData.freezer} onChange={handleInputChange} className="rounded-[18px] w-[100px] text-center bg-accentColorLightBlue p-[2px]"/>
                                    </div>
                                    <div className="flex flex-col justify-between items-center">
                                        <label>Washer</label>
                                        <input type="number" name="washer" value={formData.washer} onChange={handleInputChange} className="rounded-[18px] w-[100px] text-center bg-accentColorLightBlue p-[2px]"/>
                                    </div>
                                </div>
                                <div className="flex justify-between">
                                    <div className="flex flex-col justify-between items-center">
                                        <label>Game Console</label>
                                        <input type="number" name="gameConsole" value={formData.gameConsole} onChange={handleInputChange} className="rounded-[18px] w-[100px] text-center bg-accentColorLightBlue p-[2px]"/>
                                    </div>
                                    <div className="flex flex-col justify-between items-center">
                                        <label>Oven</label>
                                        <input type="number" name="oven" value={formData.oven} onChange={handleInputChange} className="rounded-[18px] w-[100px] text-center bg-accentColorLightBlue p-[2px]"/>
                                    </div>
                                    <div className="flex flex-col justify-between items-center">
                                        <label>Refrigerator</label>
                                        <input type="number" name="refrigerator" value={formData.refrigerator} onChange={handleInputChange} className="rounded-[18px] w-[100px] text-center bg-accentColorLightBlue p-[2px]"/>
                                    </div>
                                </div>
                                <div className="flex justify-evenly">
                                    <div className="flex flex-col justify-between items-center">
                                        <label>Electric Shower</label>
                                        <input type="number" name="electricShower" value={formData.electricShower} onChange={handleInputChange} className="rounded-[18px] w-[100px] text-center bg-accentColorLightBlue p-[2px]"/>
                                    </div>
                                    <div className="flex flex-col justify-between items-center">
                                        <label>Electric Vehicle</label>
                                        <input type="number" name="electricVehicle" value={formData.electricVehicle} onChange={handleInputChange} className="rounded-[18px] w-[100px] text-center bg-accentColorLightBlue p-[2px]"/>
                                    </div>
                                </div>
                                <div className="flex justify-center">
                                    <button type="submit" className="w-[50%] rounded-[50px] font-semibold p-2 mx-2 bg-accentColorBlue text-secondaryColor">
                                    {loading ? 'Loading..' : "Submit"}
                                    </button>
                                </div>
                            </form>
                            {!loading  && addPower !== 0 && <div>
                                <div className="flex gap-2 mx-[20px] m-0 mt-[10px]">
                                    <div className="small__box bg-accentColorLightBlue flex flex-col items-center">
                                        <div className="text-[16px] font-semibold p-[10px] pb-0 text-center">Additional<br/>Monthly Power<br/>Consumption</div>
                                        <div className="flex items-baseline">
                                            <div className="text-[36px] font-semibold">{loading ? '...' : addPower}</div>
                                            <div className="text-[24px]">Kwh</div>
                                        </div>
                                    </div>
                                    <div className="small__box bg-accentColorLightBlue flex flex-col items-center">
                                        <div className="text-[16px] font-semibold p-[10px] pb-0 text-center">Additional<br/>Monthly Cost</div>
                                        <div className="flex items-baseline">
                                            <div className="flex-none text-[40px] font-medium">$</div>
                                            <div className="text-[48px] font-semibold">{loading ? '...' : integer}</div>
                                            <div className="text-[24px]">{loading ? '..' : `.${decimal}`}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>}
                        </div>
                    </div>
                </div>
            </div>
            <Footer/>
        </div>
    </>
};

export default NewEV;