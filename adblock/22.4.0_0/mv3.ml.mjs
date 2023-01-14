const callback = (environment, ..._) => {
  /*!
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
  const isIsolatedWorld =
    worldEnvDefined && libEnvironment.world === "ISOLATED";
  const isMainWorld = worldEnvDefined && libEnvironment.world === "MAIN";
  const isChrome = typeof chrome === "object" && !!chrome.runtime;
  const isOtherThanChrome = typeof browser === "object" && !!browser.runtime;
  const isExtensionContext$4 =
    !isMainWorld && (isIsolatedWorld || isChrome || isOtherThanChrome);
  const copyIfExtension = (e) =>
    isExtensionContext$4 ? e : create(e, getOwnPropertyDescriptors(e));
  const {
    create: create,
    defineProperties: defineProperties,
    defineProperty: defineProperty,
    freeze: freeze,
    getOwnPropertyDescriptor: getOwnPropertyDescriptor$1,
    getOwnPropertyDescriptors: getOwnPropertyDescriptors,
  } = bound(Object);
  const invokes = bound(globalThis);
  const classes = isExtensionContext$4 ? globalThis : secure(globalThis);
  const {
    Map: Map$5,
    RegExp: RegExp$1,
    Set: Set,
    WeakMap: WeakMap$3,
    WeakSet: WeakSet$7,
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
    hidden: new WeakSet$7(),
    iframePropertiesToAbort: { read: new Set(), write: new Set() },
    abortedIframes: new WeakMap$3(),
  });
  const startsCapitalized = new RegExp$1("^[A-Z]");
  var env = new Proxy(
    new Map$5([
      [
        "chrome",
        (isExtensionContext$4 &&
          ((isChrome && chrome) || (isOtherThanChrome && browser))) ||
          void 0,
      ],
      ["isExtensionContext", isExtensionContext$4],
      ["variables", variables$1],
      ["console", copyIfExtension(console)],
      ["document", globalThis.document],
      ["performance", copyIfExtension(performance)],
      ["JSON", copyIfExtension(JSON)],
      ["Map", Map$5],
      ["Math", copyIfExtension(Math)],
      ["Number", isExtensionContext$4 ? Number : primitive("Number")],
      ["RegExp", RegExp$1],
      ["Set", Set],
      ["String", isExtensionContext$4 ? String : primitive("String")],
      ["WeakMap", WeakMap$3],
      ["WeakSet", WeakSet$7],
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
    WeakSet: WeakSet$6,
    setTimeout: setTimeout$2,
  } = env;
  let cleanup = true;
  let cleanUpCallback = (e) => {
    e.clear();
    cleanup = !cleanup;
  };
  var transformer = transformOnce.bind({
    WeakMap: WeakMap$2,
    WeakSet: WeakSet$6,
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
    reduce: reduce$1,
    unshift: unshift,
  } = caller([]);
  const { Map: Map$3, WeakMap: WeakMap$1 } = secure(globalThis);
  const map$1 = new Map$3();
  const descriptors = (e) => {
    const t = [];
    let n = e;
    while (n) {
      if (map$1.has(n)) unshift(t, map$1.get(n));
      else {
        const e = getOwnPropertyDescriptors$1(n);
        map$1.set(n, e);
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
    isExtensionContext: isExtensionContext$3,
    Array: Array$3,
    Number: Number$1,
    String: String$1,
    Object: Object$3,
  } = env;
  const { isArray: isArray } = Array$3;
  const {
    getOwnPropertyDescriptor: getOwnPropertyDescriptor,
    setPrototypeOf: setPrototypeOf$1,
  } = Object$3;
  const { toString: toString } = Object$3.prototype;
  const { slice: slice } = String$1.prototype;
  const getBrand = (e) => call(slice, call(toString, e), 8, -1);
  const { get: nodeType } = getOwnPropertyDescriptor(
    Node.prototype,
    "nodeType"
  );
  const chained = isExtensionContext$3
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
    if (isArray(e)) return setPrototypeOf$1(e, Array$3.prototype);
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
  var $ = isExtensionContext$3
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
    getComputedStyle: getComputedStyle$4,
    isExtensionContext: isExtensionContext$2,
    variables: variables,
    Array: Array$2,
    MutationObserver: MutationObserver$8,
    Object: Object$2,
    XPathEvaluator: XPathEvaluator,
    XPathExpression: XPathExpression,
    XPathResult: XPathResult,
  } = $(window);
  let { querySelectorAll: querySelectorAll } = document$1;
  let $$ = querySelectorAll && bind(querySelectorAll, document$1);
  const { assign: assign, setPrototypeOf: setPrototypeOf } = Object$2;
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
    new MutationObserver$8(() => {
      for (let [e, t] of r) {
        let r = n.getPropertyValue(e);
        let o = n.getPropertyPriority(e);
        if (r != t || o != "important") n.setProperty(e, t, "important");
      }
    }).observe(e, { attributes: true, attributeFilter: ["style"] });
  }
  function notifyElementHidden(e) {
    if (isExtensionContext$2 && typeof checkElement === "function")
      checkElement(e);
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
    return assign(new MutationObserver$8(o), {
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
    return isVisible(i, getComputedStyle$4(i), n);
  }
  function getComputedCSSText(e) {
    let t = getComputedStyle$4(e);
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
    MutationObserver: MutationObserver$7,
    WeakSet: WeakSet$5,
  } = $(window);
  function simulateEvent(e, t, n = "0") {
    if (!e)
      throw new Error$2("[simulate-event snippet]: No event type provided.");
    if (!t)
      throw new Error$2("[simulate-event snippet]: No selector provided.");
    let r = initQueryAndApply(t);
    let o = parseInt$1(n, 10);
    let i = new WeakSet$5();
    let s = new MutationObserver$7(a);
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
  let { Math: Math$3, RegExp: RegExp } = $(window);
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
  function randomId() {
    return $(Math$3.floor(Math$3.random() * 2116316160 + 60466176)).toString(
      36
    );
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
    Array: Array$1,
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
        won = new Array$1();
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
  let { MutationObserver: MutationObserver$6 } = $(window);
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
    let c = new MutationObserver$6(l);
    let u = raceWinner("hide-if-contains-and-matches-style", () =>
      c.disconnect()
    );
    c.observe(document, {
      childList: true,
      characterData: true,
      subtree: true,
    });
    l();
  }
  let {
    clearTimeout: clearTimeout,
    fetch: fetch,
    getComputedStyle: getComputedStyle$3,
    setTimeout: setTimeout,
    Map: Map$1,
    MutationObserver: MutationObserver$5,
    Uint8Array: Uint8Array,
  } = $(window);
  function hideIfContainsImage(e, t, n) {
    if (n == null) n = t;
    let r = toRegExp(e);
    let o = () => {
      for (let e of $$(n)) {
        let n = getComputedStyle$3(e);
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
    let i = new MutationObserver$5(o);
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
    parseFloat: parseFloat$2,
    Math: Math$2,
    MutationObserver: MutationObserver$4,
    WeakSet: WeakSet$4,
  } = $(window);
  const { min: min } = Math$2;
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
    const i = new WeakSet$4();
    const s = getDebugger("hide-if-contains-similar-text");
    const a = $(e);
    const { length: l } = a;
    const c = l + parseFloat$2(r) || 0;
    const u = $([...a]).sort();
    const p = parseFloat$2(o) || Infinity;
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
    let f = new MutationObserver$4(d);
    let h = raceWinner("hide-if-contains-similar-text", () => f.disconnect());
    f.observe(document, {
      childList: true,
      characterData: true,
      subtree: true,
    });
    d();
  }
  let {
    getComputedStyle: getComputedStyle$2,
    Map: Map,
    WeakSet: WeakSet$3,
    parseFloat: parseFloat$1,
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
      if (!t) t = getComputedStyle$2(e);
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
      let n = getComputedStyle$2(e, t);
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
      if (i) n = getComputedStyle$2(e);
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
            s += p(t, e, getComputedStyle$2(t), r, { boxMargin: o });
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
    const f = parseFloat$1(d) || 0;
    let h = toRegExp(e);
    let m = new WeakSet$3();
    const g = hideIfMatches(
      (e, t) => {
        if (m.has(e)) return false;
        m.add(e);
        let n = p(e, t, null, null, { boxMargin: f });
        let r = h.test(n);
        if (debug() && n.length) log(r, h, n);
        return r;
      },
      t,
      n
    );
    g.race(
      raceWinner("hide-if-contains-visible-text", () => {
        g.disconnect();
      })
    );
  }
  let { MutationObserver: MutationObserver$3 } = $(window);
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
    let l = new MutationObserver$3(a);
    let c = raceWinner("hide-if-has-and-matches-style", () => l.disconnect());
    l.observe(document, { childList: true, subtree: true });
    a();
  }
  let {
    getComputedStyle: getComputedStyle$1,
    MutationObserver: MutationObserver$2,
    WeakSet: WeakSet$2,
  } = $(window);
  function hideIfLabelledBy(e, t, n = null) {
    let r = n == null;
    let o = toRegExp(e);
    let i = new WeakSet$2();
    let s = () => {
      for (let e of $$(t)) {
        let t = r ? e : $(e).closest(n);
        if (!t || !isVisible(e, getComputedStyle$1(e), t)) continue;
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
    let a = new MutationObserver$2(s);
    let l = raceWinner("hide-if-labelled-by", () => a.disconnect());
    a.observe(document, {
      characterData: true,
      childList: true,
      subtree: true,
    });
    s();
  }
  let {
    Math: Math$1,
    setInterval: setInterval,
    chrome: chrome$2,
    isExtensionContext: isExtensionContext$1,
    performance: performance$1,
  } = $(window);
  const noopProfile = {
    mark() {},
    end() {},
    toString() {
      return "{mark(){},end(){}}";
    },
  };
  let inactive = true;
  function setProfile() {
    inactive = false;
  }
  function profile(e, t = 10) {
    if (inactive || !isExtensionContext$1) return noopProfile;
    function n() {
      let e = $([]);
      for (let { name: t, duration: n } of performance$1.getEntriesByType(
        "measure"
      ))
        e.push({ name: t, duration: n });
      if (e.length) {
        performance$1.clearMeasures();
        chrome$2.runtime.sendMessage({
          type: "ewe:profiler.sample",
          category: "snippets",
          samples: e,
        });
      }
    }
    if (!profile[e]) {
      profile[e] = setInterval(n, Math$1.round(6e4 / Math$1.min(60, t)));
    }
    return {
      mark() {
        performance$1.mark(e);
      },
      end(t = false) {
        performance$1.measure(e, e);
        performance$1.clearMarks(e);
        if (t) {
          clearInterval(profile[e]);
          delete profile[e];
          n();
        }
      },
    };
  }
  let { MutationObserver: MutationObserver$1 } = $(window);
  const { ELEMENT_NODE: ELEMENT_NODE } = Node;
  function hideIfMatchesXPath(e) {
    let { mark: t, end: n } = profile("hide-if-matches-xpath");
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
    let i = new MutationObserver$1(o);
    let s = raceWinner("hide-if-matches-xpath", () => i.disconnect());
    i.observe(document, {
      characterData: true,
      childList: true,
      subtree: true,
    });
    o();
  }
  let {
    chrome: chrome$1,
    getComputedStyle: getComputedStyle,
    isExtensionContext: isExtensionContext,
    parseFloat: parseFloat,
    Array: Array,
    MutationObserver: MutationObserver,
    Object: Object$1,
    WeakSet: WeakSet$1,
  } = $(window);
  let {
    filter: filter,
    map: map,
    push: push,
    reduce: reduce,
    some: some,
  } = caller(window.Array.prototype);
  function hideIfGraphMatches(e, t) {
    let n = false;
    let r = new WeakSet$1();
    let o = t;
    let i = (t) => {
      for (let i of $(t)) {
        let { target: t } = $(i, "MutationRecord");
        if ($(t).tagName == o) {
          if (!n) {
            n = true;
            requestAnimationFrame(() => {
              n = false;
              predictAds(a, e, r);
            });
          }
          break;
        }
      }
    };
    let s = new MutationObserver(i);
    let a = raceWinner("hide-if-graph-matches", () => s.disconnect());
    s.observe(document, { childList: true, subtree: true });
    predictAds(a, e, r);
  }
  const GRAPH_CUT_OFF = 50;
  const THRESHOLD = 0.5;
  const CHROME_SEND_MESSAGE_CALLBACK_NO_RESPONSE_MESSAGE =
    "The message port closed before a response was received.";
  const sendMessage = (e) =>
    new Promise((t, n) => {
      chrome$1.runtime.sendMessage(e, (e) => {
        if (chrome$1.runtime.lastError) {
          if (
            chrome$1.runtime.lastError.message ===
            CHROME_SEND_MESSAGE_CALLBACK_NO_RESPONSE_MESSAGE
          )
            t();
          else n(new Error(chrome$1.runtime.lastError.message));
        } else {
          t(e);
        }
      });
    });
  function processElement(e) {
    let { adjacencyMatrix: t, features: n } = addEdgesFeatures(
      e,
      GRAPH_CUT_OFF
    );
    return { adjacencyMatrix: t, features: n };
  }
  function predictAds(e, t, n) {
    let r = getDebugger("hide-if-graph-matches");
    let o = $$(t);
    for (let t of o) {
      if (n.has(t)) continue;
      if ($(t).innerText == "") continue;
      n.add(t);
      let o = processElement(t);
      let { mark: i, end: s } = profile(`ml:inference:${randomId()}`);
      i();
      let a = {
        type: "ewe:ml-inference",
        inputs: [
          {
            data: [o.adjacencyMatrix],
            preprocess: [
              { funcName: "padAdjacency", args: GRAPH_CUT_OFF },
              { funcName: "unstack" },
              { funcName: "localPooling" },
              { funcName: "stack" },
            ],
          },
          {
            data: [o.features],
            preprocess: [
              { funcName: "padFeatures", args: GRAPH_CUT_OFF },
              { funcName: "cast", args: "float32" },
            ],
          },
        ],
        model: "hideIfGraphMatches",
      };
      let l = function (n) {
        if (!n) return;
        let o = Object$1.values(n);
        if (!some(o, (e) => e > 0))
          r("Error: ML prediction results are corrupted");
        let i = reduce(o, (e, t) => e + t, 0);
        let s = map(o, (e) => e / i);
        let a = map(
          filter(s, (e, t) => t % 2 == 1),
          (e) => e > THRESHOLD
        );
        if (a[0]) {
          r("Detected ad: " + $(t).innerText);
          e();
          hideElement(t);
        }
      };
      if (isExtensionContext) {
        sendMessage(a)
          .then((e) => {
            if (e) {
              l(e);
              r(e);
            } else {
              a.type = "ml.inference";
              sendMessage(a).then(l).catch(r);
            }
            s(true);
          })
          .catch(r);
      }
    }
  }
  class GraphNode {
    constructor(e, t) {
      this.tag = e;
      this.attributes = t;
      this.children = [];
      this.elementHidden = false;
      this.elementBlocked = false;
      this.filter = null;
      this.requestType = null;
      this.height = 0;
      this.width = 0;
      this.cssSelectors = null;
    }
    addChild(e) {
      push(this.children, e);
    }
  }
  const IMPORTANT_NODE_ATTRIBUTES = ["style"];
  function cloneObject(e) {
    let t = {};
    for (let n in e) {
      if (e[n]) t[n] = e[n];
    }
    return t;
  }
  function addEdgesFeatures(e, t) {
    let n = new Array(t);
    for (let e = 0; e < t; e++) n[e] = new Array(t).fill(0);
    let r = n;
    let o = [];
    let i = 0;
    function s(e, n) {
      if (i >= t) return;
      let a = {};
      for (let t of $(e).attributes) a[$(t).name] = $(t).value;
      for (let t of IMPORTANT_NODE_ATTRIBUTES) a[t] = cloneObject(e[t]);
      let l = new GraphNode(e.tagName, a);
      l.cssSelectors = getComputedStyle(e).cssText;
      l.height = e.clientHeight;
      l.width = e.clientWidth;
      l.nodeId = i;
      i += 1;
      if (n !== null) {
        r[n.nodeId][l.nodeId] = 1;
        r[l.nodeId][n.nodeId] = 1;
      }
      if (n == null) {
        l.nodeLevel = 0;
        l.parentNodeId = 0;
        l.siblings = 0;
      } else {
        l.nodeLevel = n.nodeLevel + 1;
        l.parentNodeId = n.nodeId;
        l.siblings = n.children.length;
      }
      l.numChildren = e.children.length;
      if (
        l.attributes.hasOwnProperty("src") &&
        l.attributes["src"] !== undefined
      ) {
        l.attributes["src_level"] = 0;
      } else if (
        n !== null &&
        Object$1.values(n.attributes).length !== 0 &&
        n.attributes.hasOwnProperty("src") &&
        n.attributes["src"] !== undefined
      ) {
        l.attributes["src"] = n.attributes["src"];
        l.attributes["src_level"] = n.attributes["src_level"] + 1;
        l["requestType"] = n["requestType"];
      }
      l.features = new featureGenerator().getNodeFeatures(
        l,
        location.href,
        true,
        true,
        true,
        true
      );
      push(o, l.features);
      for (let t of e.children) s(t, l);
    }
    s(e, null);
    return { adjacencyMatrix: r, features: o };
  }
  let eye = function (e) {
    let t = [];
    for (let n = 0; n < e; n++) {
      let r = [];
      for (let t = 0; t < e; t++) push(r, n === t ? 1 : 0);
      push(t, r);
    }
    return t;
  };
  const DISPLAY_ATTR_MAP = {
    none: 1,
    inline: 2,
    block: 3,
    "inline-block": 4,
    inherit: 5,
  };
  const ONE_HOT_DISPLAY_LEN = 5;
  const NUM_CSS_SELECTORS = 55;
  const CSS_COLORS = [
    "background-color",
    "border-bottom-color",
    "border-left-color",
    "border-right-color",
    "border-top-color",
    "color",
    "outline-color",
    "text-decoration",
    "text-decoration-color",
    "column-rule-color",
    "-webkit-text-emphasis-color",
    "-webkit-text-fill-color",
    "-webkit-text-stroke-color",
    "caret-color",
  ];
  const CSS_PIXELS = [
    "border-bottom-width",
    "height",
    "min-height",
    "min-width",
    "padding-bottom",
    "padding-left",
    "padding-right",
    "padding-top",
    "width",
  ];
  const CSS_ORIGINS = ["perspective-origin", "transform-origin"];
  const REQUEST_TYPES = [
    "script",
    "subdocument",
    "image",
    "xmlhttprequest",
    "font",
    "document",
    "stylesheet",
    "other",
    "ping",
    "websocket",
    "media",
    "object",
  ];
  let requestTypesDict = {};
  const reqtypeVEC = eye(REQUEST_TYPES.length);
  for (let e in REQUEST_TYPES)
    requestTypesDict[REQUEST_TYPES[e]] = reqtypeVEC[e];
  const URL_CHARS =
    " abcdefghijklmnopqrstuvwxyz1234567890:;/?!=+.,()[]-`*_|~".split("");
  let wordIndex = {};
  let charEncoderIndex = 1;
  URL_CHARS.forEach((e) => {
    wordIndex[e] = charEncoderIndex;
    charEncoderIndex += 1;
  });
  let featureGenerator = function () {
    let e = function (e, t) {
      map(t, (t) => push(e, t));
    };
    let t = function (t, n) {
      let r = [];
      t = t.split("");
      t.forEach((e) => {
        push(r, wordIndex.hasOwnProperty(e) ? wordIndex[e] : -1);
      });
      if (r.length > n) return r.slice(-n);
      e(r, new Array(n - r.length).fill(0));
      return r;
    };
    let n = function (e, n = 8) {
      let r = e["tag"].toLowerCase();
      let o = t(r, n);
      return o;
    };
    let r = function (e, t, n) {
      let r = 0;
      let o = 0;
      let i = 0;
      let s = e["attributes"];
      if (s !== undefined && s.hasOwnProperty(n)) {
        let e = s[n].toLowerCase();
        o = 1;
        if (e.startsWith("http") == true) r = 1;
        let a = e.split("/");
        let l = a[2];
        if (l !== t) i = 1;
      }
      return [o, r, i];
    };
    let o = function (e) {
      let t = /rgba?\((\d+), (\d+), (\d+)\)/g;
      let n = t.exec(e);
      if (n) {
        return [parseFloat(n[1]), parseFloat(n[2]), parseFloat(n[3])];
      }
      return [0, 0, 0];
    };
    let i = function (e) {
      let t = /(\d*?\.?\d*)px/g;
      let n = t.exec(e);
      if (n) return [parseFloat(n[1])];
      return [0];
    };
    let s = function (e) {
      let t = /(\d*?\.?\d*)px (\d*?\.?\d*)px/g;
      let n = t.exec(e);
      if (n) return [parseFloat(n[1]), parseFloat(n[2])];
      return [0, 0];
    };
    let a = function (t) {
      let n = t["cssSelectors"];
      if (!n) return new Array(NUM_CSS_SELECTORS).fill(0);
      let r = {};
      let a = n.split("; ");
      for (let e in a) {
        let t = a[e].split(":");
        let n = t[0];
        let o = t[1];
        if (n !== undefined && o !== undefined) r[n.trim()] = o.trim();
      }
      let l = [];
      for (let t in CSS_COLORS) {
        let n = r.hasOwnProperty(CSS_COLORS[t])
          ? o(r[CSS_COLORS[t]])
          : [0, 0, 0];
        e(l, n);
      }
      for (let t in CSS_PIXELS) {
        let n = r.hasOwnProperty(CSS_PIXELS[t]) ? i(r[CSS_PIXELS[t]]) : [0];
        e(l, n);
      }
      for (let t in CSS_ORIGINS) {
        let n = r.hasOwnProperty(CSS_ORIGINS[t])
          ? s(r[CSS_ORIGINS[t]])
          : [0, 0];
        e(l, n);
      }
      return l;
    };
    let l = function (t) {
      let n = t.hasOwnProperty("attributes") ? t["attributes"] : {};
      let r = n.hasOwnProperty("style") ? n["style"] : {};
      let o = r.hasOwnProperty("offsetHeight") ? r["offsetHeight"] : "0";
      if (o) o = parseFloat(o.trim());
      let i = r.hasOwnProperty("offsetWidth") ? r["offsetWidth"] : "0";
      if (i) i = parseFloat(i.trim());
      let s = r.hasOwnProperty("display") ? r["display"] : "-1";
      if (s) s.trim().toLowerCase();
      s = DISPLAY_ATTR_MAP.hasOwnProperty(s) ? DISPLAY_ATTR_MAP[s] : 0;
      let a = new Array(ONE_HOT_DISPLAY_LEN).fill(0);
      if (s > 0) a[s - 1] = 1;
      let l = [o, i];
      e(l, a);
      let c = r.hasOwnProperty("font-size") ? r["font-size"] : 0;
      if (c) c = parseFloat(c.trim().toLowerCase().replace("px", ""));
      push(l, c);
      return l;
    };
    this.getNodeFeatures = function (
      o,
      i,
      s = true,
      c = false,
      u = false,
      p = false
    ) {
      let d = [];
      if (s == true) {
        push(d, o.nodeId);
        push(d, o.parentNodeId);
        push(d, o.siblings);
        e(d, n(o));
        push(d, o.nodeLevel);
        push(d, o.numChildren);
        let t = o.hasOwnProperty("requestType") ? o["requestType"] : null;
        if (t !== null) t = t.toLowerCase();
        let r = new Array(REQUEST_TYPES.length).fill(0);
        if (t !== null && requestTypesDict.hasOwnProperty(t))
          r = requestTypesDict[t];
        e(d, r);
      }
      if (c == true) {
        let n = o.hasOwnProperty("attributes") ? o["attributes"] : undefined;
        let s = "";
        if (n != undefined && n.hasOwnProperty("src")) {
          s = n["src"];
          s = s.trim().toLowerCase();
        }
        e(d, t(s, 256));
        e(d, r(o, i, "src"));
        let a = "";
        if (n != undefined && n.hasOwnProperty("href")) {
          a = n["href"];
          a = a.trim().toLowerCase();
        }
        e(d, t(a, 256));
        e(d, r(o, i, "href"));
        let l = "";
        if (n != undefined && n.hasOwnProperty("id")) {
          l = n["id"];
          l = l.trim().toLowerCase();
          l = l
            .replace(/[!"'\(\)\*,\-\.\/:;\?\[\\\]\^_`\{\|\}~“” ]/g, " ")
            .replace(/\s+/g, " ");
        }
        e(d, t(l, 16));
        let c = "";
        if (n != undefined && n.hasOwnProperty("class")) {
          c = n["class"];
          c = c.trim().toLowerCase();
          c = c
            .replace(/[!"'\(\)\*,\-\.\/:;\?\[\\\]\^_`\{\|\}~“” ]/g, " ")
            .replace(/\s+/g, " ");
        }
        e(d, t(c, 16));
      }
      if (u == true) e(d, l(o));
      if (p == true) e(d, a(o));
      return d;
    };
  };
  const snippets = {
    log: log,
    race: race,
    debug: setDebug,
    profile: setProfile,
    "hide-if-matches-xpath": hideIfMatchesXPath,
    "hide-if-contains": hideIfContains,
    "hide-if-contains-similar-text": hideIfContainsSimilarText,
    "hide-if-contains-visible-text": hideIfContainsVisibleText,
    "hide-if-contains-and-matches-style": hideIfContainsAndMatchesStyle,
    "hide-if-has-and-matches-style": hideIfHasAndMatchesStyle,
    "hide-if-labelled-by": hideIfLabelledBy,
    "hide-if-contains-image": hideIfContainsImage,
    "hide-if-graph-matches": hideIfGraphMatches,
    "simulate-event-poc": simulateEvent,
  };
  const dependencies = {};
  exports.dependencies = dependencies;
  let ctx;
  for (const [name, ...args] of _) {
    if (snippets.hasOwnProperty(name)) {
      try {
        ctx = snippets[name].apply(ctx, args);
      } catch (error) {
        console.error(error);
      }
    }
  }
  ctx = void 0;
};
const graph = new Map([
  ["log", null],
  ["race", null],
  ["debug", null],
  ["profile", null],
  ["hide-if-matches-xpath", null],
  ["hide-if-contains", null],
  ["hide-if-contains-similar-text", null],
  ["hide-if-contains-visible-text", null],
  ["hide-if-contains-and-matches-style", null],
  ["hide-if-has-and-matches-style", null],
  ["hide-if-labelled-by", null],
  ["hide-if-contains-image", null],
  ["hide-if-graph-matches", null],
  ["simulate-event-poc", null],
]);
callback.get = (snippet) => graph.get(snippet);
callback.has = (snippet) => graph.has(snippet);
export default callback;
