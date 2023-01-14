/**
 * This file is part of eyeo's Anti-Circumvention Snippets module (@eyeo/snippets),
 * Copyright (C) 2006-present eyeo GmbH
 *
 * @eyeo/snippets is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * @eyeo/snippets is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with @eyeo/snippets.  If not, see <http://www.gnu.org/licenses/>.
 */

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const $$1 = Proxy;
const { apply: a, bind: b, call: c } = Function;
const apply$2 = c.bind(a);
const bind = c.bind(b);
const call = c.bind(c);
const callerHandler = {
  get(e, t) {
    return bind(c, e[t]);
  },
};
const caller = (e) => new $$1(e, callerHandler);
const handler$1 = {
  get(e, t) {
    return bind(e[t], e);
  },
};
const bound = (e) => new $$1(e, handler$1);
const {
  assign: assign$1,
  defineProperties: defineProperties$1,
  freeze: freeze$1,
  getOwnPropertyDescriptor: getOwnPropertyDescriptor$2,
  getOwnPropertyDescriptors: getOwnPropertyDescriptors$1,
  getPrototypeOf: getPrototypeOf,
} = bound(Object);
caller({});
const { species: species } = Symbol;
const handler = {
  get(e, t) {
    const n = e[t];
    class r extends n {}
    const o = getOwnPropertyDescriptors$1(n.prototype);
    delete o.constructor;
    freeze$1(defineProperties$1(r.prototype, o));
    const i = getOwnPropertyDescriptors$1(n);
    delete i.length;
    delete i.prototype;
    i[species] = { value: r };
    return freeze$1(defineProperties$1(r, i));
  },
};
const secure = (e) => new $$1(e, handler);
const libEnvironment = typeof environment !== "undefined" ? environment : {};
if (typeof globalThis === "undefined") window.globalThis = window;
const { apply: apply$1, ownKeys: ownKeys } = bound(Reflect);
const worldEnvDefined = "world" in libEnvironment;
const isIsolatedWorld = worldEnvDefined && libEnvironment.world === "ISOLATED";
const isMainWorld = worldEnvDefined && libEnvironment.world === "MAIN";
const isChrome = typeof chrome === "object" && !!chrome.runtime;
const isOtherThanChrome = typeof browser === "object" && !!browser.runtime;
const isExtensionContext$2 =
  !isMainWorld && (isIsolatedWorld || isChrome || isOtherThanChrome);
const copyIfExtension = (e) =>
  isExtensionContext$2 ? e : create(e, getOwnPropertyDescriptors(e));
