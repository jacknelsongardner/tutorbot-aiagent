import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Survey.css';
import { PageContext, RoleContext, UserContext } from '../App';

const initialQuestions = [
  "What's your favorite movie?",
  "What's your favorite TV show?",
  "What's your favorite video game?",
];

const nextQuestions = [
  "How much do you like zelda?",
  "How much do you like star wars?",
  "How much do you like harry potter?",
];

function Survey() {
  const [showIntro, setShowIntro] = useState(true);
  const [step, setStep] = useState(0);
  const [textAnswers, setTextAnswers] = useState([]);
  const [sliderQuestions, setSliderQuestions] = useState([]);
  const [sliderAnswers, setSliderAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [finished, setFinished] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [fadeClass, setFadeClass] = useState('fade-in');

  useEffect(() => {
    // Auto-fade-out intro after 2 seconds
    if (showIntro) {
      setTimeout(() => {
        setFadeClass('fade-out');
        setTimeout(() => {
          setShowIntro(false);
          setFadeClass('fade-in');
        }, 1000);
      }, 2000);
    }
  }, [showIntro]);

  const handleTextSubmit = async () => {
    setFadeClass('fade-out');
    setTimeout(async () => {
      const updatedAnswers = [...textAnswers, inputValue];
      setTextAnswers(updatedAnswers);
      setInputValue('');

      if (step < initialQuestions.length - 1) {
        setStep(prev => prev + 1);
        setFadeClass('fade-in');
      } else {
        setIsSubmitting(true);
        try {
          const res = nextQuestions; // simulate fetch
          setSliderQuestions(nextQuestions);
          setStep(0);
        } catch (err) {
          console.error("Failed to get slider questions", err);
        } finally {
          setIsSubmitting(false);
          setFadeClass('fade-in');
        }
      }
    }, 300); // match CSS duration
  };

  const handleSliderSubmit = () => {
    setFadeClass('fade-out');
    setTimeout(() => {
      if (step < sliderQuestions.length - 1) {
        setStep(prev => prev + 1);
        setFadeClass('fade-in');
      } else {
        setFinished(true);
      }
    }, 300);
  };

  if (isSubmitting) {
    return <div className="fade-slide fade-in">Loading next questions...</div>;
  }

  if (finished) {
    return <div className="fade-slide fade-in">Creating your avatar…</div>;
  }

  return (
    <div className="questionnaire-container">
      {showIntro ? (
        <div className={`fade-slide ${fadeClass}`}>
          <h2>Now let's generate your tutor…</h2>
        </div>
      ) : sliderQuestions.length === 0 ? (
        <div className={`fade-slide ${fadeClass}`}>
          <h2>{initialQuestions[step]}</h2>
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
          <h2>{sliderQuestions[step]}</h2>
          <input
            type="range"
            min="0"
            max="10"
            value={sliderAnswers[sliderQuestions[step]] || 5}
            onChange={e =>
              setSliderAnswers({
                ...sliderAnswers,
                [sliderQuestions[step]]: parseInt(e.target.value),
              })
            }
          />
          <p>{sliderAnswers[sliderQuestions[step]] || 5}</p>
          <button onClick={handleSliderSubmit}>Next</button>
        </div>
      )}
    </div>
  );
}

export default Survey;
