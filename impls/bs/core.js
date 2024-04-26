const {pr_str} = require('./types');
const {MalNil, MalString, MalList, areEqual, MalSequence, MalAtom} = require('./types');
const {read_str} = require('./reader');
const fs = require('fs');

const ns = {
  "+": (...args) => args.reduce((a, b) => a + b, 0),
  '*': (...args) => args.reduce((a, b) => a * b, 1),
  '-': (...args) => {
    if (args.length === 1) {
      args.unshift(0);
    }
    return args.reduce((a, b) => a - b);
  },
  '/': (...args) => {
    if (args.length === 1) {
      args.unshift(1);
    }
    return args.reduce((a, b) => a / b);
  },
  '=': (a, b) => areEqual(a, b),
  '<': (a, b) => a < b,
  '<=': (a, b) => a <= b,
  '>': (a, b) => a > b,
  '>=': (a, b) => a >= b,
  'empty?': (a) => a.isEmpty(),
  'not': (x) => {
    if (x instanceof MalNil) return true;
    return (x === 0) ? false : !x
  },
  'count': (x) => (x instanceof MalSequence) ? x.count() : 0,
  'list': (...args) => new MalList(args),
  'list?': (a) => a instanceof MalList,
  'pr-str': (...args) =>
    pr_str(new MalString(args.map(x => pr_str(x, true))
      .join(" ")), true),

  'println': (...args) => {
    const str = args.map(x => pr_str(x, false)).join(" ");
    console.log(str);
    return new MalNil();
  },
  'prn': (...args) => {
    const str = args.map(x => pr_str(x, true)).join(" ");
    console.log(str);
    return new MalNil();
  },
  'str': (...args) => new MalString(args.map(x => pr_str(x, false)).join("")),
  'read-string': (str) => read_str(str.value),
  'slurp': (filename) => new MalString(fs.readFileSync(filename.value, "utf8")),
  'atom': (malData) => MalAtom.create(malData),
  'atom?': (x) => (x instanceof MalAtom),
  'deref': (x) => x.deref(),
  'reset!': (x, value) => x.reset(value),
  'swap!': (x, f, ...args) => x.swap(f, args),
  'cons': (x, y) => {
    if (!y instanceof MalList) throw "can not conj into a non list data type";
    return y.cons(x);
  },
  'concat': (...lists) => {
    return lists.reduce((newList, list) => newList.concat(list), new MalList())
  }
}

module.exports = ns;