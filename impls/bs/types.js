const _ = require("lodash");
const {pr_str} = require("./printer");

class MalValue {
  value;

  constructor(value) {
    this.value = value;
  }

  pr_str() {
    return this.value.toString();
  }

  isEql(other) {
    return this.value === other.value;
  }
}

class MalSequence extends MalValue {
  constructor(ast) {
    super(ast);
    this.ast = ast;
  }

  pr_seq(print_readably = false, brackets = ['(', ')']) {
    const [opening, closing] = brackets;
    return opening + this.ast.map(x => pr_str(x, print_readably)).join(" ") + closing;
  }

  count() {
    return this.ast.length;
  }

  isEql(other) {
    if (!(other instanceof MalSequence)) {
      return false;
    }

    if (this.count() !== other.count()) {
      return false;
    }

    for (let i = 0; i < this.count(); i++) {
      if (!isEql(this.ast[i], other.ast[i])) {
        return false;
      }
    }

    return true;
  }
}

class MalList extends MalSequence {
  #value;

  constructor(value) {
    super(value);
    this.#value = value;
  }

  pr_str() {
    return "(" + this.#value.map(toString).join(" ") + ")";
  }
}

class MalVector extends MalSequence {
  #value;

  constructor(value) {
    super(value);
    this.#value = value;
  }

  pr_str() {
    return "[" + this.#value.map(toString).join(" ") + "]";
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

class MalString extends MalValue {
  #string

  constructor(string) {
    super(string);
    this.#string = string;
  }

  pr_str(print_readably) {
    if (print_readably) {
      return '"' + this.#string
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n") + '"';
    }
    return this.#string;
  }
}

const isEql = (a, b) => {
  if ((a instanceof MalValue) && (b instanceof MalValue)) {
    return a.isEql(b);
  }
  return _.isEqual(a, b);
}

const toString = (x) => (x instanceof MalValue ? x.pr_str() : x);

module.exports = {MalValue, MalList, MalVector, MalHashmap, MalKeyword, MalSymbol, MalString, isEql};
