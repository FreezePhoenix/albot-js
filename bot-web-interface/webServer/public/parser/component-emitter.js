class Emitter {
	#callbacks = new Map();
	constructor() {}
	on(event, listener) {
		const callbacks = this.#callbacks.get(event) ?? [];
		callbacks.push(listener);
		this.#callbacks.set(event, callbacks);
		return this;
	}
	once(event, listener) {
		const on = (...args) => {
			this.off(event, on);
			listener.apply(this, args);
		};

		on.fn = listener;
		this.on(event, on);
		return this;
	}
	off(event, listener) {
		if (event === undefined && listener === undefined) {
			this.#callbacks.clear();
			return this;
		}

		if (listener === undefined) {
			this.#callbacks.delete(event);
			return this;
		}

		const callbacks = this.#callbacks.get(event);
		if (callbacks) {
			for (const [index, callback] of callbacks.entries()) {
				if (callback === listener || callback.fn === listener) {
					callbacks.splice(index, 1);
					break;
				}
			}

			if (callbacks.length === 0) {
				this.#callbacks.delete(event);
			} else {
				this.#callbacks.set(event, callbacks);
			}
		}

		return this;
	}
	emit(event, ...args) {
		const callbacks = this.#callbacks.get(event);
		if (callbacks) {
			// Create a copy of the callbacks array to avoid issues if it's modified during iteration
			const callbacksCopy = [...callbacks];
			for (const callback of callbacksCopy) {
				callback.apply(this, args);
			}
		}

		return this;
	}
	listeners(event) {
		return this.#callbacks.get(event) ?? [];
	}
	listenerCount(event) {
		if (event) {
			return this.listeners(event).length;
		}

		let totalCount = 0;
		for (const callbacks of this.#callbacks.values()) {
			totalCount += callbacks.length;
		}

		return totalCount;
	}
	hasListeners(event) {
		return this.listenerCount(event) > 0;
	}
}

// Aliases
Emitter.prototype.emitReserved = Emitter.prototype.emit;
Emitter.prototype.addEventListener = Emitter.prototype.on;
Emitter.prototype.removeListener = Emitter.prototype.off;
Emitter.prototype.removeEventListener = Emitter.prototype.off;
Emitter.prototype.removeAllListeners = Emitter.prototype.off;

if (typeof module !== 'undefined') {
	module.exports = Emitter;
}