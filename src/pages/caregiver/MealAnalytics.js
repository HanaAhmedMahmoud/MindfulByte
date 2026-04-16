import React, { useEffect } from 'react';
import { useState } from 'react';
import '../../styles/Main.css';
import logo from '../../assets/logo.png'
import pfp from '../../assets/pfp.png'
import calendar from '../../assets/calendar.png'
import utensils from '../../assets/utensils.png'
import sun from '../../assets/sun.png'
import people from '../../assets/people.png'
import clock from '../../assets/clock.png'
import scale from '../../assets/scale.svg'
import stopwatch from '../../assets/stopwatch.png'
import shake from '../../assets/shake.svg'
import pause from '../../assets/pause.png'  
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import AnalyticsItem from '../../components/AnalyticsItem';
import { LineChart } from '@mui/x-charts/LineChart';
import Smileys from '../../components/Smileys';

// --- Meal Analytics Page for Caregivers with Detailed Metrics and Visualisations ---
function MealAnalytics() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mealAnalytics, setMealAnalytics] = useState([]);
  const [journal, setJournal ] = useState([]);
  const [prompts, setPrompts ] = useState([]);
  const [portions, setPortions ] = useState([]);
  const [username, setUsername ] = useState('');
  const [hasData, setHasData] = useState(true);
  const id = searchParams.get('id');
  const patientID = searchParams.get('patientID');
  const caregiverID = searchParams.get('caregiverID')

  useEffect(() => {
    async function fetchMeal(){
      try{
          const response = await fetch(`/get-meal-metrics?mealID=${id}`, {
          method: 'GET',
          headers: {
          'Content-Type': 'application/json',
          },
      });
      
      const data = await response.json();
      console.log(data)

      const meal = data.meal;
      const notRecorded = !meal || !meal.meal_date || meal.time_of_meal

      if (notRecorded) {
        setHasData(false);
        return; // Stop here and show the "No meal data" page
      }

      setMealAnalytics(data.meal);
      setJournal(data.journal);
      setPrompts(data.prompts);
      setPortions(data.portionSizes);

      } catch (err) {
          console.error('Error fetching meal sessions:', err);
          return [];
      }
    }

    fetchMeal();
  }, [id]);

useEffect(() => {
    if (!mealAnalytics || !mealAnalytics.user_id) return;
    async function getUserName(){
        try{ 
            const response = await fetch(`/get-username?userID=${mealAnalytics.user_id}`, {
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
  }, [mealAnalytics]);  //only when user id exists when fetched 

if (!hasData) {
  return(
    <div className="noDataMessage">No meal data avaliable due to lack of hardware</div>
  )
}

if (hasData) {
  return (
    <div>
      <link href="https://fonts.googleapis.com/css2?family=Poltawski+Nowy:ital,wght@0,400..700;1,400..700&display=swap" rel="Main.css"/>
      <img src={logo} alt="Logo" className="Logo"/>
        <div className="analyticsBox"> 
            <div className="mainTitleBox">
                <button className="back" onClick={() => navigate(`/meal-sessions?id=${patientID}&caregiverID=${caregiverID}`)}>back</button>
                <div className="titleBox">
                    <h1>{username}'s Meal Analytics</h1> 
                </div>
            </div> 
            <div className="secondRowContainer">
              <div className="analyticsSummaryBox">
                  <AnalyticsItem label="Username" icon={pfp} data={username || "-"} />
                  <AnalyticsItem label="Date" icon={calendar} data={mealAnalytics.meal_date || "-"} />
                  <AnalyticsItem label="Meal Name" icon={utensils} data={mealAnalytics.meal_name || "-"} />
                  <AnalyticsItem label="Time of Day" icon={sun} data={mealAnalytics.meal_type || "-"} />
                  <AnalyticsItem label="Environment" icon={people} data={mealAnalytics.meal_environment || "-"} />
                  <AnalyticsItem label="Time to Complete Meal" icon={clock} data={mealAnalytics.time_of_meal != null ? `${Math.round(mealAnalytics.time_of_meal / 60)} minutes` : "—"} />
              </div>
              <div className="heartRateBox"> 
                <div className="scaleContainer">
                  <h4>Meal Weight</h4>
                  <p>{mealAnalytics.start_weight != null ? `${mealAnalytics.start_weight}g` : "—"}</p>
                  <img src={scale} alt="Meal Weight" className="scaleImage"></img>
                </div>
              </div>
            </div>
            <div className="thirdRowContainer">
              <div className="leftAnalytics">
                <div className="leftAnalyticsInnerBox">
                  <div className="eatingPaceBox">
                    <h1>Eating Pace</h1>
                    <AnalyticsItem label="Time to first bite" icon={stopwatch} data={mealAnalytics.time_to_first_bite != null ? `${mealAnalytics.time_to_first_bite} seconds` : "—"} />
                    <AnalyticsItem label="Shake count" icon={shake} data={mealAnalytics.shake_count ?? "-"} />
                    <AnalyticsItem label="Number of pauses" icon={pause} data={mealAnalytics.pause_count ?? "-"} />
                  </div>
                  <div className="graphBox">
                    <h4>Variability in Portion Sizes</h4>
                    {portions.length > 0 ? (
                      <LineChart
                        xAxis={[{ 
                          data: [...Array(portions.length).keys()].map(i => i + 1), 
                          label: 'Bites', 
                              labelStyle: {
                                fontSize: 12,
                                transform: 'translateY(-15px)',
                              },
                        }]} 
                        yAxis={[{
                            label: 'Portions sizes (g)',
                              labelStyle: {
                                fontSize: 12,
                                transform: 'rotate(-90deg) translateY(-120px) translateX(-10px)',
                              },
                          },
                        ]}
                        series={[
                          {
                            data: portions ,
                          },
                        ]}
                        height={200}
                        spacing={0}
                      />
                    ) : (<p> No data available </p>)}
                  </div>
                </div>
                <div className="leftAnalyticsInnerBox2">
                  <h1>Prompts</h1>
                  <div className="promptScrollBox">
                    {prompts.length > 0 ? (
                      prompts.map((prompt, index) => (
                      <div className="promptScrolBoxItem" key={index}>
                          <div className="mealStyler">
                              <p>{prompt}</p>
                          </div>
                      </div>))
                    ):(<p>No prompts recorded</p>)}
                  </div>
                </div>
              </div>
              <div className="rightAnalytics">
                <h1>Feelings</h1>
                <div className="preMealBox"> 
                  <h4>Pre-meal:</h4>
                  <Smileys rating={journal.pre_meal_rating} />
                  <div className="journalBox">{journal.pre_meal_journal || "No journal entry"}</div> 
                </div>
                <div className="preMealBox"> 
                  <h4>Post-meal:</h4>
                  <Smileys rating={journal.post_meal_rating} />
                  <div className="journalBox">{journal.post_meal_journal || "No journal entry"}</div> 
                </div>
              </div>
            </div> 
          </div>
        </div>
    );
  }
}

export default MealAnalytics;
