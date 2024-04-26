const {MalSymbol, areEqual, MalList} = require('./types');

class Env {
  constructor(outer = null) {
    this.data = new Map();
    this.outer = outer;
  }

  static create(outer = null, binds = [], exprs = []) {
    const env = new Env(outer);
    const ampersand = new MalSymbol("&");
    for (let i = 0; i < binds.length; i++) {
      if (areEqual(binds[i], ampersand)) {
        const rest = exprs.slice(i);
        env.set(binds[i + 1], new MalList(rest));
        return env;
      }
      env.set(binds[i], exprs[i]);
    }
    return env;
  }

  set(key, malValue) {
    if (!(key instanceof MalSymbol)) {
      throw `${key} not symbol`;
    }
    this.data.set(key.value, malValue);
    return malValue;
  }

  find(key) {
    return (this.data.has(key.value)) ?
      this : this.outer && this.outer.find(key);
  }

  get(key) {
    const env = this.find(key);
    if (env === null) {
      throw `${key.value} not found`
    }

    return env.data.get(key.value);
  }
}

module.exports = Env;