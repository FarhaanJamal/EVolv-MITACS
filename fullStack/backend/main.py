from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import bcrypt
from dotenv import load_dotenv
import os
from pymongo import MongoClient
from typing import List
from newEV import predictNewEVCost
from report import get_gemini_response

load_dotenv()
client = MongoClient(os.getenv("MONGO_URL"))
EVolvDB = client.EVolvDB
user_collection = EVolvDB.user_collection

def find_user_data(name):
    user_data = user_collection.find_one({
        "name": name
    })
    return user_data

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("BASE_URL")],
    allow_methods=["*"],
    allow_credentials=True,
    allow_headers=["*"]
)

class LoginRequest(BaseModel):
    name: str
    password: str

@app.post("/api/login")
async def login(login_request: LoginRequest):
    user_data = find_user_data(login_request.name)
    if login_request.name != "" and user_data != None:
        if login_request.name == user_data["name"]:
            if bcrypt.checkpw(login_request.password.encode("utf-8"), user_data["password"].encode("utf-8")):
                return JSONResponse(status_code=200, content={"message": "Login Successful!"})
            else:
                raise HTTPException(status_code=401, detail="Incorrect Password")
        else:
            raise HTTPException(status_code=401, detail="UserName does not exist.")
    else:
        raise HTTPException(status_code=401, detail="Invalid UserName")

class SessionData(BaseModel):
    username: str
    datetime: str
    main_session_data: dict
    plugin_timing: str
    charging_time: str
    distance: str
    savings: str
    optimized_slot: dict
    unOptimized_slot: dict
    charging_settings: int
    notes: str

session_collection = EVolvDB.session_collection

@app.get("/api/sessions/{username}/all", response_model=List[SessionData])
def get_sessions(username: str):
    sessions = list(session_collection.find({"username": username}))
    if not sessions: 
        raise HTTPException(status_code=404, detail="This user doesn't have any past sessions")
    return [SessionData(**session) for session in sessions]

@app.get("/api/sessions/{username}/last", response_model=List[SessionData])
def get_last_sessions(username:str):
    last_sessions = list(session_collection.find({"username": username}).sort("_id", -1).limit(2))
    if not last_sessions: 
        raise HTTPException(status_code=404, detail="This user doesn't have any past sessions")
    return [SessionData(**session) for session in last_sessions]

class NewEVRequest(BaseModel):
    homeType: str
    area: float
    powerConsumption: float
    people: int
    tv: int
    dishWasher: int
    sauna: int
    cableBox: int
    coffeeMaker: int
    dryer: int
    freezer: int
    washer: int
    gameConsole: int
    oven: int
    refrigerator: int
    electricShower: int
    electricVehicle: int	

@app.post("/api/newEV")
async def NewEV(newEV_request: NewEVRequest):
    homeType = newEV_request.homeType
    area = newEV_request.area
    power_consumption = newEV_request.powerConsumption
    people = newEV_request.people
    tv = newEV_request.tv
    dish_washer = newEV_request.dishWasher
    sauna = newEV_request.sauna
    cable_box = newEV_request.cableBox
    coffee_maker = newEV_request.coffeeMaker
    dryer = newEV_request.dryer
    freezer = newEV_request.freezer
    washer = newEV_request.washer
    game_console = newEV_request.gameConsole
    oven = newEV_request.oven
    refrigerator = newEV_request.refrigerator
    electric_shower = newEV_request.electricShower
    electric_vehicle = newEV_request.electricVehicle

    home_type = 1 if homeType == 'multiFamily' else 0
    additional_power = 0
    additional_power += (predictNewEVCost(people, area, home_type, tv, dish_washer, sauna, cable_box, coffee_maker, dryer, freezer, washer, game_console, refrigerator, oven, electric_shower, electric_vehicle, power_consumption) * 10) if predictNewEVCost(people, area, home_type, tv, dish_washer, sauna, cable_box, coffee_maker, dryer, freezer, washer, game_console, refrigerator, oven, electric_shower, electric_vehicle, power_consumption) < 50 else predictNewEVCost(people, area, home_type, tv, dish_washer, sauna, cable_box, coffee_maker, dryer, freezer, washer, game_console, refrigerator, oven, electric_shower, electric_vehicle, power_consumption)
    additional_cost = (additional_power * 13.3) / 100
    return JSONResponse(status_code=200, content={"message": f"{additional_power},{additional_cost}"})

class ReportData(BaseModel):
    report: str

@app.get("/api/report/{username}", response_model=ReportData)
def get_report(username: str):
    sessions = list(session_collection.find({"username": username}))
    if not sessions: 
        return {"report": "No sessions found."}
    report = get_gemini_response(sessions)
    return {"report": report}
