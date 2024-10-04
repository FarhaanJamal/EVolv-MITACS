from keras.models import load_model
from joblib import load
import numpy as np
from dotenv import load_dotenv
import os
from pymongo import MongoClient
from datetime import datetime, timedelta
from math import ceil

model = load_model('models/best_lstm_model.keras')
scalar_x = load('models/x_scalar.save')
scalar_y = load('models/y_scalar.save')

load_dotenv()
client = MongoClient(os.getenv("MONGO_URL"))
EVolvDB = client.EVolvDB
session_collection = EVolvDB.session_collection

weekend_pricing = {
    "winter": "off-peak",
    "summer": "off-peak"
}
time_of_use = {
    "winter": {
        "off-peak": {
            "cost": 8.7,
            "time-period": [19, 24, 0, 7]
        },
        "mid-peak": {
            "cost": 12.2,
            "time-period": [11, 17]
        },
        "on-peak": {
            "cost": 18.2,
            "time-period": [7, 11, 17, 19]
        }
    },
    "summer": {
        "off-peak": {
            "cost": 8.7,
            "time-period": [19, 24, 0, 7]
        },
        "mid-peak": {
            "cost": 12.2,
            "time-period": [7, 11, 17, 19]
        },
        "on-peak": {
            "cost": 18.2,
            "time-period": [11, 17]
        }
    }
}

def time_of_use_to_minutes(time_of_use):
    for season in time_of_use:
        for peak_type in time_of_use[season]:
            time_of_use[season][peak_type]["time-period"] = [hour * 60 for hour in time_of_use[season][peak_type]["time-period"]]
    return time_of_use

def getSessions(username, sequence_length=5):
    sessions = list(session_collection.find({"username": username}))
    temp = [{'charger_company': 1, 'charger_type': 1, 'start_hour': 16, 'start_data_of_week': 6, 'is_weekend': 1, 'duration': 837, 'demand': 16.28},
            {'charger_company': 1, 'charger_type': 1, 'start_hour': 17, 'start_data_of_week': 1, 'is_weekend': 1, 'duration': 886, 'demand': 21.67},
            {'charger_company': 1, 'charger_type': 1, 'start_hour': 18, 'start_data_of_week': 2, 'is_weekend': 0, 'duration': 732, 'demand': 11.24},
            {'charger_company': 1, 'charger_type': 1, 'start_hour': 17, 'start_data_of_week': 3, 'is_weekend': 0, 'duration': 826, 'demand': 19.38},
            {'charger_company': 1, 'charger_type': 1, 'start_hour': 16, 'start_data_of_week': 4, 'is_weekend': 0, 'duration': 891, 'demand': 27.67}]
    input_sequence = []
    if len(sessions) >= sequence_length:
        for session in sessions[-5:]:
            main_data = (session["main_session_data"])
            input_sequence.append([main_data["charger_company"], main_data["charger_type"], main_data["start_hour"], main_data["start_data_of_week"], main_data["is_weekend"], main_data["duration"], main_data["demand"]])
    else:
        if len(sessions) > 0:
            for ind in range(5 - len(sessions)):
                main_data = (temp[ind])
                input_sequence.append([main_data["charger_company"], main_data["charger_type"], main_data["start_hour"], main_data["start_data_of_week"], main_data["is_weekend"], main_data["duration"], main_data["demand"]])
            for session in sessions:
                main_data = (session["main_session_data"])
                input_sequence.append([main_data["charger_company"], main_data["charger_type"], main_data["start_hour"], main_data["start_data_of_week"], main_data["is_weekend"], main_data["duration"], main_data["demand"]])
        else:
            for session in temp:
                main_data = (session["main_session_data"])
                input_sequence.append([main_data["charger_company"], main_data["charger_type"], main_data["start_hour"], main_data["start_data_of_week"], main_data["is_weekend"], main_data["duration"], main_data["demand"]])
    return np.array(input_sequence)

def predictChargeDuration(input_sequence, sequence_length=5):
    x_scaled = scalar_x.transform(input_sequence)
    y_pred = model.predict(x_scaled.reshape(1, sequence_length, input_sequence.shape[-1]))
    pred = scalar_y.inverse_transform(y_pred)
    pred_duration, pred_demand = pred[0][0], pred[0][1]
    print(pred_duration, pred_demand)
    return np.float32(pred_duration), np.float32(pred_demand)