const {
  create: create,
  defineProperties: defineProperties,
  defineProperty: defineProperty,
  freeze: freeze,
  getOwnPropertyDescriptor: getOwnPropertyDescriptor$1,
  getOwnPropertyDescriptors: getOwnPropertyDescriptors,
} = bound(Object);
const invokes = bound(globalThis);
const classes = isExtensionContext$2 ? globalThis : secure(globalThis);
const {
  Map: Map$5,
  RegExp: RegExp$1,
  Set: Set,
  WeakMap: WeakMap$3,
  WeakSet: WeakSet$6,
} = classes;
const augment = (e, t, n = null) => {
  const r = ownKeys(t);
  for (const o of ownKeys(e)) {
    if (r.includes(o)) continue;
    const i = getOwnPropertyDescriptor$1(e, o);
    if (n && "value" in i) {
      const { value: e } = i;
      if (typeof e === "function") i.value = n(e);
    }
    defineProperty(t, o, i);
  }
};
const primitive = (e) => {
  const t = classes[e];
  class n extends t {}
  const { toString: r, valueOf: o } = t.prototype;
  defineProperties(n.prototype, {
    toString: { value: r },
    valueOf: { value: o },
  });
  const i = e.toLowerCase();
  const s = (e) =>
    function () {
      const t = apply$1(e, this, arguments);
      return typeof t === i ? new n(t) : t;
    };
  augment(t, n, s);
  augment(t.prototype, n.prototype, s);
  return n;
};
const variables$1 = freeze({
  frozen: new WeakMap$3(),
  hidden: new WeakSet$6(),
  iframePropertiesToAbort: { read: new Set(), write: new Set() },
  abortedIframes: new WeakMap$3(),
});
const startsCapitalized = new RegExp$1("^[A-Z]");
var env = new Proxy(
  new Map$5([
    [
      "chrome",
      (isExtensionContext$2 &&
        ((isChrome && chrome) || (isOtherThanChrome && browser))) ||
        void 0,
    ],
    ["isExtensionContext", isExtensionContext$2],
    ["variables", variables$1],
    ["console", copyIfExtension(console)],
    ["document", globalThis.document],
    ["performance", copyIfExtension(performance)],
    ["JSON", copyIfExtension(JSON)],
    ["Map", Map$5],
    ["Math", copyIfExtension(Math)],
    ["Number", isExtensionContext$2 ? Number : primitive("Number")],
    ["RegExp", RegExp$1],
    ["Set", Set],
    ["String", isExtensionContext$2 ? String : primitive("String")],
    ["WeakMap", WeakMap$3],
    ["WeakSet", WeakSet$6],
    ["MouseEvent", MouseEvent],
  ]),
  {
    get(e, t) {
      if (e.has(t)) return e.get(t);
      let n = globalThis[t];
      if (typeof n === "function")
        n = (startsCapitalized.test(t) ? classes : invokes)[t];
      e.set(t, n);
      return n;
    },
    has(e, t) {
      return e.has(t);
    },
  }
);
/*! (c) Andrea Giammarchi - ISC */ class WeakValue {
  has() {
    return false;
  }
  set() {}
}
const helpers = { WeakSet: WeakSet, WeakMap: WeakMap, WeakValue: WeakValue };
const { apply: apply } = Reflect;
function transformOnce(e) {
  const { WeakSet: t, WeakMap: n, WeakValue: r } = this || helpers;
  const o = new t();
  const i = new n();
  const s = new r();
  return function (t) {
    if (o.has(t)) return t;
    if (i.has(t)) return i.get(t);
    if (s.has(t)) return s.get(t);
    const n = apply(e, this, arguments);
    o.add(n);
    if (n !== t) (typeof t === "object" && t ? i : s).set(t, n);
    return n;
  };
}
const {
  Map: Map$4,
  WeakMap: WeakMap$2,
  WeakSet: WeakSet$5,
  setTimeout: setTimeout$2,
} = env;
let cleanup = true;
let cleanUpCallback = (e) => {
  e.clear();
  cleanup = !cleanup;
};
var transformer = transformOnce.bind({
  WeakMap: WeakMap$2,
  WeakSet: WeakSet$5,
  WeakValue: class extends Map$4 {
    set(e, t) {
      if (cleanup) {
        cleanup = !cleanup;
        setTimeout$2(cleanUpCallback, 0, this);
      }
      return super.set(e, t);
    }
  },
});
const {
  concat: concat,
  includes: includes,
  join: join,
  reduce: reduce,
  unshift: unshift,
} = caller([]);
const { Map: Map$3, WeakMap: WeakMap$1 } = secure(globalThis);
const map = new Map$3();
const descriptors = (e) => {
  const t = [];
  let n = e;
  while (n) {
    if (map.has(n)) unshift(t, map.get(n));
    else {
      const e = getOwnPropertyDescriptors$1(n);
      map.set(n, e);
      unshift(t, e);
    }
    n = getPrototypeOf(n);
  }
  unshift(t, {});
  return apply$2(assign$1, null, t);
};
const chain = (e) => {
  const t = typeof e === "function" ? e.prototype : e;
  const n = descriptors(t);
  const r = {
    get(e, t) {
      if (t in n) {
        const { value: r, get: o } = n[t];
        if (o) return call(o, e);
        if (typeof r === "function") return bind(r, e);
      }
      return e[t];
    },
    set(e, t, r) {
      if (t in n) {
        const { set: o } = n[t];
        if (o) {
          call(o, e, r);
          return true;
        }
      }
      e[t] = r;
      return true;
    },
  };
  return (e) => new Proxy(e, r);
};
const {
  isExtensionContext: isExtensionContext$1,
  Array: Array$2,
  Number: Number$1,
  String: String$1,
  Object: Object$2,
} = env;
const { isArray: isArray } = Array$2;
const {
  getOwnPropertyDescriptor: getOwnPropertyDescriptor,
  setPrototypeOf: setPrototypeOf$1,
} = Object$2;
const { toString: toString } = Object$2.prototype;
const { slice: slice } = String$1.prototype;
const getBrand = (e) => call(slice, call(toString, e), 8, -1);
const { get: nodeType } = getOwnPropertyDescriptor(Node.prototype, "nodeType");
const chained = isExtensionContext$1
  ? {}
  : {
      Attr: chain(Attr),
      CanvasRenderingContext2D: chain(CanvasRenderingContext2D),
      CSSStyleDeclaration: chain(CSSStyleDeclaration),
      Document: chain(Document),
      Element: chain(Element),
      HTMLCanvasElement: chain(HTMLCanvasElement),
      HTMLElement: chain(HTMLElement),
      HTMLImageElement: chain(HTMLImageElement),
      HTMLScriptElement: chain(HTMLScriptElement),
      MutationRecord: chain(MutationRecord),
      Node: chain(Node),
      ShadowRoot: chain(ShadowRoot),
      get CSS2Properties() {
        return chained.CSSStyleDeclaration;
      },
    };
