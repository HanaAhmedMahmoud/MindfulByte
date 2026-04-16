import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './pages/user/App';
import Main from './pages/Main'; 
import SelectRole from './pages/SelectRole'; 
import Register from './pages/Register';
import Motivations from './pages/Motivations';
import UserHome from './pages/user/UserHome';
import CaregiverHome from './pages/caregiver/CaregiverHome';
import MealSessions from './pages/caregiver/MealSessions';
import MealAnalytics from './pages/caregiver/MealAnalytics';
import PostMealQuestion from './pages/user/PostMealQuestions';
import Activity from './pages/user/Activity';

// --- Main Application Rendering ---
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/select-role" element={<SelectRole />} />
        <Route path="/register" element={<Register />} />
        <Route path="/motivations" element={<Motivations />} />
        <Route path="/user" element={<UserHome />} />
        <Route path="/caregiver" element={<CaregiverHome />} />
        <Route path="/app" element={<App />} />
        <Route path="/meal-sessions" element={<MealSessions />} />
        <Route path="/meal-analytics" element={<MealAnalytics />} />
        <Route path="/post-meal-questions" element={<PostMealQuestion />} />
        <Route path="/activity" element={<Activity />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
