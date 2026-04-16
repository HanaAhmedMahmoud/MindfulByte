import React from 'react';
import '../styles/Main.css';
import logo from '../assets/logo.png'
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import InputField from '../components/InputField';
import {useState} from 'react'

// --- Reflective Motivation Excercise on Sign Up ---
function Motivations() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = Number(searchParams.get('id'));

   const [recover, setRecover] = useState(""); 
   const [miss, setMiss] = useState(""); 
   const [person, setPerson] = useState(""); 
   const [remember, setRemember] = useState(""); 
   const [quote, setQuote] = useState(""); 
   const [error, setError] = useState(""); 
   
  async function updateRecover(){
        //some nlp? 
          const payload = {
            id,
            recover: `"I want to recover so that I can ${recover}"`,
            miss: `"I want to enjoy ${miss}"`,
            person: `"I'm doing this for ${person}"`,
            remember: `"I want to remember ${remember}"`,
            quote: `"${quote}"`,
          };
       const response = await fetch('/insert-user-quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.success) {
        navigate('/');
      }
      else{
        setError('Update Failed ');
      }
    }

  return (
    <div>
      <link href="https://fonts.googleapis.com/css2?family=Poltawski+Nowy:ital,wght@0,400..700;1,400..700&display=swap" rel="Main.css"/>
      <img src={logo} alt="Logo" className="Logo"/>
        <div className="motivationsBox"> 
            <h1>Motivations</h1>
             <div className="group"> 
                <InputField label="I want to recover so that I can..." value={recover} onChange={setRecover} />
                <InputField label="I miss enjoying..." value={miss} onChange={setMiss}  />
                <InputField label="I'm doing this for..." value={person} onChange={setPerson}  />
                <InputField label="When things get hard, I want to remember..." value={remember} onChange={setRemember}  />
                <InputField label="My favourite recovery quote is..." value={quote} onChange={setQuote}  />
             </div>
            <button onClick={() => updateRecover()}>
              Create Account
            </button>
            {error && <h3 className="error">{error}</h3>}
        </div>
    </div>
  );
}

export default Motivations;
