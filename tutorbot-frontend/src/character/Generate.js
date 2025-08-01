import React, { useEffect, useState, useContext } from 'react';
import './Character.css';
import axios from 'axios';
import { PageContext, RoleContext, UserContext } from '../App';
import Character from '../whiteboard/Character.js'

const phrases = [
  "Generating your character…",
  "Picking favorite colors…",
  "Drawing hair… maybe…",
  "Giving it personality…",
  "Making it awesome…",
];

function Generate() {


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
        const data = {	
          "userID": "jack",
          "age": 10,
          "sex": "male",
          "favorites": user.favorites
        };
        
        const res = await axios.post('http://localhost:5000/character', data);
        console.log(res.data.response)

        // Properly update user state
        setUser(prevUser => ({
          ...prevUser,
          tutor: res.data.response
        }));

        setTimeout(() => {
          setTransitionDone(true);
          setTimeout(() => setPage("whiteboard"), 4000);
        }, 500);
      } catch (err) {
        console.error("Character generation failed", err);
      }
    };


    fetchCharacter();

    return () => clearInterval(phraseInterval);
  }, [phraseIndex]);

  return (
    <div className={`generation-container`}>
      
        <img
          src="/character/shadow.webp"
          className="character fade-loop"
          alt="Generating Character"
        />
      


      <div className="caption">{currentPhrase}</div>
    </div>
  );
}

export default Generate;
