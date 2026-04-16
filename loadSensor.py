import serial
import time
import asyncio
import websockets
import json
import math 
import random
import requests
import signal 
import sys
from bleak import BleakClient
from rpi_ws281x import PixelStrip, Color


#globals that need to be uploaded 
start_time = time.time() 
time_of_meal = 0 #total meal time 
time_to_first_bite = 0 #this is fork pick up time 
start_weight = 0 #weight at the start of the meal
average_bite_per_min = 0 #how many portions are removed each miniute average 
portion_size = [] #array of portion sizes taken during meal
pause_count = 0 #how many times the fork is still for more than 30 seconds
cut_count = 0 #how many times the fork is in cutting position for more than 15 seconds
shake_count = 0 #how many times the fork is shaken (need to add to database will do at some point)
prompt_array = [] #to be filled with user prompts
current_acc = [0.0, 0.0, 0.0]
MEAL_ID = sys.argv[1] 
USER_ID = sys.argv[2]

#bluetooth and websocket setup 
DEVICE = "F9:7E:5C:77:E7:32"
UART_RX = "6e400003-b5a3-f393-e0a9-e50e24dcca9e"
UART_TX = "6e400002-b5a3-f393-e0a9-e50e24dcca9e"
buffer = ""
connected_components = set() 
fork_connected_event = asyncio.Event()

# --- LED configuration --- 
LED_COUNT      = 36        # num of pixls 
LED_PIN        = 18       # GPIO pin 
LED_FREQ_HZ    = 800000   # LED signal frequency
LED_DMA        = 10       # DMA channel to use for generating signal
LED_BRIGHTNESS = 64      
LED_INVERT     = False   
LED_CHANNEL    = 0       

#  LED colours 
colours = {"lightBlue": [137, 207, 240], "blue": [0, 71, 171], "darkBlue": [0, 0, 139], "evenDarkerBlue": [0, 0, 255]}

# Create neopixel object strip 
strip = PixelStrip(LED_COUNT, LED_PIN, LED_FREQ_HZ, LED_DMA, LED_INVERT, LED_BRIGHTNESS, LED_CHANNEL)

# NeoPixel functions 
async def fadeColour(r1,g1,b1, r2, g2, b2):
  for i in range(0, 255, 10):
    for j in range(strip.numPixels()):
        r = int((r1 * (255 - i) + r2 * i) / 255)
        g = int((g1 * (255 - i) + g2 * i) / 255)
        b = int((b1 * (255 - i) + b2 * i) / 255)
        strip.setPixelColor(j, Color(r, g, b))
    strip.show()
    await asyncio.sleep(0.1) 

async def promptGiven():
    for _ in range(3): 
        strip.setBrightness(0)
        strip.show()
        await asyncio.sleep(0.01)
        strip.setBrightness(255)
        strip.show()
        await asyncio.sleep(0.01)

async def LEDloop():
    # start strip 
    strip.begin()
    strip.setBrightness(60)
    strip.show()
    while True: 
        await fadeColour(colours["lightBlue"][0], colours["lightBlue"][1], colours["lightBlue"][2], colours["blue"][0], colours["blue"][1], colours["blue"][2])
        await fadeColour(colours["blue"][0], colours["blue"][1], colours["blue"][2], colours["darkBlue"][0], colours["darkBlue"][1], colours["darkBlue"][2])
        await fadeColour(colours["darkBlue"][0], colours["darkBlue"][1], colours["darkBlue"][2], colours["evenDarkerBlue"][0], colours["evenDarkerBlue"][1], colours["evenDarkerBlue"][2])
        await fadeColour(colours["evenDarkerBlue"][0], colours["evenDarkerBlue"][1], colours["evenDarkerBlue"][2], colours["darkBlue"][0], colours["darkBlue"][1], colours["darkBlue"][2])
        await fadeColour(colours["darkBlue"][0], colours["darkBlue"][1], colours["darkBlue"][2], colours["blue"][0], colours["blue"][1], colours["blue"][2])
        await fadeColour(colours["blue"][0], colours["blue"][1], colours["blue"][2], colours["lightBlue"][0], colours["lightBlue"][1], colours["lightBlue"][2])

