const ns = {
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '*': (a, b) => a * b,
  '/': (a, b) => a / b,
  '=': (a, b) => a === b,
  '<': (a, b) => a < b,
  '<=': (a, b) => (a <= b),
  '>': (a, b) => (a > b),
  'and': (a, b) => (a && b),
  '>=': (a, b) => (a >= b)
};

module.exports = ns;