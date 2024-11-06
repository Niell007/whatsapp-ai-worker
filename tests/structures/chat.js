function createChatStructure(message) {
	return {
	  messages: [
		{ role: "system", content: "You are a helpful assistant." },
		{ role: "user", content: message }
	  ]
	};
  }

  module.exports = { createChatStructure };
