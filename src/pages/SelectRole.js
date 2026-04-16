import React from 'react';
import '../styles/Main.css';
import logo from '../assets/logo.png'
import { useNavigate } from 'react-router-dom';

// --- Role Selection Page for New Users ---
function SelectRole() {
  const navigate = useNavigate();
  return (
    <div>
      <link href="https://fonts.googleapis.com/css2?family=Poltawski+Nowy:ital,wght@0,400..700;1,400..700&display=swap" rel="Main.css"/>
      <img src={logo} alt="Logo" className="Logo"/>
        <div className="container"> 
            <h1>what type of account are we creating?</h1>
            <button onClick={() => navigate('/register?role=user')}>
              user
            </button>
            <button onClick={() => navigate('/register?role=caregiver')}>
              caregiver
            </button>
        </div>
    </div>
  );
}

export default SelectRole;
