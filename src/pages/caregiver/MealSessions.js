import React, { useEffect } from 'react';
import { useState } from 'react';
import '../../styles/Main.css';
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import {NavBar} from '../../components/NavBar';

// --- Meal Sessions Page for Caregivers to View Past Meals of a Patient ---
function MealSessions() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [sessions, setSessions] = useState([]);
  const [username, setUsername]= useState(""); 
  const id = searchParams.get('id');
  const caregiverID = searchParams.get('caregiverID')

  useEffect(() => {
    async function fetchSessions(){
      try{
          const response = await fetch(`/get-meal-sessions?patientID=${id}`, {
          method: 'GET',
          headers: {
          'Content-Type': 'application/json',
          },
      });
      
      const data = await response.json();
      setSessions(data.sessions);

      } catch (err) {
          console.error('Error fetching meal sessions:', err);
          return [];
      }
    }
    fetchSessions();
  }, [id]);

  useEffect(() => {
      if (!id) return;
      async function getUserName(){
          try{ 
              const response = await fetch(`/get-username?userID=${id}`, {
                  method: 'GET',
                  headers: {
                  'Content-Type': 'application/json',
                  },
              });
              const data = await response.json();
              setUsername(data.username);
          } catch (err) {
              console.error('Error fetching username:', err);
          }
      }
      getUserName(); 
    }, [id]);  //only when user id exists when fetched 

  function goToMeal(mealID){
    navigate(`/meal-analytics?id=${mealID}&patientID=${id}&caregiverID=${caregiverID}`);
  }

  return (
    <div>
      <link href="https://fonts.googleapis.com/css2?family=Poltawski+Nowy:ital,wght@0,400..700;1,400..700&display=swap" rel="Main.css"/>
      <NavBar/>
        <button className="back" onClick={() => navigate(`/caregiver?id=${caregiverID}`)}>Back</button>
        <div className="caregiverBox"> 
            <h1>{username} Meals</h1>
            <div className="scrollBox2">
                {sessions.map((session, index) => (
                    <button className="scrollMealButtons" key={index} onClick={() => goToMeal(session.meal_id)}>
                        <div className="mealStyler">
                            <p>{session.meal_date}</p>
                            <p>{session.meal_type}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    </div>
  );
}

export default MealSessions;
