import React, { useState } from 'react';
import './LoginPopup.css';

function LoginPopup({ role, onClose, onSubmit }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');


 const [firstName, setFirstName] = useState('');
 const [lastName, setLastName] = useState('');
 const [age, setAge] = useState();
 const [grade, setGrade] = useState('');
 const [country, setCountry] = useState('');

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
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />

        <input
          type="number"
          placeholder="Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />

        <input
          type="text"
          placeholder="Grade"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
        />

        <input
          type="text"
          placeholder="Country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        />

        <input
          type="email"
          placeholder="School Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="popup-buttons">
          <button onClick={submitLogin}>Start</button>
        </div>
      </div>
    </div>
  );
}

export default LoginPopup;
