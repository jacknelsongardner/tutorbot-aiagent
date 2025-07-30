import React, { useEffect, useState, useContext } from 'react';
import './Character.css';
import axios from 'axios';
import { PageContext, RoleContext, UserContext } from '../App';


const phrases = [
  "Generating your character…",
  "Picking favorite colors…",
  "Drawing hair… maybe…",
  "Giving it personality…",
  "Making it awesome…",
];

function Character() {


    const { page, setPage } = useContext(PageContext);
    const { role, setRole } = useContext(RoleContext);
    const { user, setUser } = useContext(UserContext);

  const [currentPhrase, setCurrentPhrase] = useState(phrases[0]);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [imageUrl, setImageUrl] = useState(null); // server image
  const [transitionDone, setTransitionDone] = useState(false);

  useEffect(() => {
    const phraseInterval = setInterval(() => {
      setPhraseIndex(prev => (prev + 1) % phrases.length);
      setCurrentPhrase(phrases[(phraseIndex + 1) % phrases.length]);
    }, 4000);

    const fetchCharacter = async () => {
      try {
        //const res = await axios.post('http://localhost:3001/generate-character');
        setImageUrl("character/generated.PNG"); // Assume this is a full URL
        setTimeout(() => {
          setTransitionDone(true);
          setTimeout(() => setPage("whiteboard"), 4000);
        }, 500); // Small delay before transition
      } catch (err) {
        console.error("Character generation failed", err);
      }
    };

    fetchCharacter();

    return () => clearInterval(phraseInterval);
  }, [phraseIndex]);

  return (
    <div className={`generation-container ${transitionDone ? 'reveal' : ''}`}>
      {!transitionDone && (
        <img
          src="/character/shadow.PNG"
          className="character fade-loop"
          alt="Generating Character"
        />
      )}

      {transitionDone && (
        <>
          <img
            src="/character/shine.PNG"
            className="sun"
            alt="Sun"
          />
          <img
            src={imageUrl}
            className="character"
            alt="Final Character"
          />
        </>
      )}

      <div className="caption">{currentPhrase}</div>
    </div>
  );
}

export default Character;
