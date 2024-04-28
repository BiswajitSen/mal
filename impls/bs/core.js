const {pr_str, MalVector, MalSymbol, MalHashmap, MalKeyword} = require('./types');
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
  'concat': (...lists) => lists.reduce((newList, list) => newList.concat(list), new MalList()),
  'vec': (list) => new MalVector(list.value),
  'nth': (seq, n) => {
    if (seq instanceof MalSequence) seq.nth(n)
    return seq[n];
  },
  'first': (seq) => {
    if (seq instanceof MalNil) return seq;
    if (seq instanceof MalSequence) seq.first()
    return seq[0];
  },
  'rest': (seq) => (seq === MalNil) ? new MalList([]) : seq.rest(),
  'symbol': (val) => new MalSymbol(val),
  'symbol?': (x) => x instanceof MalSymbol,
  'keyword': (x) => MalKeyword.create(x),
  'keyword?': (x) => x instanceof MalKeyword,
  'sequential?': (x) => x instanceof MalSequence,
  'hash-map': (...args) => {
    if (args.length % 2 !== 0) throw 'odd number of arguments'
    const kvPairs = new Map();
    for (let i = 0; i < args.length; i += 2) {
      kvPairs.set(args[i], args[i + 1]);
    }
    return new MalHashmap(kvPairs);

  },
  'contains?': (hm, key) => hm.contains(key),
  'keys': (hm) => hm.keys(),
  'nil?': (x) => x instanceof MalNil,
  'true?': (x) => x,
  'false?': (x) => !x,
  'vector?': (x) => x instanceof MalVector,
  'map?': (x) => x instanceof MalHashmap,
}

module.exports = ns;