function mockFetch(responseData) {
	return jest.fn().mockImplementation(() =>
	  Promise.resolve({
		json: () => Promise.resolve(responseData)
	  })
	);
  }

  function mockEnv() {
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

  module.exports = { mockFetch, mockEnv };
