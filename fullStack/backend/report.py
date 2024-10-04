import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API"))
model = genai.GenerativeModel("gemini-1.5-pro")

def get_gemini_response(sessions):
    description = """{
        "username": username,
        "datetime": EV plugin datetime,
        "main_session_data": {
            "charger_company": charger manufacturing company[own company (1), other company (0)],
            "charger_type": charger type[fast charger (1) and slow charger (0)],
            "start_hour": plugin start hour,
            "start_data_of_week": plugin start data of week,
            "is_weekend": plugin is_weekend,
            "duration": plugin duration[in minutes],
            "demand": power consumed[in KWh] for that session
        },
        "plugin_timing": plugin timing,
        "charging_time": total charging time,
        "distance": distance[in Km] for that session,
        "savings": savings, 
        "optimized_slot": {
            "slots": optimized_slot[0],
            "cost": optimized_slot[1]
        },
        "unOptimized_slot": {
            "slots": unOptimized_slot[0],
            "cost": unOptimized_slot[1]
        },
        "charging_settings": charging_settings[daily driven (0), make the battery full (1)],
        "notes": notes
    }"""

    instructions = f"Yor are a report generator for a EV Charge Scheduler, your result should be precise and quantifiable like using average info from the below given data, output should directly speak to the user and not contain any table with each sentence ends with \"<br/><br/>\" with minimum 5 sentences. Data description:\n{description}"
    overall_knowledge = "This project tends to solve the problems: \"Uncontrolled and unOptimized EV charging leads to higher electricity costs for consumers, increased strain on the grid during peak demand, and greater overall energy consumption due to inefficient use of available power resources.\" and \"For households planning to purchase an EV, accurately estimating the additional power consumption is challenging, making it difficult to budget for potential increases in electricity bills and overall energy usage.\""
    question = f"{overall_knowledge}\n\nInstructions:\n{instructions}\n\nThe data:\n" + str(sessions)
    response = model.generate_content(question)
    text = response.text
    return text.replace("**", "'")



"""from pymongo import MongoClient
client = MongoClient(os.getenv("MONGO_URL"))
EVolvDB = client.EVolvDB
session_collection = EVolvDB.session_collection
sessions = list(session_collection.find({"username": "test"}))

print(get_gemini_response(sessions))"""