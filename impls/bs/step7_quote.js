const readline = require('readline');
const {
  MalSymbol,
  MalList,
  MalVector,
  MalHashmap,
  MalValue,
  MalNil,
  MalFunction,
  MalString,
} = require('./types');
const Env = require('./env');

const {read_str} = require('./reader');
const {pr_str} = require('./types');
const ns = require("./core");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const loadCustomFns = (env) => {
  rep('(def! load-file (fn* (file_name) (eval (read-string (str "(do " (slurp file_name) "\nnil)")))))', env);
}

const initialiseEnv = () => {
  const env = new Env();
  Object.entries(ns).forEach(([k, v]) => env.set(new MalSymbol(k), v));
  env.set(new MalSymbol('eval'), (ast) => EVAL(ast, env));
  loadCustomFns(env);
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
  if (ast.value.length !== 3) throw "Incorrect number of arguments to def!";

  const [_, key, exp] = ast.value;
  const val = EVAL(exp, env);

  return env.set(key, val);
}

const handleLet = (ast, env) => {
  if (ast.value.length !== 3) throw "Incorrect number of arguments to let*";

  const newEnv = new Env(env);
  const bindings = ast.value[1].value;
  const expr = ast.value[2];

  for (let i = 0; i < bindings.length; i += 2) {
    newEnv.set(bindings[i], EVAL(bindings[i + 1], newEnv));
  }

  return EVAL(expr, newEnv);
}

const handleDo = (ast, env) => {
  return ast.value.slice(1).reduce((_, form) => EVAL(form, env), new MalNil());
}

const handleIf = (ast, env) => {
  const [_, condition, then, otherwise] = ast.value;
  const expr = EVAL(condition, env);
  return (expr === false || expr instanceof MalNil) ? otherwise : then;
}

const handleFn = (ast, env) => {
  const [_, bindings, fnBody] = ast.value;
  const fn = (...args) =>
    EVAL(fnBody, Env.create(env, bindings.value, args));

  return new MalFunction(bindings.value, fnBody, env, fn);
}

const handleQuote = (ast, env) => {
  const [, arg] = ast.value;
  return arg;
}

const handleQuasiquote = (ast) => {
  const unquoteSymbol = new MalSymbol("unquote");

  if (ast instanceof MalList && ast.startsWith(unquoteSymbol))
    return ast.value[1];

  if (ast instanceof MalVector || ast instanceof MalList) {
    let result = new MalList();
    for (let i = ast.value.length - 1; i >= 0; i--) {
      const elt = ast.value[i];

      if ((elt instanceof MalList) && elt.value[0] && elt.value[0].value === "splice-unquote") {
        result = new MalList([new MalSymbol("concat"), elt.value[1], result])
      } else {
        result = new MalList([new MalSymbol("cons"), handleQuasiquote(elt), result])
      }
    }

    if (ast instanceof MalList) return result;
    if (ast instanceof MalVector) return new MalList([new MalSymbol("vec"), result]);
  }

  if ((ast instanceof MalSymbol) || (ast instanceof MalHashmap))
    return new MalList([new MalSymbol("quote"), ast]);

  return ast;
}

const EVAL = (ast, env) => {
  while (true) {
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
        ast = handleIf(ast, env);
        break;
      case firstElement === "fn*":
        return handleFn(ast, env);
      case firstElement === 'quote':
        return handleQuote(ast, env);
      case firstElement === 'quasiquote':
        ast = handleQuasiquote(ast.value[1]);
        break;
      case firstElement === 'quasiquoteexpand':
        return handleQuasiquote(ast.value[1]);
      default:
        const [fn, ...args] = eval_ast(ast, env).value;

        if (fn instanceof MalFunction) {
          ast = fn.fnBody;
          env = Env.create(fn.env, fn.binds, args);
          break;
        }

        if (fn instanceof Function) return fn.apply(null, args);
        throw `${fn} is not a function`;
    }
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

const main = () => {
  const env = initialiseEnv();

  const args = process.argv.slice(3);
  const malArgs = new MalList(args.map(x => new MalString(x)));
  env.set(new MalSymbol("*ARGV*"), malArgs);
  if (process.argv.length <= 2) return repl(env);

  const fileName = process.argv[2];
  const code = `(load-file "${fileName}")`;
  rl.close();
  rep(code, env);
  process.exit(0);
}

main();

