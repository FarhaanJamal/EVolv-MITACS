import React from "react";
import {RiLinkedinFill} from 'react-icons/ri'
import {AiFillGithub} from 'react-icons/ai'
import {Link} from 'react-router-dom'

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

const quickLink =[
    {
        path: "/",
        display: "Home"
    },
    {
        path: "/chargeScheduler",
        display: "Charge Scheduler"
    },
    {
        path: "/newEV",
        display: "New Ev"
    },
    {
        path: '/report',
        display: 'AI Report'
    }
]

const support = {
    path: "mailto:farhaanjamal456@gmail.com",
    display: "Contact Us"
}


const Footer = () => {
    return <footer>
        <div className="container p-0 mt-[20px]">
            <div className="small__box rounded-b-none p-[20px] pb-[10px] flex justify-between flex-col md:flex-row flex-wrap gap-[2px]">
                <div>
                    <h2 className="text-[16px] leading-[15px] font-semibold">Quick Links</h2>
                    <ul className="flex justify-between md:gap-5 px-[5px] md:pt-[5px]">
                        {quickLink.map((item, index) => (
                            <li key={index}>
                                <Link to={item.path} className="text-[14px] leading-7 font-medium">{item.display}</Link>
                            </li>
                        ))}
                    </ul>
                </div>
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
            </div>
        </div>
    </footer>
};

export default Footer;