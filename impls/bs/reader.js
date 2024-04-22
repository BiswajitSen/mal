const { MalSymbol, MalList } = require("./types");

class Reader {
  #tokens;
  #top;

  constructor(tokens = []) {
    this.#tokens = tokens;
    this.#top = 0;
  }

  peek() {
    return this.#tokens[this.#top];
  }

  next() {
    return this.#tokens[this.#top++];
  }
}

const tokenize = (code) => {
  const regex = /[\s,]*(~@|[\[\]{}()'`~^@]|"(?:\\.|[^\\"])*"?|;.*|[^\s\[\]{}('"`,;)]*)/g;
  return [...code.trim().matchAll(regex)].map((token) => token[1]).filter((ele) => ele !== '');
}
  
const read_atom = (reader) => {
  const token = reader.next();
  switch(true) {
    case token.match(/^-?[0-9][0-9.]*$/): return new Number(token);
    case token === 'true': return true;
    case token === 'false': return false;
    default: return new MalSymbol(token);
  }
}

const read_list = (reader) => {
  const ast = [];
  reader.next();

  while(reader.peek() !== ')') {
    if(reader.peek() === undefined) throw new Error("unbalanced");
    ast.push(read_form(reader));
  }
  reader.next();

  return new MalList(ast);
}

const read_form = (reader) => {
  if(reader.peek() === '(') return read_list(reader);
  return read_atom(reader);
}

const read_str = (code) => {
    const reader = new Reader(tokenize(code));
    return read_form(reader);
}

module.exports = {read_str}