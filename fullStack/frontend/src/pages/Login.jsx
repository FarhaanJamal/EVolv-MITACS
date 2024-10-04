import React, { useState } from "react";
import {RiLinkedinFill} from 'react-icons/ri'
import {AiFillGithub} from 'react-icons/ai'
import {NavLink, Link, useNavigate} from 'react-router-dom'
import { BASE_URL } from "../config";
import logoWithName from '../assets/images/logo-with-name.png'
import {toast} from 'react-toastify'

const socialLinks = [
    {
        path: "https://www.linkedin.com/in/farhaan-jamal/",
        icon: <RiLinkedinFill className="group-hover:text-white w-4 h-5"/>
    },
    {
        path: "https://github.com/FarhaanJamal",
        icon: <AiFillGithub className="group-hover:text-white w-4 h-5"/>
    }
]

const support = {
    path: "mailto:farhaanjamal456@gmail.com",
    display: "Contact Us"
}

const Login = () => {
    const [formData, setFormData] = useState({
        uname: "",
        password: ""
    })
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleInputChange = e => {
        setFormData({ ... formData, [e.target.name]: e.target.value})
    }

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const formData1 = {
                name: formData.uname,
                password: formData.password
            }
            const response = await fetch(`${BASE_URL}/login`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(formData1),
                mode: "cors"
            })
            setLoading(false)
            if (response.ok){
                localStorage.removeItem('userData')
                const result = await response.json()
                const userData = {
                    username: formData1.name,
                    lastLogin: new Date().toISOString()
                }
                localStorage.setItem("userData", JSON.stringify(userData));
                toast.success(result.message)
                navigate("/")
            } else {
                const err = await response.json()
                toast.error(err.detail)
            }
        } catch (err) {
            setLoading(false)
            toast.error("Failed to connect to the server.")
        }
    }

    return <>
        <div className="min-h-screen flex flex-col">
            <div className="flex-grow flex justify-center">
                <div className="w-[768px]">
                    <div className="h-[300px] flex justify-center items-center">
                        <img  className="object-cover mt-[45px] h-[125px]" src={logoWithName} alt="" />
                    </div>
                    <div className="container">
                        <div className="rounded-[18px] mx-[20px] bg-mainColor shadow-xl text-accentColorWhite">
                            <h3 className=" text-[22px] p-[30px] font-bold">{message}Hello! <span className="text-accentColorLightBlue">Welcome</span> back ✨</h3>
                            <form className="py-4 md:py-0" onSubmit={handleLogin}>
                                <div className="p-5 pt-0 flex flex-col gap-5">
                                    <input className="px-4 py-3 border-b border-solid border-accentColorLightBlue focus:outline-none focus:border-b-mainColor text-[16px] leading-7 text-secondaryColor placeholder:opacity-75 rounded-[18px] cursor-pointer" placeholder="UserName" name="uname" value={formData.uname} onChange={handleInputChange}/>
                                    <input type="password" className="px-4 py-3 border-b border-solid border-accentColorLightBlue focus:outline-none focus:border-b-mainColor text-[16px] leading-7 text-secondaryColor placeholder:opacity-75 rounded-[18px] cursor-pointer" placeholder="Password" name="password" value={formData.password} onChange={handleInputChange}/>
                                    <button type="submit" className=" rounded-[50px] font-semibold p-2 mx-2 bg-accentColorBlue text-secondaryColor">
                                        {loading ? 'Loading..' : "Login"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className="m-[35px] mb-0 text-[14px] indent-6">
                        ** User Name & Password are given with the Hardware
                    </div>
                    <div className="m-[35px] mt-0 text-[14px] indent-6">
                        For testing use (username: "test") and (password: "1234567890")
                    </div>
                </div>
            </div>
            <div className="container p-0">
                <footer className="small__box rounded-b-none p-[20px] pb-[10px] flex justify-between md:justify-around flex-col md:flex-row flex-wrap gap-[2px]">
                    <div>
                        <h2 className="text-[16px] md:mb-[5px] leading-[15px] font-semibold">Support</h2>
                        <Link to={support.path} className="ml-[5px] text-[14px] leading-7 font-medium">{support.display}</Link>
                    </div>
                    <div className="flex justify-between md:flex-col mt-[-8px]">
                        <h2 className="text-[16px] pt-[5px] font-semibold">Developed By</h2>
                        <div className="flex items-center md:px-[5px] md:pt-[5px] gap-3">
                            <p className="text-[14px] leading-7 font-medium">Farhaan J</p>
                            {socialLinks.map((link, index) => (
                                <Link to={link.path} key={index} className="w-7 h-7 border border-solid border-[#181A1E] rounded-full flex items-center justify-center group hover:bg-accentColorBlue hover:border-none">{link.icon}</Link>
                            ))}
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    </>
};

export default Login;