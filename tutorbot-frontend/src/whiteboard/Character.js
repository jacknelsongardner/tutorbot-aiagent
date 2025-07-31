import React from 'react';
import './Character.css';


const Character = ({ sprite, speechText, isTalking, isLoading }) => {
  return (
    <div className="character-container">
         <div className="speech-bubble-wrapper">
        
        {!isLoading && 
        (<img src="login/bubble.png" alt="Speech Bubble" className="speech-bubble" />

        )}
        
        <p className="speech-text">{speechText}</p>
      </div>
      <div className="character-image-wrapper">
        
        
        
        <img src={sprite} alt="Character" className="character-sprite" />
        {isTalking && (
          <img src="character/mouth.png" alt="Mouth Animation" className="mouth-overlay" />
        )}

        {isLoading && (
          <img src="character/loading.gif" alt="Loading Tutorbot" className="speech-bubble"/>
        )}

      </div>
    </div>
  );
};

export default Character;
