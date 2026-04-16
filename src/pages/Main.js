import React from 'react';
import { useState } from 'react';
import '../styles/Main.css';
import logo from '../assets/logo.png'
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import InputField from '../components/InputField';

// --- Main Login Page ---
function Main() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");


  async function handleLogin() {
    try{
      const response = await fetch('/validate-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
    
      const data = await response.json();
      
      if (data.valid) {
        if (data.role === 'caregiver') {
            navigate('/caregiver?id='+data.id);
        } else {
            navigate('/user?id='+data.id);
        }
      } 
      else {
        console.log("Invalid credentials");
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('Network error');
    }
  }
  

  return (
    <div>
      <link href="https://fonts.googleapis.com/css2?family=Poltawski+Nowy:ital,wght@0,400..700;1,400..700&display=swap" rel="Main.css"/>
      <img src={logo} alt="Logo" className="Logo"/>
        <div className="LoginBox"> 
            <div className='group'>
              <h1>user login</h1>
              <InputField label="Username:" value={username} onChange={setUsername} />
              <InputField label="Password:" value={password} type="password" onChange={setPassword} />
              {/*to be changed to handle login see function above*/}
              <button onClick={() => handleLogin()}>
                login
              </button>
              <Link to="/select-role">
                <p className='link' >new user?</p>
              </Link>
              {error && <h3 className="error">{error}</h3>}
            </div>
        </div>
    </div>
  );
}

export default Main;
