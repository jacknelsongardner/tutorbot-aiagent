import React from 'react';
import './Character.css';

const Character = ({ sprite, speechText, isTalking }) => {
  return (
    <div className="character-container">
         <div className="speech-bubble-wrapper">
        <img src="login/bubble.png" alt="Speech Bubble" className="speech-bubble" />
        <p className="speech-text">{speechText}</p>
      </div>
      <div className="character-image-wrapper">
        <img src={sprite} alt="Character" className="character-sprite" />
        {isTalking && (
          <img src="character/mouth.png" alt="Mouth Animation" className="mouth-overlay" />
        )}
      </div>
    </div>
  );
};

export default Character;
