import React, { useRef, useState } from 'react';
import { Stage, Layer, Line, Text, Rect } from 'react-konva';
import './Whiteboard.css';

const Whiteboard = () => {
  const [userDrawnLines, setUserDrawnLines] = useState([]);
  const isDrawing = useRef(false);

  const [texts, setTexts] = useState([]);
  const [rects, setRects] = useState([]);
  const [programmaticLines, setProgrammaticLines] = useState([]);

  const [currentStroke, setCurrentStroke] = useState(null);

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
            <h2>Tools</h2>
            {/*<button onClick={() => addText('Hello!', 100, 100)}>Add Text</button>
            <button onClick={() => addRect(150, 150, 100, 60)}>Add Rectangle</button>
            <button onClick={() => addProgrammaticLine(50, 50, 200, 200)}>Add Line</button>*/}

            <button onClick={clearBoard}>Clear Whiteboard</button>
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
