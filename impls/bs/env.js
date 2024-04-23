class Env {
  #data;
  #outer;

  constructor(outer = null) {
    this.#outer = outer;
    this.#data = new Map();
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