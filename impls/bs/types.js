class MalValue {
  constructor(value) {
    this.value = value;
  }

  isEqual(other) {
    return other.value === this.value;
  }

  isInstanceOf(className) {
    return (this instanceof className);
  }
}

class MalSequence extends MalValue {
  constructor(value) {
    super(value);
  }

  pr_seq(print_readably = false, brackets = ['(', ')']) {
    const [opening, closing] = brackets;
    return opening + this.value.map(x => pr_str(x, print_readably)).join(" ") + closing;
  }

  isEmpty() {
    return this.value.length === 0;
  }

  count() {
    return this.value.length;
  }

  nth(n) {
    if (n === 0 && this.value.length === 0) return new MalNil();
    if (n >= this.value.length) {
      throw "index out of bound";
    }

    return this.value[n];
  }

  first() {
    return this.nth(0)
  }

  rest() {
    if (this.value.length === 0) {
      return new MalList([]);
    }
    return new MalList(this.value.slice(1));
  }

  isEqual(other) {
    if (!(other instanceof MalSequence)) {
      return false;
    }

    if (this.count() !== other.count()) {
      return false;
    }

    for (let i = 0; i < this.count(); i++) {
      if (!areEqual(this.value[i], other.value[i])) {
        return false;
      }
    }

    return true;
  }
}

class MalList extends MalSequence {
  constructor(value = []) {
    super(value);
  }

  pr_str(print_readably = false) {
    return this.pr_seq(print_readably);
  }

  cons(val) {
    return new MalList([val, ...this.value]);
  }

  concat(anotherList) {
    return new MalList([...this.value, ...anotherList.value]);
  }

  startsWith(symbol) {
    return areEqual(this.value[0], symbol);
  }
}

class MalVector extends MalSequence {
  constructor(value) {
    super(value);
  }

  pr_str(print_readably = false) {
    return this.pr_seq(print_readably, ['[', ']']);
  }

  cons(val) {
    return new MalList([val, ...this.value]);
  }
}

class MalHashmap extends MalValue {
  constructor(value) {
    super(value);
  }

  pr_str(print_readably = false) {
    let str = "";
    let separator = "";
    for (const [key, value] of this.value.entries()) {
      str = str + separator + pr_str(key, print_readably) + " " + pr_str(value, print_readably);
      separator = " ";
    }
    return "{" + str + "}";
  }

  get(key) {
    return this.value.get(key) || new MalNil();
  }

  contains(key) {
    return this.value.has(key);
  }

  keys() {
    return this.value.keys();
  }

  vals() {
    return this.value.value();
  }

  first() {
    return 'ok'
  }
}

class MalNil extends MalValue {
  constructor() {
    super("nil");
  }

  pr_str(print_readably = false) {
    return "nil";
  }

  isEqual(other) {
    return other instanceof MalNil;
  }

  rest() {
    return new MalList();
  }
}

class MalString extends MalValue {
  constructor(value) {
    super(value);
  }

  pr_str(print_readably = false) {
    if (print_readably) {
      return '"' + this.value
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n") + '"';
    }
    return this.value;
  }

  isEqual(other) {
    return (other instanceof MalString) && this.value === other.value;
  }
}

class MalKeyword extends MalValue {
  constructor(value) {
    super(value);
  }

  static create(val) {
    if (val instanceof MalValue)
      return new MalKeyword(val.value);
    return new MalKeyword(val);
  }

  pr_str(print_readably = false) {
    return ':' + this.value;
  }

  isEqual(other) {
    return (other instanceof MalKeyword) && this.value === other.value;
  }

}

class MalSymbol extends MalValue {
  constructor(value) {
    super(value);
  }

  pr_str(print_readably = false) {
    return this.value;
  }

  isEqual(other) {
    return (other instanceof MalSymbol) && this.value === other.value;
  }
}

class MalFunction extends MalValue {
  constructor(binds, fnBody, env, fn, is_macro = false) {
    super();
    this.binds = binds;
    this.fnBody = fnBody;
    this.env = env;
    this.fn = fn;
    this.is_macro = is_macro;
  }

  pr_str(print_readably = false) {
    return "#<function>";
  }

  apply(context, args) {
    return this.fn.apply(context, args) || new MalNil();
  }
}

class MalAtom extends MalValue {
  constructor(value) {
    super(value)
    console.log(this.value);
  }

  static create(malData) {
    return new MalAtom(malData);
  }

  pr_str(print_readably = false) {
    return "(" + "atom " + pr_str(this.value, print_readably) + ")";
  }

  isEqual(other) {
    return (other instanceof MalAtom) && super.isEqual(other);
  }

  deref() {
    return this.value;
  }

  reset(newValue) {
    this.value = newValue;
    return this.value;
  }

  swap(fn, args) {
    console.log({args});
    this.value = fn.apply(null, [this.value, ...args]);
    return this.value;
  }
}

const pr_str = (val, print_readably = false) => {
  if (val instanceof MalValue) {
    return val.pr_str(print_readably);
  }

  if (val instanceof Function) {
    return "#<function>";
  }

  return val;
}

const areEqual = (a, b) => {
  if ((a instanceof MalValue) && (b instanceof MalValue)) {
    return a.isEqual(b);
  }
  return a === b;
}

module.exports = {
  MalValue,
  MalSequence,
  MalList,
  MalVector,
  MalString,
  MalKeyword,
  MalSymbol,
  MalHashmap,
  MalFunction,
  MalNil,
  MalAtom,
  pr_str,
  areEqual
}