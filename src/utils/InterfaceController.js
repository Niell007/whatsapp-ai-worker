export class InterfaceController {
	constructor(env) {
		this.env = env;
		this.handlers = new Map();
		this.#setupDefaultHandlers();
	}

	async handleRequest(request) {
		const url = new URL(request.url);
		const handler = this.#getHandler(url.pathname);

		if (!handler) {
			return new Response('Not Found', { status: 404 });
		}

		try {
			return await handler(request);
		} catch (error) {
			return this.#handleError(error);
		}
	}

	#setupDefaultHandlers() {
		this.handlers.set('/health', async () => {
			const status = await this.#checkHealth();
			return new Response(JSON.stringify(status), {
				headers: { 'Content-Type': 'application/json' }
			});
		});

		this.handlers.set('/metrics', async (request) => {
			const metrics = await this.#getMetrics(request);
			return new Response(JSON.stringify(metrics), {
				headers: { 'Content-Type': 'application/json' }
			});
		});
	}

	#getHandler(path) {
		return this.handlers.get(path);
	}

	async #checkHealth() {
		return {
			status: 'healthy',
			timestamp: Date.now(),
			version: '1.0.0'
		};
	}

	async #getMetrics(request) {
		const url = new URL(request.url);
		const type = url.searchParams.get('type');
		const range = parseInt(url.searchParams.get('range')) || 3600000;

		return {
			type,
			range,
			data: await this.env.MONITORING.getMetrics(type, range)
		};
	}

	#handleError(error) {
		console.error('Interface error:', error);
		return new Response(JSON.stringify({
			error: 'Internal Server Error',
			message: error.message
		}), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	registerHandler(path, handler) {
		if (typeof handler !== 'function') {
			throw new Error('Handler must be a function');
		}
		this.handlers.set(path, handler);
	}
}
