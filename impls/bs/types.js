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
  constructor(sequence) {
    super(sequence);
  }

  pr_seq(print_readably = false, brackets = ['(', ')']) {
    const [opening, closing] = brackets;
    return opening + this.value.map(toString).join(" ") + closing;
  }

  count() {
    return this.value.length;
  }

  isEql(other) {
    if (!(other instanceof MalSequence)) {
      return false;
    }

    if (this.count() !== other.count()) {
      return false;
    }

    for (let i = 0; i < this.count(); i++) {
      if (!isEql(this.value[i], other.value[i])) {
        return false;
      }
    }

    return true;
  }
}

class MalList extends MalSequence {

  constructor(value) {
    super(value);
  }

  pr_str(print_readably = false) {
    return this.pr_seq(print_readably);
  }
}

class MalVector extends MalSequence {
  constructor(value) {
    super(value);
  }

  pr_str(print_readably = false) {
    return this.pr_seq(print_readably);
  }
}

class MalHashmap extends MalSequence {

  constructor(value) {
    super(value);
  }

  pr_str(print_readably) {
    return this.pr_seq(print_readably);
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
  constructor(symbol) {
    super(symbol);
  }

  pr_str() {
    return this.value;
  }
}

class MalString extends MalValue {
  constructor(string) {
    super(string);
  }

  pr_str(print_readably) {
    if (print_readably) {
      return '"' + this.value
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n") + '"';
    }
    return this.value;
  }
}

class MalNil extends MalValue {
  constructor() {
    super(false);
  }

  count() {
    return 0;
  }

  pr_str() {
    return "nil";
  }
}

const isEql = (a, b) => {
  if ((a instanceof MalValue) && (b instanceof MalValue)) {
    return a.isEql(b);
  }
  return _.isEqual(a, b);
}

const getCount = (x) => (x instanceof MalValue) ? x.count() : (x && x.length || 0);
const toString = (x) => (x instanceof MalValue ? x.pr_str() : x);

module.exports = {
  MalValue,
  MalList,
  MalVector,
  MalHashmap,
  MalKeyword,
  MalSymbol,
  MalString,
  MalNil,
  isEql,
  getCount
};
