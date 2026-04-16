# MindfulByte

## Overview
This repositary shows the software stack powering the webapp of MindfulByte. This system tracks eating behaviours such as meal weight, bite size and fork movement to give real-time feedback for the purpose of supporting individuals with eating disorders. 

## Tech Stack
Frondend: React 
Backend: Node.js + Express
Database: MySQL 
Hardware: Raspberry Pi 3 Model B, Arduino Feather, Load Cells (HX711 + OpenScale board), Accelerometer (LSM303D), NeoPixel LEDs, 3D printed components (found in supplementary material)
Languages: Python, Javascript, C++ 
Communication: WebSockets, Bluetooth 

## Setup & Installation
### 1. Hardware Setup
- You'll need to assemble the hardware as shown in the dissertation section 6.2 and ensure all the sensors are connected correctly. 
- Download the code in the arduinocode.imo file onto your Arduino 
- Make sure to change the MAC address of your arduino in the loadSensor.py to connect via BLE

### 2. Connect to Raspberry Pi
```bash
ssh pi@dex.local
```
And type in your password as required 


### 3. Clone the Repository
```bash
git clone https://github.com/HanaAhmedMahmoud/MindfulByte.git
```

### 4. Install dependencies and build
```bash
rm -rf node_modules package-lock.json
npm install
npm run build 
```

### 5. Run the project from the Server
In this case I ran it with node 16 on the pi
``` bash
sudo /home/pi/.nvm/versions/node/v16.20.2/bin/node server.js
```

### 6. Access application 
```bash
http://dex.local:5000/
```
## Running just the webapp 
If you're interested to have a browse around MindfulByte without the connected hardware, you can run a limited version following the steps below!

### 1. Clone the Repository
```bash
git clone https://github.com/HanaAhmedMahmoud/MindfulByte.git
```

### 2. Install dependencies and build 
```bash
rm -rf node_modules package-lock.json
npm install
npm run build 
 ```

### 3. Run webapp 
```bash
http://localhost:5000
 ```

You should be able to: 
- Register a new account with caregiver ID 2 (or alternatively create your own caregiver login and it will be ID 3)
- On registration complete a reflective motivation exercise 
- Log in as a User
- Explore the pre-meal interface 
- Start a meal (Note that MindfulByte will run a hardware connectivity check, and after a brief delay, the session will terminate automatically as it tells you the smart scale and fork are not connected)
- Login as caregiver 
- Look through associated accounts


## Troubleshooting
### Bluetooth issues 
Sometimes bluetooth needs a little reset!
``` bash  
sudo systemctl stop bluetooth
sudo hciconfig hci0 down
sudo hciconfig hci0 up
sudo systemctl start bluetooth
sleep 5
```
### No WiFi
If you're not connected by WiFi and are hotspotting, the websockets won't work unless you use USB tethering. Here is a me written guide which is specific to Mac OS: 
1. Make sure phone is on hotspot and wifi is not connected on computer 
2. Go to Network and check that phone USB is connected
    1. At this point make sure you can go on the internet on safari/google 
3. Go to general then to sharing and make sure internet sharing is initially off
4. Click the i, tick everything and make sure that the name is what you set it up to  
5. You should see WiFi logo 
6. SSH into pi as normal 
7. run project on SAFARI!!

### Node taking too long to install 
Run this command 
``` bash 
GENERATE_SOURCEMAP=false npm run build OR
NODE_OPTIONS="--max-old-space-size=2048" npm install
```
