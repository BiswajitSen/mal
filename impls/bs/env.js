class Env {
  #data;
  #outer;

  constructor(outer = null, data = new Map()) {
    this.#outer = outer;
    this.#data = data;
  }

  static create(outer = null, binds, exprs) {
    const data = new Map();
    if (binds && exprs) {
      for (let i = 0; i < binds.length; i++) {
        data.set(binds[i].value, exprs[i]);
      }
    }
    return new Env(outer, data);
  }

  set(key, value) {
    this.#data.set(key, value);
  }

  find(key) {
    if (this.#data.has(key)) {
      return this.#data;
    }

    return this.#outer && this.#outer.find(key);
  }

  get(key) {
    const env = this.find(key.value);
    if (env === null) throw new Error(`${key.value} not found`);
    if (env) return env.get(key.value);
  }

  toString() {
    return this.set()
  }
}

module.exports = {Env};