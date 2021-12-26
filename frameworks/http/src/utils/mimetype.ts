/* eslint-disable @kraftr/returns-throw */
function removeLeadingAndTrailingHTTPWhitespace(value: string) {
  return value.replace(/^[ \t\n\r]+/u, '').replace(/[ \t\n\r]+$/u, '');
}

function removeTrailingHTTPWhitespace(value: string) {
  return value.replace(/[ \t\n\r]+$/u, '');
}

function isHTTPWhitespaceChar(char: string | undefined) {
  return char === ' ' || char === '\t' || char === '\n' || char === '\r';
}

function solelyContainsHTTPTokenCodePoints(value: string) {
  return /^[-!#$%&'*+.^_`|~A-Za-z0-9]*$/u.test(value);
}

function soleyContainsHTTPQuotedStringTokenCodePoints(value: string) {
  return /^[\t\u0020-\u007E\u0080-\u00FF]*$/u.test(value);
}

function asciiLowercase(value: string) {
  return value.replace(/[A-Z]/gu, (l) => l.toLowerCase());
}

// This variant only implements it with the extract-value flag set.
function collectAnHTTPQuotedString(input: string, position: number) {
  let value = '';

  position++;

  while (true) {
    while (
      position < input.length &&
      input[position] !== '"' &&
      input[position] !== '\\'
    ) {
      value += input[position];
      ++position;
    }

    if (position >= input.length) break;

    const quoteOrBackslash = input[position];
    ++position;

    if (quoteOrBackslash !== '\\') break;

    if (position >= input.length) {
      value += '\\';
      break;
    }

    value += input[position];
    ++position;
  }

  return [value, position] as const;
}

function parse(input: string) {
  input = removeLeadingAndTrailingHTTPWhitespace(input);

  let position = 0;
  let type = '';
  while (position < input.length && input[position] !== '/') {
    type += input[position];
    ++position;
  }

  if (type.length === 0 || !solelyContainsHTTPTokenCodePoints(type)) {
    return null;
  }

  if (position >= input.length) {
    return null;
  }

  // Skips past "/"
  ++position;

  let subtype = '';
  while (position < input.length && input[position] !== ';') {
    subtype += input[position];
    ++position;
  }

  subtype = removeTrailingHTTPWhitespace(subtype);

  if (subtype.length === 0 || !solelyContainsHTTPTokenCodePoints(subtype)) {
    return null;
  }

  const mimeType = {
    type: asciiLowercase(type),
    subtype: asciiLowercase(subtype),
    parameters: new Map()
  };

  while (position < input.length) {
    // Skip past ";"
    ++position;

    while (isHTTPWhitespaceChar(input[position])) {
      ++position;
    }

    let parameterName = '';
    while (
      position < input.length &&
      input[position] !== ';' &&
      input[position] !== '='
    ) {
      parameterName += input[position];
      ++position;
    }
    parameterName = asciiLowercase(parameterName);

    if (position < input.length) {
      if (input[position] === ';') {
        continue;
      }

      // Skip past "="
      ++position;
    }

    let parameterValue = null;
    if (input[position] === '"') {
      [parameterValue, position] = collectAnHTTPQuotedString(input, position);

      while (position < input.length && input[position] !== ';') {
        ++position;
      }
    } else {
      parameterValue = '';
      while (position < input.length && input[position] !== ';') {
        parameterValue += input[position];
        ++position;
      }

      parameterValue = removeTrailingHTTPWhitespace(parameterValue);

      if (parameterValue === '') {
        continue;
      }
    }

    if (
      parameterName.length > 0 &&
      solelyContainsHTTPTokenCodePoints(parameterName) &&
      soleyContainsHTTPQuotedStringTokenCodePoints(parameterValue) &&
      !mimeType.parameters.has(parameterName)
    ) {
      mimeType.parameters.set(parameterName, parameterValue);
    }
  }

  return mimeType;
}

class MIMETypeParameters {
  constructor(private _map: Map<string, string>) {}

  get size() {
    return this._map.size;
  }

  get(name: string) {
    name = asciiLowercase(String(name));
    return this._map.get(name);
  }

  has(name: string) {
    name = asciiLowercase(String(name));
    return this._map.has(name);
  }

  set(name: string, value: string) {
    name = asciiLowercase(String(name));
    value = String(value);

    if (!solelyContainsHTTPTokenCodePoints(name)) {
      throw new Error(
        `Invalid MIME type parameter name "${name}": only HTTP token code points are valid.`
      );
    }
    if (!soleyContainsHTTPQuotedStringTokenCodePoints(value)) {
      throw new Error(
        `Invalid MIME type parameter value "${value}": only HTTP quoted-string token code points are ` +
          `valid.`
      );
    }

    return this._map.set(name, value);
  }

  clear() {
    this._map.clear();
  }

  delete(name: string) {
    name = asciiLowercase(String(name));
    return this._map.delete(name);
  }

  forEach(
    callbackFn: (value: string, key: string, map: Map<string, string>) => void,
    thisArg: unknown
  ) {
    this._map.forEach(callbackFn, thisArg);
  }

  keys() {
    return this._map.keys();
  }

  values() {
    return this._map.values();
  }

  entries() {
    return this._map.entries();
  }

  [Symbol.iterator]() {
    return this._map[Symbol.iterator]();
  }
}

type Serializable = string | { toString: () => string };

export class MIMEType {
  private _type: string;
  private _subtype: string;
  private _parameters: MIMETypeParameters;

  constructor(input: Serializable) {
    input = String(input);
    const result = parse(input as string);

    if (result === null) {
      throw new Error(`Could not parse MIME type string "${input}"`);
    }

    this._type = result.type;
    this._subtype = result.subtype;
    this._parameters = new MIMETypeParameters(result.parameters);
  }

  static parse(input: Serializable) {
    if (parse(String(input)) === null) {
      return null;
    }
    return new this(input);
  }

  get essence() {
    return `${this.type}/${this.subtype}`;
  }

  get type(): string {
    return this._type;
  }

  set type(value: Serializable) {
    const _value = asciiLowercase(String(value));

    if (_value.length === 0) {
      throw new Error('Invalid type: must be a non-empty string');
    }
    if (!solelyContainsHTTPTokenCodePoints(_value)) {
      throw new Error(`Invalid type ${_value}: must contain only HTTP token code points`);
    }

    this._type = _value;
  }

  get subtype(): string {
    return this._subtype;
  }

  set subtype(value: Serializable) {
    const _value = asciiLowercase(String(value));

    if (_value.length === 0) {
      throw new Error('Invalid subtype: must be a non-empty string');
    }
    if (!solelyContainsHTTPTokenCodePoints(_value)) {
      throw new Error(
        `Invalid subtype ${_value}: must contain only HTTP token code points`
      );
    }

    this._subtype = _value;
  }

  get parameters() {
    return this._parameters;
  }

  toString() {
    // The serialize function works on both "MIME type records" (i.e. the results of parse) and on this class, since
    // this class's interface is identical.
    return serialize(this);
  }

  isJavaScript({ prohibitParameters = false } = {}) {
    switch (this._type) {
      case 'text': {
        switch (this._subtype) {
          case 'ecmascript':
          case 'javascript':
          case 'javascript1.0':
          case 'javascript1.1':
          case 'javascript1.2':
          case 'javascript1.3':
          case 'javascript1.4':
          case 'javascript1.5':
          case 'jscript':
          case 'livescript':
          case 'x-ecmascript':
          case 'x-javascript': {
            return !prohibitParameters || this._parameters.size === 0;
          }
          default: {
            return false;
          }
        }
      }
      case 'application': {
        switch (this._subtype) {
          case 'ecmascript':
          case 'javascript':
          case 'x-ecmascript':
          case 'x-javascript': {
            return !prohibitParameters || this._parameters.size === 0;
          }
          default: {
            return false;
          }
        }
      }
      default: {
        return false;
      }
    }
  }
  isXML() {
    return (
      (this._subtype === 'xml' &&
        (this._type === 'text' || this._type === 'application')) ||
      this._subtype.endsWith('+xml')
    );
  }
  isHTML() {
    return this._subtype === 'html' && this._type === 'text';
  }
}

function serialize(mimeType: MIMEType) {
  let serialization = `${mimeType.type}/${mimeType.subtype}`;

  if (mimeType.parameters.size === 0) {
    return serialization;
  }

  for (let [name, value] of mimeType.parameters) {
    serialization += ';';
    serialization += name;
    serialization += '=';

    if (!solelyContainsHTTPTokenCodePoints(value) || value.length === 0) {
      value = value.replace(/(["\\])/gu, '\\$1');
      value = `"${value}"`;
    }

    serialization += value;
  }

  return serialization;
}
