const readline = require('readline');
const {read_str} = require('./reader');
const {pr_str} = require('./types');
const {MalSymbol, MalVector, MalList, MalHashmap, MalValue} = require("./types");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const env = {
  '+': (...args) => args.reduce((a, b) => a + b, 0),
  '*': (...args) => args.reduce((a, b) => a * b, 1),
  '-': (a, b) => a - b,
  '/': (a, b) => a / b,
};

const eval_symbol = (symbol) => {
  const val = env[symbol.value];
  if (val) return val;
  throw `'${symbol.value}' symbol not found`;
}

const handleMalDataTypes = (ast, env) => {
  switch (true) {
    case ast.isInstanceOf(MalSymbol):
      return eval_symbol(ast);
    case ast.isInstanceOf(MalVector):
      return new MalVector(ast.value.map((x) => EVAL(x, env)));
    case ast.isInstanceOf(MalList):
      return new MalList(ast.value.map((x) => EVAL(x, env)));
    case ast.isInstanceOf(MalHashmap):
      const hashmap = ast.value;
      const newHashMap = new Map();
      for (const [key, value] of hashmap.entries()) {
        newHashMap.set(key, EVAL(value, env))
      }
      return new MalHashmap(newHashMap);
  }
}

const isMalDataType = (ast) => ast instanceof MalValue
const eval_ast = (ast, env) => (isMalDataType(ast)) ? handleMalDataTypes(ast, env) : ast;

const READ = (str) => read_str(str);

const EVAL = (ast, env) => {
  switch (true) {
    case !(ast instanceof MalList):
      return eval_ast(ast, env);
    case ast.isEmpty():
      return ast;
    default:
      const [fn, ...args] = eval_ast(ast, env).value;
      if (fn instanceof Function) return fn.apply(null, args);

      throw `${fn} is not a function`;
  }
};

const PRINT = (val) => pr_str(val, true);
const rep = (str) => PRINT(EVAL(READ(str), env));

const repl = () => {
  rl.question('user> ', (str) => {
    try {
      console.log(rep(str));
    } catch (e) {
      console.log(e);
    } finally {
      repl();
    }
  });
}

repl();