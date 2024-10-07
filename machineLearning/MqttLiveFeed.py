import paho.mqtt.client as mqtt
import time
import ssl
import json  # For JSON decoding and pretty printing
from chargeScheduler import chargeSchedulerMain, updatePlugOutTime


# ThingSpeak MQTT Settings
MQTT_BROKER = "mqtt3.thingspeak.com"
MQTT_PORT = 8883  # Use TLS/SSL
MQTT_TOPIC = "channels/2674151/subscribe"
CLIENT_ID = "LDExGTouKzoFJhkuCRgnODM"
MQTT_USERNAME = CLIENT_ID
MQTT_PASSWORD = "1mU/SX5yVwhphzhnCOvmLzXb"

# Global variables to store plug-in and plug-out times
last_plugin_time = None
username = "test"

# Callback for when the client receives a CONNACK response from the server
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Connected successfully to ThingSpeak!")
        client.subscribe(MQTT_TOPIC)
    else:
        print(f"Failed to connect, return code {rc}")

# Callback for when a message is received from the MQTT server
def on_message(client, userdata, msg):
    global last_plugin_time

    print(f"Raw Message received: {msg.payload.decode()}")

    try:
        # Try to decode the JSON message
        payload = json.loads(msg.payload.decode())

        # Extract specific fields from the JSON message
        plug_status = int(payload.get('field1'))  # Plug status (0 for plug-in, 1 for plug-out)
        power_kW = float(payload.get('field2', 0.0))  # Power in kW
        demand_kWh = float(payload.get('field3', 0.0))  # Demand in kWh
        charger_type = int(payload.get('field4', 1))  # Charger type (1 for Level 2, 0 for Level 1)
        plug_in_time = payload.get('field5', '')  # Plug-in timestamp (string format)
        plug_out_time = payload.get('field6', '')  # Plug-out timestamp (string format)

        # Handle plug-in or plug-out events based on plugStatus
        if plug_status == 1:
            # Plug-in event
            print("Plug-in event detected")
            last_plugin_time = plug_in_time  # Store plug-in time for reference
            optimized_slot = chargeSchedulerMain(username, plug_in_time, charger_type)
            print("Success")
        elif plug_status == 0:
            # Plug-out event
            print("Plug-out event detected")
            updatePlugOutTime(username, plug_in_time, plug_out_time)
            print("Success")

    except json.JSONDecodeError:
        print("Failed to decode JSON data.")
    except Exception as e:
        print(f"Error processing message: {e}")

# Setup MQTT client
client = mqtt.Client(client_id=CLIENT_ID)
client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)
client.on_connect = on_connect
client.on_message = on_message

# Setup TLS/SSL for secure connection
client.tls_set(cert_reqs=ssl.CERT_NONE, tls_version=ssl.PROTOCOL_TLSv1_2)
client.tls_insecure_set(True)

# Connect to the MQTT broker
client.connect(MQTT_BROKER, MQTT_PORT, 60)

# Start the loop to receive and handle messages
client.loop_start()

# Keep the script running to receive messages
try:
    print("Listening for messages. Press Ctrl+C to exit.")
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    print("Exiting...")

client.loop_stop()
client.disconnect()
