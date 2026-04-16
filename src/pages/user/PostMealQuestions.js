import React from 'react';
import '../../styles/Main.css';
import logo from '../../assets/logo.png'
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import SmileySlider from '../../components/SmileySlider';
import {NavBar} from '../../components/NavBar';

// --- Post Meal Reflection Journal and Rating ---
function PostMealQuestion() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('mealID');

  const [post_meal_journal, setPostMealJournal] = useState("");
  const [post_meal_rating, setPostMealRating] = useState(3);

  async function sendJournalData(){
    const response = await fetch('/update-post-meal-journal', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mealID: id,
        post_meal_rating: post_meal_rating,
        post_meal_journal: post_meal_journal
      })
    });
    const result = await response.json();
    if (result.success) {
        navigate('/activity?mealID='+id);
    }
  }

  return (
    <div>
      <link href="https://fonts.googleapis.com/css2?family=Poltawski+Nowy:ital,wght@0,400..700;1,400..700&display=swap" rel="Main.css"/>
      <NavBar/>
        <div className="postMealBox">
            <h1>How do you feel after your meal?</h1> 
            <SmileySlider
                mealRating={post_meal_rating}
                setMealRating={setPostMealRating}
            />
            <div className="postMealTextAndButton">
                <textarea 
                    className="postMealTextArea" 
                    placeholder="Write your thoughts here..."
                    value={post_meal_journal} 
                    onChange={(e) => setPostMealJournal(e.target.value)} 
                />
                <button onClick={sendJournalData}>
                    <img src={require('../../assets/send-button.png')} alt="Submit" />
                </button>
            </div>
        </div>
    </div>
  );
}

export default PostMealQuestion;
