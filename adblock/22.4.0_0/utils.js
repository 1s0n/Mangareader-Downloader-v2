"use strict";

/**
 * Generate and return a randomly generated user ID.
 *
 * @return {string} the user ID generated
 */
export function generateUserId() {
  const timeSuffix = Date.now() % 1e8; // 8 digits from end of timestamp

  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";

  const result = [];

  for (let i = 0; i < 8; i++) {
    const choice = Math.floor(Math.random() * alphabet.length);

    result.push(alphabet[choice]);
  }
  return result.join("") + timeSuffix;
}

/**
 * Ping sends the provided data to the stats server as JSON.
 *
 * @param data {object} the data to send to the stats server
 * @param [cb]u
 * {function} callback to receive the response
 */
export function ping(data, cb) {
  const xhr = new XMLHttpRequest();
  const url = "https://ping.ublock.org/api/stats";
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.overrideMimeType("text/html;charset=utf-8");
  xhr.responseType = "text";
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      cb(xhr.response);
    }
  };
  xhr.send(JSON.stringify(data));
}

// Parse a URL. Based upon http://blog.stevenlevithan.com/archives/parseuri
// parseUri 1.2.2, (c) Steven Levithan <stevenlevithan.com>, MIT License
// Inputs: url: the URL you want to parse
// Outputs: object containing all parts of |url| as attributes
const PARSE_URL_REGEX =
  /^(([^:]+(?::|$))(?:(?:\w+:)?\/\/)?(?:[^:@/]*(?::[^:@/]*)?@)?(([^:/?#]*)(?::(\d*))?))((?:[^?#/]*\/)*[^?#]*)(\?[^#]*)?(#.*)?/;

/**
 * parse the uri and return an object with uri parts split up.
 * @param url {string} the url to parse
 * @returns {{href:string,origin:string,protocol:string,host:string,hostname:string,port:string,pathname:string,search:string,hash:string}} the parsed url with href, origin, protocol, host, hostname, port, pathname, search, and hash
 */
export function parseUri(url) {
  const matches = PARSE_URL_REGEX.exec(url);

  // The key values are identical to the JS location object values for that key
  const keys = [
    "href",
    "origin",
    "protocol",
    "host",
    "hostname",
    "port",
    "pathname",
    "search",
    "hash",
  ];
  const uri = {};
  for (let i = 0; matches && i < keys.length; i++) {
    uri[keys[i]] = matches[i] || "";
  }
  return uri;
}
