const readline = require("node:readline");
const { stdin: input, stdout: output, env } = require("node:process");

const printer = require("./printer");
const { read_str } = require("./reader");
const { MalSymbol, MalList, MalVector, MalHashmap, MalValue } = require("./types");

const rl = readline.createInterface({ input, output });

const repl_env = {
  "+": (a, b) => a + b,
  "-": (a, b) => a - b,
  "*": (a, b) => a * b,
  "/": (a, b) => a / b,
};

const READ = (str) => read_str(str);

const eval_ast = (ast, env) => {
  switch (true) {
    case ast instanceof MalList:
      return ast.value.map((token) => EVAL(token, env));
    case ast instanceof MalSymbol: {
      const symbolBinding = env[ast.value] || ast.value;
      if (symbolBinding) return symbolBinding;
      throw new Error("no value is found");
    }
    case ast instanceof MalVector:
      return new MalVector(ast.value.map((token) => EVAL(token, env)));

    case ast instanceof MalHashmap:
      return new MalHashmap(ast.value.map((token) => EVAL(token, env)))
    default:
      return ast;
  }
};

const EVAL = (ast, env) => {
  if (!(ast instanceof MalList)) {
    return eval_ast(ast, env);
  }

  if (ast.value.length === 0) {
    return ast;
  }

  const [fn, ...args] = eval_ast(ast, env);

  if (fn instanceof Function) {
    return fn.apply(null, args);
  }
};

const PRINT = (str) => printer.pr_str(str);

const rep = (str, env) => PRINT(EVAL(READ(str), env));

const repl = () => {
  rl.question("user> ", (input) => {
    try {
      console.log(rep(input, repl_env));
    } catch (e) {
      console.log(e);
    }

    repl();
  });
};

repl();
