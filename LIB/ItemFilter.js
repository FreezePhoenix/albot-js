class ItemFilter {
	#level = -1;
	#levelMode = '==';
	#names = [];
	#property = true;
	level(level, mode = '==') {
		this.#level = level;
		this.#levelMode = mode;
		return this;
	}
	toString() {
		let parts = [];
		if (this.#names.length == 1) {
			parts.push(`name='${this.#names[0]}'`);
		} else if (this.#names.length > 1) {
			parts.push(`name=['${this.#names.join("','")}']`);
		}
		if (this.#level != -1) {
			parts.push(`level${this.#levelMode}${this.#level}`);
		}
		if (this.#property == false) {
			parts.push('property=null');
		} else if (this.#property != true) {
			parts.push(`property='${this.#property}'`);
		}
		return `ItemFilter(${parts.join(',')})`;
	}
	property(name) {
		this.#property = name;
		return this;
	}
	name(name) {
		if (!this.#names.includes(name) && typeof name == 'string') {
			this.#names.push(name);
		}
		return this;
	}
	names(...names) {
		for (let name of names) {
			this.name(name);
		}
		return this;
	}
	#propertyFilter() {
		if (this.#property === true) {
			return 'true';
		}
		if (this.#property === false) {
			return '(item?.p == null)';
		}
		return `(item?.p == "${this.#property}")`;
	}
	#levelFilter() {
		if (this.#level == -1) {
			return 'true';
		}
		return `(item?.level ${this.#levelMode} ${this.#level})`;
	}
	#nameFilter() {
		if (this.#names.length == 0) {
			throw new Error('ItemFilter.names must not be empty');
		}
		return `(${this.#names
			.map((name) => `item?.name == "${name}"`)
			.join(' || ')})`;
	}
	build() {
		let parts = [
			this.#levelFilter(),
			this.#nameFilter(),
			this.#propertyFilter(),
		].filter((str) => str != 'true');
		let result = Function(`return (item) => ${parts.join(' && ')};`)();
    result.looking = this.#names;
    return result;
	}
	static ofName(name) {
		return new ItemFilter().name(name);
	}
	static toFilter(object) {
		if (object instanceof Function) {
			return object;
		}
		if (object instanceof String) {
			return ofName(object).build();
		}
		return null;
	}
}

module.exports = ItemFilter;