def automatic_slot_finder(time_of_use, plugin_datetime, pred_duration):
    time_of_use = time_of_use_to_minutes(time_of_use)
    date_format = "%Y-%m-%d:%H:%M"
    date_obj = datetime.strptime(plugin_datetime, date_format)
    plugin_time = date_obj.hour * 60 + date_obj.minute
    plugin_season = "summer" if date_obj.month in range(5, 11) else "winter"
    is_weekend = date_obj.weekday() >= 5

    time_slot = {}
    while True:
        for peak_type in time_of_use[plugin_season]:
            time_period = time_of_use[plugin_season][peak_type]["time-period"]
            cost = time_of_use[plugin_season][peak_type]["cost"]
            for start_minute, end_minute in zip(time_period[::2], time_period[1::2]):
                if start_minute <= plugin_time <= end_minute:
                    slot_duration = end_minute - plugin_time
                    actual_duration = min(slot_duration, ceil(pred_duration))
                    if is_weekend:
                        cost = time_of_use[plugin_season][weekend_pricing[plugin_season]]['cost']
                    time_slot[f"slot-{len(time_slot)+1}"] = [[plugin_time, plugin_time + actual_duration], cost]
                    pred_duration -= actual_duration
                    plugin_time += actual_duration
                    if pred_duration <= 0:
                        return time_slot
                    if plugin_time == 24 * 60:
                        plugin_time = 0
                        date_obj += timedelta(days=1)
                        is_weekend = date_obj.weekday() >= 5
            
def schedular_helper(time_slot, time_from_pred_demand, is_minimum_range=False, og_time_slot=None):
    final_time_slot = {}
    final_cost = 0
    remaining_time_slot = time_slot
    if is_minimum_range:
        time_slot = og_time_slot
    for slot, (time_period, cost) in time_slot.items():
        start_minute, end_minute = time_period
        tot_time_in_slot = end_minute - start_minute
        actual_time = min(tot_time_in_slot, time_from_pred_demand)
        time_key = slot+"-e" if is_minimum_range else slot
        final_time_slot[time_key] = [start_minute, start_minute + actual_time]
        final_cost += (cost / 60) * actual_time
        time_from_pred_demand -= actual_time
        if is_minimum_range:
            remaining_time_slot.pop(slot)
        if time_from_pred_demand <= 0:
            if is_minimum_range:
                remaining_time_slot[slot] = [[start_minute + actual_time, end_minute], cost]
                return final_time_slot, final_cost, remaining_time_slot
            return final_time_slot, final_cost

def automatic_schedular(time_slot, pred_demand, designed_battery_capacity, available_battery_capacity, designed_range, available_range, rate_of_charge_in_Km, minimum_required_range=100):
    rate_of_charge_in_Kwh = rate_of_charge_in_Km / (designed_range / designed_battery_capacity)
    rate_of_charge_in_Km_per_min = rate_of_charge_in_Km / 60
    rate_of_charge_in_Kw_per_min = rate_of_charge_in_Kwh / 60
    
    sorted_time_slot = dict(sorted(time_slot.items(), key=lambda item: item[1][1]))
    time_from_pred_demand = ceil(pred_demand / rate_of_charge_in_Kw_per_min)
    distance_from_pred_demand = ceil(time_from_pred_demand * rate_of_charge_in_Km_per_min)
    og_pred_demand = pred_demand
    og_distance_from_pred_demand = distance_from_pred_demand
    og_time_slot = time_slot
    notes = ""
    if pred_demand > (designed_battery_capacity - available_battery_capacity) or distance_from_pred_demand > (designed_range - available_range):
        pred_demand = designed_battery_capacity - available_battery_capacity
        distance_from_pred_demand = designed_range - available_range
        time_from_pred_demand = ceil(pred_demand / rate_of_charge_in_Kw_per_min)
        distance_from_pred_demand = ceil(time_from_pred_demand * rate_of_charge_in_Km_per_min)
        final_time_slot_sorted, final_cost_sorted = schedular_helper(sorted_time_slot, time_from_pred_demand)
        notes = f"Even though the model predicted the required demand of:{og_pred_demand} [in Kwh] and distance of:{og_distance_from_pred_demand} [in Km] from your past changing pattern, due to the avilable energy in the battery, the demand and the distance is changed as {pred_demand} [in Kwh] and {distance_from_pred_demand} [in Km] respectivily"
    elif available_range < minimum_required_range:
        minimum_required_duration = ceil((minimum_required_range - available_range) / rate_of_charge_in_Km_per_min)
        minimum_time_slot_sorted, minimum_cost_sorted, sorted_time_slot = schedular_helper(sorted_time_slot, minimum_required_duration, is_minimum_range = True, og_time_slot=time_slot)
        remaining_time_from_pred_demand = time_from_pred_demand  - minimum_required_duration
        remaining_time_slot_sorted, remaining_cost_sorted = schedular_helper(sorted_time_slot, remaining_time_from_pred_demand)
        final_cost_sorted = minimum_cost_sorted + remaining_cost_sorted
        final_time_slot_sorted = minimum_time_slot_sorted | remaining_time_slot_sorted
        notes = f"Since the battery range is below {minimum_required_range} Km, the EV is charged for {minimum_required_duration} minutes to have the minimum emergency energy and after that the optimization starts"
    else:
        final_time_slot_sorted, final_cost_sorted = schedular_helper(sorted_time_slot, time_from_pred_demand)
        notes = "The battery is charged in an optimal way"

    final_time_slot, final_cost = schedular_helper(og_time_slot, time_from_pred_demand)
    return notes, time_from_pred_demand, distance_from_pred_demand, final_time_slot, final_cost, final_time_slot_sorted, final_cost_sorted

