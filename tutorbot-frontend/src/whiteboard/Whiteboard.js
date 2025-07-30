import React, { useRef, useEffect, useState, useContext } from 'react';
import { Stage, Layer, Line, Text, Rect } from 'react-konva';
import './Whiteboard.css';
import Character from './Character';
import { PageContext, RoleContext, UserContext } from '../App';
import axios from 'axios';

const Whiteboard = () => {
  const [userDrawnLines, setUserDrawnLines] = useState([]);
  const isDrawing = useRef(false);
  
  const [loading, setLoading] = useState(false);

  const [isTalking, setIsTalking] = useState(true); // Control character talking state
  const [chatResponse, setChatResponse] = useState('');

  
const { page, setPage } = useContext(PageContext);
const { role, setRole } = useContext(RoleContext);
const { user, setUser } = useContext(UserContext);


  const [texts, setTexts] = useState([]);
  const [rects, setRects] = useState([]);
  const [programmaticLines, setProgrammaticLines] = useState([]);

  const [currentStroke, setCurrentStroke] = useState(null);


    async function startSession(userID) {
        try {
            const response = await axios.post('http://localhost:5000/start', {
            userID: userID
            });

            // Handle the chatbot response
            return response.data.response;
        } catch (error) {
            console.error('Error starting session:', error);
            if (error.response && error.response.data?.error) {
            return `Error: ${error.response.data.error}`;
            }
            return 'An unexpected error occurred.';
        }
    }

    // Function that starts the session and stores the response
  const handleStart = async () => {
    setLoading(true);
    const userID = 'jack'; // hardcoded or pulled from context/auth
    const response = await startSession(userID);
    setChatResponse(response);
    setLoading(false);
  };

  // Automatically run on first render
  useEffect(() => {
    handleStart();
  }, []);


  const handleMouseDown = (e) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setCurrentStroke({
      tool: 'pen',
      points: [pos.x, pos.y],
      stroke: 'black',
      strokeWidth: 2,
      lineCap: 'round',
      lineJoin: 'round',
    });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current || !currentStroke) return;
    const pos = e.target.getStage().getPointerPosition();
    setCurrentStroke((prev) => ({
      ...prev,
      points: [...prev.points, pos.x, pos.y],
    }));
  };

  const handleMouseUp = () => {
    if (currentStroke) {
      setUserDrawnLines((prevLines) => [...prevLines, currentStroke]);
      setCurrentStroke(null);
    }
    isDrawing.current = false;
  };

  const addText = (text, x, y) => {
    setTexts((prev) => [...prev, { text, x, y, fontSize: 20, fill: 'blue' }]);
  };

  const addRect = (x, y, width, height) => {
    setRects((prev) => [...prev, { x, y, width, height, fill: 'rgba(100,100,255,0.5)', stroke: 'black' }]);
  };

  const addProgrammaticLine = (x1, y1, x2, y2) => {
    setProgrammaticLines((prev) => [...prev, { points: [x1, y1, x2, y2], stroke: 'red', strokeWidth: 2 }]);
  };

  const clearBoard = () => {
    setUserDrawnLines([]);
    setProgrammaticLines([]);
    setTexts([]);
    setRects([]);
    setCurrentStroke(null);
  };

const [sendText, setSendText] = useState('');

return (
    <div className="whiteboard-container">
        <div className="sidebar">
            <h2>Jack Gardner</h2>
            {/*<button onClick={() => addText('Hello!', 100, 100)}>Add Text</button>
            <button onClick={() => addRect(150, 150, 100, 60)}>Add Rectangle</button>
            <button onClick={() => addProgrammaticLine(50, 50, 200, 200)}>Add Line</button>*/}

            

            <Character
                sprite="./character/generated.png"
                speechText={chatResponse}
                isTalking={isTalking}
                isLoading={loading}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <input
                    type="text"
                    value={sendText}
                    onChange={e => setSendText(e.target.value)}
                    placeholder="Enter text"
                    style={{ flex: 1 }}
                />
                <button>Send</button>
            </div>

            <button onClick={clearBoard}>Clear Whiteboard</button>
            <button onClick={() => setPage('login')}>Logout</button>
        </div>

        <div className="drawing-area">
            <Stage
                width={window.innerWidth * 0.8}
                height={window.innerHeight}
                onMouseDown={handleMouseDown}
                onMousemove={handleMouseMove}
                onMouseup={handleMouseUp}
                onTouchStart={handleMouseDown}
                onTouchMove={handleMouseMove}
                onTouchEnd={handleMouseUp}
            >
                <Layer>
                    {userDrawnLines.map((line, i) => (
                        <Line key={`user-${i}`} {...line} />
                    ))}
                    {currentStroke && <Line {...currentStroke} />}
                    {programmaticLines.map((line, i) => (
                        <Line key={`prog-${i}`} {...line} />
                    ))}
                    {texts.map((text, i) => (
                        <Text key={`text-${i}`} {...text} />
                    ))}
                    {rects.map((rect, i) => (
                        <Rect key={`rect-${i}`} {...rect} />
                    ))}
                </Layer>
            </Stage>
        </div>
    </div>
);
};

export default Whiteboard;
