import React from 'react';
import Character from './Character';
import './Popup.css';

const Popup = ({ user, onClose }) => {
  if (!user?.tutor) return null;

  return (
    <>
      {/* Purple background overlay */}
      <div className="purple-overlay" />

      {/* Main popup */}
      <div className="popup-overlay">
        <div className="popup-container" onClick={e => e.stopPropagation()}>
          <div className="popup-header" style={{ marginBottom: "40px" }}>Meet {user.tutor.name}</div>

          <div className="spinning-sun">
            <img src="character/sun.webp" alt="Spinning Sun" />
          </div>

          <div className="character-wrapper">
            <Character
              body="costume/bluebody.GIF"
              hat={`costume/${user.tutor.hat || 'nothing.PNG'}`}
              glasses={`costume/${user.tutor.glasses || 'nothing.PNG'}`}
              holding={`costume/${user.tutor.holding || 'nothing.PNG'}`}
              isTalking={false}
              isLoading={false}
              showSpeechBubble={false}
            />
          </div>

          <div className="description-text">{user.tutor.description}</div>

          {/* Let’s Get Started button */}
          <button className="start-button" style={{ marginTop: "-20px" }} onClick={onClose}>
            Let's Get Started
          </button>
        </div>
      </div>
    </>
  );
};

export default Popup;