# --- PROMPTS --- 
class Prompts:
    def __init__(self, message, interval, priority):
        self.message = message
        self.interval = interval
        self.priority = priority

class PromptManager:
    def __init__(self):
        self.active_prompt = None
        self.last_prompt_time = 0
        self.prompts_given = []
    
    def try_send_prompt(self, prompt): 
        current_time = time.time()
        if self.active_prompt is None or prompt.priority > self.active_prompt.priority or current_time - self.last_prompt_time >= prompt.interval:
            asyncio.ensure_future(self.send_prompt(prompt))
            self.active_prompt = prompt
            self.last_prompt_time = current_time
            self.prompts_given.append(prompt)

    async def send_prompt(self, prompt):
        await notify_components(json.dumps({"message": prompt.message}))
        #trigger LEDS to flash if prompt is priority > 2
        if prompt.priority > 2: 
            asyncio.ensure_future(promptGiven())

#get prompts 
async def fetch_prompts():
    global prompt_array;
    print("DEBUG: Attempting to fetch prompts for USER_ID: {}".format(USER_ID))
    while not prompt_array:
        try:
            r = requests.get(
                "http://dex.local:5000/get-prompts",
                params={"userID": USER_ID},
                timeout=3
            )
            print("DEBUG: Status Code: {}".format(r.status_code))
            print("DEBUG: Raw Response: {}".format(r.text))
            data = r.json()
            row = data["quotes"]
            print("DEBUG: Row data: {}".format(row))
            prompt_array = [
                row["reasons_to_recover"],
                row["miss_enjoying"],
                row["doing_this_for"],
                row["things_get_hard"],
                row["fav_recovery_quote"]
            ]
            return 
        except:
            print("Prompts collection failed")
            await asyncio.sleep(2)


promptManager = PromptManager()
PROMPT_BIG_BITE = Prompts("Lets take bigger bites", 10, 5)
PROMPT_SLOW_DOWN = Prompts("Lets slow it down", 10, 5)
PROMPT_PICK_UP = Prompts("Lets pick up that fork", 10, 20)
PROMPT_SHAKE = Prompts("Lets take a deep breath", 10, 20)
PROMPT_CUTTING = Prompts("Lets stop cutting up the food", 10, 20)
PROMPT_PAUSE = Prompts("Lets move that fork again keep going!", 10, 10)

def randomlyGenerateUserPrompt(): 
    if not prompt_array:
        return
    ran = random.randint(0, len(prompt_array)-1)
    PROMPT = Prompts(prompt_array[ran], 10, 2)
    promptManager.try_send_prompt(PROMPT)


# --- Web Sockets ----
async def notify_components(message):
    if connected_components:  
        await asyncio.wait([client.send(message) for client in connected_components])

# --- Wifi Setup ---
async def connectFork():
    async with BleakClient(DEVICE) as client:
        print("Connected Fork")
        fork_connected_event.set()
        await client.start_notify(UART_RX, handle_rx)
        print("Listening...")
        while True:
            await asyncio.sleep(1)

# --- Scale code --- 
# Open the USB serial port
ser = serial.Serial('/dev/ttyUSB0', 9600, timeout=1)

async def zeroScale(): 
    ser.write(b'0\r')
    await asyncio.sleep(1) 
    print("Scale zeroed.")

def addPortionSize(portion): 
    if len(portion_size) > 0: 
        lastVal = portion_size[-1]
        if lastVal == portion: 
            return 
    if portion < 1:
        return 
    portion_size.append(portion)

def averageWeight(readings):
    return sum(readings) / len(readings)

