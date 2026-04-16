import React from 'react';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import '../../styles/Main.css';
import logo from '../../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import InputField from '../../components/InputField';
import DropdownField from '../../components/DropdownField';
import SmileySlider from '../../components/SmileySlider';
import {NavBar} from '../../components/NavBar';

// --- User Home Page with Meal Logging and Pre-Meal Reflection ---
function UserHome() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  const [meal_name, setMealName] = useState("");
  const [meal_date, setMealDate] = useState("");
  const [meal_type, setMealType] = useState('breakfast');
  const [meal_environment, setMealEnvironment] = useState('alone');
  const [pre_meal_journal, setPreMealJournal] = useState("");
  const [pre_meal_rating, setPreMealRating] = useState(3);

  async function startMeal() {
      const response = await fetch('/start-meal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, meal_date, meal_name, meal_type, meal_environment, pre_meal_rating, pre_meal_journal}),
      });
      const result = await response.json();
      if (result.success) {
        navigate(`/app?mealID=${result.meal_id}&id=${id}`);
      }
  }

  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1; // Months start at 0!
    let dd = today.getDate();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    const formattedToday = dd + '/' + mm + '/' + yyyy;
    setMealDate(formattedToday);
  }, [id]); 

  return (
    <div>
      <link href="https://fonts.googleapis.com/css2?family=Poltawski+Nowy:ital,wght@0,400..700;1,400..700&display=swap" rel="Main.css"/>
      <NavBar/>
      <div className="quoteBox">
        {/* Ideally this quote switches up from a bank of quotes */}
        <p>"Recovery is not linear"</p>
      </div>
      <div className="twoBoxes">
        <div className="box">
          <h1>Meal information</h1>
          <InputField label="What are you eating?" value={meal_name} onChange={setMealName} />
          <DropdownField label="What meal is this?" value={meal_type} onChange={setMealType} options={[
              { value: "breakfast", label: "Breakfast" }, 
              { value: "lunch", label: "Lunch" },
              { value: "dinner", label: "Dinner" }
          ]} />
          <DropdownField label="Who are you eating with?" value={meal_environment} onChange={setMealEnvironment} options={[
              { value: "alone", label: "Alone" },
              { value: "family", label: "Family" },
              { value: "friends", label: "Friends" }
          ]} />
        </div> 
        <div className="box2">
          <h1>How are you?</h1>
          <SmileySlider
            mealRating={pre_meal_rating}
            setMealRating={setPreMealRating}
          />
          <textarea 
            type={"text"}
            placeholder="Write your thoughts here..."
            value={pre_meal_journal} 
            onChange={(e) => setPreMealJournal(e.target.value)} 
          />
        </div>
      </div>
      <div className="buttonBox">
        <button onClick={() => startMeal()}>
          Start meal 
        </button>
      </div>
    </div>
  );
}

export default UserHome;
