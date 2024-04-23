class MalValue {
  value;
  constructor(value) {
    this.value = value;
  }

  pr_str() {
    return this.value.toString();
  }
}

  class MalVector extends MalValue {
  #value;
  constructor(value) {
    super(value);
    this.#value = value;
  }

  pr_str() {
    return "[" + this.#value.map(toString).join(" ") + "]";
  }
}

class MalList extends MalValue {
  #value;
  constructor(value) {
    super(value);
    this.#value = value;
  }

  pr_str() {
    return "(" + this.#value.map(toString).join(" ") + ")";
  }
}

class MalHashmap extends MalValue {
  #value
  constructor(value) {
    super(value);
    this.#value = value;
  }

  pr_str() {
    return "{" + this.#value.map(toString).join(" ") + "}";
  }
}

class MalKeyword extends MalValue {
  #keyword;
  constructor(keyword) {
    super(keyword);
    this.#keyword = keyword;
  }

  pr_str() {
    return ':' + this.#keyword;
  }
}

class MalSymbol extends MalValue {
  #symbol
  constructor(symbol) {
    super(symbol);
    this.#symbol = symbol;
  }

  pr_str() {
    return this.#symbol;
  }
}

const toString = (x) => (x instanceof MalValue ? x.pr_str() : x);

module.exports = {MalValue, MalList, MalVector, MalHashmap, MalKeyword, MalSymbol};
