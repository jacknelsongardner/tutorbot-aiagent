import React, { useEffect, useState, useContext } from 'react';
import './Survey.css';
import { PageContext, RoleContext, UserContext } from '../App';

import { findRelatedEntities, searchEntities } from '../qloo';

const initialQuestions = [
  "What's your favorite movie?",
  "What's your favorite TV show?",
  "What's your favorite video game?",
];

const likeQuestions = [];

var possibleFavorites = [];


function Survey() {
  const { setPage } = useContext(PageContext);
  const { setRole } = useContext(RoleContext);
  const { user, setUser } = useContext(UserContext);

  const [showIntro, setShowIntro] = useState(true);
  const [step, setStep] = useState(0);
  const [textAnswers, setTextAnswers] = useState([]);
  const [likeAnswers, setLikeAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [finished, setFinished] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [fadeClass, setFadeClass] = useState('fade-in');

  // Utility delay function to replace setTimeout with async/await
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

  useEffect(() => {
    if (showIntro) {
      (async () => {
        await delay(2000);
        setFadeClass('fade-out');
        await delay(1000);
        setShowIntro(false);
        setFadeClass('fade-in');
      })();
    }
  }, [showIntro]);
const handleTextSubmit = async () => {
  setFadeClass('fade-out');
  await delay(300); // Wait for fade out animation

  const updatedAnswers = [...textAnswers, inputValue];
  const currentStep = step; // capture before incrementing
  const currentAnswer = inputValue;
  setTextAnswers(updatedAnswers);
  setInputValue('');

  // Determine the entity type based on the step index
  const entityTypes = ['movie', 'tv_show', 'videogame'];
  const entityType = entityTypes[currentStep];

  try {
    const entityResults = await searchEntities(entityType, currentAnswer, 2);
    if (entityResults.length > 0) {
      setUser(prevUser => ({
        ...prevUser,
        favorites: [...(prevUser.favorites || []), entityResults[0]],
      }));
    }
  } catch (err) {
    console.error('Failed to search entities:', err);
  }

  if (currentStep < initialQuestions.length - 1) {
    setStep(currentStep + 1);
    setFadeClass('fade-in');
  } else {
    setStep(0);
    // Wait until favorites are fully updated
    await delay(300); // helps ensure setUser completes before accessing

    const favoritesCopy = [...(user.favorites || [])];
    const entityIds = favoritesCopy.map(f => f.entity_id);

    let [possibleMovies, possibleVideoGames, possibleTVShows] = [[], [], []];
    try {
      possibleMovies = await findRelatedEntities('movie', entityIds, 1990, 2025, 2);
      possibleVideoGames = await findRelatedEntities('videogame', entityIds, 1990, 2025, 2);
      possibleTVShows = await findRelatedEntities('tv_show', entityIds, 1990, 2025, 2);
    } catch (err) {
      console.error('Failed to fetch related entities:', err);
    }

    likeQuestions.length = 0;
    possibleFavorites.length = 0;

    possibleMovies.forEach(movie => {
      likeQuestions.push(`Do you like the movie "${movie.name}"?`);
      possibleFavorites.push(movie);
    });
    possibleTVShows.forEach(show => {
      likeQuestions.push(`Do you like the TV show "${show.name}"?`);
      possibleFavorites.push(show);
    });
    possibleVideoGames.forEach(game => {
      likeQuestions.push(`Do you like the video game "${game.name}"?`);
      possibleFavorites.push(game);
    });

    setFadeClass('fade-in');
  }
};


  const handleLikeSubmit = async (answer) => {
    setFadeClass('fade-out');
    await delay(300); // wait fade out

    const currentQuestion = likeQuestions[step];
    const updatedAnswers = {
      ...likeAnswers,
      [currentQuestion]: answer,
    };
    setLikeAnswers(updatedAnswers);

    if (step < likeQuestions.length - 1) {

        if (answer === "yes") {
            setUser({
            ...user,
            favorites: [...(user.favorites || []), possibleFavorites[step]],
            });
        }
        
      setStep(step + 1);
      setFadeClass('fade-in');
    } else {
      setFinished(true);
    }
  };

  useEffect(() => {
    if (finished) {
      setPage('character');
    }
  }, [finished, setPage]);

  return (
    <div className="questionnaire-container">
      {showIntro ? (
        <div className={`fade-slide ${fadeClass}`}>
          <h2 className="questionText">Now let's generate your tutor based on your interests…</h2>
        </div>
      ) : textAnswers.length < initialQuestions.length ? (
        <div className={`fade-slide ${fadeClass}`}>
          <h2>{initialQuestions[textAnswers.length]}</h2>
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleTextSubmit()}
            className="text-input"
            autoFocus
          />
          <button onClick={handleTextSubmit}>Next</button>
        </div>
      ) : (
        <div className={`fade-slide ${fadeClass}`}>
          <h2>{likeQuestions[step]}</h2>
          <div className="button-group">
            <button onClick={() => handleLikeSubmit("yes")}>Yes</button>
            <button onClick={() => handleLikeSubmit("no")}>No</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Survey;
