(() => {
  var e = {
      3: (e, t) => {
        "use strict";
        let s = (t.textToRegExp = (e) =>
          e.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"));
        const r = /^\/(.*)\/([imu]*)$/;
        t.makeRegExpParameter = function (e) {
          let [, t, n] = r.exec(e) || [null, s(e)];
          try {
            return new RegExp(t, n);
          } catch (e) {
            return null;
          }
        };
        let n = (t.splitSelector = function (e) {
          if (!e.includes(",")) return [e];
          let t = [],
            s = 0,
            r = 0,
            n = "";
          for (let i = 0; i < e.length; i++) {
            let l = e[i];
            "\\" == l
              ? i++
              : l == n
              ? (n = "")
              : "" == n &&
                ('"' == l || "'" == l
                  ? (n = l)
                  : "(" == l
                  ? r++
                  : ")" == l
                  ? (r = Math.max(0, r - 1))
                  : "," == l &&
                    0 == r &&
                    (t.push(e.substring(s, i)), (s = i + 1)));
          }
          return t.push(e.substring(s)), t;
        });
        function i(e) {
          let t = 0,
            s = 0,
            r = [];
          for (let n of [...e].reverse()) {
            let e = r[r.length - 1];
            if ("'" == n || '"' == n) e == n ? r.pop() : r.push(n);
            else if ("]" == n || ")" == n) "'" != e && '"' != e && r.push(n);
            else if ("[" == n) "]" == e && r.pop();
            else if ("(" == n) ")" == e && r.pop();
            else if (!e)
              if (/\s/.test(n)) s++;
              else if (">" == n || "+" == n || "~" == n || (s > 0 && ":" != n))
                break;
            r.length > 0 && (s = 0), (t += n.length);
          }
          return e.length - t + s;
        }
        t.qualifySelector = function (e, t) {
          let s = "",
            r = i(t),
            [, l = ""] = /^([a-z][a-z-]*)?/i.exec(t.substring(r));
          for (let r of n(e)) {
            (r = r.trim()), (s += ", ");
            let e = i(r),
              [, n = "", a] = /^([a-z][a-z-]*)?\*?(.*)/i.exec(r.substring(e));
            n == l && (n = ""),
              /[\s>+~]$/.test(t)
                ? (s += r.substring(0, e) + t + n + a)
                : (s += r.substring(0, e) + n + t + a);
          }
          return s.substring(2);
        };
      },
      35: (e, t, s) => {
        "use strict";
        const {
            makeRegExpParameter: r,
            splitSelector: n,
            qualifySelector: i,
          } = s(3),
          { filterToRegExp: l } = s(841);
        let a = 3e3;
        let o = 50,
          g = /:(-abp-[\w-]+|has|has-text|xpath|not)\(/,
          c = null;
        function m() {
          let e = performance.now();
          return {
            didTimeout: !1,
            timeRemaining() {
              let t = performance.now() - e,
                s = o - t;
              return Math.max(0, s);
            },
          };
        }
        function u() {
          return new Promise((e) => {
            "function" == typeof requestIdleCallback
              ? requestIdleCallback(e)
              : setTimeout(() => {
                  e(m());
                }, 0);
          });
        }
        function d(e, t, s = () => {}) {
          let r = e[t];
          return (
            void 0 === r && Object.defineProperty(e, t, { value: (r = s()) }), r
          );
        }
        function h(e, t = "") {
          if (null == e) return null;
          if (!e.parentElement) {
            let e = ":root";
            return t && (e += " > " + t), e;
          }
          let s = (function (e) {
            let t = 0;
            for (let s of e.parentNode.children) {
              if (s == e) return t + 1;
              t++;
            }
            return 0;
          })(e);
          if (s > 0) {
            let r = `${e.tagName}:nth-child(${s})`;
            return t && (r += " > " + t), h(e.parentElement, r);
          }
          return t;
        }
        function A(e) {
          let t = [];
          for (let s = 0; s < e.style.length; s++) {
            let r = e.style.item(s),
              n = e.style.getPropertyValue(r),
              i = e.style.getPropertyPriority(r);
            t.push(`${r}: ${n}${i ? " !" + i : ""};`);
          }
          return (
            t.sort(), { style: t.join(" "), subSelectors: n(e.selectorText) }
          );
        }
        let f = null;
        function p(e, t, s) {
          return ">" == t[0]
            ? ((t = ":scope" + t),
              f
                ? s
                  ? e.querySelectorAll(t)
                  : e.querySelector(t)
                : null == f
                ? (function (e, t, s) {
                    let r = null;
                    try {
                      (r = s ? e.querySelectorAll(t) : e.querySelector(t)),
                        (f = !0);
                    } catch (e) {
                      f = !1;
                    }
                    return r;
                  })(e, t, s)
                : null)
            : s
            ? e.querySelectorAll(t)
            : e.querySelector(t);
        }
        function x(e, t) {
          return p(e, t, !0);
        }
        class b {
          constructor(e) {
            (this._selector = e),
              (this.maybeDependsOnAttributes = /[#.:]|\[.+\]/.test(e)),
              (this.maybeContainsSiblingCombinators = /[~+]/.test(e));
          }
          *getSelectors(e, t, s) {
            yield [e + this._selector, t];
          }
        }
        const y = /[\s>+~]$/;
        class w {
          constructor(e) {
            this._innerPattern = new E(e);
          }
          get dependsOnStyles() {
            return this._innerPattern.dependsOnStyles;
          }
          get dependsOnCharacterData() {
            return this._innerPattern.dependsOnCharacterData;
          }
          get maybeDependsOnAttributes() {
            return this._innerPattern.maybeDependsOnAttributes;
          }
          *getSelectors(e, t, s) {
            for (let r of this.getElements(e, t, s)) yield [h(r), r];
          }
          *getElements(e, t, s) {
            let r = x(t, !e || y.test(e) ? e + "*" : e);
            if (r)
              for (let e of r)
                !s || s.some((t) => e.contains(t) || t.contains(e))
                  ? (c && c.lastProcessedElements.add(e),
                    this._innerPattern.matches(e, t) || (yield e),
                    yield null)
                  : yield null;
          }
          setStyles(e) {
            this._innerPattern.setStyles(e);
          }
        }
        class S {
          constructor(e) {
            this._innerPattern = new E(e);
          }
          get dependsOnStyles() {
            return this._innerPattern.dependsOnStyles;
          }
          get dependsOnCharacterData() {
            return this._innerPattern.dependsOnCharacterData;
          }
          get maybeDependsOnAttributes() {
            return this._innerPattern.maybeDependsOnAttributes;
          }
          *getSelectors(e, t, s) {
            for (let r of this.getElements(e, t, s)) yield [h(r), r];
          }
          *getElements(e, t, s) {
            let r = x(t, !e || y.test(e) ? e + "*" : e);
            if (r)
              for (let e of r)
                if (!s || s.some((t) => e.contains(t) || t.contains(e))) {
                  c && c.lastProcessedElements.add(e);
                  for (let t of this._innerPattern.evaluate(e, s))
                    null == t ? yield null : p(e, t) && (yield e);
                  yield null;
                } else yield null;
          }
          setStyles(e) {
            this._innerPattern.setStyles(e);
          }
        }
        class v {
          constructor(e) {
            (this.dependsOnCharacterData = !0),
              (this.maybeDependsOnAttributes = !0);
            let t = new XPathEvaluator();
            this._expression = t.createExpression(e, null);
          }
          *getSelectors(e, t, s) {
            for (let r of this.getElements(e, t, s)) yield [h(r), r];
          }
          *getElements(e, t, s) {
            let { ORDERED_NODE_SNAPSHOT_TYPE: r } = XPathResult,
              n = e ? x(t, e) : [t];
            for (let e of n) {
              let t = this._expression.evaluate(e, r, null);
              for (let e = 0, { snapshotLength: s } = t; e < s; e++)
                yield t.snapshotItem(e);
            }
          }
        }
        class _ {
          constructor(e) {
            (this.dependsOnCharacterData = !0), (this._regexp = r(e));
          }
          *getSelectors(e, t, s) {
            for (let r of this.getElements(e, t, s)) yield [h(r), t];
          }
          *getElements(e, t, s) {
            let r = x(t, !e || y.test(e) ? e + "*" : e);
            if (r) {
              let e = null;
              for (let t of r)
                e && e.contains(t)
                  ? yield null
                  : ((e = t),
                    !s || s.some((e) => t.contains(e) || e.contains(t))
                      ? (c && c.lastProcessedElements.add(t),
                        this._regexp && this._regexp.test(t.textContent)
                          ? yield t
                          : yield null)
                      : yield null);
            }
          }
        }
        class P {
          constructor(e) {
            let t;
            (this.dependsOnStyles = !0),
              (this.maybeDependsOnAttributes = !0),
              (t =
                e.length >= 2 && "/" == e[0] && "/" == e[e.length - 1]
                  ? e.slice(1, -1)
                  : l(e)),
              (this._regexp = new RegExp(t, "i")),
              (this._subSelectors = []);
          }
          *getSelectors(e, t, s) {
            for (let s of this._subSelectors)
              s.startsWith("*") && !y.test(e) && (s = s.substring(1)),
                yield [i(s, e), t];
          }
          setStyles(e) {
            this._subSelectors = [];
            for (let t of e)
              if (this._regexp.test(t.style))
                for (let e of t.subSelectors) {
                  let t = e.lastIndexOf("::");
                  -1 != t && (e = e.substring(0, t)),
                    this._subSelectors.push(e);
                }
          }
        }
        class E {
          constructor(e, t) {
            (this.selectors = e), (this.text = t);
          }
          get dependsOnStyles() {
            return d(this, "_dependsOnStyles", () =>
              this.selectors.some((e) => e.dependsOnStyles)
            );
          }
          get maybeDependsOnAttributes() {
            return d(this, "_maybeDependsOnAttributes", () =>
              this.selectors.some(
                (e) =>
                  e.maybeDependsOnAttributes ||
                  (e instanceof S && e.dependsOnStyles)
              )
            );
          }
          get dependsOnCharacterData() {
            return d(this, "_dependsOnCharacterData", () =>
              this.selectors.some((e) => e.dependsOnCharacterData)
            );
          }
          get maybeContainsSiblingCombinators() {
            return d(this, "_maybeContainsSiblingCombinators", () =>
              this.selectors.some((e) => e.maybeContainsSiblingCombinators)
            );
          }
          matchesMutationTypes(e) {
            let t = d(
              this,
              "_mutationTypeMatchMap",
              () =>
                new Map([
                  ["childList", !0],
                  ["attributes", this.maybeDependsOnAttributes],
                  ["characterData", this.dependsOnCharacterData],
                ])
            );
            for (let s of e) if (t.get(s)) return !0;
            return !1;
          }
          *evaluate(e, t) {
            let s = this.selectors;
            yield* (function* e(r, n, i) {
              if (r >= s.length) yield n;
              else {
                for (let [l, a] of s[r].getSelectors(n, i, t))
                  null == l ? yield null : yield* e(r + 1, l, a);
                yield null;
              }
            })(0, "", e);
          }
          matches(e, t) {
            let s = [e];
            this.maybeContainsSiblingCombinators && (s = null);
            let r = this.evaluate(t, s);
            for (let t of r) if (t && e.matches(t)) return !0;
            return !1;
          }
          setStyles(e) {
            for (let t of this.selectors) t.dependsOnStyles && t.setStyles(e);
          }
        }
        function C(e, { stylesheets: t, mutations: s }) {
          if (!t && !s) return e.slice();
          let r = s
            ? (function (e) {
                let t = new Set();
                for (let s of e) if ((t.add(s.type), 3 == t.size)) break;
                return t;
              })(s)
            : null;
          return e.filter(
            (e) => (t && e.dependsOnStyles) || (s && e.matchesMutationTypes(r))
          );
        }
        function k(e) {
          return e.some((e) => e.dependsOnCharacterData);
        }
        function O(e) {
          return e.some((e) => e.dependsOnStyles);
        }
        t.J$ = class {
          constructor(e = () => {}, t = () => {}) {
            (this._filteringInProgress = !1),
              (this._nextFilteringScheduled = !1),
              (this._lastInvocation = -a),
              (this._scheduledProcessing = null),
              (this.document = document),
              (this.hideElemsFunc = e),
              (this.unhideElemsFunc = t),
              (this.observer = new MutationObserver(this.observe.bind(this))),
              (this.hiddenElements = new Set());
          }
          isSameOrigin(e) {
            try {
              return new URL(e.href).origin == this.document.location.origin;
            } catch (e) {
              return !0;
            }
          }
          parseSelector(e) {
            if (0 == e.length) return [];
            let t = g.exec(e);
            if (!t) return [new b(e)];
            let s = [];
            t.index > 0 && s.push(new b(e.substring(0, t.index)));
            let r = (function (e, t) {
              let s = 1,
                r = null,
                n = t;
              for (; n < e.length; n++) {
                let t = e[n];
                if ("\\" == t) n++;
                else if (r) t == r && (r = null);
                else if ("'" == t || '"' == t) r = t;
                else if ("(" == t) s++;
                else if (")" == t && (s--, 0 == s)) break;
              }
              return s > 0 ? null : { text: e.substring(t, n), end: n };
            })(e, t.index + t[0].length);
            if (!r)
              return (
                console.warn(
                  new SyntaxError(
                    `Failed to parse Adblock Plus selector ${e} due to unmatched parentheses.`
                  )
                ),
                null
              );
            if ("-abp-properties" == t[1]) s.push(new P(r.text));
            else if ("-abp-has" == t[1] || "has" == t[1]) {
              let e = this.parseSelector(r.text);
              if (null == e) return null;
              s.push(new S(e));
            } else if ("-abp-contains" == t[1] || "has-text" == t[1])
              s.push(new _(r.text));
            else if ("xpath" === t[1])
              try {
                s.push(new v(r.text));
              } catch ({ message: t }) {
                return (
                  console.warn(
                    new SyntaxError(
                      `Failed to parse Adblock Plus selector ${e}, invalid xpath: ${r.text} error: ${t}.`
                    )
                  ),
                  null
                );
              }
            else {
              if ("not" != t[1])
                return (
                  console.warn(
                    new SyntaxError(
                      `Failed to parse Adblock Plus selector ${e}, invalid pseudo-class :${t[1]}().`
                    )
                  ),
                  null
                );
              {
                let e = this.parseSelector(r.text);
                if (null == e) return null;
                e.every((e) => e instanceof b)
                  ? s.push(new b(`:not(${r.text})`))
                  : s.push(new w(e));
              }
            }
            let n = this.parseSelector(e.substring(r.end + 1));
            return null == n
              ? null
              : (s.push(...n),
                1 == s.length && s[0] instanceof _
                  ? (console.warn(
                      new SyntaxError(
                        `Failed to parse Adblock Plus selector ${e}, can't have a lonely :-abp-contains().`
                      )
                    ),
                    null)
                  : s);
          }
          _readCssRules(e) {
            let t = [];
            for (let s of e || []) {
              if (!this.isSameOrigin(s)) continue;
              let e;
              try {
                e = s.cssRules;
              } catch (e) {
                continue;
              }
              if (e) for (let s of e) s.type == s.STYLE_RULE && t.push(A(s));
            }
            return t;
          }
          async _addSelectors(e, t) {
            c && c.lastProcessedElements.clear();
            let s = m();
            O(this.patterns) && this._refreshPatternStyles();
            let r = C(this.patterns, { stylesheets: e, mutations: t }),
              n = (function (e) {
                if (!e) return null;
                let t = new Set();
                for (let s of e)
                  if ("childList" == s.type) {
                    for (let e of s.addedNodes) t.add(e);
                    s.removedNodes.length > 0 && t.add(s.target);
                  } else t.add(s.target);
                return [...t];
              })(t),
              i = [],
              l = [],
              a = new Set(this.hiddenElements);
            for (let e of r) {
              let t = n;
              e.maybeContainsSiblingCombinators && (t = null);
              let r = e.evaluate(this.document, t);
              for (let t of r) {
                if (null != t)
                  for (let s of this.document.querySelectorAll(t))
                    this.hiddenElements.has(s)
                      ? a.delete(s)
                      : (i.push(s), l.push(e.text));
                s.timeRemaining() <= 0 && (s = await u());
              }
            }
            this._hideElems(i, l);
            for (let e of a) {
              if (!e.isConnected) continue;
              this.patterns.some((t) => t.matches(e, this.document)) &&
                a.delete(e),
                s.timeRemaining() <= 0 && (s = await u());
            }
            this._unhideElems(Array.from(a));
          }
          _hideElems(e, t) {
            if (e.length > 0) {
              this.hideElemsFunc(e, t);
              for (let t of e) this.hiddenElements.add(t);
            }
          }
          _unhideElems(e) {
            if (e.length > 0) {
              this.unhideElemsFunc(e);
              for (let t of e) this.hiddenElements.delete(t);
            }
          }
          async _processFiltering() {
            if (this._filteringInProgress)
              return (
                console.warn(
                  "ElemHideEmulation scheduling error: Tried to process filtering in parallel."
                ),
                void (
                  c &&
                  c.failedAssertions.push(
                    "Tried to process filtering in parallel"
                  )
                )
              );
            let e = this._scheduledProcessing || {};
            (this._scheduledProcessing = null),
              (this._filteringInProgress = !0),
              (this._nextFilteringScheduled = !1),
              await this._addSelectors(e.stylesheets, e.mutations),
              (this._lastInvocation = performance.now()),
              (this._filteringInProgress = !1),
              this._scheduledProcessing && this._scheduleNextFiltering();
          }
          _appendScheduledProcessing(e, t) {
            this._scheduledProcessing
              ? e || t
                ? (this._scheduledProcessing.stylesheets ||
                    this._scheduledProcessing.mutations) &&
                  (e &&
                    (this._scheduledProcessing.stylesheets ||
                      (this._scheduledProcessing.stylesheets = []),
                    this._scheduledProcessing.stylesheets.push(...e)),
                  t &&
                    (this._scheduledProcessing.mutations ||
                      (this._scheduledProcessing.mutations = []),
                    this._scheduledProcessing.mutations.push(...t)))
                : (this._scheduledProcessing = {})
              : (this._scheduledProcessing = { stylesheets: e, mutations: t });
          }
          _scheduleNextFiltering() {
            this._nextFilteringScheduled ||
              this._filteringInProgress ||
              ("loading" === this.document.readyState
                ? (this.document.addEventListener(
                    "DOMContentLoaded",
                    () => this._processFiltering(),
                    { once: !0 }
                  ),
                  (this._nextFilteringScheduled = !0))
                : performance.now() - this._lastInvocation < a
                ? (setTimeout(
                    () => this._processFiltering(),
                    a - (performance.now() - this._lastInvocation)
                  ),
                  (this._nextFilteringScheduled = !0))
                : this._processFiltering());
          }
          queueFiltering(e, t) {
            this._appendScheduledProcessing(e, t),
              this._scheduleNextFiltering();
          }
          _refreshPatternStyles(e) {
            let t = this._readCssRules(this.document.styleSheets);
            for (let e of this.patterns) e.setStyles(t);
          }
          onLoad(e) {
            let t = e.target.sheet;
            t && this.queueFiltering([t]);
          }
          observe(e) {
            (c &&
              0 ==
                (e = e.filter(
                  ({
                    type: e,
                    attributeName: t,
                    target: { style: s },
                    oldValue: r,
                  }) => {
                    return !(
                      "attributes" == e &&
                      "style" == t &&
                      "none" == s.display &&
                      "none" !=
                        ((n = r),
                        Object.assign(document.createElement("test"), {
                          style: n,
                        }).style).display
                    );
                    var n;
                  }
                )).length) ||
              this.queueFiltering(null, e);
          }
          apply(e) {
            this.patterns = [];
            for (let t of e) {
              let e = this.parseSelector(t.selector);
              null != e && e.length > 0 && this.patterns.push(new E(e, t.text));
            }
            if (this.patterns.length > 0) {
              this.queueFiltering();
              let e = (function (e) {
                return e.some((e) => e.maybeDependsOnAttributes);
              })(this.patterns);
              if (
                (this.observer.observe(this.document, {
                  childList: !0,
                  attributes: e,
                  attributeOldValue: e && !!c,
                  characterData: k(this.patterns),
                  subtree: !0,
                }),
                O(this.patterns))
              ) {
                let e = this.onLoad.bind(this);
                "loading" === this.document.readyState &&
                  this.document.addEventListener("DOMContentLoaded", e, !0),
                  this.document.addEventListener("load", e, !0);
              }
            }
          }
        };
      },
      841: (e, t) => {
        "use strict";
        let s = /[\x00-\x24\x26-\x2C\x2F\x3A-\x40\x5B-\x5E\x60\x7B-\x7F]/,
          r = (t.filterToRegExp = function (e) {
            return (
              "*" == (e = e.replace(/\*+/g, "*"))[0] && (e = e.substring(1)),
              "*" == e[e.length - 1] && (e = e.substring(0, e.length - 1)),
              e
                .replace(/\^\|$/, "^")
                .replace(/\W/g, "\\$&")
                .replace(/\\\*/g, ".*")
                .replace(/\\\^/g, `(?:${s.source}|$)`)
                .replace(/^\\\|\\\|/, "^[\\w\\-]+:\\/+(?:[^\\/]+\\.)?")
                .replace(/^\\\|/, "^")
                .replace(/\\\|$/, "$")
            );
          }),
          n = new RegExp(r("||") + "$"),
          i = /[^a-z0-9%*][a-z0-9%]{2,}(?=[^a-z0-9%*])/,
          l = new RegExp(i, "g");
        class a {
          constructor(e, t) {
            (this._caseSensitive = e), (this._caseInsensitive = t);
          }
          test(e) {
            return (
              (this._caseSensitive && this._caseSensitive.test(e.href)) ||
              (this._caseInsensitive &&
                this._caseInsensitive.test(e.lowerCaseHref))
            );
          }
        }
        (t.compilePatterns = function (e) {
          if ((Array.isArray(e) ? e : [e]).length > 100) return null;
          let t = "",
            s = "";
          for (let r of e) {
            let e = r.urlPattern.regexpSource;
            r.matchCase ? (t += e + "|") : (s += e + "|");
          }
          let r = null,
            n = null;
          try {
            t && (r = new RegExp(t.slice(0, -1))),
              s && (n = new RegExp(s.slice(0, -1)));
          } catch (e) {
            return null;
          }
          return new a(r, n);
        }),
          (t.Pattern = class {
            constructor(e, t) {
              (this.matchCase = t || !1),
                this.matchCase || (e = e.toLowerCase()),
                e.length >= 2 && "/" == e[0] && "/" == e[e.length - 1]
                  ? ((e = e.substring(1, e.length - 1)),
                    (this._regexp = new RegExp(e)))
                  : ((e = e.replace(/^\*+/, "").replace(/\*+$/, "")),
                    (this.pattern = e));
            }
            isLiteralPattern() {
              return (
                void 0 !== this.pattern &&
                !/[*^|]/.test(
                  this.pattern.replace(/^\|{1,2}/, "").replace(/[|^]$/, "")
                )
              );
            }
            get regexp() {
              return (
                void 0 === this._regexp &&
                  (this._regexp = this.isLiteralPattern()
                    ? null
                    : new RegExp(r(this.pattern))),
                this._regexp
              );
            }
            get regexpSource() {
              return this._regexp ? this._regexp.source : r(this.pattern);
            }
            matchesLocation(e) {
              let t = this.matchCase ? e.href : e.lowerCaseHref,
                r = this.regexp;
              if (r) return r.test(t);
              let i = this.pattern,
                l = "|" == i[0],
                a = l && "|" == i[1],
                o = "^" == i[i.length - 1],
                g = !o && "|" == i[i.length - 1];
              a ? (i = i.substr(2)) : l && (i = i.substr(1)),
                (o || g) && (i = i.slice(0, -1));
              let c = t.indexOf(i);
              for (; -1 != c; ) {
                if (
                  (a
                    ? "/" != t[c] && n.test(t.substring(0, c))
                    : !l || 0 == c) &&
                  (o
                    ? !t[c + i.length] || s.test(t[c + i.length])
                    : !g || c == t.length - i.length)
                )
                  return !0;
                if ("" == i) return !0;
                c = t.indexOf(i, c + 1);
              }
              return !1;
            }
            hasKeywords() {
              return this.pattern && i.test(this.pattern);
            }
            keywordCandidates() {
              return this.pattern ? this.pattern.toLowerCase().match(l) : null;
            }
          });
      },
      935: function (e, t) {
        var s, r, n;
        "undefined" != typeof globalThis
          ? globalThis
          : "undefined" != typeof self && self,
          (r = [e]),
          void 0 ===
            (n =
              "function" ==
              typeof (s = function (e) {
                "use strict";
                if (
                  "undefined" == typeof browser ||
                  Object.getPrototypeOf(browser) !== Object.prototype
                ) {
                  const t =
                      "The message port closed before a response was received.",
                    s =
                      "Returning a Promise is the preferred way to send a reply from an onMessage/onMessageExternal listener, as the sendResponse will be removed from the specs (See https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage)",
                    r = (e) => {
                      const r = {
                        alarms: {
                          clear: { minArgs: 0, maxArgs: 1 },
                          clearAll: { minArgs: 0, maxArgs: 0 },
                          get: { minArgs: 0, maxArgs: 1 },
                          getAll: { minArgs: 0, maxArgs: 0 },
                        },
                        bookmarks: {
                          create: { minArgs: 1, maxArgs: 1 },
                          get: { minArgs: 1, maxArgs: 1 },
                          getChildren: { minArgs: 1, maxArgs: 1 },
                          getRecent: { minArgs: 1, maxArgs: 1 },
                          getSubTree: { minArgs: 1, maxArgs: 1 },
                          getTree: { minArgs: 0, maxArgs: 0 },
                          move: { minArgs: 2, maxArgs: 2 },
                          remove: { minArgs: 1, maxArgs: 1 },
                          removeTree: { minArgs: 1, maxArgs: 1 },
                          search: { minArgs: 1, maxArgs: 1 },
                          update: { minArgs: 2, maxArgs: 2 },
                        },
                        browserAction: {
                          disable: {
                            minArgs: 0,
                            maxArgs: 1,
                            fallbackToNoCallback: !0,
                          },
                          enable: {
                            minArgs: 0,
                            maxArgs: 1,
                            fallbackToNoCallback: !0,
                          },
                          getBadgeBackgroundColor: { minArgs: 1, maxArgs: 1 },
                          getBadgeText: { minArgs: 1, maxArgs: 1 },
                          getPopup: { minArgs: 1, maxArgs: 1 },
                          getTitle: { minArgs: 1, maxArgs: 1 },
                          openPopup: { minArgs: 0, maxArgs: 0 },
                          setBadgeBackgroundColor: {
                            minArgs: 1,
                            maxArgs: 1,
                            fallbackToNoCallback: !0,
                          },
                          setBadgeText: {
                            minArgs: 1,
                            maxArgs: 1,
                            fallbackToNoCallback: !0,
                          },
                          setIcon: { minArgs: 1, maxArgs: 1 },
                          setPopup: {
                            minArgs: 1,
                            maxArgs: 1,
                            fallbackToNoCallback: !0,
                          },
                          setTitle: {
                            minArgs: 1,
                            maxArgs: 1,
                            fallbackToNoCallback: !0,
                          },
                        },
                        browsingData: {
                          remove: { minArgs: 2, maxArgs: 2 },
                          removeCache: { minArgs: 1, maxArgs: 1 },
                          removeCookies: { minArgs: 1, maxArgs: 1 },
                          removeDownloads: { minArgs: 1, maxArgs: 1 },
                          removeFormData: { minArgs: 1, maxArgs: 1 },
                          removeHistory: { minArgs: 1, maxArgs: 1 },
                          removeLocalStorage: { minArgs: 1, maxArgs: 1 },
                          removePasswords: { minArgs: 1, maxArgs: 1 },
                          removePluginData: { minArgs: 1, maxArgs: 1 },
                          settings: { minArgs: 0, maxArgs: 0 },
                        },
                        commands: { getAll: { minArgs: 0, maxArgs: 0 } },
                        contextMenus: {
                          remove: { minArgs: 1, maxArgs: 1 },
                          removeAll: { minArgs: 0, maxArgs: 0 },
                          update: { minArgs: 2, maxArgs: 2 },
                        },
                        cookies: {
                          get: { minArgs: 1, maxArgs: 1 },
                          getAll: { minArgs: 1, maxArgs: 1 },
                          getAllCookieStores: { minArgs: 0, maxArgs: 0 },
                          remove: { minArgs: 1, maxArgs: 1 },
                          set: { minArgs: 1, maxArgs: 1 },
                        },
                        devtools: {
                          inspectedWindow: {
                            eval: {
                              minArgs: 1,
                              maxArgs: 2,
                              singleCallbackArg: !1,
                            },
                          },
                          panels: {
                            create: {
                              minArgs: 3,
                              maxArgs: 3,
                              singleCallbackArg: !0,
                            },
                            elements: {
                              createSidebarPane: { minArgs: 1, maxArgs: 1 },
                            },
                          },
                        },
                        downloads: {
                          cancel: { minArgs: 1, maxArgs: 1 },
                          download: { minArgs: 1, maxArgs: 1 },
                          erase: { minArgs: 1, maxArgs: 1 },
                          getFileIcon: { minArgs: 1, maxArgs: 2 },
                          open: {
                            minArgs: 1,
                            maxArgs: 1,
                            fallbackToNoCallback: !0,
                          },
                          pause: { minArgs: 1, maxArgs: 1 },
                          removeFile: { minArgs: 1, maxArgs: 1 },
                          resume: { minArgs: 1, maxArgs: 1 },
                          search: { minArgs: 1, maxArgs: 1 },
                          show: {
                            minArgs: 1,
                            maxArgs: 1,
                            fallbackToNoCallback: !0,
                          },
                        },
                        extension: {
                          isAllowedFileSchemeAccess: { minArgs: 0, maxArgs: 0 },
                          isAllowedIncognitoAccess: { minArgs: 0, maxArgs: 0 },
                        },
                        history: {
                          addUrl: { minArgs: 1, maxArgs: 1 },
                          deleteAll: { minArgs: 0, maxArgs: 0 },
                          deleteRange: { minArgs: 1, maxArgs: 1 },
                          deleteUrl: { minArgs: 1, maxArgs: 1 },
                          getVisits: { minArgs: 1, maxArgs: 1 },
                          search: { minArgs: 1, maxArgs: 1 },
                        },
                        i18n: {
                          detectLanguage: { minArgs: 1, maxArgs: 1 },
                          getAcceptLanguages: { minArgs: 0, maxArgs: 0 },
                        },
                        identity: {
                          launchWebAuthFlow: { minArgs: 1, maxArgs: 1 },
                        },
                        idle: { queryState: { minArgs: 1, maxArgs: 1 } },
                        management: {
                          get: { minArgs: 1, maxArgs: 1 },
                          getAll: { minArgs: 0, maxArgs: 0 },
                          getSelf: { minArgs: 0, maxArgs: 0 },
                          setEnabled: { minArgs: 2, maxArgs: 2 },
                          uninstallSelf: { minArgs: 0, maxArgs: 1 },
                        },
                        notifications: {
                          clear: { minArgs: 1, maxArgs: 1 },
                          create: { minArgs: 1, maxArgs: 2 },
                          getAll: { minArgs: 0, maxArgs: 0 },
                          getPermissionLevel: { minArgs: 0, maxArgs: 0 },
                          update: { minArgs: 2, maxArgs: 2 },
                        },
                        pageAction: {
                          getPopup: { minArgs: 1, maxArgs: 1 },
                          getTitle: { minArgs: 1, maxArgs: 1 },
                          hide: {
                            minArgs: 1,
                            maxArgs: 1,
                            fallbackToNoCallback: !0,
                          },
                          setIcon: { minArgs: 1, maxArgs: 1 },
                          setPopup: {
                            minArgs: 1,
                            maxArgs: 1,
                            fallbackToNoCallback: !0,
                          },
                          setTitle: {
                            minArgs: 1,
                            maxArgs: 1,
                            fallbackToNoCallback: !0,
                          },
                          show: {
                            minArgs: 1,
                            maxArgs: 1,
                            fallbackToNoCallback: !0,
                          },
                        },
                        permissions: {
                          contains: { minArgs: 1, maxArgs: 1 },
                          getAll: { minArgs: 0, maxArgs: 0 },
                          remove: { minArgs: 1, maxArgs: 1 },
                          request: { minArgs: 1, maxArgs: 1 },
                        },
                        runtime: {
                          getBackgroundPage: { minArgs: 0, maxArgs: 0 },
                          getPlatformInfo: { minArgs: 0, maxArgs: 0 },
                          openOptionsPage: { minArgs: 0, maxArgs: 0 },
                          requestUpdateCheck: { minArgs: 0, maxArgs: 0 },
                          sendMessage: { minArgs: 1, maxArgs: 3 },
                          sendNativeMessage: { minArgs: 2, maxArgs: 2 },
                          setUninstallURL: { minArgs: 1, maxArgs: 1 },
                        },
                        sessions: {
                          getDevices: { minArgs: 0, maxArgs: 1 },
                          getRecentlyClosed: { minArgs: 0, maxArgs: 1 },
                          restore: { minArgs: 0, maxArgs: 1 },
                        },
                        storage: {
                          local: {
                            clear: { minArgs: 0, maxArgs: 0 },
                            get: { minArgs: 0, maxArgs: 1 },
                            getBytesInUse: { minArgs: 0, maxArgs: 1 },
                            remove: { minArgs: 1, maxArgs: 1 },
                            set: { minArgs: 1, maxArgs: 1 },
                          },
                          managed: {
                            get: { minArgs: 0, maxArgs: 1 },
                            getBytesInUse: { minArgs: 0, maxArgs: 1 },
                          },
                          sync: {
                            clear: { minArgs: 0, maxArgs: 0 },
                            get: { minArgs: 0, maxArgs: 1 },
                            getBytesInUse: { minArgs: 0, maxArgs: 1 },
                            remove: { minArgs: 1, maxArgs: 1 },
                            set: { minArgs: 1, maxArgs: 1 },
                          },
                        },
                        tabs: {
                          captureVisibleTab: { minArgs: 0, maxArgs: 2 },
                          create: { minArgs: 1, maxArgs: 1 },
                          detectLanguage: { minArgs: 0, maxArgs: 1 },
                          discard: { minArgs: 0, maxArgs: 1 },
                          duplicate: { minArgs: 1, maxArgs: 1 },
                          executeScript: { minArgs: 1, maxArgs: 2 },
                          get: { minArgs: 1, maxArgs: 1 },
                          getCurrent: { minArgs: 0, maxArgs: 0 },
                          getZoom: { minArgs: 0, maxArgs: 1 },
                          getZoomSettings: { minArgs: 0, maxArgs: 1 },
                          goBack: { minArgs: 0, maxArgs: 1 },
                          goForward: { minArgs: 0, maxArgs: 1 },
                          highlight: { minArgs: 1, maxArgs: 1 },
                          insertCSS: { minArgs: 1, maxArgs: 2 },
                          move: { minArgs: 2, maxArgs: 2 },
                          query: { minArgs: 1, maxArgs: 1 },
                          reload: { minArgs: 0, maxArgs: 2 },
                          remove: { minArgs: 1, maxArgs: 1 },
                          removeCSS: { minArgs: 1, maxArgs: 2 },
                          sendMessage: { minArgs: 2, maxArgs: 3 },
                          setZoom: { minArgs: 1, maxArgs: 2 },
                          setZoomSettings: { minArgs: 1, maxArgs: 2 },
                          update: { minArgs: 1, maxArgs: 2 },
                        },
                        topSites: { get: { minArgs: 0, maxArgs: 0 } },
                        webNavigation: {
                          getAllFrames: { minArgs: 1, maxArgs: 1 },
                          getFrame: { minArgs: 1, maxArgs: 1 },
                        },
                        webRequest: {
                          handlerBehaviorChanged: { minArgs: 0, maxArgs: 0 },
                        },
                        windows: {
                          create: { minArgs: 0, maxArgs: 1 },
                          get: { minArgs: 1, maxArgs: 2 },
                          getAll: { minArgs: 0, maxArgs: 1 },
                          getCurrent: { minArgs: 0, maxArgs: 1 },
                          getLastFocused: { minArgs: 0, maxArgs: 1 },
                          remove: { minArgs: 1, maxArgs: 1 },
                          update: { minArgs: 2, maxArgs: 2 },
                        },
                      };
                      if (0 === Object.keys(r).length)
                        throw new Error(
                          "api-metadata.json has not been included in browser-polyfill"
                        );
                      class n extends WeakMap {
                        constructor(e, t) {
                          super(t), (this.createItem = e);
                        }
                        get(e) {
                          return (
                            this.has(e) || this.set(e, this.createItem(e)),
                            super.get(e)
                          );
                        }
                      }
                      const i = (e) =>
                          e &&
                          "object" == typeof e &&
                          "function" == typeof e.then,
                        l =
                          (t, s) =>
                          (...r) => {
                            e.runtime.lastError
                              ? t.reject(new Error(e.runtime.lastError.message))
                              : s.singleCallbackArg ||
                                (r.length <= 1 && !1 !== s.singleCallbackArg)
                              ? t.resolve(r[0])
                              : t.resolve(r);
                          },
                        a = (e) => (1 == e ? "argument" : "arguments"),
                        o = (e, t) =>
                          function (s, ...r) {
                            if (r.length < t.minArgs)
                              throw new Error(
                                `Expected at least ${t.minArgs} ${a(
                                  t.minArgs
                                )} for ${e}(), got ${r.length}`
                              );
                            if (r.length > t.maxArgs)
                              throw new Error(
                                `Expected at most ${t.maxArgs} ${a(
                                  t.maxArgs
                                )} for ${e}(), got ${r.length}`
                              );
                            return new Promise((n, i) => {
                              if (t.fallbackToNoCallback)
                                try {
                                  s[e](...r, l({ resolve: n, reject: i }, t));
                                } catch (i) {
                                  console.warn(
                                    `${e} API method doesn't seem to support the callback parameter, falling back to call it without a callback: `,
                                    i
                                  ),
                                    s[e](...r),
                                    (t.fallbackToNoCallback = !1),
                                    (t.noCallback = !0),
                                    n();
                                }
                              else
                                t.noCallback
                                  ? (s[e](...r), n())
                                  : s[e](...r, l({ resolve: n, reject: i }, t));
                            });
                          },
                        g = (e, t, s) =>
                          new Proxy(t, {
                            apply: (t, r, n) => s.call(r, e, ...n),
                          });
                      let c = Function.call.bind(
                        Object.prototype.hasOwnProperty
                      );
                      const m = (e, t = {}, s = {}) => {
                          let r = Object.create(null),
                            n = {
                              has: (t, s) => s in e || s in r,
                              get(n, i, l) {
                                if (i in r) return r[i];
                                if (!(i in e)) return;
                                let a = e[i];
                                if ("function" == typeof a)
                                  if ("function" == typeof t[i])
                                    a = g(e, e[i], t[i]);
                                  else if (c(s, i)) {
                                    let t = o(i, s[i]);
                                    a = g(e, e[i], t);
                                  } else a = a.bind(e);
                                else if (
                                  "object" == typeof a &&
                                  null !== a &&
                                  (c(t, i) || c(s, i))
                                )
                                  a = m(a, t[i], s[i]);
                                else {
                                  if (!c(s, "*"))
                                    return (
                                      Object.defineProperty(r, i, {
                                        configurable: !0,
                                        enumerable: !0,
                                        get: () => e[i],
                                        set(t) {
                                          e[i] = t;
                                        },
                                      }),
                                      a
                                    );
                                  a = m(a, t[i], s["*"]);
                                }
                                return (r[i] = a), a;
                              },
                              set: (t, s, n, i) => (
                                s in r ? (r[s] = n) : (e[s] = n), !0
                              ),
                              defineProperty: (e, t, s) =>
                                Reflect.defineProperty(r, t, s),
                              deleteProperty: (e, t) =>
                                Reflect.deleteProperty(r, t),
                            },
                            i = Object.create(e);
                          return new Proxy(i, n);
                        },
                        u = (e) => ({
                          addListener(t, s, ...r) {
                            t.addListener(e.get(s), ...r);
                          },
                          hasListener: (t, s) => t.hasListener(e.get(s)),
                          removeListener(t, s) {
                            t.removeListener(e.get(s));
                          },
                        }),
                        d = new n((e) =>
                          "function" != typeof e
                            ? e
                            : function (t) {
                                const s = m(
                                  t,
                                  {},
                                  { getContent: { minArgs: 0, maxArgs: 0 } }
                                );
                                e(s);
                              }
                        );
                      let h = !1;
                      const A = new n((e) =>
                          "function" != typeof e
                            ? e
                            : function (t, r, n) {
                                let l,
                                  a,
                                  o = !1,
                                  g = new Promise((e) => {
                                    l = function (t) {
                                      h ||
                                        (console.warn(s, new Error().stack),
                                        (h = !0)),
                                        (o = !0),
                                        e(t);
                                    };
                                  });
                                try {
                                  a = e(t, r, l);
                                } catch (e) {
                                  a = Promise.reject(e);
                                }
                                const c = !0 !== a && i(a);
                                if (!0 !== a && !c && !o) return !1;
                                const m = (e) => {
                                  e.then(
                                    (e) => {
                                      n(e);
                                    },
                                    (e) => {
                                      let t;
                                      (t =
                                        e &&
                                        (e instanceof Error ||
                                          "string" == typeof e.message)
                                          ? e.message
                                          : "An unexpected error occurred"),
                                        n({
                                          __mozWebExtensionPolyfillReject__: !0,
                                          message: t,
                                        });
                                    }
                                  ).catch((e) => {
                                    console.error(
                                      "Failed to send onMessage rejected reply",
                                      e
                                    );
                                  });
                                };
                                return m(c ? a : g), !0;
                              }
                        ),
                        f = ({ reject: s, resolve: r }, n) => {
                          e.runtime.lastError
                            ? e.runtime.lastError.message === t
                              ? r()
                              : s(new Error(e.runtime.lastError.message))
                            : n && n.__mozWebExtensionPolyfillReject__
                            ? s(new Error(n.message))
                            : r(n);
                        },
                        p = (e, t, s, ...r) => {
                          if (r.length < t.minArgs)
                            throw new Error(
                              `Expected at least ${t.minArgs} ${a(
                                t.minArgs
                              )} for ${e}(), got ${r.length}`
                            );
                          if (r.length > t.maxArgs)
                            throw new Error(
                              `Expected at most ${t.maxArgs} ${a(
                                t.maxArgs
                              )} for ${e}(), got ${r.length}`
                            );
                          return new Promise((e, t) => {
                            const n = f.bind(null, { resolve: e, reject: t });
                            r.push(n), s.sendMessage(...r);
                          });
                        },
                        x = {
                          devtools: { network: { onRequestFinished: u(d) } },
                          runtime: {
                            onMessage: u(A),
                            onMessageExternal: u(A),
                            sendMessage: p.bind(null, "sendMessage", {
                              minArgs: 1,
                              maxArgs: 3,
                            }),
                          },
                          tabs: {
                            sendMessage: p.bind(null, "sendMessage", {
                              minArgs: 2,
                              maxArgs: 3,
                            }),
                          },
                        },
                        b = {
                          clear: { minArgs: 1, maxArgs: 1 },
                          get: { minArgs: 1, maxArgs: 1 },
                          set: { minArgs: 1, maxArgs: 1 },
                        };
                      return (
                        (r.privacy = {
                          network: { "*": b },
                          services: { "*": b },
                          websites: { "*": b },
                        }),
                        m(e, x, r)
                      );
                    };
                  if (
                    "object" != typeof chrome ||
                    !chrome ||
                    !chrome.runtime ||
                    !chrome.runtime.id
                  )
                    throw new Error(
                      "This script should only be loaded in a browser extension."
                    );
                  e.exports = r(chrome);
                } else e.exports = browser;
              })
                ? s.apply(t, r)
                : s) || (e.exports = n);
      },
    },
    t = {};
  function s(r) {
    var n = t[r];
    if (void 0 !== n) return n.exports;
    var i = (t[r] = { exports: {} });
    return e[r].call(i.exports, i, i.exports, s), i.exports;
  }
  (() => {
    "use strict";
    var e = s(935),
      t = s(35);
    function r(e) {
      return e.catch((e) => {
        if (
          "object" != typeof e ||
          ("Could not establish connection. Receiving end does not exist." !=
            e.message &&
            "A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received" !=
              e.message)
        )
          throw e;
      });
    }
    let n = new Set(),
      i = new WeakMap();
    function l(e) {
      if ("object" == e.localName) {
        if (e.data) return e.data;
        for (let t of e.children)
          if ("param" == t.localName && "movie" == t.name && t.value)
            return new URL(t.value, document.baseURI).href;
        return null;
      }
      return e.currentSrc || e.src;
    }
    function a(e, t) {
      let { style: s } = e;
      t ||
        (t =
          "frame" == e.localName
            ? [["visibility", "hidden"]]
            : [["display", "none"]]);
      for (let [e, r] of t) s.setProperty(e, r, "important");
      i.has(e) && i.get(e).disconnect();
      let r = new MutationObserver(() => {
        for (let [e, r] of t)
          (s.getPropertyValue(e) == r &&
            "important" == s.getPropertyPriority(e)) ||
            s.setProperty(e, r, "important");
      });
      r.observe(e, { attributes: !0, attributeFilter: ["style"] }), i.set(e, r);
    }
    function o(e) {
      let t = i.get(e);
      t && (t.disconnect(), i.delete(e));
      let s = "frame" == e.localName ? "visibility" : "display";
      e.style.removeProperty(s);
    }
    function g(t) {
      let s = (function (e) {
        if ("frame" == e.localName) return null;
        if ("video" == e.localName || "audio" == e.localName)
          for (let t of e.children) if ("source" == t.localName) return null;
        let t = "";
        for (let s of ["src", "srcset"]) {
          let r = e.getAttribute(s);
          r && s in e && (t += "[" + s + "=" + CSS.escape(r) + "]");
        }
        return t ? e.localName + t : null;
      })(t);
      s
        ? n.has(s) ||
          (r(e.runtime.sendMessage({ type: "ewe:inject-css", selector: s })),
          n.add(s))
        : a(t);
    }
    function c(e, t) {
      for (let s of document.querySelectorAll("iframe[src='about:blank']"))
        if (s.contentDocument)
          for (let r of s.contentDocument.querySelectorAll(e))
            t.has(l(r)) && a(r);
    }
    let m = 0,
      u = null,
      d = [];
    async function h(t) {
      return (
        !!(function (e) {
          return (
            Object.getPrototypeOf(e) === CustomEvent.prototype &&
            !Object.hasOwnProperty.call(e, "detail")
          );
        })(t) &&
        r(
          e.runtime.sendMessage({
            type: "ewe:allowlist-page",
            timestamp: t.detail.timestamp,
            signature: t.detail.signature,
          })
        )
      );
    }
    async function A() {
      let e = d.shift();
      if (e)
        try {
          if (!0 !== (await h(e)))
            throw new Error("Domain allowlisting rejected");
          document.dispatchEvent(new Event("domain_allowlisting_success")), x();
        } catch (e) {
          m++, m >= 30 && x();
        }
      d.length || p();
    }
    function f(e) {
      d.length >= 20 || (d.push(e), u || (A(), (u = setInterval(A, 100))));
    }
    function p() {
      clearInterval(u), (u = null);
    }
    function x() {
      document.removeEventListener("domain_allowlisting_request", f, !0),
        (d = []),
        p();
    }
    class b {
      constructor(e) {
        (this.selectors = new Map(e)),
          (this.observer = new MutationObserver(() => {
            this.observer.disconnect(), setTimeout(() => this.trace(), 1e3);
          })),
          "loading" == document.readyState
            ? document.addEventListener("DOMContentLoaded", () => this.trace())
            : this.trace();
      }
      log(t, s = []) {
        r(
          e.runtime.sendMessage({
            type: "ewe:trace-elem-hide",
            filters: t,
            selectors: s,
          })
        );
      }
      trace() {
        let e = [],
          t = [];
        for (let [s, r] of this.selectors)
          document.querySelector(s) &&
            (this.selectors.delete(s), r ? e.push(r) : t.push(s));
        (e.length > 0 || t.length > 0) && this.log(e, t),
          this.observer.observe(document, {
            childList: !0,
            attributes: !0,
            subtree: !0,
          });
      }
    }
    !(function () {
      let t = null;
      e.runtime.onMessage.addListener((e, s) => {
        if (!e || "ewe:collapse" != e.type) return !1;
        if ("loading" == document.readyState) {
          t ||
            ((t = new Map()),
            document.addEventListener("DOMContentLoaded", () => {
              for (let [e, s] of t) {
                for (let t of document.querySelectorAll(e)) s.has(l(t)) && g(t);
                c(e, s);
              }
              t = null;
            }));
          let s = t.get(e.selector) || new Set();
          t.set(e.selector, s), s.add(e.url);
        } else {
          for (let t of document.querySelectorAll(e.selector))
            l(t) == e.url && g(t);
          c(e.selector, new Set([e.url]));
        }
        return !0;
      });
    })(),
      document.addEventListener("domain_allowlisting_request", f, !0),
      (async function () {
        let s,
          n = await r(e.runtime.sendMessage({ type: "ewe:content-hello" }));
        if (n) {
          if (
            (n.tracedSelectors && (s = new b(n.tracedSelectors)),
            n.emulatedPatterns.length > 0)
          ) {
            new t.J$(
              (e, t) => {
                for (let t of e) a(t, n.cssProperties);
                s && s.log(t);
              },
              (e) => {
                for (let t of e) o(t);
              }
            ).apply(n.emulatedPatterns);
          }
          n.subscribeLinks &&
            document.addEventListener(
              "click",
              (t) => {
                if (2 == t.button || !t.isTrusted) return;
                let s = t.target;
                for (; !(s instanceof HTMLAnchorElement); )
                  if (((s = s.parentNode), !s)) return;
                let n = null;
                if ("http:" == s.protocol || "https:" == s.protocol)
                  "subscribe.adblockplus.org" == s.host &&
                    "/" == s.pathname &&
                    (n = s.search.substr(1));
                else {
                  let e = /^abp:\/*subscribe\/*\?(.*)/i.exec(s.href);
                  e && (n = e[1]);
                }
                if (!n) return;
                let i = null,
                  l = null;
                for (let e of n.split("&")) {
                  let t = e.split("=", 2);
                  if (2 == t.length && /\S/.test(t[1]))
                    switch (t[0]) {
                      case "title":
                        i = decodeURIComponent(t[1]);
                        break;
                      case "location":
                        l = decodeURIComponent(t[1]);
                    }
                }
                l &&
                  (i || (i = l),
                  (i = i.trim()),
                  (l = l.trim()),
                  /^(https?|ftp):/.test(l) &&
                    (r(
                      e.runtime.sendMessage({
                        type: "ewe:subscribe-link-clicked",
                        title: i,
                        url: l,
                      })
                    ),
                    t.preventDefault(),
                    t.stopPropagation()));
              },
              !0
            );
        }
      })();
  })();
})();
//# sourceMappingURL=ewe-content.js.map
