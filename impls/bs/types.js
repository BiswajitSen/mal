class MalValue {
  constructor(value) {
    this.value = value;
  }

  isEqual(other) {
    return other === this;
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
    return this.pr_seq(print_readably, ['[', ']']);
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
  constructor(binds, fnBody, env, fn) {
    super();
    this.binds = binds;
    this.fnBody = fnBody;
    this.env = env;
    this.fn = fn;
  }

  pr_str(print_readably = false) {
    return "#<function>";
  }

  apply(context, args) {
    return this.fn.apply(null, args);
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