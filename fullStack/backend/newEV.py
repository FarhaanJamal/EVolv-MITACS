import xgboost as xgb
import numpy as np

def predictNewEVCost(numberOfPeople, squareMeters, homeType, TV, DISH_WASHER, SAUNA, CABLE_BOX, COFFEE_MACHINE, TUMBLE_DRYER, FREEZER, WASHING_MACHINE, GAME_CONSOLE, REFRIGERATOR, OVEN, ELECTRIC_SHOWER, ELECTRIC_VEHICLE, power_consumption):
    model = xgb.XGBRegressor()
    model.load_model('models/best_xgb_model.json')
    if all(param == 0 for param in [numberOfPeople, squareMeters, TV, DISH_WASHER, SAUNA, CABLE_BOX, COFFEE_MACHINE, TUMBLE_DRYER, FREEZER, WASHING_MACHINE, GAME_CONSOLE, REFRIGERATOR, OVEN, ELECTRIC_SHOWER, ELECTRIC_VEHICLE, power_consumption]):
        return 0
    try:
        people_per_sqm = numberOfPeople / squareMeters
    except:
        people_per_sqm = 0
    total_appliances = TV + DISH_WASHER + SAUNA + CABLE_BOX + COFFEE_MACHINE + TUMBLE_DRYER + FREEZER + WASHING_MACHINE + GAME_CONSOLE + REFRIGERATOR + OVEN + ELECTRIC_SHOWER
    try:
        average_energy_per_appliance = power_consumption / total_appliances
    except:
        average_energy_per_appliance = 0
    x_val = np.array([numberOfPeople, squareMeters, homeType, TV, DISH_WASHER, SAUNA, CABLE_BOX, COFFEE_MACHINE, TUMBLE_DRYER, FREEZER, WASHING_MACHINE, GAME_CONSOLE, REFRIGERATOR, OVEN, ELECTRIC_SHOWER, people_per_sqm, total_appliances, average_energy_per_appliance, ELECTRIC_VEHICLE]).reshape(1, -1)

    y_pred = model.predict(x_val)
    
    return abs(float(y_pred[0] - power_consumption))


print(predictNewEVCost(2,120.0,1,1,1,0,1,0,1,0,1,0,1,1,1,1, 820))