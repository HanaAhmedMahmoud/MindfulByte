import React, { useEffect } from 'react';
import { useState } from 'react';
import '../../styles/Main.css';
import logo from '../../assets/logo.png'
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import NavBar from '../../components/NavBar';

// --- Caregiver Home Page with List of Patients and Navigation to Meal Sessions ---
function CaregiverHome() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const patientColors = ['#cee7f4', '#9ed4f8', '#7abcef', '#52adf7', '#2f95f5'];

    useEffect(() => {
        async function getPatients() {
            try{
                const response = await fetch(`/get-patients?caregiverID=${id}`, {
                method: 'GET',
                headers: {
                'Content-Type': 'application/json',
                },
            });
            
            const data = await response.json();
            setPatients(data.patients);

            } catch (err) {
                console.error('Error fetching patients:', err);
                return [];
            }finally {
                setLoading(false);
            }
        }
        getPatients();
        console.log(patients);
    }, [id]); //change once id changes 

    function goToUser(patientID) {
        navigate(`/meal-sessions?id=${patientID}&caregiverID=${id}`);
    }

    if (loading) {
        return <div>Loading...</div>;
    }

  return (
    <div>
      <link href="https://fonts.googleapis.com/css2?family=Poltawski+Nowy:ital,wght@0,400..700;1,400..700&display=swap" rel="Main.css"/>
      <NavBar/>
        <div className="caregiverBox">
            <h1>Users</h1>
            <div className="scrollBox">
                {patients.map((patients, index) => (
                    <button className="scrollItemButtons" key={index} onClick={() => goToUser(patients.id)} style={{ backgroundColor: patientColors[index % patientColors.length] }}>
                        {patients.username}
                    </button>
                ))}
            </div>
        </div>
    </div>
  );
}

export default CaregiverHome;
