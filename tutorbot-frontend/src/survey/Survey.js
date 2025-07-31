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
    setTextAnswers(updatedAnswers);
    setInputValue('');

    try {
      const entitymovie = await searchEntities('movie', updatedAnswers[0], 2);
        setUser({
          ...user,
          favorites: [...(user.favorites || []), entitymovie[0]],
        });
    } catch (err) {
      console.error('Failed to search entities:', err);
    }

    if (step < initialQuestions.length - 1) {
      setStep(step + 1);
      setFadeClass('fade-in');
    } else {
      setStep(0);


      let possibleMovies = await findRelatedEntities('movie', user.favorites.map(m => m.entity_id), 1990, 2025, 2)
      let possibleVideoGames = await findRelatedEntities('videogame', user.favorites.map(g => g.entity_id), 1990, 2025, 2)
      let possibleTVShows = await findRelatedEntities('tv_show', user.favorites.map(s => s.entity_id), 1990, 2025, 2)


        console.log(user.favorites);

        likeQuestions.length = 0;
        possibleMovies.forEach(movie => likeQuestions.push(`Do you like the movie "${movie.name}"?`));
        possibleTVShows.forEach(show => likeQuestions.push(`Do you like the TV show "${show.name}"?`));
        possibleVideoGames.forEach(game => likeQuestions.push(`Do you like the video game "${game.name}"?`));

        possibleMovies.forEach(movie => possibleFavorites.push(movie));
        possibleTVShows.forEach(show => possibleFavorites.push(show));
        possibleVideoGames.forEach(game => possibleFavorites.push(game));


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
          <h2 className="questionText">Now let's generate your tutor…</h2>
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
