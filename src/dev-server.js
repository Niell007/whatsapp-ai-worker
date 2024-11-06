import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { createDispatcher } from './dispatcher.js';
import { MODELS } from './utils/Constants.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.static('public'));

wss.on('connection', (ws) => {
  const dispatcher = createDispatcher({
    AI: {
      // Mock AI binding for local development
      run: async (model, params) => {
        console.log('Local AI mock:', { model, params });
        return { response: 'Local development response' };
      }
    }
  });

  ws.on('message', async (message) => {
    try {
      const response = await dispatcher.dispatchMessage(JSON.parse(message));
      ws.send(JSON.stringify(response));
    } catch (error) {
      console.error('WebSocket error:', error);
      ws.send(JSON.stringify({ error: 'Internal Server Error' }));
    }
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Development server running at http://localhost:${port}`);
});
