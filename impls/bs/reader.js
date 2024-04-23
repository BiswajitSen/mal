const {
  MalList,
  MalVector,
  MalHashmap,
  MalKeyword,
  MalSymbol,
} = require("./types");

class Reader {
  #tokens;
  #top;

  constructor(tokens) {
    this.#tokens = tokens;
    this.#top = 0;
  }

  next() {
    return this.#tokens[this.#top++];
  }

  peek() {
    return this.#tokens[this.#top];
  }
}

const tokenize = (sourceCode) => {
  const regex =
    /[\s,]*(~@|[\[\]{}()'`~^@]|"(?:\\.|[^\\"])*"?|;.*|[^\s\[\]{}('"`,;)]*)/g;
  return [...sourceCode.matchAll(regex)].map((x) => x[1]).slice(0, -1);
};

const prependSymbol = (reader, symbolStr) => {
  const symbol = new MalSymbol(symbolStr);
  const ast = read_form(reader);
  return new MalList([symbol, ast]);
};

const read_string = (reader) => {
  return read_seq(reader, '"');
};

const read_quote = (reader) => {
  return prependSymbol(reader, "quote");
};

const read_quasiquote = (reader) => {
  return prependSymbol(reader, "quasiquote");
};

const read_unquote = (reader) => {
  return prependSymbol(reader, "unquote");
};

const read_deref = (reader) => {
  return prependSymbol(reader, "deref");
};

const read_splice_unquote = (reader) => {
  return prependSymbol(reader, "splice-unquote");
};

const read_atom = (reader) => {
  const token = reader.next();
  switch (true) {
    case !!token.match(/^[+-]?[0-9]+$/):
      return new Number(token);
    case token === "true":
      return true;
    case token === "false":
      return false;
    case token.startsWith(":"):
      return new MalKeyword(token.slice(1));
    case token.match(/^"(?:\\.|[^\\"])*"$/):
      const str = token
        .slice(1, token.length - 1)
        .replace(/\\(.)/g, (_, c) => (c === "n" ? "\n" : c));
      return new Str(str);
    default:
      return new MalSymbol(token);
  }
};

const read_form = (reader) => {
  const token = reader.peek();

  switch (token) {
    case "(":
      reader.next();
      return read_list(reader);

    case "[":
      reader.next();
      return read_vector(reader);

    case "{":
      reader.next();
      return read_hashmap(reader);

    case "'":
      reader.next();
      return read_quote(reader);

    case '"':
      reader.next();
      return read_string(reader);

    case "`":
      reader.next();
      return read_quasiquote(reader);

    case "~":
      reader.next();
      return read_unquote(reader);

    case "@":
      reader.next();
      return read_deref(reader);

    case "~@":
      reader.next();
      return read_splice_unquote(reader);

    default:
      return read_atom(reader);
  }
};

const read_seq = (reader, closingSymbol) => {
  const ast = [];

  while (reader.peek() != closingSymbol) {
    if (reader.peek() === undefined) {
      throw new Error("unbalanced");
    }

    ast.push(read_form(reader));
  }

  reader.next();
  return ast;
};

const read_list = (reader) => new MalList(read_seq(reader, ")"));
const read_vector = (reader) => new MalVector(read_seq(reader, "]"));
const read_hashmap = (reader) => new MalHashmap(read_seq(reader, "}"));

const read_str = (str) => {
  const tokens = tokenize(str);
  const reader = new Reader(tokens);
  return read_form(reader);
};

module.exports = { read_str };
