const {Env} = require('./env');
const ns = require('./core');
const readline = require("node:readline");

const {stdin: input, stdout: output} = require("node:process");
const printer = require('./types');
const {read_str} = require("./reader");
const {MalSymbol, MalList, MalVector, MalHashmap, MalValue, MalFunction, MalNil} = require("./types");

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

const handleLet = (ast, env) => {
  const let_env = new Env(env);
  const bindings = ast.value[1].value;
  for (let i = 0; i < bindings.length; i += 2) {
    let_env.set(bindings[i].value, EVAL(bindings[i + 1], let_env));
  }

  return EVAL(ast.value[2], let_env);
}

const handleDef = (ast, env) => {
  const val = EVAL(ast.value[2], env);
  env.set(ast.value[1].value, val);
  return val;
}

const handleIf = (ast, env) => {
  const expr = EVAL(ast.value[1], env);
  return ((expr instanceof MalNil) || expr === false) ? ast.value[3] : ast.value[2];
}

const handleDo = (ast, env) => {
  const [_, ...exprs] = ast.value;
  const [result] = exprs.map((form) => EVAL(form, env)).slice(-1);
  return result;
}

const handleFn = (ast, env) => {
  return new MalFunction(ast.value[1], ast.value[2], env);
}

const EVAL = (ast, env) => {
  while (true) {
    if (!(ast instanceof MalList)) {
      return eval_ast(ast, env);
    }

    if (ast.value.length === 0) {
      return ast;
    }

    const firstValue = ast.value[0].value;
    switch (firstValue) {
      case 'let*':
        return handleLet(ast, env);
      case 'def!':
        return handleDef(ast, env);
      case "if":
        ast = handleIf(ast, env);
        break;
      case "do":
        return handleDo(ast, env);
      case "fn*":
        return handleFn(ast, env);
      default: {
        const [fn, ...args] = eval_ast(ast, env);
        if (fn instanceof MalFunction) {
          env = Env.create(fn.env, fn.binds.value, args);
          ast = fn.fnBody;
        } else {
          return fn.apply(null, args);
        }
      }
    }
  }
};
const PRINT = (str) => printer.pr_str(str);

const rep = (str, env) => PRINT(EVAL(READ(str), env));

const instantiateEnv = () => {
  const repl_env = new Env();
  Object.entries(ns).forEach(([k, v]) => repl_env.set(k, v));
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