import '../../styles/Main.css';
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import {NavBar} from '../../components/NavBar';

// --- In-Meal Support Interface (connected to webapp) ---
function App() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('mealID');
  const userId = searchParams.get('id'); 

  const [prompt, setPrompt] = useState("") 
  const [hardwareStatus, setHardwareStatus] = useState("connecting") 

  async function endMeal(){
    if (hardwareStatus === "error") {
      navigate('/');
      return;
    }
    await fetch("/stop-sensors", { method: "POST" });
    navigate('/post-meal-questions?mealID=' + id);
  }

  const startSensors = () => {
    console.log("Pressed ")
    console.log("userID:", userId);
    //start all sensors to read from loadSensor.py 
    fetch("/start-sensors", { method: "POST", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mealID: id, userID: userId })
    })
      .then(res => res.json())
      .then(data => console.log(data));
  };

  useEffect(() => {
    startSensors();
  }, []);

  
  useEffect(() => {
    let ws; 
    let timeoutId;

    const connectWebSocket = () => {
      ws = new WebSocket("ws://dex.local:8765");

      timeoutId = setTimeout(() => {
        setHardwareStatus("error");
      }, 3000);

      ws.onopen = () => {
        console.log("Connected to sensor WebSocket");
      };

      ws.onmessage = (event) => {
        clearTimeout(timeoutId);
        const data = JSON.parse(event.data);
        setPrompt(data.message)
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
      };

      ws.onclose = () => {
        console.warn("WebSocket closed, retrying in 1 second...");
        setTimeout(connectWebSocket, 1000);
      };

    };

    connectWebSocket(); 
  
    return () =>{
      ws && ws.close();
      clearTimeout(timeoutId);
    } 
  }, []);


  return (
    <div>
      <link href="https://fonts.googleapis.com/css2?family=Poltawski+Nowy:ital,wght@0,400..700;1,400..700&display=swap" rel="Main.css"/>
      <NavBar/>
        <div className="promptBox">
          <p>
            <h4>session ongoing</h4>
            <h1>
              {hardwareStatus === "error"
                ? "No hardware connected"
                : prompt || "Connecting sensors..."}
            </h1>
            <button onClick={endMeal}>End meal</button>
          </p>
        </div>
    </div>
  );
}

export default App;