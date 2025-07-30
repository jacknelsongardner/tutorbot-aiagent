import React, { useState } from 'react';
import './LoginPopup.css';

function LoginPopup({ role, onClose, onSubmit }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submitLogin = () => {
    onSubmit(email, password);
    onClose();
  };

  return (
    <div className="popup-backdrop">
      <div className="popup">
        <button className="cancel-button" onClick={onClose}>×</button>
        
        <img src="/tutorbot.png" alt="Tutorbot" />

        <h2>{role === 'student' ? 'Student Login' : 'Teacher Login'}</h2>

        <input
          type="email"
          placeholder="School Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="popup-buttons">
          <button onClick={submitLogin}>Login</button>
        </div>
      </div>
    </div>
  );
}

export default LoginPopup;