def minutes_to_12hrs(minutes):
    hours = minutes // 60
    mins = minutes % 60
    period = "am" if hours < 12 else "pm"
    hours = hours % 12
    hours = 12 if hours == 0 else hours 
    formatted_time = f"{hours}:{mins:02} {period}"
    return formatted_time

def convert_slots(slots):
    formatted_slots = []
    for slot, times in slots.items():
        start_time = minutes_to_12hrs(times[0])
        end_time = minutes_to_12hrs(times[1])
        formatted_slots.append(f"{slot}: [{start_time} - {end_time}]")
    return formatted_slots

def chargeSchedulerMain(username,
                        pluginDateTime,
                        charger_type,
                        charger_company = 1,
                        designed_battery_capacity = 68.0,
                        available_battery_capacity = 17.14,
                        designed_range = 449.0,
                        available_range = 47.145,
                        rate_of_charge_in_Km = 53,
                        ):
    pred_duration, pred_demand = predictChargeDuration(getSessions(username))
    time_slot = automatic_slot_finder(time_of_use, pluginDateTime, pred_duration)
    notes, time_from_pred_demand, distance_from_pred_demand, final_time_slot, final_cost, final_time_slot_sorted, final_cost_sorted = automatic_schedular(
        time_slot, pred_demand, designed_battery_capacity, available_battery_capacity, designed_range, available_range, rate_of_charge_in_Km, minimum_required_range=100)
    
    date_format = "%Y-%m-%d:%H:%M"
    date_obj = datetime.strptime(pluginDateTime, date_format)
    plugin_time = date_obj.hour * 60 + date_obj.minute
    is_weekend = date_obj.weekday() >= 5

    pred_duration = float(pred_duration) if isinstance(pred_duration, np.generic) else pred_duration
    pred_demand = float(pred_demand) if isinstance(pred_demand, np.generic) else pred_demand
    final_cost = float(final_cost) if isinstance(final_cost, np.generic) else final_cost
    final_cost_sorted = float(final_cost_sorted) if isinstance(final_cost_sorted, np.generic) else final_cost_sorted

    session_collection.insert_one({
        "username": username,
        "datetime": pluginDateTime,
        "main_session_data": {
            "charger_company": charger_company,
            "charger_type": charger_type,
            "start_hour": date_obj.hour,
            "start_data_of_week": (date_obj.weekday()+1)%7,
            "is_weekend": 1 if is_weekend else 0,
            "duration": int(pred_duration),
            "demand": int(pred_demand)
        },
        "plugin_timing": minutes_to_12hrs(plugin_time),
        "charging_time": str(time_from_pred_demand),
        "distance": str(distance_from_pred_demand),
        "savings": str(round((final_cost / 100) - (final_cost_sorted / 100), 2)), 
        "optimized_slot": {
            "slots": convert_slots(final_time_slot_sorted),
            "cost": str(round((final_cost_sorted/100), 2))
        },
        "unOptimized_slot": {
            "slots": convert_slots(final_time_slot),
            "cost": str(round((final_cost/100), 2))
        },
        "charging_settings": 0,
        "notes": notes
    })


    print(f"Notes: {notes}")
    print(f"predicted plugIn duration [in Minutes]: {pred_duration} and predicted demand [in Kwh]: {pred_demand}")
    print(f"Time slot without optimization [in Minutes]: {final_time_slot} and its cost ${final_cost/100}")
    print(f"Time slot with optimization [in Minutes]: {final_time_slot_sorted} and its cost ${final_cost_sorted/100}")
    print(f"predicted charging time [in Minutes]: {time_from_pred_demand} and predicted charging distance [in Km]: {distance_from_pred_demand}")
    print(f"Total savings in this charging session: {(final_cost - final_cost_sorted)/100}")


def updatePlugOutTime(username, pluginTime, plugOutTime):
    date_format = "%Y-%m-%d:%H:%M"
    plugin_datetime = datetime.strptime(pluginTime, date_format)
    plugout_datetime = datetime.strptime(plugOutTime, date_format)

    actual_duration = (plugout_datetime - plugin_datetime).total_seconds() / 60

    session_collection.update_one(
        {"username": username, "datetime": pluginTime},
        {"$set": {"main_session_data.duration": actual_duration}}
    )

#chargeSchedulerMain("test", "2024-10-03:17:23", 1)

#updatePlugOutTime("test", "2024-10-03:17:23", "2024-10-04:7:42")
