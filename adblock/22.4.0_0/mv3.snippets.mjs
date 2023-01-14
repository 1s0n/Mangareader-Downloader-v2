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
  const proxy = (e, t) => new $$1(e, { apply: (e, r, n) => apply$2(t, r, n) });
  const handler$2 = {
    get(e, t) {
      return bind(e[t], e);
    },
  };
  const bound = (e) => new $$1(e, handler$2);
  const {
    assign: assign$1,
    defineProperties: defineProperties$1,
    freeze: freeze$1,
    getOwnPropertyDescriptor: getOwnPropertyDescriptor$3,
    getOwnPropertyDescriptors: getOwnPropertyDescriptors$1,
    getPrototypeOf: getPrototypeOf,
  } = bound(Object);
  const { hasOwnProperty: hasOwnProperty } = caller({});
  const { species: species } = Symbol;
  const handler$1 = {
    get(e, t) {
      const r = e[t];
      class n extends r {}
      const o = getOwnPropertyDescriptors$1(r.prototype);
      delete o.constructor;
      freeze$1(defineProperties$1(n.prototype, o));
      const i = getOwnPropertyDescriptors$1(r);
      delete i.length;
      delete i.prototype;
      i[species] = { value: n };
      return freeze$1(defineProperties$1(n, i));
    },
  };
  const secure = (e) => new $$1(e, handler$1);
  const libEnvironment = typeof environment !== "undefined" ? environment : {};
  if (typeof globalThis === "undefined") window.globalThis = window;
  const { apply: apply$1, ownKeys: ownKeys } = bound(Reflect);
  const worldEnvDefined = "world" in libEnvironment;
  const isIsolatedWorld =
    worldEnvDefined && libEnvironment.world === "ISOLATED";
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
    getOwnPropertyDescriptor: getOwnPropertyDescriptor$2,
    getOwnPropertyDescriptors: getOwnPropertyDescriptors,
  } = bound(Object);
  const invokes = bound(globalThis);
  const classes = isExtensionContext$2 ? globalThis : secure(globalThis);
  const {
    Map: Map$b,
    RegExp: RegExp$1,
    Set: Set$2,
    WeakMap: WeakMap$4,
    WeakSet: WeakSet$6,
  } = classes;
  const augment = (e, t, r = null) => {
    const n = ownKeys(t);
    for (const o of ownKeys(e)) {
      if (n.includes(o)) continue;
      const i = getOwnPropertyDescriptor$2(e, o);
      if (r && "value" in i) {
        const { value: e } = i;
        if (typeof e === "function") i.value = r(e);
      }
      defineProperty(t, o, i);
    }
  };
  const primitive = (e) => {
    const t = classes[e];
    class r extends t {}
    const { toString: n, valueOf: o } = t.prototype;
    defineProperties(r.prototype, {
      toString: { value: n },
      valueOf: { value: o },
    });
    const i = e.toLowerCase();
    const s = (e) =>
      function () {
        const t = apply$1(e, this, arguments);
        return typeof t === i ? new r(t) : t;
      };
    augment(t, r, s);
    augment(t.prototype, r.prototype, s);
    return r;
  };
  const variables$3 = freeze({
    frozen: new WeakMap$4(),
    hidden: new WeakSet$6(),
    iframePropertiesToAbort: { read: new Set$2(), write: new Set$2() },
    abortedIframes: new WeakMap$4(),
  });
  const startsCapitalized = new RegExp$1("^[A-Z]");
  var env = new Proxy(
    new Map$b([
      [
        "chrome",
        (isExtensionContext$2 &&
          ((isChrome && chrome) || (isOtherThanChrome && browser))) ||
          void 0,
      ],
      ["isExtensionContext", isExtensionContext$2],
      ["variables", variables$3],
      ["console", copyIfExtension(console)],
      ["document", globalThis.document],
      ["performance", copyIfExtension(performance)],
      ["JSON", copyIfExtension(JSON)],
      ["Map", Map$b],
      ["Math", copyIfExtension(Math)],
      ["Number", isExtensionContext$2 ? Number : primitive("Number")],
      ["RegExp", RegExp$1],
      ["Set", Set$2],
      ["String", isExtensionContext$2 ? String : primitive("String")],
      ["WeakMap", WeakMap$4],
      ["WeakSet", WeakSet$6],
      ["MouseEvent", MouseEvent],
    ]),
    {
      get(e, t) {
        if (e.has(t)) return e.get(t);
        let r = globalThis[t];
        if (typeof r === "function")
          r = (startsCapitalized.test(t) ? classes : invokes)[t];
        e.set(t, r);
        return r;
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
    const { WeakSet: t, WeakMap: r, WeakValue: n } = this || helpers;
    const o = new t();
    const i = new r();
    const s = new n();
    return function (t) {
      if (o.has(t)) return t;
      if (i.has(t)) return i.get(t);
      if (s.has(t)) return s.get(t);
      const r = apply(e, this, arguments);
      o.add(r);
      if (r !== t) (typeof t === "object" && t ? i : s).set(t, r);
      return r;
    };
  }
  const {
    Map: Map$a,
    WeakMap: WeakMap$3,
    WeakSet: WeakSet$5,
    setTimeout: setTimeout$2,
  } = env;
  let cleanup = true;
  let cleanUpCallback = (e) => {
    e.clear();
    cleanup = !cleanup;
  };
  var transformer = transformOnce.bind({
    WeakMap: WeakMap$3,
    WeakSet: WeakSet$5,
    WeakValue: class extends Map$a {
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
  const { Map: Map$9, WeakMap: WeakMap$2 } = secure(globalThis);
  const map = new Map$9();
  const descriptors = (e) => {
    const t = [];
    let r = e;
    while (r) {
      if (map.has(r)) unshift(t, map.get(r));
      else {
        const e = getOwnPropertyDescriptors$1(r);
        map.set(r, e);
        unshift(t, e);
      }
      r = getPrototypeOf(r);
    }
    unshift(t, {});
    return apply$2(assign$1, null, t);
  };
  const chain = (e) => {
    const t = typeof e === "function" ? e.prototype : e;
    const r = descriptors(t);
    const n = {
      get(e, t) {
        if (t in r) {
          const { value: n, get: o } = r[t];
          if (o) return call(o, e);
          if (typeof n === "function") return bind(n, e);
        }
        return e[t];
      },
      set(e, t, n) {
        if (t in r) {
          const { set: o } = r[t];
          if (o) {
            call(o, e, n);
            return true;
          }
        }
        e[t] = n;
        return true;
      },
    };
    return (e) => new Proxy(e, n);
  };
  const {
    isExtensionContext: isExtensionContext$1,
    Array: Array$3,
    Number: Number$1,
    String: String$1,
    Object: Object$9,
  } = env;
  const { isArray: isArray } = Array$3;
  const {
    getOwnPropertyDescriptor: getOwnPropertyDescriptor$1,
    setPrototypeOf: setPrototypeOf$1,
  } = Object$9;
  const { toString: toString$1 } = Object$9.prototype;
  const { slice: slice } = String$1.prototype;
  const getBrand = (e) => call(slice, call(toString$1, e), 8, -1);
  const { get: nodeType } = getOwnPropertyDescriptor$1(
    Node.prototype,
    "nodeType"
  );
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
    if (isArray(e)) return setPrototypeOf$1(e, Array$3.prototype);
    const r = getBrand(e);
    if (r in chained) return chained[r](e);
    if (r in env) return setPrototypeOf$1(e, env[r].prototype);
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
    throw new Error("unknown brand " + r);
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
    variables: variables$2,
    Array: Array$2,
    MutationObserver: MutationObserver$8,
    Object: Object$8,
    XPathEvaluator: XPathEvaluator,
    XPathExpression: XPathExpression,
    XPathResult: XPathResult,
  } = $(window);
  let { querySelectorAll: querySelectorAll } = document$1;
  let $$ = querySelectorAll && bind(querySelectorAll, document$1);
  const { assign: assign, setPrototypeOf: setPrototypeOf } = Object$8;
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
    if (variables$2.hidden.has(e)) return;
    notifyElementHidden(e);
    variables$2.hidden.add(e);
    let { style: t } = $(e);
    let r = $(t, "CSSStyleDeclaration");
    let n = $([]);
    let { debugCSSProperties: o } = libEnvironment;
    for (let [e, t] of o || [["display", "none"]]) {
      r.setProperty(e, t, "important");
      n.push([e, r.getPropertyValue(e)]);
    }
    new MutationObserver$8(() => {
      for (let [e, t] of n) {
        let n = r.getPropertyValue(e);
        let o = r.getPropertyPriority(e);
        if (n != t || o != "important") r.setProperty(e, t, "important");
      }
    }).observe(e, { attributes: true, attributeFilter: ["style"] });
  }
  function notifyElementHidden(e) {
    if (isExtensionContext && typeof checkElement === "function")
      checkElement(e);
  }
  function initQueryAndApply(e) {
    let t = e;
    if (t.startsWith("xpath(") && t.endsWith(")")) {
      let e = t.slice(6, -1);
      let r = new $XPathEvaluator();
      let n = r.createExpression(e, null);
      let o = XPathResult.ORDERED_NODE_SNAPSHOT_TYPE;
      return (e) => {
        if (!e) return;
        let t = n.evaluate(document$1, o, null);
        let { snapshotLength: r } = t;
        for (let n = 0; n < r; n++) e(t.snapshotItem(n));
      };
    }
    return (t) => $$(e).forEach(t);
  }
  function initQueryAll(e) {
    let t = e;
    if (t.startsWith("xpath(") && t.endsWith(")")) {
      let t = initQueryAndApply(e);
      return () => {
        let e = $([]);
        t((t) => e.push(t));
        return e;
      };
    }
    return () => Array$2.from($$(e));
  }
  function hideIfMatches(e, t, r) {
    if (r == null) r = t;
    let n;
    const o = () => {
      for (const o of $$(r)) {
        const r = $(o).closest(t);
        if (r && e(o, r)) {
          n();
          hideElement(r);
        }
      }
    };
    return assign(new MutationObserver$8(o), {
      race(e) {
        n = e;
        this.observe(document$1, {
          childList: true,
          characterData: true,
          subtree: true,
        });
        o();
      },
    });
  }
  function isVisible(e, t, r) {
    let n = $(t, "CSSStyleDeclaration");
    if (n.getPropertyValue("display") == "none") return false;
    let o = n.getPropertyValue("visibility");
    if (o == "hidden" || o == "collapse") return false;
    if (!r || e == r) return true;
    let i = $(e).parentElement;
    if (!i) return true;
    return isVisible(i, getComputedStyle$3(i), r);
  }
  function getComputedCSSText(e) {
    let t = getComputedStyle$3(e);
    let { cssText: r } = t;
    if (r) return r;
    for (let e of t) r += `${e}: ${t[e]}; `;
    return $(r).trim();
  }
  let {
    parseInt: parseInt$1,
    setTimeout: setTimeout$1,
    Error: Error$9,
    MouseEvent: MouseEvent$1,
    MutationObserver: MutationObserver$7,
    WeakSet: WeakSet$4,
  } = $(window);
  function simulateEvent(e, t, r = "0") {
    if (!e)
      throw new Error$9("[simulate-event snippet]: No event type provided.");
    if (!t)
      throw new Error$9("[simulate-event snippet]: No selector provided.");
    let n = initQueryAndApply(t);
    let o = parseInt$1(r, 10);
    let i = new WeakSet$4();
    let s = new MutationObserver$7(a);
    s.observe(document, { childList: true, subtree: true });
    a();
    function a() {
      n((t) => {
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
  let { Math: Math$1, RegExp: RegExp } = $(window);
  function regexEscape(e) {
    return $(e).replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
  }
  function toRegExp(e) {
    let { length: t } = e;
    if (t > 1 && e[0] === "/") {
      let r = e[t - 1] === "/";
      if (r || (t > 2 && $(e).endsWith("/i"))) {
        let t = [$(e).slice(1, r ? -1 : -2)];
        if (!r) t.push("i");
        return new RegExp(...t);
      }
    }
    return new RegExp(regexEscape(e));
  }
  function randomId() {
    return $(Math$1.floor(Math$1.random() * 2116316160 + 60466176)).toString(
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
  const { console: console$3 } = $(window);
  const noop = () => {};
  function log(...e) {
    if (debug()) $(e).unshift("%c DEBUG", "font-weight: bold");
    console$3.log(...e);
  }
  function getDebugger(e) {
    return bind(debug() ? log : noop, null, e);
  }
  let {
    Array: Array$1,
    Error: Error$8,
    Map: Map$8,
    parseInt: parseInt,
  } = $(window);
  let stack = null;
  let won = null;
  function race(e, t = "1") {
    switch (e) {
      case "start":
        stack = { winners: parseInt(t, 10) || 1, participants: new Map$8() };
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
        throw new Error$8(`Invalid action: ${e}`);
    }
  }
  function raceWinner(e, t) {
    if (stack === null) return noop;
    let r = stack;
    let { participants: n } = r;
    n.set(o, t);
    return o;
    function o() {
      if (r.winners < 1) return;
      let t = getDebugger("race");
      t(`${e} won the race`);
      if (r === stack) {
        won.push(o);
      } else {
        n.delete(o);
        if (--r.winners < 1) {
          for (let e of n.values()) e();
          n.clear();
        }
      }
    }
  }
  function hideIfContains(e, t = "*", r = null) {
    let n = toRegExp(e);
    const o = hideIfMatches((e) => n.test($(e).textContent), t, r);
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
    r = null,
    n = null,
    o = null
  ) {
    if (r == null) r = t;
    let i = toRegExp(e);
    let s = n ? toRegExp(n) : null;
    let a = o ? toRegExp(o) : null;
    let l = () => {
      for (let e of $$(r)) {
        if (i.test($(e).textContent) && (!a || a.test(getComputedCSSText(e)))) {
          let r = $(e).closest(t);
          if (r && (!s || s.test(getComputedCSSText(r)))) {
            p();
            hideElement(r);
          }
        }
      }
    };
    let c = new MutationObserver$6(l);
    let p = raceWinner("hide-if-contains-and-matches-style", () =>
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
    fetch: fetch$1,
    getComputedStyle: getComputedStyle$2,
    setTimeout: setTimeout,
    Map: Map$7,
    MutationObserver: MutationObserver$5,
    Uint8Array: Uint8Array,
  } = $(window);
  function hideIfContainsImage(e, t, r) {
    if (r == null) r = t;
    let n = toRegExp(e);
    let o = () => {
      for (let e of $$(r)) {
        let r = getComputedStyle$2(e);
        let o = $(r["background-image"]).match(/^url\("(.*)"\)$/);
        if (o) {
          fetchContent(o[1]).then((r) => {
            if (n.test(uint8ArrayToHex(new Uint8Array(r)))) {
              let r = $(e).closest(t);
              if (r) {
                s();
                hideElement(r);
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
  let fetchContentMap = new Map$7();
  function fetchContent(e, { as: t = "arrayBuffer", cleanup: r = 6e4 } = {}) {
    let n = t + ":" + e;
    let o = fetchContentMap.get(n) || {
      remove: () => fetchContentMap.delete(n),
      result: null,
      timer: 0,
    };
    clearTimeout(o.timer);
    o.timer = setTimeout(o.remove, r);
    if (!o.result) {
      o.result = fetch$1(e)
        .then((e) => e[t]())
        .catch(o.remove);
      fetchContentMap.set(n, o);
    }
    return o.result;
  }
  function toHex(e, t = 2) {
    let r = $(e).toString(16);
    if (r.length < t) r = $("0").repeat(t - r.length) + r;
    return r;
  }
  function uint8ArrayToHex(e) {
    return e.reduce((e, t) => e + toHex(t), "");
  }
  let {
    getComputedStyle: getComputedStyle$1,
    Map: Map$6,
    WeakSet: WeakSet$3,
    parseFloat: parseFloat$1,
  } = $(window);
  const { ELEMENT_NODE: ELEMENT_NODE$2, TEXT_NODE: TEXT_NODE$1 } = Node;
  function hideIfContainsVisibleText(e, t, r = null, ...n) {
    let o = $([]);
    const i = new Map$6([["-snippet-box-margin", "2"]]);
    for (let e of n) {
      e = $(e);
      let t = e.indexOf(":");
      if (t < 0) continue;
      let r = e.slice(0, t).trim().toString();
      let n = e
        .slice(t + 1)
        .trim()
        .toString();
      if (r && n) {
        if (i.has(r)) i.set(r, n);
        else o.push([r, n]);
      }
    }
    let s = $([
      ["opacity", "0"],
      ["font-size", "0px"],
      ["color", "rgba(0, 0, 0, 0)"],
    ]);
    let a = new Map$6(s.concat(o));
    function l(e, t) {
      if (!t) t = getComputedStyle$1(e);
      t = $(t);
      for (const [e, r] of a) {
        let n = toRegExp(r);
        if (n.test(t.getPropertyValue(e))) return false;
      }
      let r = t.getPropertyValue("color");
      if (t.getPropertyValue("background-color") == r) return false;
      return true;
    }
    function c(e, t) {
      let r = getComputedStyle$1(e, t);
      if (!isVisible(e, r) || !l(e, r)) return "";
      let { content: n } = $(r);
      if (n && n !== "none") {
        let t = $([]);
        n = $(n)
          .trim()
          .replace(
            /(["'])(?:(?=(\\?))\2.)*?\1/g,
            (e) => `${t.push($(e).slice(1, -1)) - 1}`
          );
        n = n.replace(
          /\s*attr\(\s*([^\s,)]+)[^)]*?\)\s*/g,
          (t, r) => $(e).getAttribute(r) || ""
        );
        return n.replace(/\x01(\d+)/g, (e, r) => t[r]);
      }
      return "";
    }
    function p(e, t, { boxMargin: r = 2 } = {}) {
      const n = $(e).getBoundingClientRect();
      const o = $(t).getBoundingClientRect();
      const i = {
        left: o.left - r,
        right: o.right + r,
        top: o.top - r,
        bottom: o.bottom + r,
      };
      return (
        i.left <= n.left &&
        n.left <= i.right &&
        i.top <= n.top &&
        n.top <= i.bottom &&
        i.top <= n.bottom &&
        n.bottom <= i.bottom &&
        i.left <= n.right &&
        n.right <= i.right
      );
    }
    function u(e, t, r, n, { boxMargin: o = 2 } = {}) {
      let i = !r;
      if (i) r = getComputedStyle$1(e);
      if (!isVisible(e, r, i && t)) return "";
      if (
        !n &&
        ($(r).getPropertyValue("overflow-x") === "hidden" ||
          $(r).getPropertyValue("overflow-y") === "hidden")
      )
        n = e;
      let s = c(e, ":before");
      for (let t of $(e).childNodes) {
        switch ($(t).nodeType) {
          case ELEMENT_NODE$2:
            s += u(t, e, getComputedStyle$1(t), n, { boxMargin: o });
            break;
          case TEXT_NODE$1:
            if (n) {
              if (p(e, n, { boxMargin: o }) && l(e, r)) s += $(t).nodeValue;
            } else if (l(e, r)) {
              s += $(t).nodeValue;
            }
            break;
        }
      }
      return s + c(e, ":after");
    }
    const f = i.get("-snippet-box-margin");
    const d = parseFloat$1(f) || 0;
    let h = toRegExp(e);
    let g = new WeakSet$3();
    const y = hideIfMatches(
      (e, t) => {
        if (g.has(e)) return false;
        g.add(e);
        let r = u(e, t, null, null, { boxMargin: d });
        let n = h.test(r);
        if (debug() && r.length) log(n, h, r);
        return n;
      },
      t,
      r
    );
    y.race(
      raceWinner("hide-if-contains-visible-text", () => {
        y.disconnect();
      })
    );
  }
  let { MutationObserver: MutationObserver$4 } = $(window);
  function hideIfHasAndMatchesStyle(e, t = "*", r = null, n = null, o = null) {
    if (r == null) r = t;
    let i = n ? toRegExp(n) : null;
    let s = o ? toRegExp(o) : null;
    let a = () => {
      for (let n of $$(r)) {
        if ($(n).querySelector(e) && (!s || s.test(getComputedCSSText(n)))) {
          let e = $(n).closest(t);
          if (e && (!i || i.test(getComputedCSSText(e)))) {
            c();
            hideElement(e);
          }
        }
      }
    };
    let l = new MutationObserver$4(a);
    let c = raceWinner("hide-if-has-and-matches-style", () => l.disconnect());
    l.observe(document, { childList: true, subtree: true });
    a();
  }
  let {
    getComputedStyle: getComputedStyle,
    MutationObserver: MutationObserver$3,
    WeakSet: WeakSet$2,
  } = $(window);
  function hideIfLabelledBy(e, t, r = null) {
    let n = r == null;
    let o = toRegExp(e);
    let i = new WeakSet$2();
    let s = () => {
      for (let e of $$(t)) {
        let t = n ? e : $(e).closest(r);
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
            let r = $(document).getElementById(e);
            if (r) {
              if (!i.has(r) && o.test(r.innerText)) {
                l();
                i.add(r);
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
    let a = new MutationObserver$3(s);
    let l = raceWinner("hide-if-labelled-by", () => a.disconnect());
    a.observe(document, {
      characterData: true,
      childList: true,
      subtree: true,
    });
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
  let { MutationObserver: MutationObserver$2 } = $(window);
  const { ELEMENT_NODE: ELEMENT_NODE$1 } = Node;
  function hideIfMatchesXPath(e) {
    let { mark: t, end: r } = profile();
    let n = initQueryAndApply(`xpath(${e})`);
    let o = () => {
      t();
      n((e) => {
        s();
        if ($(e).nodeType === ELEMENT_NODE$1) hideElement(e);
        else $(e).textContent = "";
      });
      r();
    };
    let i = new MutationObserver$2(o);
    let s = raceWinner("hide-if-matches-xpath", () => i.disconnect());
    i.observe(document, {
      characterData: true,
      childList: true,
      subtree: true,
    });
    o();
  }
  const handler = {
    get(e, t) {
      const r = e;
      while (!hasOwnProperty(e, t)) e = getPrototypeOf(e);
      const { get: n, set: o } = getOwnPropertyDescriptor$3(e, t);
      return function () {
        return arguments.length ? apply$2(o, r, arguments) : call(n, r);
      };
    },
  };
  const accessor = (e) => new $$1(e, handler);
  let {
    parseFloat: parseFloat,
    variables: variables$1,
    Array: Array,
    Error: Error$7,
    Map: Map$5,
    Object: Object$7,
    ReferenceError: ReferenceError$2,
    Set: Set$1,
    WeakMap: WeakMap$1,
  } = $(window);
  let { onerror: onerror } = accessor(window);
  let NodeProto$1 = Node.prototype;
  let ElementProto$2 = Element.prototype;
  let propertyAccessors = null;
  function wrapPropertyAccess(e, t, r) {
    let n = $(t);
    let o = n.indexOf(".");
    if (o == -1) {
      let n = Object$7.getOwnPropertyDescriptor(e, t);
      if (n && !n.configurable) return;
      let o = Object$7.assign({}, r, { configurable: true });
      if (!n && !o.get && o.set) {
        let r = e[t];
        o.get = () => r;
      }
      Object$7.defineProperty(e, t, o);
      return;
    }
    let i = n.slice(0, o);
    t = n.slice(o + 1);
    let s = e[i];
    if (s && (typeof s == "object" || typeof s == "function"))
      wrapPropertyAccess(s, t, r);
    let a = Object$7.getOwnPropertyDescriptor(e, i);
    if (a && !a.configurable) return;
    if (!propertyAccessors) propertyAccessors = new WeakMap$1();
    if (!propertyAccessors.has(e)) propertyAccessors.set(e, new Map$5());
    let l = propertyAccessors.get(e);
    if (l.has(i)) {
      l.get(i).set(t, r);
      return;
    }
    let c = new Map$5([[t, r]]);
    l.set(i, c);
    Object$7.defineProperty(e, i, {
      get: () => s,
      set(e) {
        s = e;
        if (s && (typeof s == "object" || typeof s == "function")) {
          for (let [e, t] of c) wrapPropertyAccess(s, e, t);
        }
      },
      configurable: true,
    });
  }
  function overrideOnError(e) {
    let t = onerror();
    onerror((...r) => {
      let n = r.length && r[0];
      if (typeof n == "string" && $(n).includes(e)) return true;
      if (typeof t == "function") return apply$2(t, this, r);
    });
  }
  function abortOnRead(e, t, r) {
    let n = getDebugger(e);
    if (!r) {
      n("no property to abort on read");
      return;
    }
    let o = randomId();
    function i() {
      n(`${r} access aborted`);
      throw new ReferenceError$2(o);
    }
    n(`aborting on ${r} access`);
    wrapPropertyAccess(t, r, { get: i, set() {} });
    overrideOnError(o);
  }
  function abortOnWrite(e, t, r) {
    let n = getDebugger(e);
    if (!r) {
      n("no property to abort on write");
      return;
    }
    let o = randomId();
    function i() {
      n(`setting ${r} aborted`);
      throw new ReferenceError$2(o);
    }
    n(`aborting when setting ${r}`);
    wrapPropertyAccess(t, r, { set: i });
    overrideOnError(o);
  }
  function abortOnIframe(e, t = false, r = false) {
    let n = variables$1.abortedIframes;
    let o = variables$1.iframePropertiesToAbort;
    for (let o of Array.from(window.frames)) {
      if (n.has(o)) {
        for (let i of e) {
          if (t) n.get(o).read.add(i);
          if (r) n.get(o).write.add(i);
        }
      }
    }
    for (let n of e) {
      if (t) o.read.add(n);
      if (r) o.write.add(n);
    }
    i();
    if (!n.has(document)) {
      n.set(document, true);
      addHooksOnDomAdditions(i);
    }
    function i() {
      for (let e of Array.from(window.frames)) {
        if (!n.has(e)) {
          n.set(e, { read: new Set$1(o.read), write: new Set$1(o.write) });
        }
        let t = n.get(e).read;
        if (t.size > 0) {
          let r = Array.from(t);
          t.clear();
          for (let t of r) abortOnRead("abort-on-iframe-property-read", e, t);
        }
        let r = n.get(e).write;
        if (r.size > 0) {
          let t = Array.from(r);
          r.clear();
          for (let r of t) abortOnWrite("abort-on-iframe-property-write", e, r);
        }
      }
    }
  }
  function addHooksOnDomAdditions(e) {
    let t;
    r(NodeProto$1, ["appendChild", "insertBefore", "replaceChild"]);
    r(ElementProto$2, [
      "append",
      "prepend",
      "replaceWith",
      "after",
      "before",
      "insertAdjacentElement",
      "insertAdjacentHTML",
    ]);
    t = o(ElementProto$2, "innerHTML");
    wrapPropertyAccess(ElementProto$2, "innerHTML", t);
    t = o(ElementProto$2, "outerHTML");
    wrapPropertyAccess(ElementProto$2, "outerHTML", t);
    function r(e, t) {
      for (let r of t) {
        let t = n(e, r);
        wrapPropertyAccess(e, r, t);
      }
    }
    function n(t, r) {
      let n = t[r];
      return {
        get() {
          return function (...t) {
            let r;
            r = apply$2(n, this, t);
            e && e();
            return r;
          };
        },
      };
    }
    function o(t, r) {
      let n = Object$7.getOwnPropertyDescriptor(t, r);
      let { set: o } = n || {};
      return {
        set(t) {
          let r;
          r = call(o, this, t);
          e && e();
          return r;
        },
      };
    }
  }
  let { Object: NativeObject } = window;
  function findOwner(e, t) {
    if (!(e instanceof NativeObject)) return;
    let r = e;
    let n = $(t).split(".");
    if (n.length === 0) return;
    for (let e = 0; e < n.length - 1; e++) {
      let t = n[e];
      if (!hasOwnProperty(r, t)) return;
      r = r[t];
      if (!(r instanceof NativeObject)) return;
    }
    let o = n[n.length - 1];
    if (hasOwnProperty(r, o)) return [r, o];
  }
  const decimals = $(/^\d+$/);
  function overrideValue(e) {
    switch (e) {
      case "false":
        return false;
      case "true":
        return true;
      case "null":
        return null;
      case "noopFunc":
        return () => {};
      case "trueFunc":
        return () => true;
      case "falseFunc":
        return () => false;
      case "emptyArray":
        return [];
      case "emptyObj":
        return {};
      case "undefined":
        return void 0;
      case "":
        return e;
      default:
        if (decimals.test(e)) return parseFloat(e);
        throw new Error$7(
          "[override-property-read snippet]: " + `Value "${e}" is not valid.`
        );
    }
  }
  let {
    HTMLScriptElement: HTMLScriptElement$1,
    Object: Object$6,
    ReferenceError: ReferenceError$1,
  } = $(window);
  let Script = Object$6.getPrototypeOf(HTMLScriptElement$1);
  function abortCurrentInlineScript(e, t = null) {
    let r = t ? toRegExp(t) : null;
    let n = randomId();
    let o = $(document).currentScript;
    let i = window;
    let s = $(e).split(".");
    let a = $(s).pop();
    for (let e of $(s)) {
      i = i[e];
      if (!i || !(typeof i == "object" || typeof i == "function")) return;
    }
    let { get: l, set: c } = Object$6.getOwnPropertyDescriptor(i, a) || {};
    let p = i[a];
    let u = () => {
      let e = $(document).currentScript;
      if (
        e instanceof Script &&
        $(e, "HTMLScriptElement").src == "" &&
        e != o &&
        (!r || r.test($(e).textContent))
      )
        throw new ReferenceError$1(n);
    };
    let f = {
      get() {
        u();
        if (l) return call(l, this);
        return p;
      },
      set(e) {
        u();
        if (c) call(c, this, e);
        else p = e;
      },
    };
    wrapPropertyAccess(i, a, f);
    overrideOnError(n);
  }
  function abortOnIframePropertyRead(...e) {
    abortOnIframe(e, true, false);
  }
  function abortOnIframePropertyWrite(...e) {
    abortOnIframe(e, false, true);
  }
  function abortOnPropertyRead(e) {
    abortOnRead("abort-on-property-read", window, e);
  }
  function abortOnPropertyWrite(e) {
    abortOnWrite("abort-on-property-write", window, e);
  }
  let { Error: Error$6 } = $(window);
  let { cookie: documentCookies } = accessor(document);
  function cookieRemover(e) {
    if (!e) throw new Error$6("[cookie-remover snippet]: No cookie to remove.");
    let t = getDebugger("cookie-remover");
    let r = toRegExp(e);
    if (!$(/^http|^about/).test(location.protocol)) {
      t("Snippet only works for http or https and about.");
      return;
    }
    t("Parsing cookies for matches");
    for (const e of $(n())) {
      let r = $(location.hostname);
      let n = $(e).split("=")[0];
      let o = "expires=Thu, 01 Jan 1970 00:00:00 GMT";
      let i = "path=/";
      let s = "domain=" + r.slice(r.indexOf(".") + 1);
      documentCookies(`${$(n).trim()}=;${o};${i};${s}`);
      t(`Set expiration date on ${n}`);
    }
    function n() {
      const e = $(documentCookies()).split(";");
      return e.filter((e) => r.test($(e).split("=")[0]));
    }
  }
  let {
    ELEMENT_NODE: ELEMENT_NODE,
    TEXT_NODE: TEXT_NODE,
    prototype: NodeProto,
  } = Node;
  let { prototype: ElementProto$1 } = Element;
  let { prototype: HTMLElementProto } = HTMLElement;
  let {
    console: console$2,
    variables: variables,
    DOMParser: DOMParser,
    Error: Error$5,
    MutationObserver: MutationObserver$1,
    Object: Object$5,
    ReferenceError: ReferenceError,
  } = $(window);
  let { getOwnPropertyDescriptor: getOwnPropertyDescriptor } = Object$5;
  function freezeElement(e, t = "", ...r) {
    let n;
    let o = false;
    let i = false;
    let s = $(r).filter((e) => !f(e));
    let a = $(r)
      .filter((e) => f(e))
      .map(toRegExp);
    let l = randomId();
    let c;
    let p = initQueryAll(e);
    d();
    let u = {
      selector: e,
      shouldAbort: i,
      rid: l,
      exceptionSelectors: s,
      regexExceptions: a,
      changeId: 0,
    };
    if (!variables.frozen.has(document)) {
      variables.frozen.set(document, true);
      h();
    }
    n = new MutationObserver$1(g);
    n.observe(document, { childList: true, subtree: true });
    g();
    function f(e) {
      return e.length >= 2 && e[0] == "/" && e[e.length - 1] == "/";
    }
    function d() {
      let r = $(t).split("+");
      if (r.length === 1 && r[0] === "") r = [];
      for (let t of r) {
        switch (t) {
          case "subtree":
            o = true;
            break;
          case "abort":
            i = true;
            break;
          default:
            throw new Error$5(
              "[freeze] Unknown option passed to the snippet." +
                " [selector]: " +
                e +
                " [option]: " +
                t
            );
        }
      }
    }
    function h() {
      let e;
      e = S(NodeProto, "appendChild", t, o);
      wrapPropertyAccess(NodeProto, "appendChild", e);
      e = S(NodeProto, "insertBefore", t, o);
      wrapPropertyAccess(NodeProto, "insertBefore", e);
      e = S(NodeProto, "replaceChild", t, o);
      wrapPropertyAccess(NodeProto, "replaceChild", e);
      e = x(ElementProto$1, "append", t, o);
      wrapPropertyAccess(ElementProto$1, "append", e);
      e = x(ElementProto$1, "prepend", t, o);
      wrapPropertyAccess(ElementProto$1, "prepend", e);
      e = x(ElementProto$1, "replaceWith", r, i);
      wrapPropertyAccess(ElementProto$1, "replaceWith", e);
      e = x(ElementProto$1, "after", r, i);
      wrapPropertyAccess(ElementProto$1, "after", e);
      e = x(ElementProto$1, "before", r, i);
      wrapPropertyAccess(ElementProto$1, "before", e);
      e = T(ElementProto$1, "insertAdjacentElement", n, s);
      wrapPropertyAccess(ElementProto$1, "insertAdjacentElement", e);
      e = T(ElementProto$1, "insertAdjacentHTML", n, s);
      wrapPropertyAccess(ElementProto$1, "insertAdjacentHTML", e);
      e = T(ElementProto$1, "insertAdjacentText", n, s);
      wrapPropertyAccess(ElementProto$1, "insertAdjacentText", e);
      e = C(ElementProto$1, "innerHTML", t, o);
      wrapPropertyAccess(ElementProto$1, "innerHTML", e);
      e = C(ElementProto$1, "outerHTML", r, i);
      wrapPropertyAccess(ElementProto$1, "outerHTML", e);
      e = A(NodeProto, "textContent", t, o);
      wrapPropertyAccess(NodeProto, "textContent", e);
      e = A(HTMLElementProto, "innerText", t, o);
      wrapPropertyAccess(HTMLElementProto, "innerText", e);
      e = A(NodeProto, "nodeValue", t, o);
      wrapPropertyAccess(NodeProto, "nodeValue", e);
      function t(e) {
        return e && variables.frozen.has(e);
      }
      function r(e) {
        try {
          return (
            e &&
            (variables.frozen.has(e) || variables.frozen.has($(e).parentNode))
          );
        } catch (e) {
          return false;
        }
      }
      function n(e, t) {
        try {
          return (
            e &&
            ((variables.frozen.has(e) && t) ||
              (variables.frozen.has($(e).parentNode) && !t))
          );
        } catch (e) {
          return false;
        }
      }
      function o(e) {
        return variables.frozen.get(e);
      }
      function i(e) {
        try {
          if (variables.frozen.has(e)) return variables.frozen.get(e);
          let t = $(e).parentNode;
          return variables.frozen.get(t);
        } catch (e) {}
      }
      function s(e, t) {
        try {
          if (variables.frozen.has(e) && t) return variables.frozen.get(e);
          let r = $(e).parentNode;
          return variables.frozen.get(r);
        } catch (e) {}
      }
    }
    function g() {
      c = p();
      y(c, false);
    }
    function y(e, t = true) {
      for (let r of e) {
        if (!variables.frozen.has(r)) {
          variables.frozen.set(r, u);
          if (!t && o) {
            new MutationObserver$1((e) => {
              for (let t of $(e)) y($(t, "MutationRecord").addedNodes);
            }).observe(r, { childList: true, subtree: true });
          }
          if (o && $(r).nodeType === ELEMENT_NODE) y($(r).childNodes);
        }
      }
    }
    function b(e, ...t) {
      log(`[freeze][${e}] `, ...t);
    }
    function w(e, t, r, n) {
      let o = n.selector;
      let i = n.changeId;
      let s = typeof e == "string";
      let a = n.shouldAbort ? "aborting" : "watching";
      console$2.groupCollapsed(`[freeze][${i}] ${a}: ${o}`);
      switch (r) {
        case "appendChild":
        case "append":
        case "prepend":
        case "insertBefore":
        case "replaceChild":
        case "insertAdjacentElement":
        case "insertAdjacentHTML":
        case "insertAdjacentText":
        case "innerHTML":
        case "outerHTML":
          b(i, s ? "text: " : "node: ", e);
          b(i, "added to node: ", t);
          break;
        case "replaceWith":
        case "after":
        case "before":
          b(i, s ? "text: " : "node: ", e);
          b(i, "added to node: ", $(t).parentNode);
          break;
        case "textContent":
        case "innerText":
        case "nodeValue":
          b(i, "content of node: ", t);
          b(i, "changed to: ", e);
          break;
      }
      b(i, `using the function "${r}"`);
      console$2.groupEnd();
      n.changeId++;
    }
    function m(e, t) {
      if (t) {
        let r = $(e);
        for (let e of t) {
          if (r.matches(e)) return true;
        }
      }
      return false;
    }
    function E(e, t) {
      if (t) {
        for (let r of t) {
          if (r.test(e)) return true;
        }
      }
      return false;
    }
    function v(e) {
      throw new ReferenceError(e);
    }
    function P(e, t, r, n) {
      let o = new DOMParser();
      let { body: i } = $(o.parseFromString(e, "text/html"));
      let s = $(i).childNodes;
      let a = O(s, t, r, n);
      let l = $(a).map((e) => {
        switch ($(e).nodeType) {
          case ELEMENT_NODE:
            return $(e).outerHTML;
          case TEXT_NODE:
            return $(e).textContent;
          default:
            return "";
        }
      });
      return l.join("");
    }
    function O(e, t, r, n) {
      let o = $([]);
      for (let i of e) {
        if (M(i, t, r, n)) o.push(i);
      }
      return o;
    }
    function M(e, t, r, n) {
      let o = n.shouldAbort;
      let i = n.regexExceptions;
      let s = n.exceptionSelectors;
      let a = n.rid;
      if (typeof e == "string") {
        let s = e;
        if (E(s, i)) return true;
        if (debug()) w(s, t, r, n);
        if (o) v(a);
        return debug();
      }
      let l = e;
      switch ($(l).nodeType) {
        case ELEMENT_NODE:
          if (m(l, s)) return true;
          if (o) {
            if (debug()) w(l, t, r, n);
            v(a);
          }
          if (debug()) {
            hideElement(l);
            w(l, t, r, n);
            return true;
          }
          return false;
        case TEXT_NODE:
          if (E($(l).textContent, i)) return true;
          if (debug()) w(l, t, r, n);
          if (o) v(a);
          return false;
        default:
          return true;
      }
    }
    function S(e, t, r, n) {
      let o = getOwnPropertyDescriptor(e, t) || {};
      let i = (o.get && call(o.get, e)) || o.value;
      if (!i) return;
      return {
        get() {
          return function (...e) {
            if (r(this)) {
              let r = n(this);
              if (r) {
                let n = e[0];
                if (!M(n, this, t, r)) return n;
              }
            }
            return apply$2(i, this, e);
          };
        },
      };
    }
    function x(e, t, r, n) {
      let o = getOwnPropertyDescriptor(e, t) || {};
      let i = (o.get && call(o.get, e)) || o.value;
      if (!i) return;
      return {
        get() {
          return function (...e) {
            if (!r(this)) return apply$2(i, this, e);
            let o = n(this);
            if (!o) return apply$2(i, this, e);
            let s = O(e, this, t, o);
            if (s.length > 0) return apply$2(i, this, s);
          };
        },
      };
    }
    function T(e, t, r, n) {
      let o = getOwnPropertyDescriptor(e, t) || {};
      let i = (o.get && call(o.get, e)) || o.value;
      if (!i) return;
      return {
        get() {
          return function (...e) {
            let [o, s] = e;
            let a = o === "afterbegin" || o === "beforeend";
            if (r(this, a)) {
              let e = n(this, a);
              if (e) {
                let r = a ? this : $(this).parentNode;
                let n;
                switch (t) {
                  case "insertAdjacentElement":
                    if (!M(s, r, t, e)) return s;
                    break;
                  case "insertAdjacentHTML":
                    n = P(s, r, t, e);
                    if (n) return call(i, this, o, n);
                    return;
                  case "insertAdjacentText":
                    if (!M(s, r, t, e)) return;
                    break;
                }
              }
            }
            return apply$2(i, this, e);
          };
        },
      };
    }
    function C(e, t, r, n) {
      let o = getOwnPropertyDescriptor(e, t) || {};
      let { set: i } = o;
      if (!i) return;
      return {
        set(e) {
          if (!r(this)) return call(i, this, e);
          let o = n(this);
          if (!o) return call(i, this, e);
          let s = P(e, this, t, o);
          if (s) return call(i, this, s);
        },
      };
    }
    function A(e, t, r, n) {
      let o = getOwnPropertyDescriptor(e, t) || {};
      let { set: i } = o;
      if (!i) return;
      return {
        set(e) {
          if (!r(this)) return call(i, this, e);
          let o = n(this);
          if (!o) return call(i, this, e);
          if (M(e, this, t, o)) return call(i, this, e);
        },
      };
    }
  }
  const {
    Map: Map$4,
    MutationObserver: MutationObserver,
    Object: Object$4,
    Set: Set,
    WeakSet: WeakSet$1,
  } = $(window);
  let ElementProto = Element.prototype;
  let { attachShadow: attachShadow } = ElementProto;
  let hiddenShadowRoots = new WeakSet$1();
  let searches = new Map$4();
  let observer = null;
  function hideIfShadowContains(e, t = "*") {
    let r = `${e}\\${t}`;
    if (!searches.has(r)) {
      searches.set(r, [
        toRegExp(e),
        t,
        raceWinner("hide-if-shadow-contains", () => {
          searches.delete(r);
        }),
      ]);
    }
    if (!observer) {
      observer = new MutationObserver((e) => {
        let t = new Set();
        for (let { target: r } of $(e)) {
          let e = $(r).parentNode;
          while (e) [r, e] = [e, $(r).parentNode];
          if (hiddenShadowRoots.has(r)) continue;
          if (t.has(r)) continue;
          t.add(r);
          for (let [e, t, n] of searches.values()) {
            if (e.test($(r).textContent)) {
              let e = $(r.host).closest(t);
              if (e) {
                n();
                $(r).appendChild(document.createElement("style")).textContent =
                  ":host {display: none !important}";
                hideElement(e);
                hiddenShadowRoots.add(r);
              }
            }
          }
        }
      });
      Object$4.defineProperty(ElementProto, "attachShadow", {
        value: proxy(attachShadow, function () {
          let e = apply$2(attachShadow, this, arguments);
          observer.observe(e, {
            childList: true,
            characterData: true,
            subtree: true,
          });
          return e;
        }),
      });
    }
  }
  const {
    Error: Error$4,
    JSON: JSON$2,
    Map: Map$3,
    Object: Object$3,
  } = $(window);
  let paths$1 = null;
  function jsonOverride(e, t, r = "", n = "") {
    if (!e)
      throw new Error$4("[json-override snippet]: Missing paths to override.");
    if (typeof t == "undefined")
      throw new Error$4("[json-override snippet]: No value to override with.");
    if (!paths$1) {
      let e = getDebugger("json-override");
      let { parse: t } = JSON$2;
      paths$1 = new Map$3();
      Object$3.defineProperty(window.JSON, "parse", {
        value: proxy(t, function (r) {
          let n = apply$2(t, this, arguments);
          for (let {
            prune: t,
            needle: o,
            filter: i,
            value: s,
          } of paths$1.values()) {
            if (i && !i.test(r)) continue;
            if ($(o).some((e) => !findOwner(n, e))) return n;
            for (let r of t) {
              let t = findOwner(n, r);
              if (typeof t != "undefined") {
                e(`Found ${r} replaced it with ${s}`);
                t[0][t[1]] = overrideValue(s);
              }
            }
          }
          return n;
        }),
      });
      e("Wrapped JSON.parse for override");
    }
    paths$1.set(e, {
      prune: $(e).split(/ +/),
      needle: r.length ? $(r).split(/ +/) : [],
      filter: n ? toRegExp(n) : null,
      value: t,
    });
  }
  let {
    Error: Error$3,
    JSON: JSON$1,
    Map: Map$2,
    Object: Object$2,
  } = $(window);
  let paths = null;
  function jsonPrune(e, t = "") {
    if (!e) throw new Error$3("Missing paths to prune");
    if (!paths) {
      let e = getDebugger("json-prune");
      let { parse: t } = JSON$1;
      paths = new Map$2();
      Object$2.defineProperty(window.JSON, "parse", {
        value: proxy(t, function () {
          let r = apply$2(t, this, arguments);
          for (let { prune: t, needle: n } of paths.values()) {
            if ($(n).some((e) => !findOwner(r, e))) return r;
            for (let n of t) {
              let t = findOwner(r, n);
              if (typeof t != "undefined") {
                e(`Found ${n} and deleted`);
                delete t[0][t[1]];
              }
            }
          }
          return r;
        }),
      });
      e("Wrapped JSON.parse for prune");
    }
    paths.set(e, {
      prune: $(e).split(/ +/),
      needle: t.length ? $(t).split(/ +/) : [],
    });
  }
  let { Error: Error$2 } = $(window);
  function overridePropertyRead(e, t) {
    if (!e) {
      throw new Error$2(
        "[override-property-read snippet]: " + "No property to override."
      );
    }
    if (typeof t === "undefined") {
      throw new Error$2(
        "[override-property-read snippet]: " + "No value to override with."
      );
    }
    let r = getDebugger("override-property-read");
    let n = overrideValue(t);
    let o = () => {
      r(`${e} override done.`);
      return n;
    };
    r(`Overriding ${e}.`);
    wrapPropertyAccess(window, e, { get: o, set() {} });
  }
  let {
    Error: Error$1,
    Map: Map$1,
    Object: Object$1,
    console: console$1,
  } = $(window);
  let { toString: toString } = Function.prototype;
  let EventTargetProto = EventTarget.prototype;
  let { addEventListener: addEventListener } = EventTargetProto;
  let events = null;
  function preventListener(e, t, r) {
    if (!e) throw new Error$1("[prevent-listener snippet]: No event type.");
    if (!events) {
      events = new Map$1();
      let e = getDebugger("[prevent]");
      Object$1.defineProperty(EventTargetProto, "addEventListener", {
        value: proxy(addEventListener, function (t, r) {
          for (let { evt: n, handlers: o, selectors: i } of events.values()) {
            if (!n.test(t)) continue;
            let s = this instanceof Element;
            for (let a = 0; a < o.length; a++) {
              let l = o[a];
              let c = i[a];
              let p = () =>
                l.test(
                  call(toString, typeof r === "function" ? r : r.handleEvent)
                );
              if ((l && !p()) || (c && !(s && $(this).matches(c)))) continue;
              if (debug()) {
                console$1.groupCollapsed("DEBUG [prevent] was successful");
                e(`type: ${t} matching ${n}`);
                e("handler:", r);
                if (l) e(`matching ${l}`);
                if (c) e("on element: ", this, ` matching ${c}`);
                e("was prevented from being added");
                console$1.groupEnd();
              }
              return;
            }
          }
          return apply$2(addEventListener, this, arguments);
        }),
      });
      e("Wrapped addEventListener");
    }
    if (!events.has(e))
      events.set(e, { evt: toRegExp(e), handlers: [], selectors: [] });
    let { handlers: n, selectors: o } = events.get(e);
    n.push(t ? toRegExp(t) : null);
    o.push(r);
  }
  let { URL: URL, fetch: fetch } = $(window);
  let { delete: deleteParam } = caller(URLSearchParams.prototype);
  let parameters;
  function stripFetchQueryParameter(e, t = null) {
    if (!parameters) {
      parameters = new Map();
      window.fetch = proxy(fetch, (...e) => {
        let [t] = e;
        if (typeof t === "string") {
          let r = new URL(t);
          for (let [n, o] of parameters) {
            if (!o || o.test(t)) {
              deleteParam(r.searchParams, n);
              e[0] = r.href;
            }
          }
        }
        return apply$2(fetch, self, e);
      });
    }
    parameters.set(e, t && toRegExp(t));
  }
  function trace(...e) {
    apply$2(log, null, e);
  }
  const injectedSnippetsList = [
    "abort-current-inline-script",
    "abort-on-iframe-property-read",
    "abort-on-iframe-property-write",
    "abort-on-property-read",
    "abort-on-property-write",
    "cookie-remover",
    "debug",
    "freeze-element",
    "hide-if-shadow-contains",
    "json-override",
    "json-prune",
    "override-property-read",
    "prevent-listener",
    "strip-fetch-query-parameter",
    "trace",
  ];
  const snippets = {
    log: log,
    race: race,
    debug: setDebug,
    "hide-if-matches-xpath": hideIfMatchesXPath,
    "hide-if-contains": hideIfContains,
    "hide-if-contains-visible-text": hideIfContainsVisibleText,
    "hide-if-contains-and-matches-style": hideIfContainsAndMatchesStyle,
    "hide-if-has-and-matches-style": hideIfHasAndMatchesStyle,
    "hide-if-labelled-by": hideIfLabelledBy,
    "hide-if-contains-image": hideIfContainsImage,
    "simulate-event-poc": simulateEvent,
  };
  const injectedSnippetsCallbacks = [
    abortCurrentInlineScript,
    abortOnIframePropertyRead,
    abortOnIframePropertyWrite,
    abortOnPropertyRead,
    abortOnPropertyWrite,
    cookieRemover,
    setDebug,
    freezeElement,
    hideIfShadowContains,
    jsonOverride,
    jsonPrune,
    overridePropertyRead,
    preventListener,
    stripFetchQueryParameter,
    trace,
  ];
  for (let e = 0, { length: t } = injectedSnippetsList; e < t; e++)
    snippets[injectedSnippetsList[e]] = injectedSnippetsCallbacks[e];
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
  ["hide-if-matches-xpath", null],
  ["hide-if-contains", null],
  ["hide-if-contains-visible-text", null],
  ["hide-if-contains-and-matches-style", null],
  ["hide-if-has-and-matches-style", null],
  ["hide-if-labelled-by", null],
  ["hide-if-contains-image", null],
  ["simulate-event-poc", null],
  ["abort-current-inline-script", null],
  ["abort-on-iframe-property-read", null],
  ["abort-on-iframe-property-write", null],
  ["abort-on-property-read", null],
  ["abort-on-property-write", null],
  ["cookie-remover", null],
  ["freeze-element", null],
  ["hide-if-shadow-contains", null],
  ["json-override", null],
  ["json-prune", null],
  ["override-property-read", null],
  ["prevent-listener", null],
  ["strip-fetch-query-parameter", null],
  ["trace", null],
]);
callback.get = (snippet) => graph.get(snippet);
callback.has = (snippet) => graph.has(snippet);
export default callback;
