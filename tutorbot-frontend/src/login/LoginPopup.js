import React, { useState } from 'react';
import './LoginPopup.css';

function LoginPopup({ role, onClose, onSubmit }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [grade, setGrade] = useState('');
  const [country, setCountry] = useState('');

  const allFieldsFilled =
    firstName.trim() &&
    lastName.trim() &&
    age &&
    grade.trim() &&
    country.trim()

  const submitLogin = () => {
    if (allFieldsFilled) {
      onSubmit(email, password);
      onClose();
    }
    else {
      alert("Please complete all fields before starting.");
    }
  };

  return (
    <div className="popup-backdrop">
      <div className="popup">
        <button className="cancel-button" onClick={onClose}>×</button>

        <img src="/tutorbot.png" alt="Tutorbot" />

        <h2  style={{ marginTop: '80px', color: 'black', marginBottom: '-30px' }}>Let's get to know you a little.</h2>

        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          style={{ marginTop: '100px' }}
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


        <div className="popup-buttons">
          <button
            onClick={submitLogin}
            style={{ opacity: allFieldsFilled ? 1 : 0.5 }}
          >
            Start
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPopup;
