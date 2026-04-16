import { useSearchParams } from 'react-router-dom';
import '../styles/Main.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png'
import InputField from '../components/InputField';

// --- Registration Page for New Users and Caregivers ---
const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role');

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [caregiver, setCaregiver] = useState("");
  const [x, setX] = useState(false);
  const [error, setError] = useState("");
  
  if (!role) {
    return navigate('/select-role');
  }

  async function handleRegister() {
    if (role === 'user') {
      const response = await fetch('/register-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, caregiverID: caregiver }),
      });
      const result = await response.json();
      if (result.success) {
        navigate(`/motivations?id=${result.id}`);
      }
      else{
        setError('Registration failed');
      }

    } else if (role === 'caregiver') {
      const response = await fetch('/register-caregiver', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      const result = await response.json();
      if (result.success) {
        navigate('/');
      }
      else{
        setError('Registration failed');
      }
    }
  }

  return (
    <>
      <img src={logo} alt="Logo" className="Logo"/>
      {role === 'caregiver' ? 
          <div className="LoginBox">
            <h1>create caregiver</h1>
              <div className='group'>
                <InputField label="Username:" value={username} onChange={setUsername} />
                <InputField label="Password:" type="password" value={password} onChange={setPassword} />
              </div>
            <button onClick={() => navigate('/')}>
              create account
            </button>
            {error && <h3 className="error">{error}</h3>}
          </div>

        : 
          <div className="RegisterBox">
            <h1>create user</h1>
              <div className='group'>
                <InputField label="Username:" value={username} onChange={setUsername} />
                <InputField label="Password:" type="password" value={password} onChange={setPassword} />
                <InputField label="Caregiver ID:" value={caregiver} onChange={setCaregiver} />
              </div>
            <div className='checkbox'>
              <input type="checkbox"
                checked={x}
                onChange={e => setX(e.target.checked)}
              /> 
              <span>Consent to giving caregiver access to mealtime data</span>
            </div>
            <button onClick={() => handleRegister()}>
              next step
            </button>
            {error && <h3 className="error">{error}</h3>}
          </div>}
    </>
  );
};
export default Register;