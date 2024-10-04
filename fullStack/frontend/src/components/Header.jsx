import {useEffect, useRef, useState} from "react";
import logoWithName from "../assets/images/logo-with-name.png"
import {NavLink, Link, useNavigate} from 'react-router-dom'
import {HiMenuAlt3} from "react-icons/hi"
import {toast} from 'react-toastify'

const Header = () => {
    const headerRef = useRef(null)
    const menuRef = useRef(null)
    const navigate = useNavigate()

    const [showLogout, setShowLogout] = useState(false)
    const [username, setUsername] = useState("")
    const navLinks = [
        {
            path: '/',
            display: 'Home'
        },
        {
            path: '/chargeScheduler',
            display: 'Charge Scheduler'
        },
        {
            path: '/newEV',
            display: 'New EV Cost Estimator'
        },
        {
            path: '/report',
            display: 'AI Report'
        },
        ...(showLogout ? [{ path: '/login', display: 'Logout' }] : [])
    ]

    const handleStickyHeader = () => {
        window.addEventListener('scroll', () =>{
            if(document.body.scrollTop < 80 || document.documentElement.scrollTop > 80){
                headerRef.current.classList.add('sticky__header')
            }else{
                headerRef.current.classList.remove('sticky__header')
            }
        })
        
    }
    useEffect(() => {
        handleStickyHeader()
        return () => window.removeEventListener('scroll', handleStickyHeader)
    })

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('userData'))
        if (userData) {
            const lastLoginDate = new Date(userData.lastLogin)
            const currentDate = new Date()
            const daysSinceLastLogin = Math.ceil((currentDate - lastLoginDate) / (1000 * 60 * 60 * 24))
            if (daysSinceLastLogin <= 15){
                setUsername(userData.username)
            } else {
                navigate('/login')
                toast.error("Login to get the access")
            }
        } else {
            navigate('/login')
            toast.error("Login to get the access")
        }
    }, [navigate])

    const toggleMenu = () => {
        menuRef.current.classList.toggle('show__menu')
        setShowLogout(prevState => !prevState)
    }
    
    return <header className="header flex items-center" ref={headerRef}>
        <div className="container">
            <div className="flex items-center justify-between">
                <div>
                    <img onClick={() => navigate('/')} className="w-[200px] object-cover cursor-pointer" src={logoWithName} alt="" />
                </div>
                <div className="navigation" ref={menuRef} onClick={toggleMenu}>
                    <ul className="menu bg-mainColor flex items-center gap-[2.7rem]">{
                        navLinks.map((link, index) => (
                            <li key={index}>
                                <NavLink to={link.path} className={navClass => navClass.isActive ? 'text-accentColorBlue text-[16px] leading-7 font-[600]': 'text-accentColorWhite text-[16px] leading-7 font-[500] hover:text-accentColorBlue'}>{link.display}</NavLink>
                            </li>)
                        )
                    }</ul>
                </div>
                <div className="flex text-accentColorWhite items-center justify-between gap-4">
                    <p className="text-accentColorWhite flex-none text-[14px] sm:text-[16px]">
                        {username ? `Hi ${username}` : "Hi Guest"}
                    </p>
                    {!showLogout && (
                        <div onClick={() => {
                            localStorage.removeItem('userData')
                            navigate('/login')
                        }} className="hidden lg:flex cursor-pointer">
                            Logout
                        </div>
                    )}
                    <span className="lg:hidden" onClick={toggleMenu}>
                        <HiMenuAlt3 className='w-6 h-6 cursor-pointer' />
                    </span>
                </div>
            </div>
        </div>
    </header>
};

export default Header;