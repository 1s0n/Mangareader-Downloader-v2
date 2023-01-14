export class Logs {
  constructor(debug) {
    this._debug = debug;
  }

  debug() {
    if (this._debug) {
      console.debug(arguments);
    }
  }

  info() {
    if (this._debug) {
      console.info(arguments);
    }
  }

  warn() {
    if (this._debug) {
      console.warn(arguments);
    }
  }

  error() {
    if (this._debug) {
      console.error(arguments);
    }
  }
}
