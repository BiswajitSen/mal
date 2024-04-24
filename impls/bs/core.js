const _ = require('lodash');
const {pr_str} = require("./printer");
const {MalList, MalValue, isEql} = require("./types");

const ns = {
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '*': (a, b) => a * b,
  '/': (a, b) => a / b,
  '=': (a, b) => {
    return isEql(a, b)
  },
  '<': (a, b) => a < b,
  '<=': (a, b) => (a <= b),
  '>': (a, b) => (a > b),
  'and': (a, b) => (a && b),
  '>=': (a, b) => (a >= b),
  'list': (...args) => new MalList([...args]),
  'list?': (x) => (x instanceof Array) || (x instanceof MalList),
  'count': (x) => {
    if (x instanceof MalValue) return x.value.length || 0;
    return x && x.length || 0;
  },
  'empty?': (x) => {
    if (x instanceof MalValue) return x.value.length === 0;
    return (x.length === 0)
  },
  'prn': (...args) => {
    const output = args.map(x => x.value ? `"${x.value}"` : x).join(' ');
    console.log(output);
    return null;
  },
  'println': (x) => {
    x && console.log(x);
    return 'nil';
  },
  'str': (x) => pr_str(x),
  'pr-str': (x) => {
    if (x instanceof MalValue) return x.pr_str(x, true);
    return x ? x : `""`;
  },
  'not': (x) => (x === 0) ? false : !x,
};

module.exports = ns;