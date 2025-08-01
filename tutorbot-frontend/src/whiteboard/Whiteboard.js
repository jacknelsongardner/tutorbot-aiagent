import React, { useRef, useEffect, useState, useContext } from 'react';
import { Stage, Layer, Line, Text, Rect } from 'react-konva';
import './Whiteboard.css';
import Character from './Character';
import { PageContext, RoleContext, UserContext } from '../App';
import axios from 'axios';
import Popup from "./Popup.js"

const Whiteboard = () => {
  const [userDrawnLines, setUserDrawnLines] = useState([]);
  const isDrawing = useRef(false);
  
  const [showPopup, setShowPopup] = useState(true);

  const closePop = () => {
    setShowPopup(false);

  };

  const [loading, setLoading] = useState(false);

  const [isTalking, setIsTalking] = useState(true); // Control character talking state
  const [chatResponse, setChatResponse] = useState({});

    const userWhiteboardRef = useRef();


    const getWhiteboardScreenshot = async () => {
        return userWhiteboardRef.current.toDataURL({
            mimeType: 'image/png',
            pixelRatio: 2,
        });
    };
  
const { page, setPage } = useContext(PageContext);
const { role, setRole } = useContext(RoleContext);
const { user, setUser } = useContext(UserContext);

const [whiteboardContent, setWhiteboardContent] = useState([]);

  const [texts, setTexts] = useState([]);
  const [rects, setRects] = useState([]);
  const [programmaticLines, setProgrammaticLines] = useState([]);

  const [currentStroke, setCurrentStroke] = useState(null);


    async function startSession(userID) {
        try {
            const response = await axios.post('http://localhost:5000/start', {
            userID: userID,
            tutor: user.tutor,
            favorites: user.favorites
            });

            console.log(response.data);

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

    async function sendMessage(userID, message) {
        try {
            const screenshot = await getWhiteboardScreenshot();
            const response = await axios.post('http://localhost:5000/message', {
            userID: userID,
            message: message,
            tutor: user.tutor,
            favorites: user.favorites,
            image: screenshot
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

  const handleSend = async () => {
    setLoading(true);
    const userID = 'jack'; // hardcoded or pulled from context/auth

    const response = await sendMessage(userID, sendText);
    setChatResponse(response);

    setSendText("");
    if (response.clear)
    {
      if (response.clear == true)
      {
        clearAiBoard();
      }
    }

    console.log(response);
    if (response.whiteboard) {
        
        await handleWhiteboardUpdate(response.whiteboard);
    }

    setLoading(false);
  };

const handleWhiteboardUpdate = async (content) => {

    for (const element of content) {
        if (element.type === 'text') {
            console.log("drawing text", element);
            addText(element.content, element.position[0]*3, element.position[1]*3);
        }
        else if (element.type === 'line') {
            addProgrammaticLine(element.from[0]*3, element.from[1]*3, element.to[0]*3, element.to[1]*3);
        }
    };
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

  const clearAiBoard = () => {
    setProgrammaticLines([]);
    setTexts([]);
    setRects([]);
    setCurrentStroke(null);
  };

  const clearUserBoard = () => {
    setUserDrawnLines([]);
    
  };

const [sendText, setSendText] = useState('');

return (
    <div className="whiteboard-container">
        {showPopup && (
          <Popup
            user={user}
            onClose={() => closePop()}
          />
        )}
        
        <div className="sidebar">
            {/*<h2>Jack Gardner</h2>*/}

            <Character
                body="costume/bluebody.GIF"      
                hat={`costume/${user?.tutor?.hat || 'nothing.PNG'}`}         
                glasses={`costume/${user?.tutor?.glasses || 'nothing.PNG'}`}
                holding={`costume/${user?.tutor?.holding || 'nothing.PNG'}`}
                speechText={chatResponse.commentary}
                isTalking={false}
                isLoading={loading}
            />

            <div className="chat-input-container">
                <input
                    type="text"
                    value={sendText}
                    onChange={e => setSendText(e.target.value)}
                    placeholder="Type your message here..."
                    className="chat-input"
                />
                <button onClick={handleSend} className="chat-send-button">Send</button>
            </div>

            <button onClick={clearUserBoard}>Clear Whiteboard</button>
            <button onClick={() => setPage('login')}>Start Over</button>
        </div>
        <div className="drawing-container">
            <div className="whiteboard-wrapper">
                <div className="whiteboard-label">AI Whiteboard</div>
                {loading && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <img src="character/loading.gif" alt="Loading Tutorbot" className="speech-bubble" />
                  </div>
                )}
                
                <Stage
                    width={window.innerWidth * 0.8}
                    height={window.innerHeight * .5}
                    onMouseDown={handleMouseDown}
                    onMousemove={handleMouseMove}
                    onMouseup={handleMouseUp}
                    onTouchStart={handleMouseDown}
                    onTouchMove={handleMouseMove}
                    onTouchEnd={handleMouseUp}
                >


                    <Layer>
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

            <div className="divider" />

            <div className="whiteboard-wrapper">
                <div className="whiteboard-label">User Whiteboard</div>
                <Stage
                    ref={userWhiteboardRef}
                    width={window.innerWidth * 0.8}
                    height={window.innerHeight * .5}
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
                    </Layer>
                </Stage>
            </div>
        </div>`
    </div>
);
};

export default Whiteboard;