const upgrade = (e, t) => {
  if (t !== "Element" && t in chained) return chained[t](e);
  if (isArray(e)) return setPrototypeOf$1(e, Array$2.prototype);
  const n = getBrand(e);
  if (n in chained) return chained[n](e);
  if (n in env) return setPrototypeOf$1(e, env[n].prototype);
  if ("nodeType" in e) {
    switch (call(nodeType, e)) {
      case 1:
        if (!(t in chained)) throw new Error("unknown hint " + t);
        return chained[t](e);
      case 2:
        return chained.Attr(e);
      case 3:
        return chained.Node(e);
      case 9:
        return chained.Document(e);
    }
  }
  throw new Error("unknown brand " + n);
};
var $ = isExtensionContext$1
  ? (e) => (e === window || e === globalThis ? env : e)
  : transformer((e, t = "Element") => {
      if (e === window || e === globalThis) return env;
      switch (typeof e) {
        case "object":
          return e && upgrade(e, t);
        case "string":
          return new String$1(e);
        case "number":
          return new Number$1(e);
        default:
          throw new Error("unsupported value");
      }
    });
let {
  document: document$1,
  getComputedStyle: getComputedStyle$3,
  isExtensionContext: isExtensionContext,
  variables: variables,
  Array: Array$1,
  MutationObserver: MutationObserver$7,
  Object: Object$1,
  XPathEvaluator: XPathEvaluator,
  XPathExpression: XPathExpression,
  XPathResult: XPathResult,
} = $(window);
let { querySelectorAll: querySelectorAll } = document$1;
let $$ = querySelectorAll && bind(querySelectorAll, document$1);
const { assign: assign, setPrototypeOf: setPrototypeOf } = Object$1;
class $XPathExpression extends XPathExpression {
  evaluate(...e) {
    return setPrototypeOf(
      apply$2(super.evaluate, this, e),
      XPathResult.prototype
    );
  }
}
class $XPathEvaluator extends XPathEvaluator {
  createExpression(...e) {
    return setPrototypeOf(
      apply$2(super.createExpression, this, e),
      $XPathExpression.prototype
    );
  }
}
function hideElement(e) {
  if (variables.hidden.has(e)) return;
  notifyElementHidden(e);
  variables.hidden.add(e);
  let { style: t } = $(e);
  let n = $(t, "CSSStyleDeclaration");
  let r = $([]);
  let { debugCSSProperties: o } = libEnvironment;
  for (let [e, t] of o || [["display", "none"]]) {
    n.setProperty(e, t, "important");
    r.push([e, n.getPropertyValue(e)]);
  }
  new MutationObserver$7(() => {
    for (let [e, t] of r) {
      let r = n.getPropertyValue(e);
      let o = n.getPropertyPriority(e);
      if (r != t || o != "important") n.setProperty(e, t, "important");
    }
  }).observe(e, { attributes: true, attributeFilter: ["style"] });
}
function notifyElementHidden(e) {
  if (isExtensionContext && typeof checkElement === "function") checkElement(e);
}
function initQueryAndApply(e) {
  let t = e;
  if (t.startsWith("xpath(") && t.endsWith(")")) {
    let e = t.slice(6, -1);
    let n = new $XPathEvaluator();
    let r = n.createExpression(e, null);
    let o = XPathResult.ORDERED_NODE_SNAPSHOT_TYPE;
    return (e) => {
      if (!e) return;
      let t = r.evaluate(document$1, o, null);
      let { snapshotLength: n } = t;
      for (let r = 0; r < n; r++) e(t.snapshotItem(r));
    };
  }
  return (t) => $$(e).forEach(t);
}
function hideIfMatches(e, t, n) {
  if (n == null) n = t;
  let r;
  const o = () => {
    for (const o of $$(n)) {
      const n = $(o).closest(t);
      if (n && e(o, n)) {
        r();
        hideElement(n);
      }
    }
  };
  return assign(new MutationObserver$7(o), {
    race(e) {
      r = e;
      this.observe(document$1, {
        childList: true,
        characterData: true,
        subtree: true,
      });
      o();
    },
  });
}
function isVisible(e, t, n) {
  let r = $(t, "CSSStyleDeclaration");
  if (r.getPropertyValue("display") == "none") return false;
  let o = r.getPropertyValue("visibility");
  if (o == "hidden" || o == "collapse") return false;
  if (!n || e == n) return true;
  let i = $(e).parentElement;
  if (!i) return true;
  return isVisible(i, getComputedStyle$3(i), n);
}
function getComputedCSSText(e) {
  let t = getComputedStyle$3(e);
  let { cssText: n } = t;
  if (n) return n;
  for (let e of t) n += `${e}: ${t[e]}; `;
  return $(n).trim();
}
let {
  parseInt: parseInt$1,
  setTimeout: setTimeout$1,
  Error: Error$2,
  MouseEvent: MouseEvent$1,
  MutationObserver: MutationObserver$6,
  WeakSet: WeakSet$4,
} = $(window);
function simulateEvent(e, t, n = "0") {
  if (!e)
    throw new Error$2("[simulate-event snippet]: No event type provided.");
  if (!t) throw new Error$2("[simulate-event snippet]: No selector provided.");
  let r = initQueryAndApply(t);
  let o = parseInt$1(n, 10);
  let i = new WeakSet$4();
  let s = new MutationObserver$6(a);
  s.observe(document, { childList: true, subtree: true });
  a();
  function a() {
    r((t) => {
      if (!i.has(t)) {
        i.add(t);
        setTimeout$1(() => {
          $(t).dispatchEvent(
            new MouseEvent$1(e, { bubbles: true, cancelable: true })
          );
        }, o);
      }
    });
  }
}
let { Math: Math$2, RegExp: RegExp } = $(window);
function regexEscape(e) {
  return $(e).replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
}
function toRegExp(e) {
  let { length: t } = e;
  if (t > 1 && e[0] === "/") {
    let n = e[t - 1] === "/";
    if (n || (t > 2 && $(e).endsWith("/i"))) {
      let t = [$(e).slice(1, n ? -1 : -2)];
      if (!n) t.push("i");
      return new RegExp(...t);
    }
  }
  return new RegExp(regexEscape(e));
}
let debugging = false;
function debug() {
  return debugging;
}
function setDebug() {
  debugging = true;
}
const { console: console$1 } = $(window);
const noop = () => {};
function log(...e) {
  if (debug()) $(e).unshift("%c DEBUG", "font-weight: bold");
  console$1.log(...e);
}
function getDebugger(e) {
  return bind(debug() ? log : noop, null, e);
}
let {
  Array: Array,
  Error: Error$1,
  Map: Map$2,
  parseInt: parseInt,
} = $(window);
let stack = null;
let won = null;
function race(e, t = "1") {
  switch (e) {
    case "start":
      stack = { winners: parseInt(t, 10) || 1, participants: new Map$2() };
      won = new Array();
      break;
    case "end":
    case "finish":
    case "stop":
      stack = null;
      for (let e of won) e();
      won = null;
      break;
    default:
      throw new Error$1(`Invalid action: ${e}`);
  }
}
function raceWinner(e, t) {
  if (stack === null) return noop;
  let n = stack;
  let { participants: r } = n;
  r.set(o, t);
  return o;
  function o() {
    if (n.winners < 1) return;
    let t = getDebugger("race");
    t(`${e} won the race`);
    if (n === stack) {
      won.push(o);
    } else {
      r.delete(o);
      if (--n.winners < 1) {
        for (let e of r.values()) e();
        r.clear();
      }
    }
  }
}
function hideIfContains(e, t = "*", n = null) {
  let r = toRegExp(e);
  const o = hideIfMatches((e) => r.test($(e).textContent), t, n);
  o.race(
    raceWinner("hide-if-contains", () => {
      o.disconnect();
    })
  );
}
let { MutationObserver: MutationObserver$5 } = $(window);
function hideIfContainsAndMatchesStyle(
  e,
  t = "*",
  n = null,
  r = null,
  o = null
) {
  if (n == null) n = t;
  let i = toRegExp(e);
  let s = r ? toRegExp(r) : null;
  let a = o ? toRegExp(o) : null;
  let l = () => {
    for (let e of $$(n)) {
      if (i.test($(e).textContent) && (!a || a.test(getComputedCSSText(e)))) {
        let n = $(e).closest(t);
        if (n && (!s || s.test(getComputedCSSText(n)))) {
          u();
          hideElement(n);
        }
      }
    }
  };
  let c = new MutationObserver$5(l);
  let u = raceWinner("hide-if-contains-and-matches-style", () =>
    c.disconnect()
  );
  c.observe(document, { childList: true, characterData: true, subtree: true });
  l();
}
let {
  clearTimeout: clearTimeout,
  fetch: fetch,
  getComputedStyle: getComputedStyle$2,
  setTimeout: setTimeout,
  Map: Map$1,
  MutationObserver: MutationObserver$4,
  Uint8Array: Uint8Array,
} = $(window);
function hideIfContainsImage(e, t, n) {
  if (n == null) n = t;
  let r = toRegExp(e);
  let o = () => {
    for (let e of $$(n)) {
      let n = getComputedStyle$2(e);
      let o = $(n["background-image"]).match(/^url\("(.*)"\)$/);
      if (o) {
        fetchContent(o[1]).then((n) => {
          if (r.test(uint8ArrayToHex(new Uint8Array(n)))) {
            let n = $(e).closest(t);
            if (n) {
              s();
              hideElement(n);
            }
          }
        });
      }
    }
  };
  let i = new MutationObserver$4(o);
  let s = raceWinner("hide-if-contains-image", () => i.disconnect());
  i.observe(document, { childList: true, subtree: true });
  o();
}
let fetchContentMap = new Map$1();
function fetchContent(e, { as: t = "arrayBuffer", cleanup: n = 6e4 } = {}) {
  let r = t + ":" + e;
  let o = fetchContentMap.get(r) || {
    remove: () => fetchContentMap.delete(r),
    result: null,
    timer: 0,
  };
  clearTimeout(o.timer);
  o.timer = setTimeout(o.remove, n);
  if (!o.result) {
    o.result = fetch(e)
      .then((e) => e[t]())
      .catch(o.remove);
    fetchContentMap.set(r, o);
  }
  return o.result;
}
function toHex(e, t = 2) {
  let n = $(e).toString(16);
  if (n.length < t) n = $("0").repeat(t - n.length) + n;
  return n;
}
function uint8ArrayToHex(e) {
  return e.reduce((e, t) => e + toHex(t), "");
}
const {
  parseFloat: parseFloat$1,
  Math: Math$1,
  MutationObserver: MutationObserver$3,
  WeakSet: WeakSet$3,
} = $(window);
const { min: min } = Math$1;
const ld = (e, t) => {
  const n = e.length + 1;
  const r = t.length + 1;
  const o = [[0]];
  let i = 0;
  let s = 0;
  while (++i < r) o[0][i] = i;
  i = 0;
  while (++i < n) {
    const n = e[s];
    let a = 0;
    let l = 0;
    o[i] = [i];
    while (++a < r) {
      o[i][a] = min(o[s][a] + 1, o[i][l] + 1, o[s][l] + (n != t[l]));
      ++l;
    }
    ++s;
  }
  return o[n - 1][r - 1];
};
function hideIfContainsSimilarText(e, t, n = null, r = 0, o = 0) {
  const i = new WeakSet$3();
  const s = getDebugger("hide-if-contains-similar-text");
  const a = $(e);
  const { length: l } = a;
  const c = l + parseFloat$1(r) || 0;
  const u = $([...a]).sort();
  const p = parseFloat$1(o) || Infinity;
  if (n == null) n = t;
  s("Looking for similar text: " + a);
  const d = () => {
    for (const e of $$(n)) {
      if (i.has(e)) continue;
      i.add(e);
      const { innerText: n } = $(e);
      const o = min(p, n.length - c + 1);
      for (let i = 0; i < o; i++) {
        const o = $(n).substr(i, c);
        const l = ld(u, $([...o]).sort()) - r;
        if (l <= 0) {
          const n = $(e).closest(t);
          s("Found similar text: " + a, n);
          if (n) {
            h();
            hideElement(n);
            break;
          }
        }
      }
    }
  };
  let f = new MutationObserver$3(d);
  let h = raceWinner("hide-if-contains-similar-text", () => f.disconnect());
  f.observe(document, { childList: true, characterData: true, subtree: true });
  d();
}
let {
  getComputedStyle: getComputedStyle$1,
  Map: Map,
  WeakSet: WeakSet$2,
  parseFloat: parseFloat,
} = $(window);
const { ELEMENT_NODE: ELEMENT_NODE$1, TEXT_NODE: TEXT_NODE } = Node;
function hideIfContainsVisibleText(e, t, n = null, ...r) {
  let o = $([]);
  const i = new Map([["-snippet-box-margin", "2"]]);
  for (let e of r) {
    e = $(e);
    let t = e.indexOf(":");
    if (t < 0) continue;
    let n = e.slice(0, t).trim().toString();
    let r = e
      .slice(t + 1)
      .trim()
      .toString();
    if (n && r) {
      if (i.has(n)) i.set(n, r);
      else o.push([n, r]);
    }
  }
  let s = $([
    ["opacity", "0"],
    ["font-size", "0px"],
    ["color", "rgba(0, 0, 0, 0)"],
  ]);
  let a = new Map(s.concat(o));
  function l(e, t) {
    if (!t) t = getComputedStyle$1(e);
    t = $(t);
    for (const [e, n] of a) {
      let r = toRegExp(n);
      if (r.test(t.getPropertyValue(e))) return false;
    }
    let n = t.getPropertyValue("color");
    if (t.getPropertyValue("background-color") == n) return false;
    return true;
  }
  function c(e, t) {
    let n = getComputedStyle$1(e, t);
    if (!isVisible(e, n) || !l(e, n)) return "";
    let { content: r } = $(n);
    if (r && r !== "none") {
      let t = $([]);
      r = $(r)
        .trim()
        .replace(
          /(["'])(?:(?=(\\?))\2.)*?\1/g,
          (e) => `${t.push($(e).slice(1, -1)) - 1}`
        );
      r = r.replace(
        /\s*attr\(\s*([^\s,)]+)[^)]*?\)\s*/g,
        (t, n) => $(e).getAttribute(n) || ""
      );
      return r.replace(/\x01(\d+)/g, (e, n) => t[n]);
    }
    return "";
  }
  function u(e, t, { boxMargin: n = 2 } = {}) {
    const r = $(e).getBoundingClientRect();
    const o = $(t).getBoundingClientRect();
    const i = {
      left: o.left - n,
      right: o.right + n,
      top: o.top - n,
      bottom: o.bottom + n,
    };
    return (
      i.left <= r.left &&
      r.left <= i.right &&
      i.top <= r.top &&
      r.top <= i.bottom &&
      i.top <= r.bottom &&
      r.bottom <= i.bottom &&
      i.left <= r.right &&
      r.right <= i.right
    );
  }
  function p(e, t, n, r, { boxMargin: o = 2 } = {}) {
    let i = !n;
    if (i) n = getComputedStyle$1(e);
    if (!isVisible(e, n, i && t)) return "";
    if (
      !r &&
      ($(n).getPropertyValue("overflow-x") === "hidden" ||
        $(n).getPropertyValue("overflow-y") === "hidden")
    )
      r = e;
    let s = c(e, ":before");
    for (let t of $(e).childNodes) {
      switch ($(t).nodeType) {
        case ELEMENT_NODE$1:
          s += p(t, e, getComputedStyle$1(t), r, { boxMargin: o });
          break;
        case TEXT_NODE:
          if (r) {
            if (u(e, r, { boxMargin: o }) && l(e, n)) s += $(t).nodeValue;
          } else if (l(e, n)) {
            s += $(t).nodeValue;
          }
          break;
      }
    }
    return s + c(e, ":after");
  }
  const d = i.get("-snippet-box-margin");
  const f = parseFloat(d) || 0;
  let h = toRegExp(e);
  let g = new WeakSet$2();
  const m = hideIfMatches(
    (e, t) => {
      if (g.has(e)) return false;
      g.add(e);
      let n = p(e, t, null, null, { boxMargin: f });
      let r = h.test(n);
      if (debug() && n.length) log(r, h, n);
      return r;
    },
    t,
    n
  );
  m.race(
    raceWinner("hide-if-contains-visible-text", () => {
      m.disconnect();
    })
  );
}
let { MutationObserver: MutationObserver$2 } = $(window);
function hideIfHasAndMatchesStyle(e, t = "*", n = null, r = null, o = null) {
  if (n == null) n = t;
  let i = r ? toRegExp(r) : null;
  let s = o ? toRegExp(o) : null;
  let a = () => {
    for (let r of $$(n)) {
      if ($(r).querySelector(e) && (!s || s.test(getComputedCSSText(r)))) {
        let e = $(r).closest(t);
        if (e && (!i || i.test(getComputedCSSText(e)))) {
          c();
          hideElement(e);
        }
      }
    }
  };
  let l = new MutationObserver$2(a);
  let c = raceWinner("hide-if-has-and-matches-style", () => l.disconnect());
  l.observe(document, { childList: true, subtree: true });
  a();
}
let {
  getComputedStyle: getComputedStyle,
  MutationObserver: MutationObserver$1,
  WeakSet: WeakSet$1,
} = $(window);
function hideIfLabelledBy(e, t, n = null) {
  let r = n == null;
  let o = toRegExp(e);
  let i = new WeakSet$1();
  let s = () => {
    for (let e of $$(t)) {
      let t = r ? e : $(e).closest(n);
      if (!t || !isVisible(e, getComputedStyle(e), t)) continue;
      let s = $(e).getAttribute("aria-labelledby");
      let a = () => {
        if (i.has(t)) return;
        if (o.test($(e).getAttribute("aria-label") || "")) {
          l();
          i.add(t);
          hideElement(t);
        }
      };
      if (s) {
        for (let e of $(s).split(/\s+/)) {
          let n = $(document).getElementById(e);
          if (n) {
            if (!i.has(n) && o.test(n.innerText)) {
              l();
              i.add(n);
              hideElement(t);
            }
          } else {
            a();
          }
        }
      } else {
        a();
      }
    }
  };
  let a = new MutationObserver$1(s);
  let l = raceWinner("hide-if-labelled-by", () => a.disconnect());
  a.observe(document, { characterData: true, childList: true, subtree: true });
  s();
}
$(window);
const noopProfile = {
  mark() {},
  end() {},
  toString() {
    return "{mark(){},end(){}}";
  },
};
function profile(e, t = 10) {
  return noopProfile;
}
let { MutationObserver: MutationObserver } = $(window);
const { ELEMENT_NODE: ELEMENT_NODE } = Node;
function hideIfMatchesXPath(e) {
  let { mark: t, end: n } = profile();
  let r = initQueryAndApply(`xpath(${e})`);
  let o = () => {
    t();
    r((e) => {
      s();
      if ($(e).nodeType === ELEMENT_NODE) hideElement(e);
      else $(e).textContent = "";
    });
    n();
  };
  let i = new MutationObserver(o);
  let s = raceWinner("hide-if-matches-xpath", () => i.disconnect());
  i.observe(document, { characterData: true, childList: true, subtree: true });
  o();
}
const snippets = {
  log: log,
  race: race,
  debug: setDebug,
  "hide-if-matches-xpath": hideIfMatchesXPath,
  "hide-if-contains": hideIfContains,
  "hide-if-contains-similar-text": hideIfContainsSimilarText,
  "hide-if-contains-visible-text": hideIfContainsVisibleText,
  "hide-if-contains-and-matches-style": hideIfContainsAndMatchesStyle,
  "hide-if-has-and-matches-style": hideIfHasAndMatchesStyle,
  "hide-if-labelled-by": hideIfLabelledBy,
  "hide-if-contains-image": hideIfContainsImage,
  "simulate-event-poc": simulateEvent,
};
exports.snippets = snippets;
