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

    if (this.#outer !== null && !!this.#outer.find(key)) return this.#outer.#data;
  }

  get(key) {
    const env = this.find(key.value);
    if (env) return env.get(key.value);
  }

  toString() {
    return this.set()
  }
}

module.exports = {Env};