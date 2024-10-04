from chargeScheduler import chargeSchedulerMain, updatePlugOutTime


username = "test"
pluginTime = "2024-10-03:17:23"
charger_type = 1

chargeSchedulerMain(username, pluginTime, charger_type)


plugOutTime = "2024-10-04:7:14"

updatePlugOutTime(username, pluginTime, plugOutTime)