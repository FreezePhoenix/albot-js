module.exports = class ArrayPool {
    #registry;
    #length;
    #buffer;
    #view;
    #free = new Set();
    #used = new Set();
    #empty_handlers = new WeakMap();
    #elements = new WeakMap();
    #iter = this.#free.values();
    constructor(number, length, klass) {
        this.#registry = new FinalizationRegistry(heldValue => {
            this.#cleanup(heldValue);
        });
        this.#length = length;
        this.#buffer = new ArrayBuffer(number * length * klass.BYTES_PER_ELEMENT);
        this.#view = new klass(this.#buffer);
        for(let i = 0; i < number; i++) {
            this.#free.add(this.#view.subarray(i * length, i * length + length));
        }
    }
    allocate() {
        let next = this.#iter.next();
        if(next.done) {
            if(this.#free.size === 0) {
                throw Error("Maximum limit reached!");
            }
            this.#iter = this.#free.values();
            next = this.#iter.next();
        }
        let proxy = Proxy.revocable(new WeakRef(next.value), {
            get: function (oTarget, sKey) {
                return oTarget.deref()[sKey];
            },
            set: function (oTarget, sKey, vValue) {
                return oTarget.deref()[sKey] = vValue;
            },
        });
        this.#empty_handlers.set(proxy.proxy, proxy.revoke);
        this.#elements.set(proxy.proxy, next.value);
        this.#free.delete(next.value);
        this.#used.add(next.value);
        this.#registry.register(proxy.proxy, next.value, next.value);
        return proxy.proxy;
    }
    free(element) {
        if(!this.#empty_handlers.has(element)) {
            throw Error("Element does not belong to this pool!");
        }
        let revoke = this.#empty_handlers.get(element);
        this.#empty_handlers.delete(element);
        let raw = this.#elements.get(element);
        this.#registry.unregister(element);
        revoke();
        this.#cleanup(raw);
    }
    #cleanup(element) {
        this.#used.delete(element);
        this.#free.add(element);
        for(let i = 0; i < this.#length; i++) {
            element[i] = 0;
        }
    }
}