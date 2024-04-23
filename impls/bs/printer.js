const {MalValue} = require("./types");

const pr_str = (exp) => {
  switch (true) {
    case exp instanceof MalValue :
      return exp.pr_str();
    case exp instanceof Function :
      return "#<function>";
    default:
      return exp;
  }
}

module.exports = {
  pr_str,
};