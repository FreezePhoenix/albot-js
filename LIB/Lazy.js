module.exports = class Lazy {
  #iterable = null;
  #functions = [];
  #conditionals = [];
  #takeCount = Infinity;
  #triage = null;
  constructor(iterable) {
    this.#iterable = iterable;
  }
  take(quantity) {
    this.#takeCount = quantity;
    return this;
  }
  filter(predicate) {
    this.#functions.push({
      value: predicate,
      type: "filter"
    });
    return this;
  }
  map(consumer) {
    this.#functions.push({
      value: consumer,
      type: "map"
    });
    return this;
  }
  while(conditional) {
    this.#conditionals.push(conditional);
    return this;
  }
  *[Symbol.iterator]() {
    let iterator = this.#iterable[Symbol.iterator]();
    let found = 0;
    let current = iterator.next();
    while (!current.done && found < this.#takeCount) {
      let value = current.value;
      for (let i = 0; i < this.#conditionals.length; i++) {
        let condition = this.#conditionals[i];
        if (!condition()) {
          return null;
        }
      }
      let filter_failed = false;
      for (let i = 0, len = this.#functions.length; i < len; i++) {
        let func = this.#functions[i];
        if (func.type === "filter") {
          if (func.value(value)) {
            continue;
          }
          filter_failed = true;
          break;
        } else if (func.type === "map") {
          value = func.value(value);
        }
      }
      if (!filter_failed) {
        found++;
        yield value;
      }
      current = iterator.next();
    }
    return null;
  }
  forEach(consumer) {
    let iter = this[Symbol.iterator](),
      current = iter.next(),
      cont = true;
    while (!current.done && cont) {
      cont = consumer(current.value);
      current = iter.next();
    }
  }
  /**
   *
   */
  find(filter) {
    let iterator = this.#iterable[Symbol.iterator]();
    let found = 0;
    let current = iterator.next();
    while (!current.done && found < this.#takeCount) {
      let value = current.value;
      for (let i = 0; i < this.#conditionals.length; i++) {
        let condition = this.#conditionals[i];
        if (!condition()) {
          return null;
        }
      }
      let filter_failed = false;
      for (let i = 0, len = this.#functions.length; i < len; i++) {
        let func = this.#functions[i];
        if (func.type === "filter") {
          if (func.value(value)) {
            continue;
          }
          filter_failed = true;
          break;
        } else if (func.type === "map") {
          value = func.value(value);
        }
      }
      if (!filter_failed && filter(value)) {
        found++;
        return value;
      }
      current = iterator.next();
    }
    return null;
  }
  /**
   * For full functionality, it is recommended to use the iterator instead of ._value(). However, both exhibit Lazy behavior.
   */
  value() {
    if (this.#takeCount < 1) {
      return null;
    } else if (this.#takeCount == 1) {
      return this[Symbol.iterator]().next().value;
    }
    return [...this];
  }
  /**
   *
   */
  first() {
    return this[Symbol.iterator]().next().value;
  }
}