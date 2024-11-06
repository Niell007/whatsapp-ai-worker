function parseJSONResponse(response) {
	return response.json().catch(() => ({}));
  }

  function createChatMessage(role, content) {
	return { role, content };
  }

  module.exports = { parseJSONResponse, createChatMessage };
