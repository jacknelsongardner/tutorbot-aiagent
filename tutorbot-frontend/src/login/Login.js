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
        favorites: [],
        tutor: {}
      });
    } 
    }
  

  return (
    <div className="login-layout">
      <div className="left-pane">
        <img src="login/logo.png" style={{maxWidth:"65%"}}></img>
        <p className="subtitle">Your personalized, AI-powered tutor (and friend)</p>
        <div className="role-selection" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button onClick={() => handleSelectRole('student')}>Try it out!</button>
        </div>
      </div>

      <div className="right-pane">
        
        <div className="scrolling-background">
        <img
          src="login/backdrop.jpg"
          alt="Backdrop"
          className="/background-image"
        />
        <img
          src="login/backdrop.jpg"
          alt="Backdrop"
          className="/background-image"
        />
        </div>

          <img
            src="login/slide1.webp"
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
