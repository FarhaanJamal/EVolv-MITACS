import os
import pprint
import bcrypt
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()
client = MongoClient(os.getenv("MONGO_URL"))

EVolvDB = client.EVolvDB
user_collection = EVolvDB.user_collection

def add_users(name, password):
    encrypted_pass = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    user_collection.insert_one({
        "name": name,
        "password": encrypted_pass
    })

"""add_users("1", "1")
add_users("test", "1234567890")"""

session_collection = EVolvDB.session_collection

def add_charging_sessions(username, datetime, main_session_data, plugin_timing, charging_time, distance, savings, optimized_slot, unOptimized_slot, charging_settings, notes):
    charger_company, charger_type, start_hour, start_data_of_week, is_weekend, duration, demand = main_session_data
    session_collection.insert_one({
        "username": username,
        "datetime": datetime,
        "main_session_data": {
            "charger_company": charger_company,
            "charger_type": charger_type,
            "start_hour": start_hour,
            "start_data_of_week": start_data_of_week,
            "is_weekend": is_weekend,
            "duration": duration,
            "demand": demand
        },
        "plugin_timing": plugin_timing,
        "charging_time": charging_time,
        "distance": distance,
        "savings": savings, 
        "optimized_slot": {
            "slots": optimized_slot[0],
            "cost": optimized_slot[1]
        },
        "unOptimized_slot": {
            "slots": unOptimized_slot[0],
            "cost": unOptimized_slot[1]
        },
        "charging_settings": charging_settings,
        "notes": notes
    })
"""
add_charging_sessions("test", "2024-09-28:17:20", [1, 1, 16, 6, 1, 837, 16.28], "5:20 pm", "91", "108", "0.04", [["slot-1-e: [5:20pm - 6:05pm]", "slot-2: [7:00pm - 7:46pm]"], "0.15"], [["[5:20pm - 6:51pm]"], "0.19"], 0, "Since the battery range is below 100 Km, the EV is charged for 45 minutes to have the minimum emergency energy and after that the optimization starts")
add_charging_sessions("test", "2024-09-29:16:50", [1, 1, 17, 1, 1, 886, 21.67], "4:50 pm", "128", "133", "0.11", [["slot-1: [7:00pm - 9:02pm]"], "0.17"], [["4:50pm - 5:00pm]", "[5:00pm - 6:59pm]"], "0.28"], 0, "")
add_charging_sessions("test", "2024-09-30:18:30", [1, 1, 18, 2, 0, 732, 11.24], "6:30 pm", "61", "78", "0.02", [["slot-1: [7:00pm - 7:01pm]"], "0.09"], [["[6:30pm - 7:31pm]"], "0.11"], 0, "")
add_charging_sessions("test", "2024-10-01:17:03", [1, 1, 17, 3, 0, 826, 19.38], "5:03 pm", "122", "121", "0.08", [["slot-1: [7:00pm - 9:02pm]"], "0.17"], [["[5:03pm - 6:58pm]"], "0.25"], 0, "")
add_charging_sessions("test", "2024-10-02:16:17", [1, 1, 16, 4, 0, 891, 27.67], "4:17 pm", "158", "158", "0.15", [["slot-1-e: [4:17pm - 4:32pm]", "slot-2: [7:00pm - 9:23pm]"], "0.24"], [["[4:17pm - 6:55pm]"], "0.39"], 0, "Since the battery range is below 100 Km, the EV is charged for 15 minutes to have the minimum emergency energy and after that the optimization starts")
"""