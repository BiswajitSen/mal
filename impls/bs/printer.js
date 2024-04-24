const {MalValue} = require("./types");

const pr_str = (exp, print_readably = false) => {
  switch (true) {
    case exp instanceof MalValue :
      return exp.pr_str(print_readably);
    case exp instanceof Function :
      return "#<function>";
    case exp === null:
      return 'nil';
    default:
      return exp;
  }
}

module.exports = {
  pr_str,
};