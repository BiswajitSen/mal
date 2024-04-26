const readline = require('readline');
const {read_str} = require('./reader');
const {pr_str} = require('./types');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const READ = (str) => read_str(str);
const EVAL = (ast) => ast;
const PRINT = (val) => pr_str(val, true);

const rep = (str) => PRINT(EVAL(READ(str)));

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