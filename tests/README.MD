Sure, I'll provide a detailed guide on how to use the `tests` folder, focusing on `client.js`, `helper.js`, and the `structures` folder.

### Guide for Using the `tests` Folder

The `tests` folder is designed to help you test the functionality of your handlers and utilities. Here's a detailed guide on how to use each file within the `tests` folder.

### Test Folder Structure

```plaintext
tests/
├── client.js
├── helper.js
├── structures/
│   ├── chat.js
│   ├── group.js
│   └── message.js
```

### Test Scripts

#### `tests/client.js`

This script tests the main handler functions by simulating requests and logging the responses.

**Usage:**

1. **Run the Test Script**

   ```bash
   node tests/client.js
   ```

2. **Expected Output**

   The script will log the responses from the handlers, allowing you to verify their behavior.

   **Example Output:**

   ```plaintext
   Running AI Request Test...
   { response: 'AI Response' }
   Running Chat Request Test...
   { response: 'Chat Response' }
   Running Media Request Test...
   { response: 'Media Response' }
   ```

3. **Contents of `client.js`**

   ```javascript
   import { handleAIRequest } from '../src/handlers/aiHandler';
   import { handleChatRequest } from '../src/handlers/chatHandler';
   import { handleMediaRequest } from '../src/handlers/mediaHandler';

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
   ```

#### `tests/helper.js`

This script contains helper functions for mocking the environment and responses, facilitating easier testing of the handlers.

**Contents of `helper.js`**

```javascript
export function mockFetch(responseData) {
  return jest.fn().mockImplementation(() =>
    Promise.resolve({
      json: () => Promise.resolve(responseData)
    })
  );
}

export function mockEnv() {
  return {
    AI: {
      run: jest.fn().mockResolvedValue({ result: 'Mock AI Response' })
    },
    mediaStorage: {
      get: jest.fn().mockResolvedValue(JSON.stringify({ key: 'value' })),
      put: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined)
    }
  };
}
```

**Usage:**

1. **Mocking Fetch Requests**

   Use `mockFetch` to create a mock fetch function that returns a specified response.

   ```javascript
   const fetchMock = mockFetch({ result: 'Test Response' });
   global.fetch = fetchMock;
   ```

2. **Mocking Environment**

   Use `mockEnv` to create a mock environment object with predefined responses.

   ```javascript
   const env = mockEnv();
   ```

#### `tests/structures/chat.js`

Defines the structure of chat messages for testing purposes.

**Contents of `chat.js`**

```javascript
export function createChatStructure(message) {
  return {
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: message }
    ]
  };
}
```

**Usage:**

1. **Creating a Chat Structure**

   Use `createChatStructure` to generate a chat message structure for testing.

   ```javascript
   const chat = createChatStructure('Hello, Chat!');
   ```

#### `tests/structures/group.js`

Defines the structure of group messages for testing purposes.

**Contents of `group.js`**

```javascript
export function createGroupStructure(groupName, messages) {
  return {
    groupName,
    messages: messages.map((msg) => ({ role: "user", content: msg }))
  };
}
```

**Usage:**

1. **Creating a Group Structure**

   Use `createGroupStructure` to generate a group message structure for testing.

   ```javascript
   const group = createGroupStructure('Test Group', ['Message 1', 'Message 2']);
   ```

#### `tests/structures/message.js`

Defines the structure of individual messages for testing purposes.

**Contents of `message.js`**

```javascript
export function createMessageStructure(content) {
  return { role: "user", content };
}
```

**Usage:**

1. **Creating a Message Structure**

   Use `createMessageStructure` to generate a single message structure for testing.

   ```javascript
   const message = createMessageStructure('Test Message');
   ```

### Running the Tests

To run the tests, follow these steps:

1. **Ensure Dependencies are Installed**

   Make sure you have installed all the necessary dependencies.

   ```bash
   pnpm install
   ```

2. **Run the Test Scripts**

   Use the following command to run the test scripts:

   ```bash
   node tests/client.js
   ```

This will execute the test functions in `client.js` and log the output, allowing you to verify the handlers' behavior.

### Example Output

Here is an example of what the output might look like when running the tests:

```plaintext
Running AI Request Test...
{ response: 'AI Response' }
Running Chat Request Test...
{ response: 'Chat Response' }
Running Media Request Test...
{ response: 'Media Response' }
```

Feel free to modify the test scripts as needed to better fit your testing requirements. This guide should help you get started with testing your handlers and utilities effectively.
