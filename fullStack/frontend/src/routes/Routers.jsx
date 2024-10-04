import React from "react";
import Home from "../pages/Home";
import Login from "../pages/Login";
import ChargeScheduler from "../pages/ChargeScheduler";
import NewEV from "../pages/NewEV";
import Report from "../pages/Report";

import {Routes, Route} from 'react-router-dom';


const Routers = () => {
    return <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/chargeScheduler" element={<ChargeScheduler/>}/>
        <Route path="/newEV" element={<NewEV/>}/>
        <Route path="/report" element={<Report/>}/>
    </Routes>
};

export default Routers;