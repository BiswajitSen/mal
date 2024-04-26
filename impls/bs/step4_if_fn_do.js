const readline = require('readline');
const {MalSymbol, MalList, MalVector, MalHashmap, MalValue, MalNil} = require('./types');
const Env = require('./env');

const {read_str} = require('./reader');
const {pr_str} = require('./types');
const ns = require("./core");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const initialiseEnv = () => {
  const env = new Env();
  Object.entries(ns).forEach(([k, v]) => env.set(new MalSymbol(k), v));
  return env;
}

const eval_symbol = (symbol, env) => {
  const val = env.get(symbol);
  if (val !== undefined) return val;
  throw `'${symbol.value}' symbol not found`;
}

const handleMalDataTypes = (ast, env) => {
  switch (true) {
    case ast.isInstanceOf(MalSymbol):
      return eval_symbol(ast, env);
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
    default:
      return ast;
  }
}

const isMalDataType = (ast) => ast instanceof MalValue
const eval_ast = (ast, env) => (isMalDataType(ast)) ? handleMalDataTypes(ast, env) : ast;

const READ = (str) => read_str(str);

const handleDef = (ast, env) => {
  if (ast.value.length !== 3) {
    throw "Incorrect number of arguments to def!";
  }
  const val = EVAL(ast.value[2], env);
  return env.set(ast.value[1], val);
}

const handleLet = (ast, env) => {
  if (ast.value.length !== 3) {
    throw "Incorrect number of arguments to let*";
  }
  const newEnv = new Env(env);
  const bindings = ast.value[1].value;
  for (let i = 0; i < bindings.length; i += 2) {
    newEnv.set(bindings[i], EVAL(bindings[i + 1], newEnv));
  }

  return EVAL(ast.value[2], newEnv);
}

const handleDo = (ast, env) => {
  return ast.value.slice(1).reduce((_, form) => EVAL(form, env), new MalNil());
}

const handleIf = (ast, env) => {
  const expr = EVAL(ast.value[1], env);
  console.log({expr});
  if (expr === false) {
    const result = EVAL(ast.value[3], env);
    return (result !== undefined) ? result : new MalNil()
  }
  if (expr instanceof MalNil) {
    return EVAL(ast.value[3], env) ? EVAL(ast.value[3], env) : new MalNil();
  }
  return EVAL(ast.value[2], env);
}

const handleFn = (ast, env) => {
  return function (...exprs) {
    const newEnv = Env.create(env, ast.value[1].value, exprs);
    return EVAL(ast.value[2], newEnv);
  }
}

const EVAL = (ast, env) => {
  if (!(ast instanceof MalList)) return eval_ast(ast, env);
  if (ast.isEmpty()) return ast;

  const firstElement = ast.value[0].value;
  switch (true) {
    case firstElement === "def!":
      return handleDef(ast, env);
    case firstElement === "let*":
      return handleLet(ast, env);
    case firstElement === "do":
      return handleDo(ast, env);
    case firstElement === "if":
      return handleIf(ast, env);
    case firstElement === "fn*":
      return handleFn(ast, env);
    default:
      const [fn, ...args] = eval_ast(ast, env).value;
      if (fn instanceof Function) return fn.apply(null, args);
      throw `${fn} is not a function`;
  }
};
const PRINT = (val) => pr_str(val, true);

const rep = (str, env) => PRINT(EVAL(READ(str), env));

const repl = (env) => {
  rl.question('user> ', (str) => {
    try {
      console.log(rep(str, env));
    } catch (e) {
      console.log(e);
    } finally {
      repl(env);
    }
  });
}

repl(initialiseEnv());