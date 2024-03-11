import cors from 'cors';
import express from 'express';
import expressWs from 'express-ws';
import { ActiveConnections, IncomingMessage } from './types';

const app = express();
expressWs(app);

const port = 8000;

app.use(cors());

const router = express.Router();

const activeConnections: ActiveConnections = {};

router.ws('/draw', (ws, _req, _next) => {
  const id = crypto.randomUUID();
  console.log('Client connected');
  activeConnections[id] = ws;

  ws.on('message', (message) => {
    const parsedMessage = JSON.parse(message.toString()) as IncomingMessage;
    if (parsedMessage.type === 'SEND_DRAWING') {
      Object.values(activeConnections).forEach((connection) => {
        const outgoingMsg = {
          type: 'NEW_DRAWING',
          payload: parsedMessage.payload,
        };
        connection.send(JSON.stringify(outgoingMsg));
      });
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    delete activeConnections[id];
  });
});

app.use(router);

app.listen(port, () => {
  console.log('Server start on port: ', port);
});
