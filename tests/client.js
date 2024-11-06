const { handleAIRequest } = require('../src/handlers/aiHandler');
const { handleChatRequest } = require('../src/handlers/chatHandler');
const { handleMediaRequest } = require('../src/handlers/mediaHandler');

async function testAIRequest() {
  const request = new Request('http://localhost/ai', {
    method: 'POST',
    body: JSON.stringify({ message: 'Hello, AI!' }),
    headers: { 'Content-Type': 'application/json' }
  });

  const response = await handleAIRequest(request);
  console.log(await response.json());
}

async function testChatRequest() {
  const request = new Request('http://localhost/chat', {
    method: 'POST',
    body: JSON.stringify({ message: 'Hello, Chat!' }),
    headers: { 'Content-Type': 'application/json' }
  });

  const response = await handleChatRequest(request, { AI: { run: () => ({ result: 'Chat Response' }) } });
  console.log(await response.json());
}

async function testMediaRequest() {
  const request = new Request('http://localhost/media', {
    method: 'POST',
    body: JSON.stringify({ mediaUrl: 'http://example.com/media.jpg' }),
    headers: { 'Content-Type': 'application/json' }
  });

  const response = await handleMediaRequest(request, { AI: { run: () => ({ result: 'Media Response' }) } });
  console.log(await response.json());
}

testAIRequest();
testChatRequest();
testMediaRequest();
