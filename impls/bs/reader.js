const {MalNil, MalKeyword, MalString, MalSymbol, MalHashmap, MalVector, MalList} = require("./types");

class Reader {
  #top;

  constructor(tokens) {
    this.tokens = tokens;
    this.#top = 0;
  }

  peek() {
    return this.tokens[this.#top];
  }

  next() {
    return this.tokens[this.#top++]
  }
}

const tokenize = (str) => {
  const re = /[\s,]*(~@|[\[\]{}()'`~^@]|"(?:\\.|[^\\"])*"?|;.*|[^\s\[\]{}('"`,;)]*)/g;
  return [...str.matchAll(re)].map(x => x[1])
    .filter(y => !y.startsWith(';')).filter(y => y !== '' || y !== ' ');
}

const read_atom = (reader) => {
  const token = reader.next();

  if (token.match(/^-?[0-9]+$/)) {
    return parseInt(token);
  }
  if (token.match(/^-?[0-9][0-9.]*$/)) {
    return parseFloat(token);
  }

  if (token === "true") {
    return true;
  }
  if (token === "false") {
    return false;
  }
  if (token === "nil") {
    return new MalNil();
  }

  if (token.startsWith(":")) {
    return new MalKeyword(token.slice(1));
  }

  if (token.match(/^"(\\.|[^\\"])*"$/)) {
    const str = token.slice(1, token.length - 1).replace(/\\(.)/g, function (_, c) {
      return c === "n" ? "\n" : c
    });

    return new MalString(str);
  }

  if (token.startsWith('"')) throw "unbalanced";

  return new MalSymbol(token);
}

const read_seq = (reader, closeSymbol) => {
  const ast = [];
  reader.next();

  while (reader.peek() !== closeSymbol) {
    if (reader.peek() === undefined) {
      throw "unbalanced";
    }
    ast.push(read_form(reader));
  }

  reader.next();
  return ast;
}

const read_list = (reader) => {
  const ast = read_seq(reader, ')');
  return new MalList(ast);
};

const read_vector = (reader) => {
  const ast = read_seq(reader, ']');
  return new MalVector(ast);
};

const read_hashmap = (reader) => {
  const ast = read_seq(reader, '}');

  if (ast.length % 2 !== 0) {
    throw "invalid hashmap pairs !!!";
  }

  const hashmap = new Map();
  for (let i = 0; i < ast.length; i += 2) {
    if ((ast[i] instanceof MalString) || (ast[i] instanceof MalKeyword)) {
      hashmap.set(ast[i], ast[i + 1]);
    } else {
      throw "invalid mapping pair !!!"
    }
  }
  return new MalHashmap(hashmap);
};

const prependSymbol = (reader, symbolStr) => {
  reader.next();
  const symbol = new MalSymbol(symbolStr);
  const newAst = read_form(reader);
  return new MalList([symbol, newAst]);
}

const read_deref = (reader) => {
  return prependSymbol(reader, "deref");
}

const read_quote = (reader) => {
  return prependSymbol(reader, "quote");
}

const read_quasiquote = (reader) => {
  return prependSymbol(reader, "quasiquote");
}

const read_unquote = (reader) => {
  return prependSymbol(reader, "unquote");
}

const read_splice_unquote = (reader) => {
  return prependSymbol(reader, "splice-unquote");
}

const read_form = (reader) => {
  const token = reader.peek();

  switch (token) {
    case '(':
      return read_list(reader);
    case '[':
      return read_vector(reader);
    case '{':
      return read_hashmap(reader);
    case '@':
      return read_deref(reader);
    case "'":
      return read_quote(reader);
    case "`":
      return read_quasiquote(reader);
    case "~":
      return read_unquote(reader);
    case "~@":
      return read_splice_unquote(reader);
    case ']':
      throw 'unbalanced ]';
    case ')':
      throw 'unbalanced )';
    case '}':
      throw 'unbalanced }';
  }

  return read_atom(reader);
}

const read_str = (str) => {
  const tokens = tokenize(str);
  const reader = new Reader(tokens);
  return read_form(reader);
}

module.exports = {read_str, prependSymbol};