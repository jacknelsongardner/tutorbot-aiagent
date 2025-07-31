import React from 'react';
import './Character.css';

const Character = ({ body, hat, glasses, holding, speechText, isTalking, isLoading }) => {
  return (
    <div className="character-container">
      <div className="speech-bubble-wrapper">
        {!isLoading && (
          <>
            <img src="login/bubble.png" alt="Speech Bubble" className="speech-bubble" />
            <p className="speech-text">{speechText}</p>
          </>
        )}
      </div>

      <div className="character-image-wrapper">
        {/* Base character body */}
        {body && <img src={body} alt="Body" className="character-layer" />}

        {/* Overlays */}
        {hat && <img src={`${hat}`} alt="Hat" className="character-layer" />}
        {glasses && <img src={`${glasses}`} alt="Glasses" className="character-layer" />}
        {holding && <img src={`${holding}`} alt="Holding" className="character-layer" />}

        {/* Mouth animation if talking */}
        {isTalking && (
          <img src="character/mouth.png" alt="Mouth Animation" className="character-layer" />
        )}

        {/* Loading animation */}
        {isLoading && (
          <img src="character/loading.gif" alt="Loading Tutorbot" className="speech-bubble" />
        )}
      </div>
    </div>
  );
};

export default Character;
