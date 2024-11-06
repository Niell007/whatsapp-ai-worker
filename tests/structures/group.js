function createGroupStructure(groupName, messages) {
	return {
	  groupName,
	  messages: messages.map((msg) => ({ role: "user", content: msg }))
	};
  }

  module.exports = { createGroupStructure };
