export class WebSocketManagerService {
  constructor(env) {
    this.env = env;
    this.connections = new Map();
    this.heartbeatInterval = 30000; // 30 seconds
  }

  async handleConnection(ws, sessionId) {
    // Store connection
    this.connections.set(sessionId, {
      ws,
      lastHeartbeat: Date.now()
    });

    // Set up heartbeat
    this.#setupHeartbeat(sessionId);

    // Handle messages
    ws.addEventListener('message', async (event) => {
      try {
        const data = JSON.parse(event.data);
        await this.#handleWebSocketMessage(sessionId, data);
      } catch (error) {
        console.error('WebSocket message handling error:', error);
      }
    });

    // Handle closure
    ws.addEventListener('close', () => {
      this.#handleDisconnection(sessionId);
    });
  }

  async #setupHeartbeat(sessionId) {
    const interval = setInterval(() => {
      const connection = this.connections.get(sessionId);
      if (!connection) {
        clearInterval(interval);
        return;
      }

      if (Date.now() - connection.lastHeartbeat > this.heartbeatInterval * 2) {
        this.#handleDisconnection(sessionId);
        clearInterval(interval);
        return;
      }

      connection.ws.send(JSON.stringify({ type: 'ping' }));
    }, this.heartbeatInterval);
  }

  async #handleWebSocketMessage(sessionId, data) {
    const connection = this.connections.get(sessionId);
    if (!connection) return;

    switch (data.type) {
      case 'pong':
        connection.lastHeartbeat = Date.now();
        break;
      case 'message':
        await this.env.MESSAGE_PROCESSOR.processMessage(data.message, sessionId);
        break;
      case 'restore_session':
        await this.#handleSessionRestore(sessionId, data.session);
        break;
    }
  }

  async #handleSessionRestore(sessionId, sessionData) {
    try {
      await this.env.WHATSAPP_SERVICE._restoreSession(sessionId, sessionData);
      this.sendToClient(sessionId, {
        type: 'status',
        status: 'connected'
      });
    } catch (error) {
      console.error('Session restore error:', error);
      this.sendToClient(sessionId, {
        type: 'error',
        message: 'Failed to restore session'
      });
    }
  }

  async #handleDisconnection(sessionId) {
    this.connections.delete(sessionId);
    this.env.WHATSAPP_SERVICE.disconnectClient(sessionId);
  }

  sendToClient(sessionId, data) {
    const connection = this.connections.get(sessionId);
    if (connection?.ws.readyState === WebSocket.OPEN) {
      connection.ws.send(JSON.stringify(data));
    }
  }
}
