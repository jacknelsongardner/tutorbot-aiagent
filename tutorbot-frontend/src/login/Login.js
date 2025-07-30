import React, { useState, useContext } from 'react';
import LoginPopup from './LoginPopup';
import './Login.css';
import { PageContext, RoleContext, UserContext } from '../App';

function Login() {
  const [showPopup, setShowPopup] = useState(false);

  const { page, setPage } = useContext(PageContext);
  const { role, setRole } = useContext(RoleContext);
  const { user, setUser } = useContext(UserContext);

  const [bubbleText, setBubbleText] = useState("Hello! Ready to learn?");



  const handleSelectRole = (selectedRole) => {
    setRole(selectedRole);
    setShowPopup(true);
  };

  const handleLogin = (email, password) => {
    console.log(`Logging in as ${role}:`, email);

    if (role === 'student') {
      setPage('survey');
      setUser({
        name: 'Jack Gardner',
        Classes: {
          '5th Grade Math': {
            goals: {
              area_of_triangle: 'student should be able to find the area of a triangle',
              area_of_rectangle: 'student should be able to find the area of a rectangle',
            },
          },
        },
      });
    } else if (role === 'teacher') {
      setPage('classes');
      setRole('teacher');
      setUser({
        name: 'Arnold Fowler',
        Classes: {
          '5th Grade Math': {
            goals: {
              area_of_circle: 'student should be able to find the area of a triangle',
              area_of_rectangle: 'student should be able to find the area of a rectangle',
            },
          },
        },
      });
    }
  };

  return (
    <div className="login-layout">
      <div className="left-pane">
        <h1 className="title">MyTutor.ai</h1>
        <p className="subtitle">Your personalized, AI-powered learning assistant</p>
        <div className="role-selection" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button onClick={() => handleSelectRole('student')}>I'm a Student</button>
          <button onClick={() => handleSelectRole('teacher')}>I'm a Teacher</button>
        </div>
      </div>

      <div className="right-pane">
        <img
          src="/login/backdrop.png"
          alt="Backdrop"
          className="background-image"
        />
          <img
            src="/login/slide1.png"
            alt="Banner"
            className="foreground-image"
          />

          <div className="speech-bubble-image">
            <h2 className="speech-bubble-text">{bubbleText}</h2>
            <img src="login/bubble.png" alt="Speech Bubble" style={{ width: '100%', height: 'auto' }} />
          </div>

          
        
        </div>

      {showPopup && (
        <LoginPopup
          role={role}
          onClose={() => setShowPopup(false)}
          onSubmit={handleLogin}
        />
      )}
    </div>
  );
}

export default Login;
