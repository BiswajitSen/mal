class Env {
  #data;
  #outer;

  constructor(outer = null, data = new Map()) {
    this.#outer = outer;
    this.#data = data;
  }

  static create(outer = null, binds = [], exprs = []) {
    const data = new Map();
    let i = 0;
    if (binds && exprs) {
      while (i < binds.length) {
        if (binds[i].value === '&') break;
        data.set(binds[i].value, exprs[i]);
        i++;
      }
    }
    if (i < binds.length) data.set(binds[i + 1].value, exprs.slice(i));
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