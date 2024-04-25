const _ = require('lodash');
const {pr_str} = require("./printer");
const {MalList, MalValue, isEql, getCount, MalNil} = require("./types");
const {read_str} = require("./reader");
const {readFileSync} = require("fs");

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
  'count': (x) => getCount(x),
  'empty?': (x) => {
    if (x instanceof MalValue) return x.value.length === 0;
    return (x.length === 0)
  },
  'prn': (...args) => {
    const output = args.map(x => x.value ? x.value : x).join(' ');
    console.log(output);
    return 'nil';
  },
  'println': (...args) => {
    const str = args.map(x => pr_str(x)).join(" ");
    console.log(str);
    return null;
  },
  'str': (...x) => {
    const output = x.map(a => a.value).join("")
    return output || `""`;
  },
  'pr-str': (...x) => {
    const output = [];
    x.forEach(token => {
      if (token instanceof MalValue) output.push(token.pr_str(x, true));
    });

    return output.join(' ') || '""';
  },
  'not': (x) => {
    if (x instanceof MalNil) return true;
    return (x === 0) ? false : !x
  },
  'read-string': (x) => {
    console.log(x.value);
    read_str(x.value)
  },
  'slurp': (fileName) => {
    return readFileSync(fileName, {encoding: "utf-8"})
  }
};

module.exports = ns;