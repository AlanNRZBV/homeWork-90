import { useEffect, useRef, useState } from 'react';
import { Layer, Line, Stage } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { IncomingMessage, UserLine } from '../types';


const App = () => {
  const tool = 'pen';
  const [lines, setLines] = useState<UserLine[]>([]);
  const isDrawing = useRef(false);

  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8000/draw');

    ws.current.addEventListener('close', () => console.log('ws closed'));

    ws.current.addEventListener('message', (e) => {
      console.log('in message ', e.data)
      const decodedMessage = JSON.parse(e.data) as IncomingMessage;
      if (decodedMessage.type === 'NEW_DRAWING') {
        setLines(prevState => [...prevState, ...decodedMessage.payload])
      }
    });

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    isDrawing.current = true;
    const pos = e.target.getStage()?.getPointerPosition();
    if (pos) {
      setLines([...lines, { tool, points: [pos.x, pos.y] }]);
    }
  };

  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (!isDrawing.current) {
      return;
    }
    const stage = e.target.getStage();
    const point = stage?.getPointerPosition();

    const lastLine = lines[lines.length - 1];
    if (point) {
      lastLine.points = lastLine.points.concat([point.x, point.y]);
    }
    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
    ws.current?.send(JSON.stringify({type:'SEND_DRAWING', payload: lines}))
  };

  return (
    <div style={{ border: '1px solid black', maxHeight: '50vh' }}>
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
      >
        <Layer>
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke="#df4b26"
              strokeWidth={5}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};
export default App
