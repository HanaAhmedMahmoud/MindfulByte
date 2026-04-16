import React from 'react';
import '../../styles/Main.css';
import logo from '../../assets/logo.png'
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import {NavBar} from '../../components/NavBar';

// --- Post Meal Activity Recommendations For Cognititve Diffusion ---
function Activity() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('mealID');

  function finish(){
    navigate('/' );
  }

  let activities = ["Go for a walk", "Do some light stretching", "Listen to your favorite music", "Practice deep breathing exercises", "Read a book or a magazine", "Spend time in nature", "Try a short meditation session", "Engage in a hobby you enjoy"]
  const activityColors = ['#cee7f4', '#9ed4f8', '#7abcef', '#52adf7', '#2f95f5'];

  return (
    <div>
      <link href="https://fonts.googleapis.com/css2?family=Poltawski+Nowy:ital,wght@0,400..700;1,400..700&display=swap" rel="Main.css"/>
      <NavBar/>
        <div className="postMealBox2">
            <h1>Recommended Activities</h1> 
            <div className="scrollBox">
                {activities.map((activity, index) => (
                    <button className="scrollItemButtons" key={index} style={{ backgroundColor: activityColors[index % activityColors.length] }}>
                        {activity}
                    </button>
                ))}
            </div>
            <button className="finishButton" onClick={finish}>
                Finish
            </button>
        </div>
    </div>
  );
}

export default Activity;