async def readScale():

    await zeroScale()
    await fork_connected_event.wait()

    global start_weight

    baseline_weight = None
    last_weight = None

    stable_count = 0
    unstable = False

    STABLE_THRESHOLD = 6
    CHANGE_THRESHOLD = 2.5

    # skip first 7 readings
    for _ in range(7):
        ser.readline()

    while True:

        readings = []
        for _ in range(3):
            line = ser.readline().decode('utf-8').strip()
            if line:
                try:
                    readings.append(float(line.split(",")[0]))
                except ValueError:
                    continue

        if not readings:
            continue

        average = abs(averageWeight(readings) * 1000)
        print("average weight", average)

        if baseline_weight is None:
            baseline_weight = average
            last_weight = average
            start_weight = round(average)
            continue

        # movement compared to previous reading
        movement = average - last_weight

        # detect instability
        if abs(movement) > CHANGE_THRESHOLD:
            unstable = True
            stable_count = 0

        else:
            stable_count += 1

        # scale stabilised again
        if unstable and stable_count >= STABLE_THRESHOLD:

            portion = round(abs(baseline_weight - average))

            if portion > 2.5:
                print("portion detected:", portion)

                addPortionSize(portion)

                if 1 <= portion <= 5:
                    promptManager.try_send_prompt(PROMPT_BIG_BITE)
                elif portion >= 18:
                    promptManager.try_send_prompt(PROMPT_SLOW_DOWN)
                else:
                    randomlyGenerateUserPrompt()

            # new baseline
            baseline_weight = average
            unstable = False
            stable_count = 0

        last_weight = average

        await asyncio.sleep(0.01)

# -- Fork code -- 
# fork class 
class Fork: 
    def __init__(self):
        self.direction = "FLAT" 
        self.interval = 0 
        self.pickedUp = False 
    
    def setForkDirection(self, direction): 
        if self.pickedUp:
            if self.direction != direction:
                self.direction = direction 
                self.interval = 0
            else: 
                self.updateInterval()

    def getForkDirection(self): 
        return self.direction 
    
    def setForkPickup(self): 
        self.pickedUp = True 
    
    def updateInterval(self): 
        global pause_count
        global cut_count
        self.interval += 1 
        if self.interval > 15: 
            if self.direction == "SIDE": 
                promptManager.try_send_prompt(PROMPT_CUTTING)
                cut_count += 1
            else:
                promptManager.try_send_prompt(PROMPT_PAUSE)
                pause_count += 1
            self.interval = 0 
    
#how much the fork is being moved 
def getAccVec(acc):
  return math.sqrt(acc[0]*acc[0] + acc[1]*acc[1] + acc[2]*acc[2])

#get values from bluetooth
def handle_rx(_, data):
    global buffer, current_acc

    buffer += data.decode(errors="ignore")

    while "\n" in buffer:
        line, buffer = buffer.split("\n", 1)
        line = line.strip()

        if not line:
            return

        try:
            x, y, z = map(float, line.split(","))
            current_acc = [x, y, z] 
        except ValueError:
            print("Bad packet:", repr(line))
    

