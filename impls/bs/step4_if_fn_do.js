const {Env} = require('./env');

const readline = require("node:readline");
const {stdin: input, stdout: output} = require("node:process");

const printer = require("./printer");
const {read_str} = require("./reader");
const {MalSymbol, MalList, MalVector, MalHashmap, MalValue} = require("./types");

const rl = readline.createInterface({input, output});

const READ = (str) => read_str(str);

const eval_ast = (ast, env) => {
  switch (true) {
    case ast instanceof MalList:
      return ast.value.map((token) => EVAL(token, env));
    case ast instanceof MalSymbol:
      return env.get(ast);
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

  if (ast.value[0].value === 'let*') {
    const let_env = new Env(env);
    const bindings = ast.value[1].value;
    for (let i = 0; i < bindings.length; i += 2) {
      let_env.set(bindings[i].value, EVAL(bindings[i + 1], let_env));
    }

    return EVAL(ast.value[2], let_env);
  }

  if (ast.value[0].value === 'def!') {
    const val = EVAL(ast.value[2], env);
    env.set(ast.value[1].value, val);
    return val;
  }

  if (ast.value[0].value === "if") {
    const expr = EVAL(ast.value[1], env);

    if (expr === null || expr === false) {
      return EVAL(ast.value[3], env);
    }
    return EVAL(ast.value[2], env);
  }

  if (ast.value[0].value === "do") {
    const [_, ...exprs] = ast.value;
    const [result] = exprs.map((form) => EVAL(form, env)).slice(-1);
    return result;
  }

  if (ast.value[0].value === "fn*") {
    return (...args) => {
      const localEnv = Env.create(env, ast.value[1].value, [...args]);
      return EVAL(ast.value[2], localEnv);
    };
  }

  const [fn, ...args] = eval_ast(ast, env);

  if (fn instanceof Function) {
    return fn.apply(null, args);
  }
};

const PRINT = (str) => printer.pr_str(str);

const rep = (str, env) => PRINT(EVAL(READ(str), env));

const instantiateEnv = () => {
  const repl_env = new Env();
  repl_env.set('+', (a, b) => a + b);
  repl_env.set('-', (a, b) => a - b);
  repl_env.set('*', (a, b) => a * b);
  repl_env.set('/', (a, b) => a / b);

  return repl_env;
}
const env = instantiateEnv();
const repl = () => {
  rl.question("user> ", (input) => {
    try {
      console.log(rep(input, env));
    } catch (e) {
      console.log(e);
    }

    repl();
  });
};

repl();