async def readFork():

    #wait for fork to connect 
    await fork_connected_event.wait()

    fork = Fork() 

    forkPickedUp = False 
    forkRestingStateSet = False 
    forkRestingState = 0 
    startTime = 0 
    global time_to_first_bite, shake_count, pause_count
    lastMag = 0
    shake_window = [] 

    #thresholds  
    FORK_PICKUP = 0.1
    FORK_SHAKE = 0.3
    FORK_ON_RIGHT = 0.8
    FORK_ON_LEFT = -0.8
    FORK_UP = -0.8
    FORK_DOWN = 0.8
    FORK_FLAT = 0.8 
    FORK_OPFLAT = 0.8
    NO_FORK_MOVEMENT = 30

    while True:
        await asyncio.sleep(0.5)

        #send prompt to user as default 
        randomlyGenerateUserPrompt()
                
        #get value read from bluetooth 
        acc = current_acc
        
        if getAccVec(acc) < 0.1:
            continue 

        # -- set up  -- 
        if not forkRestingStateSet: 
            forkRestingState = getAccVec(acc)
            startTime = time.time() 
            forkRestingStateSet = True

        diff = abs(getAccVec(acc) - forkRestingState)
        elapsedTime = round(time.time() - startTime)

        # -- fork pick up -- 
        if diff > FORK_PICKUP and not forkPickedUp: 
            forkPickedUp = True 
            fork.setForkPickup()
            time_to_first_bite = elapsedTime

        if not forkPickedUp and elapsedTime > NO_FORK_MOVEMENT: 
            promptManager.try_send_prompt(PROMPT_PICK_UP)
            if pause_count == 0: 
                pause_count += 1

        # -- fork shaking -- 
        if lastMag == 0: 
            lastMag = getAccVec(acc)
        else: 
            magDiff = abs(getAccVec(acc) - lastMag)
            lastMag = getAccVec(acc)

            #append TRUE if a shake is detected, and FALSE if not 
            shake_window.append(magDiff > FORK_SHAKE)

            #keep only the last 3 shake detections
            if len(shake_window) > 3:
                shake_window.pop(0)
            
            #if the last 3 readings were all shakes, count as a shake event 
            if len(shake_window) == 3 and all(shake_window):
                shake_count += 1
                promptManager.try_send_prompt(PROMPT_SHAKE)
                shake_window.clear()

        # -- detect particular movement for extended periods -- 
        if acc[1] > FORK_ON_RIGHT or acc[1] < FORK_ON_LEFT: 
            fork.setForkDirection("SIDE")
        elif acc[0] > FORK_DOWN:
            fork.setForkDirection("DOWN")
        elif acc[0] < FORK_UP:
            fork.setForkDirection("UP")
        elif acc[2] > FORK_FLAT:
            fork.setForkDirection("FLAT") 
        elif acc[2] < FORK_OPFLAT:
            fork.setForkDirection("OFLAT")

        await asyncio.sleep(0.01)


# --- Handling Web Connection ---
async def handler(websocket,path): 
    #add to connected components 
    connected_components.add(websocket)
    #keep web socket open 
    try: 
        await asyncio.Future() 
    except: 
        pass
    finally: 
        connected_components.remove(websocket)

def shutdown_handler(sig, frame):
    print("shutting down")
    loop = asyncio.get_event_loop()
    loop.create_task(async_shutdown())

async def async_shutdown():
    global time_of_meal
    time_of_meal = round(time.time() - start_time)
    send_session_summary(MEAL_ID)

    # disconnect web
    if connected_components:
        await asyncio.wait([client.close() for client in connected_components])

    # turn off leds
    try:
        for i in range(strip.numPixels()):
            strip.setPixelColor(i, Color(0, 0, 0))
        strip.show()
        print("LEDs turned off.", flush=True)
    except Exception as e:
        print("LED shutdown error:", e)

    # Stop the asyncio loop after cleanup
    loop = asyncio.get_event_loop()
    loop.stop()


def send_session_summary(meal_id):

    payload = {
        "meal_id": meal_id,
        "time_of_meal": time_of_meal,
        "time_to_first_bite": time_to_first_bite,
        "start_weight": start_weight,
        "portions": portion_size,
        "pause_count": pause_count,
        "shake_count": shake_count,
        "prompts": [p.message for p in promptManager.prompts_given]
    }

    try:
        r = requests.post(
            "http://dex.local:5000/send-meal-analytics",
            json=payload,
            timeout=3
        )
        print("Summary sent:", r.status_code)
    except Exception as e:
        print("Failed to send summary:", e)

async def main():
    server = await websockets.serve(handler, "0.0.0.0", 8765)
    print("WebSocket server running on ws://0.0.0.0:8765")
    await fetch_prompts()
    print("Loaded prompts:", prompt_array)
    #start tasks 
    asyncio.ensure_future(LEDloop())
    asyncio.ensure_future(connectFork()) 
    asyncio.ensure_future(readScale())
    asyncio.ensure_future(readFork())
    await asyncio.Future()

# --- Shutdown Handlers ---
signal.signal(signal.SIGTERM, shutdown_handler)
signal.signal(signal.SIGINT, shutdown_handler)

loop = asyncio.get_event_loop()
try:
    loop.run_until_complete(main())
finally:
    loop.close()
