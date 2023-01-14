/*
 * This file is part of Adblock Plus <https://adblockplus.org/>,
 * Copyright (C) 2006-present eyeo GmbH
 *
 * Adblock Plus is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * Adblock Plus is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Adblock Plus.  If not, see <http://www.gnu.org/licenses/>.
 */ /* eslint-disable */
(function(){'use strict';function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}
function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}let port;
const connectListeners = new Set();
const disconnectListeners = new Set();
const messageListeners = new Set();
function addConnectListener(listener) {
    connectListeners.add(listener);
    listener();
}
function addDisconnectListener(listener) {
    disconnectListeners.add(listener);
}
function addMessageListener(listener) {
    messageListeners.add(listener);
}
const connect = () => {
    if (port) {
        return port;
    }
    try {
        port = browser.runtime.connect({ name: "ui" });
    }
    catch (ex) {
        port = null;
        disconnectListeners.forEach((listener) => listener());
        return port;
    }
    port.onMessage.addListener((message) => {
        onMessage(message);
    });
    port.onDisconnect.addListener(onDisconnect);
    connectListeners.forEach((listener) => listener());
    return port;
};
function listen(_a) {
    var { type, filter } = _a, options = __rest(_a, ["type", "filter"]);
    addConnectListener(() => {
        if (port) {
            port.postMessage(Object.assign({ type: `${type}.listen`, filter }, options));
        }
    });
}
function onDisconnect() {
    port = null;
    setTimeout(() => connect(), 100);
}
function onMessage(message) {
    if (!message.type.endsWith(".respond")) {
        return;
    }
    messageListeners.forEach((listener) => listener(message));
}
function removeDisconnectListener(listener) {
    disconnectListeners.delete(listener);
}const platformToStore = {
    chromium: "chrome",
    edgehtml: "edge",
    gecko: "firefox"
};
const app = {
    get: (what) => send("app.get", { what }),
    getInfo: () => __awaiter(void 0, void 0, void 0, function* () {
        return Promise.all([app.get("application"), app.get("platform")]).then(([application, rawPlatform]) => {
            const platform = rawPlatform;
            let store;
            if (application !== "edge" && application !== "opera") {
                store = platformToStore[platform] || "chrome";
            }
            else {
                store = application;
            }
            return {
                application,
                platform,
                store
            };
        });
    }),
    listen: (filter) => listen({ type: "app", filter }),
    open: (what) => send("app.open", { what })
};
const ctalinks = {
    get: (link, queryParams = {}) => send("app.get", { what: "ctalink", link, queryParams })
};
const doclinks = {
    get: (link) => send("app.get", { what: "doclink", link })
};
const filters = {
    get: () => send("filters.get"),
    listen: (filter) => listen({ type: "filters", filter })
};
const notifications = {
    get: (displayMethod) => send("notifications.get", { displayMethod }),
    seen: () => send("notifications.seen")
};
const prefs = {
    get: (key) => send("prefs.get", { key }),
    listen: (filter) => listen({ type: "prefs", filter })
};
const premium = {
    activate: (userId) => send("premium.activate", { userId }),
    get: () => send("premium.get"),
    listen: (filter) => listen({ type: "premium", filter })
};
const requests = {
    listen: (filter, tabId) => listen({ type: "requests", filter, tabId })
};
function send(sendType, rawArgs = {}) {
    const args = Object.assign(Object.assign({}, rawArgs), { type: sendType });
    return browser.runtime.sendMessage(args);
}
const stats = {
    getBlockedPerPage: (tab) => send("stats.getBlockedPerPage", { tab }),
    getBlockedTotal: () => send("stats.getBlockedTotal"),
    listen: (filter) => listen({ type: "stats", filter })
};
const subscriptions = {
    get: (options) => send("subscriptions.get", options),
    getInitIssues: () => send("subscriptions.getInitIssues"),
    listen: (filter) => listen({ type: "subscriptions", filter })
};
const api = {
    addDisconnectListener,
    addListener: addMessageListener,
    app,
    ctalinks,
    doclinks,
    filters,
    notifications,
    prefs,
    premium,
    requests,
    removeDisconnectListener,
    subscriptions,
    stats
};
connect();function getSourceAttribute(element)
{
  const sourceContainer = element.closest("[data-source]");
  if (!sourceContainer)
    return null;
  return sourceContainer.dataset.source;
}if (browser.runtime.getBrowserInfo)
{
  browser.runtime.getBrowserInfo().then(info =>
  {
    info.name.toLowerCase();
  });
}
const $ = (selector, container = document) =>
  container.querySelector(selector);
const $$ = (selector, container = document) =>
  container.querySelectorAll(selector);const i18nAttributes = ["alt", "placeholder", "title", "value"];
function setElementText(element, stringName, args, children = [])
{
  function processString(str, currentElement)
  {
    const match = /^(.*?)<(a|em|slot|strong)(\d)?>(.*?)<\/\2\3>(.*)$/.exec(str);
    if (match)
    {
      const [, before, name, index, innerText, after] = match;
      processString(before, currentElement);
      if (name == "slot")
      {
        const e = children[index];
        if (e)
        {
          currentElement.appendChild(e);
        }
      }
      else
      {
        const e = document.createElement(name);
        if (typeof index != "undefined")
        {
          e.dataset.i18nIndex = index;
        }
        processString(innerText, e);
        currentElement.appendChild(e);
      }
      processString(after, currentElement);
    }
    else
      currentElement.appendChild(document.createTextNode(str));
  }
  while (element.lastChild)
    element.removeChild(element.lastChild);
  processString(browser.i18n.getMessage(stringName, args), element);
}
function loadI18nStrings()
{
  function resolveStringNames(container)
  {
    {
      const elements = container.querySelectorAll("[data-i18n]");
      for (const element of elements)
      {
        const children = Array.from(element.children);
        setElementText(element, element.dataset.i18n, null, children);
      }
    }
    for (const attr of i18nAttributes)
    {
      const elements = container.querySelectorAll(`[data-i18n-${attr}]`);
      for (const element of elements)
      {
        const stringName = element.getAttribute(`data-i18n-${attr}`);
        element.setAttribute(attr, browser.i18n.getMessage(stringName));
      }
    }
  }
  resolveStringNames(document);
  for (const template of document.querySelectorAll("template"))
    resolveStringNames(template.content);
}
function initI18n()
{
  browser.runtime.sendMessage({
    type: "app.get",
    what: "localeInfo"
  })
  .then(localeInfo =>
  {
    document.documentElement.lang = localeInfo.locale;
    document.documentElement.dir = localeInfo.bidiDir;
  });
  loadI18nStrings();
}function setupBlock(tab)
{
  $("#block-element").addEventListener("click", () =>
  {
    $("#page-info").classList.add("blocking");
    activateClickHide(tab);
  });
  $("#block-element-cancel").addEventListener("click", () =>
  {
    $("#page-info").classList.remove("blocking");
    cancelClickHide(tab);
  });
  browser.tabs.sendMessage(tab.id, {type: "composer.content.getState"})
    .then(response =>
    {
      if (response && response.active)
        $("#page-info").classList.add("blocking");
    })
    .catch((err) =>
    {
    });
}
let timeout = 0;
function activateClickHide(tab)
{
  browser.tabs.sendMessage(tab.id, {
    type: "composer.content.startPickingElement"
  });
  timeout = window.setTimeout(window.close, 5000);
}
function cancelClickHide(tab)
{
  if (timeout != 0)
  {
    window.clearTimeout(timeout);
    timeout = 0;
  }
  browser.tabs.sendMessage(tab.id, {type: "composer.content.finished"});
}const shareURL = "https://adblockplus.org/";
const messageMark = Symbol("messageMark");
const shareLinks = {
  facebook: ["https://www.facebook.com/dialog/feed", {
    app_id: "475542399197328",
    display: "page",
    link: shareURL,
    hashtag: messageMark
  }],
  twitter: ["https://twitter.com/intent/tweet", {
    text: messageMark,
    url: shareURL,
    via: "AdblockPlus"
  }],
  weibo: ["http://service.weibo.com/share/share.php", {
    title: messageMark,
    url: shareURL
  }]
};
const shareLinksContent = {
  facebook(blockedCount)
  {
    if (blockedCount < 1000)
      return "#AdblockPlus100";
    if (blockedCount < 10000)
      return "#AdblockPlus1000";
    if (blockedCount < 100000)
      return "#AdblockPlus10K";
    if (blockedCount < 1000000)
      return "#AdblockPlus100K";
    return "#AdblockPlus1M";
  },
  twitter(blockedCount)
  {
    return browser.i18n.getMessage(
      "share_on_twitter_message",
      [blockedCount.toLocaleString()]
    );
  },
  weibo(blockedCount)
  {
    return browser.i18n.getMessage(
      "share_on_weibo_message",
      [blockedCount.toLocaleString()]
    );
  }
};
function createShareLink(network, blockedCount)
{
  const [url, params] = shareLinks[network];
  const searchParams = new URLSearchParams();
  for (const key in params)
  {
    let value = params[key];
    if (value == messageMark)
      value = shareLinksContent[network](blockedCount);
    searchParams.append(key, value);
  }
  return url + "?" + searchParams;
}const activeTab = new Promise(
  resolve =>
  {
    document.addEventListener("DOMContentLoaded", () =>
    {
      browser.tabs.query({active: true, lastFocusedWindow: true})
        .then((tabs) =>
        {
          const {id, incognito, url} = tabs[0];
          resolve({id, incognito, url});
        });
    }, {once: true});
  }
);
function isTabAllowlisted(tab)
{
  return browser.runtime.sendMessage({type: "filters.isAllowlisted", tab});
}
function reportIssue(tab)
{
  browser.tabs.create({
    active: false,
    url: browser.runtime.getURL("/issue-reporter.html?" + tab.id)
  }).then(
    () => window.close()
  );
}
function setPref(key, value)
{
  return browser.runtime.sendMessage({type: "prefs.set", key, value});
}
function whenPageReady(tab)
{
  return new Promise(resolve =>
  {
    function onMessage(message, sender)
    {
      if (message.type == "composer.ready" && sender.page &&
          sender.page.id == tab.id)
      {
        browser.runtime.onMessage.removeListener(onMessage);
        resolve();
      }
    }
    browser.runtime.onMessage.addListener(onMessage);
    browser.runtime.sendMessage({
      type: "composer.isPageReady",
      pageId: tab.id
    }).then(ready =>
    {
      if (ready)
      {
        browser.runtime.onMessage.removeListener(onMessage);
        resolve();
      }
    });
  });
}let toggleChecked;
function setupToggles(tab)
{
  const domain = $("#page-status .domain io-circle-toggle");
  const page = $("#page-status .page io-circle-toggle");
  domain.addEventListener("click", () =>
  {
    setPageStateAfterDomain(
      page,
      !domain.state.checked,
      domain.state.checked
    );
  });
  $("#page-refresh button").addEventListener("click", () =>
  {
    browser.tabs.reload(tab.id).then(window.close);
  });
  isTabAllowlisted(tab).then((isAllowlisted) =>
  {
    document.body.classList.toggle(
      "disabled",
      isAllowlisted.hostname || isAllowlisted.page
    );
    if (isAllowlisted.hostname)
    {
      domain.setState({checked: false}, false);
      domain.checked = false;
      setPageStateAfterDomain(page, false, true);
    }
    else if (isAllowlisted.page)
    {
      setPageStateAfterDomain(page, false, false);
    }
    toggleChecked = domain.checked;
  });
  domain.addEventListener("change", () =>
  {
    const {checked} = domain;
    document.body.classList.toggle("refresh", toggleChecked !== checked);
    browser.runtime.sendMessage({
      type: `filters.${checked ? "unallowlist" : "allowlist"}`,
      origin: "popup",
      tab
    });
  });
  page.addEventListener("change", () =>
  {
    document.body.classList.toggle("refresh");
    browser.runtime.sendMessage({
      type: `filters.${page.checked ? "unallowlist" : "allowlist"}`,
      origin: "popup",
      singlePage: true,
      tab
    });
  });
}
function setPageStateAfterDomain(page, checked, disabled)
{
  page.setState({checked}, checked);
  page.checked = checked;
  page.disabled = disabled;
}/*! (c) Andrea Giammarchi - ISC */
var self$3 = {};
try { self$3.WeakMap = WeakMap; }
catch (WeakMap) {
  self$3.WeakMap = (function (id, Object) {    var dP = Object.defineProperty;
    var hOP = Object.hasOwnProperty;
    var proto = WeakMap.prototype;
    proto.delete = function (key) {
      return this.has(key) && delete key[this._];
    };
    proto.get = function (key) {
      return this.has(key) ? key[this._] : void 0;
    };
    proto.has = function (key) {
      return hOP.call(key, this._);
    };
    proto.set = function (key, value) {
      dP(key, this._, {configurable: true, value: value});
      return this;
    };
    return WeakMap;
    function WeakMap(iterable) {
      dP(this, '_', {value: '_@ungap/weakmap' + id++});
      if (iterable)
        iterable.forEach(add, this);
    }
    function add(pair) {
      this.set(pair[0], pair[1]);
    }
  }(Math.random(), Object));
}
var WeakMap$1 = self$3.WeakMap;/*! (c) Andrea Giammarchi - ISC */
var self$2 = {};
try { self$2.WeakSet = WeakSet; }
catch (WeakSet) {
  (function (id, dP) {
    var proto = WeakSet.prototype;
    proto.add = function (object) {
      if (!this.has(object))
        dP(object, this._, {value: true, configurable: true});
      return this;
    };
    proto.has = function (object) {
      return this.hasOwnProperty.call(object, this._);
    };
    proto.delete = function (object) {
      return this.has(object) && delete object[this._];
    };
    self$2.WeakSet = WeakSet;
    function WeakSet() {      dP(this, '_', {value: '_@ungap/weakmap' + id++});
    }
  }(Math.random(), Object.defineProperty));
}
var WeakSet$1 = self$2.WeakSet;const {indexOf: indexOf$1, slice: slice$1} = [];const append = (get, parent, children, start, end, before) => {
  const isSelect = 'selectedIndex' in parent;
  let noSelection = isSelect;
  while (start < end) {
    const child = get(children[start], 1);
    parent.insertBefore(child, before);
    if (isSelect && noSelection && child.selected) {
      noSelection = !noSelection;
      let {selectedIndex} = parent;
      parent.selectedIndex = selectedIndex < 0 ?
        start :
        indexOf$1.call(parent.querySelectorAll('option'), child);
    }
    start++;
  }
};
const eqeq = (a, b) => a == b;
const identity = O => O;
const indexOf = (
  moreNodes,
  moreStart,
  moreEnd,
  lessNodes,
  lessStart,
  lessEnd,
  compare
) => {
  const length = lessEnd - lessStart;
  if (length < 1)
    return -1;
  while ((moreEnd - moreStart) >= length) {
    let m = moreStart;
    let l = lessStart;
    while (
      m < moreEnd &&
      l < lessEnd &&
      compare(moreNodes[m], lessNodes[l])
    ) {
      m++;
      l++;
    }
    if (l === lessEnd)
      return moreStart;
    moreStart = m + 1;
  }
  return -1;
};
const isReversed = (
  futureNodes,
  futureEnd,
  currentNodes,
  currentStart,
  currentEnd,
  compare
) => {
  while (
    currentStart < currentEnd &&
    compare(
      currentNodes[currentStart],
      futureNodes[futureEnd - 1]
    )) {
      currentStart++;
      futureEnd--;
    }  return futureEnd === 0;
};
const next = (get, list, i, length, before) => i < length ?
              get(list[i], 0) :
              (0 < i ?
                get(list[i - 1], -0).nextSibling :
                before);
const remove = (get, children, start, end) => {
  while (start < end)
    drop(get(children[start++], -1));
};
const DELETION = -1;
const INSERTION = 1;
const SKIP = 0;
const SKIP_OND = 50;
const HS = (
  futureNodes,
  futureStart,
  futureEnd,
  futureChanges,
  currentNodes,
  currentStart,
  currentEnd,
  currentChanges
) => {
  let k = 0;
  let minLen = futureChanges < currentChanges ? futureChanges : currentChanges;
  const link = Array(minLen++);
  const tresh = Array(minLen);
  tresh[0] = -1;
  for (let i = 1; i < minLen; i++)
    tresh[i] = currentEnd;
  const nodes = currentNodes.slice(currentStart, currentEnd);
  for (let i = futureStart; i < futureEnd; i++) {
    const index = nodes.indexOf(futureNodes[i]);
    if (-1 < index) {
      const idxInOld = index + currentStart;
      k = findK(tresh, minLen, idxInOld);
      if (-1 < k) {
        tresh[k] = idxInOld;
        link[k] = {
          newi: i,
          oldi: idxInOld,
          prev: link[k - 1]
        };
      }
    }
  }
  k = --minLen;
  --currentEnd;
  while (tresh[k] > currentEnd) --k;
  minLen = currentChanges + futureChanges - k;
  const diff = Array(minLen);
  let ptr = link[k];
  --futureEnd;
  while (ptr) {
    const {newi, oldi} = ptr;
    while (futureEnd > newi) {
      diff[--minLen] = INSERTION;
      --futureEnd;
    }
    while (currentEnd > oldi) {
      diff[--minLen] = DELETION;
      --currentEnd;
    }
    diff[--minLen] = SKIP;
    --futureEnd;
    --currentEnd;
    ptr = ptr.prev;
  }
  while (futureEnd >= futureStart) {
    diff[--minLen] = INSERTION;
    --futureEnd;
  }
  while (currentEnd >= currentStart) {
    diff[--minLen] = DELETION;
    --currentEnd;
  }
  return diff;
};
const OND = (
  futureNodes,
  futureStart,
  rows,
  currentNodes,
  currentStart,
  cols,
  compare
) => {
  const length = rows + cols;
  const v = [];
  let d, k, r, c, pv, cv, pd;
  outer: for (d = 0; d <= length; d++) {
    if (d > SKIP_OND)
      return null;
    pd = d - 1;
    pv = d ? v[d - 1] : [0, 0];
    cv = v[d] = [];
    for (k = -d; k <= d; k += 2) {
      if (k === -d || (k !== d && pv[pd + k - 1] < pv[pd + k + 1])) {
        c = pv[pd + k + 1];
      } else {
        c = pv[pd + k - 1] + 1;
      }
      r = c - k;
      while (
        c < cols &&
        r < rows &&
        compare(
          currentNodes[currentStart + c],
          futureNodes[futureStart + r]
        )
      ) {
        c++;
        r++;
      }
      if (c === cols && r === rows) {
        break outer;
      }
      cv[d + k] = c;
    }
  }
  const diff = Array(d / 2 + length / 2);
  let diffIdx = diff.length - 1;
  for (d = v.length - 1; d >= 0; d--) {
    while (
      c > 0 &&
      r > 0 &&
      compare(
        currentNodes[currentStart + c - 1],
        futureNodes[futureStart + r - 1]
      )
    ) {
      diff[diffIdx--] = SKIP;
      c--;
      r--;
    }
    if (!d)
      break;
    pd = d - 1;
    pv = d ? v[d - 1] : [0, 0];
    k = c - r;
    if (k === -d || (k !== d && pv[pd + k - 1] < pv[pd + k + 1])) {
      r--;
      diff[diffIdx--] = INSERTION;
    } else {
      c--;
      diff[diffIdx--] = DELETION;
    }
  }
  return diff;
};
const applyDiff = (
  diff,
  get,
  parentNode,
  futureNodes,
  futureStart,
  currentNodes,
  currentStart,
  currentLength,
  before
) => {
  const live = [];
  const length = diff.length;
  let currentIndex = currentStart;
  let i = 0;
  while (i < length) {
    switch (diff[i++]) {
      case SKIP:
        futureStart++;
        currentIndex++;
        break;
      case INSERTION:
        live.push(futureNodes[futureStart]);
        append(
          get,
          parentNode,
          futureNodes,
          futureStart++,
          futureStart,
          currentIndex < currentLength ?
            get(currentNodes[currentIndex], 0) :
            before
        );
        break;
      case DELETION:
        currentIndex++;
        break;
    }
  }
  i = 0;
  while (i < length) {
    switch (diff[i++]) {
      case SKIP:
        currentStart++;
        break;
      case DELETION:
        if (-1 < live.indexOf(currentNodes[currentStart]))
          currentStart++;
        else
          remove(
            get,
            currentNodes,
            currentStart++,
            currentStart
          );
        break;
    }
  }
};
const findK = (ktr, length, j) => {
  let lo = 1;
  let hi = length;
  while (lo < hi) {
    const mid = ((lo + hi) / 2) >>> 0;
    if (j < ktr[mid])
      hi = mid;
    else
      lo = mid + 1;
  }
  return lo;
};
const smartDiff = (
  get,
  parentNode,
  futureNodes,
  futureStart,
  futureEnd,
  futureChanges,
  currentNodes,
  currentStart,
  currentEnd,
  currentChanges,
  currentLength,
  compare,
  before
) => {
  applyDiff(
    OND(
      futureNodes,
      futureStart,
      futureChanges,
      currentNodes,
      currentStart,
      currentChanges,
      compare
    ) ||
    HS(
      futureNodes,
      futureStart,
      futureEnd,
      futureChanges,
      currentNodes,
      currentStart,
      currentEnd,
      currentChanges
    ),
    get,
    parentNode,
    futureNodes,
    futureStart,
    currentNodes,
    currentStart,
    currentLength,
    before
  );
};
const drop = node => (node.remove || dropChild).call(node);
function dropChild() {
  const {parentNode} = this;
  if (parentNode)
    parentNode.removeChild(this);
}/*! (c) 2018 Andrea Giammarchi (ISC) */
const domdiff = (
  parentNode,
  currentNodes,
  futureNodes,
  options
) => {
  if (!options)
    options = {};
  const compare = options.compare || eqeq;
  const get = options.node || identity;
  const before = options.before == null ? null : get(options.before, 0);
  const currentLength = currentNodes.length;
  let currentEnd = currentLength;
  let currentStart = 0;
  let futureEnd = futureNodes.length;
  let futureStart = 0;
  while (
    currentStart < currentEnd &&
    futureStart < futureEnd &&
    compare(currentNodes[currentStart], futureNodes[futureStart])
  ) {
    currentStart++;
    futureStart++;
  }
  while (
    currentStart < currentEnd &&
    futureStart < futureEnd &&
    compare(currentNodes[currentEnd - 1], futureNodes[futureEnd - 1])
  ) {
    currentEnd--;
    futureEnd--;
  }
  const currentSame = currentStart === currentEnd;
  const futureSame = futureStart === futureEnd;
  if (currentSame && futureSame)
    return futureNodes;
  if (currentSame && futureStart < futureEnd) {
    append(
      get,
      parentNode,
      futureNodes,
      futureStart,
      futureEnd,
      next(get, currentNodes, currentStart, currentLength, before)
    );
    return futureNodes;
  }
  if (futureSame && currentStart < currentEnd) {
    remove(
      get,
      currentNodes,
      currentStart,
      currentEnd
    );
    return futureNodes;
  }
  const currentChanges = currentEnd - currentStart;
  const futureChanges = futureEnd - futureStart;
  let i = -1;
  if (currentChanges < futureChanges) {
    i = indexOf(
      futureNodes,
      futureStart,
      futureEnd,
      currentNodes,
      currentStart,
      currentEnd,
      compare
    );
    if (-1 < i) {
      append(
        get,
        parentNode,
        futureNodes,
        futureStart,
        i,
        get(currentNodes[currentStart], 0)
      );
      append(
        get,
        parentNode,
        futureNodes,
        i + currentChanges,
        futureEnd,
        next(get, currentNodes, currentEnd, currentLength, before)
      );
      return futureNodes;
    }
  }
  else if (futureChanges < currentChanges) {
    i = indexOf(
      currentNodes,
      currentStart,
      currentEnd,
      futureNodes,
      futureStart,
      futureEnd,
      compare
    );
    if (-1 < i) {
      remove(
        get,
        currentNodes,
        currentStart,
        i
      );
      remove(
        get,
        currentNodes,
        i + futureChanges,
        currentEnd
      );
      return futureNodes;
    }
  }
  if ((currentChanges < 2 || futureChanges < 2)) {
    append(
      get,
      parentNode,
      futureNodes,
      futureStart,
      futureEnd,
      get(currentNodes[currentStart], 0)
    );
    remove(
      get,
      currentNodes,
      currentStart,
      currentEnd
    );
    return futureNodes;
  }
  if (
    currentChanges === futureChanges &&
    isReversed(
      futureNodes,
      futureEnd,
      currentNodes,
      currentStart,
      currentEnd,
      compare
    )
  ) {
    append(
      get,
      parentNode,
      futureNodes,
      futureStart,
      futureEnd,
      next(get, currentNodes, currentEnd, currentLength, before)
    );
    return futureNodes;
  }
  smartDiff(
    get,
    parentNode,
    futureNodes,
    futureStart,
    futureEnd,
    futureChanges,
    currentNodes,
    currentStart,
    currentEnd,
    currentChanges,
    currentLength,
    compare,
    before
  );
  return futureNodes;
};/*! (c) Andrea Giammarchi - ISC */
var self$1 = {};
self$1.CustomEvent = typeof CustomEvent === 'function' ?
  CustomEvent :
  (function (__p__) {
    CustomEvent[__p__] = new CustomEvent('').constructor[__p__];
    return CustomEvent;
    function CustomEvent(type, init) {
      if (!init) init = {};
      var e = document.createEvent('CustomEvent');
      e.initCustomEvent(type, !!init.bubbles, !!init.cancelable, init.detail);
      return e;
    }
  }('prototype'));
var CustomEvent$1 = self$1.CustomEvent;/*! (c) Andrea Giammarchi - ISC */
var self = {};
try { self.Map = Map; }
catch (Map) {
  self.Map = function Map() {
    var i = 0;
    var k = [];
    var v = [];
    return {
      delete: function (key) {
        var had = contains(key);
        if (had) {
          k.splice(i, 1);
          v.splice(i, 1);
        }
        return had;
      },
      forEach: function forEach(callback, context) {
        k.forEach(
          function (key, i)  {
            callback.call(context, v[i], key, this);
          },
          this
        );
      },
      get: function get(key) {
        return contains(key) ? v[i] : void 0;
      },
      has: function has(key) {
        return contains(key);
      },
      set: function set(key, value) {
        v[contains(key) ? i : (k.push(key) - 1)] = value;
        return this;
      }
    };
    function contains(v) {
      i = k.indexOf(v);
      return -1 < i;
    }
  };
}
var Map$1 = self.Map;function Component() {
  return this;
}
function setup(content) {
  const children = new WeakMap$1;
  const create = Object.create;
  const createEntry = (wm, id, component) => {
    wm.set(id, component);
    return component;
  };
  const get = (Class, info, context, id) => {
    const relation = info.get(Class) || relate(Class, info);
    switch (typeof id) {
      case 'object':
      case 'function':
        const wm = relation.w || (relation.w = new WeakMap$1);
        return wm.get(id) || createEntry(wm, id, new Class(context));
      default:
        const sm = relation.p || (relation.p = create(null));
        return sm[id] || (sm[id] = new Class(context));
    }
  };
  const relate = (Class, info) => {
    const relation = {w: null, p: null};
    info.set(Class, relation);
    return relation;
  };
  const set = context => {
    const info = new Map$1;
    children.set(context, info);
    return info;
  };
  Object.defineProperties(
    Component,
    {
      for: {
        configurable: true,
        value(context, id) {
          return get(
            this,
            children.get(context) || set(context),
            context,
            id == null ?
              'default' : id
          );
        }
      }
    }
  );
  Object.defineProperties(
    Component.prototype,
    {
      handleEvent: {value(e) {
        const ct = e.currentTarget;
        this[
          ('getAttribute' in ct && ct.getAttribute('data-call')) ||
          ('on' + e.type)
        ](e);
      }},
      html: lazyGetter('html', content),
      svg: lazyGetter('svg', content),
      state: lazyGetter('state', function () { return this.defaultState; }),
      defaultState: {get() { return {}; }},
      dispatch: {value(type, detail) {
        const {_wire$} = this;
        if (_wire$) {
          const event = new CustomEvent$1(type, {
            bubbles: true,
            cancelable: true,
            detail
          });
          event.component = this;
          return (_wire$.dispatchEvent ?
                    _wire$ :
                    _wire$.firstChild
                  ).dispatchEvent(event);
        }
        return false;
      }},
      setState: {value(state, render) {
        const target = this.state;
        const source = typeof state === 'function' ? state.call(this, target) : state;
        for (const key in source) target[key] = source[key];
        if (render !== false)
          this.render();
        return this;
      }}
    }
  );
}
const lazyGetter = (type, fn) => {
  const secret = '_' + type + '$';
  return {
    get() {
      return this[secret] || setValue(this, secret, fn.call(this, type));
    },
    set(value) {
      setValue(this, secret, value);
    }
  };
};
const setValue = (self, secret, value) =>
  Object.defineProperty(self, secret, {
    configurable: true,
    value: typeof value === 'function' ?
      function () {
        return (self._wire$ = value.apply(this, arguments));
      } :
      value
  })[secret]
;
Object.defineProperties(
  Component.prototype,
  {
    ELEMENT_NODE: {value: 1},
    nodeType: {value: -1}
  }
);const attributes = {};
const intents = {};
const keys = [];
const hasOwnProperty = intents.hasOwnProperty;
let length = 0;
var Intent = {
  attributes,
  define: (intent, callback) => {
    if (intent.indexOf('-') < 0) {
      if (!(intent in intents)) {
        length = keys.push(intent);
      }
      intents[intent] = callback;
    } else {
      attributes[intent] = callback;
    }
  },
  invoke: (object, callback) => {
    for (let i = 0; i < length; i++) {
      let key = keys[i];
      if (hasOwnProperty.call(object, key)) {
        return intents[key](object[key], callback);
      }
    }
  }
};var isArray = Array.isArray ||  (function (toString) {
  var $ = toString.call([]);
  return function isArray(object) {
    return toString.call(object) === $;
  };
}({}.toString));/*! (c) Andrea Giammarchi - ISC */
var createContent = (function (document) {  var FRAGMENT = 'fragment';
  var TEMPLATE = 'template';
  var HAS_CONTENT = 'content' in create(TEMPLATE);
  var createHTML = HAS_CONTENT ?
    function (html) {
      var template = create(TEMPLATE);
      template.innerHTML = html;
      return template.content;
    } :
    function (html) {
      var content = create(FRAGMENT);
      var template = create(TEMPLATE);
      var childNodes = null;
      if (/^[^\S]*?<(col(?:group)?|t(?:head|body|foot|r|d|h))/i.test(html)) {
        var selector = RegExp.$1;
        template.innerHTML = '<table>' + html + '</table>';
        childNodes = template.querySelectorAll(selector);
      } else {
        template.innerHTML = html;
        childNodes = template.childNodes;
      }
      append(content, childNodes);
      return content;
    };
  return function createContent(markup, type) {
    return (type === 'svg' ? createSVG : createHTML)(markup);
  };
  function append(root, childNodes) {
    var length = childNodes.length;
    while (length--)
      root.appendChild(childNodes[0]);
  }
  function create(element) {
    return element === FRAGMENT ?
      document.createDocumentFragment() :
      document.createElementNS('http://www.w3.org/1999/xhtml', element);
  }
  function createSVG(svg) {
    var content = create(FRAGMENT);
    var template = create('div');
    template.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg">' + svg + '</svg>';
    append(content, template.firstChild.childNodes);
    return content;
  }
}(document));/*! (c) Andrea Giammarchi */
function disconnected(poly) {  var Event = poly.Event;
  var WeakSet = poly.WeakSet;
  var notObserving = true;
  var observer = null;
  return function observe(node) {
    if (notObserving) {
      notObserving = !notObserving;
      observer = new WeakSet;
      startObserving(node.ownerDocument);
    }
    observer.add(node);
    return node;
  };
  function startObserving(document) {
    var connected = new WeakSet;
    var disconnected = new WeakSet;
    try {
      (new MutationObserver(changes)).observe(
        document,
        {subtree: true, childList: true}
      );
    }
    catch(o_O) {
      var timer = 0;
      var records = [];
      var reschedule = function (record) {
        records.push(record);
        clearTimeout(timer);
        timer = setTimeout(
          function () {
            changes(records.splice(timer = 0, records.length));
          },
          0
        );
      };
      document.addEventListener(
        'DOMNodeRemoved',
        function (event) {
          reschedule({addedNodes: [], removedNodes: [event.target]});
        },
        true
      );
      document.addEventListener(
        'DOMNodeInserted',
        function (event) {
          reschedule({addedNodes: [event.target], removedNodes: []});
        },
        true
      );
    }
    function changes(records) {
      for (var
        record,
        length = records.length,
        i = 0; i < length; i++
      ) {
        record = records[i];
        dispatchAll(record.removedNodes, 'disconnected', disconnected, connected);
        dispatchAll(record.addedNodes, 'connected', connected, disconnected);
      }
    }
    function dispatchAll(nodes, type, wsin, wsout) {
      for (var
        node,
        event = new Event(type),
        length = nodes.length,
        i = 0; i < length;
        (node = nodes[i++]).nodeType === 1 &&
        dispatchTarget(node, event, type, wsin, wsout)
      );
    }
    function dispatchTarget(node, event, type, wsin, wsout) {
      if (observer.has(node) && !wsin.has(node)) {
        wsout.delete(node);
        wsin.add(node);
        node.dispatchEvent(event);
      }
      for (var
        children = node.children || [],
        length = children.length,
        i = 0; i < length;
        dispatchTarget(children[i++], event, type, wsin, wsout)
      );
    }
  }
}/*! (c) Andrea Giammarchi - ISC */
var importNode = (function (
  document,
  appendChild,
  cloneNode,
  createTextNode,
  importNode
) {
  var native = importNode in document;
  var fragment = document.createDocumentFragment();
  fragment[appendChild](document[createTextNode]('g'));
  fragment[appendChild](document[createTextNode](''));
  var content = native ?
    document[importNode](fragment, true) :
    fragment[cloneNode](true);
  return content.childNodes.length < 2 ?
    function importNode(node, deep) {
      var clone = node[cloneNode]();
      for (var
        childNodes = node.childNodes || [],
        length = childNodes.length,
        i = 0; deep && i < length; i++
      ) {
        clone[appendChild](importNode(childNodes[i], deep));
      }
      return clone;
    } :
    (native ?
      document[importNode] :
      function (node, deep) {
        return node[cloneNode](!!deep);
      }
    );
}(
  document,
  'appendChild',
  'cloneNode',
  'createTextNode',
  'importNode'
));var trim = ''.trim ||  function () {
  return String(this).replace(/^\s+|\s+/g, '');
};/*! (c) Andrea Giammarchi - ISC */
var UID = '-' + Math.random().toFixed(6) + '%';
var UID_IE = false;
try {
  if (!(function (template, content, tabindex) {
    return content in template && (
      (template.innerHTML = '<p ' + tabindex + '="' + UID + '"></p>'),
      template[content].childNodes[0].getAttribute(tabindex) == UID
    );
  }(document.createElement('template'), 'content', 'tabindex'))) {
    UID = '_dt: ' + UID.slice(1, -1) + ';';
    UID_IE = true;
  }
} catch(meh) {}
var UIDC = '<!--' + UID + '-->';
var COMMENT_NODE = 8;
var ELEMENT_NODE = 1;
var TEXT_NODE = 3;
var SHOULD_USE_TEXT_CONTENT = /^(?:plaintext|script|style|textarea|title|xmp)$/i;
var VOID_ELEMENTS = /^(?:area|base|br|col|embed|hr|img|input|keygen|link|menuitem|meta|param|source|track|wbr)$/i;/*! (c) Andrea Giammarchi - ISC */
function sanitize (template) {
  return template.join(UIDC)
          .replace(selfClosing, fullClosing)
          .replace(attrSeeker, attrReplacer);
}
var spaces = ' \\f\\n\\r\\t';
var almostEverything = '[^' + spaces + '\\/>"\'=]+';
var attrName = '[' + spaces + ']+' + almostEverything;
var tagName = '<([A-Za-z]+[A-Za-z0-9:._-]*)((?:';
var attrPartials = '(?:\\s*=\\s*(?:\'[^\']*?\'|"[^"]*?"|<[^>]*?>|' + almostEverything.replace('\\/', '') + '))?)';
var attrSeeker = new RegExp(tagName + attrName + attrPartials + '+)([' + spaces + ']*/?>)', 'g');
var selfClosing = new RegExp(tagName + attrName + attrPartials + '*)([' + spaces + ']*/>)', 'g');
var findAttributes = new RegExp('(' + attrName + '\\s*=\\s*)([\'"]?)' + UIDC + '\\2', 'gi');
function attrReplacer($0, $1, $2, $3) {
  return '<' + $1 + $2.replace(findAttributes, replaceAttributes) + $3;
}
function replaceAttributes($0, $1, $2) {
  return $1 + ($2 || '"') + UID + ($2 || '"');
}
function fullClosing($0, $1, $2) {
  return VOID_ELEMENTS.test($1) ? $0 : ('<' + $1 + $2 + '></' + $1 + '>');
}var umap = _ => ({
  get: key => _.get(key),
  set: (key, value) => (_.set(key, value), value)
});var normalizeAttributes = UID_IE ?
  function (attributes, parts) {
    var html = parts.join(' ');
    return parts.slice.call(attributes, 0).sort(function (left, right) {
      return html.indexOf(left.name) <= html.indexOf(right.name) ? -1 : 1;
    });
  } :
  function (attributes, parts) {
    return parts.slice.call(attributes, 0);
  }
;
function find(node, path) {
  var length = path.length;
  var i = 0;
  while (i < length)
    node = node.childNodes[path[i++]];
  return node;
}
function parse(node, holes, parts, path) {
  var childNodes = node.childNodes;
  var length = childNodes.length;
  var i = 0;
  while (i < length) {
    var child = childNodes[i];
    switch (child.nodeType) {
      case ELEMENT_NODE:
        var childPath = path.concat(i);
        parseAttributes(child, holes, parts, childPath);
        parse(child, holes, parts, childPath);
        break;
      case COMMENT_NODE:
        var textContent = child.textContent;
        if (textContent === UID) {
          parts.shift();
          holes.push(
            SHOULD_USE_TEXT_CONTENT.test(node.nodeName) ?
              Text(node, path) :
              Any(child, path.concat(i))
          );
        } else {
          switch (textContent.slice(0, 2)) {
            case '/*':
              if (textContent.slice(-2) !== '*/')
                break;
            case '\uD83D\uDC7B':
              node.removeChild(child);
              i--;
              length--;
          }
        }
        break;
      case TEXT_NODE:
        if (
          SHOULD_USE_TEXT_CONTENT.test(node.nodeName) &&
          trim.call(child.textContent) === UIDC
        ) {
          parts.shift();
          holes.push(Text(node, path));
        }
        break;
    }
    i++;
  }
}
function parseAttributes(node, holes, parts, path) {
  var attributes = node.attributes;
  var cache = [];
  var remove = [];
  var array = normalizeAttributes(attributes, parts);
  var length = array.length;
  var i = 0;
  while (i < length) {
    var attribute = array[i++];
    var direct = attribute.value === UID;
    var sparse;
    if (direct || 1 < (sparse = attribute.value.split(UIDC)).length) {
      var name = attribute.name;
      if (cache.indexOf(name) < 0) {
        cache.push(name);
        var realName = parts.shift().replace(
          direct ?
            /^(?:|[\S\s]*?\s)(\S+?)\s*=\s*('|")?$/ :
            new RegExp(
              '^(?:|[\\S\\s]*?\\s)(' + name + ')\\s*=\\s*(\'|")[\\S\\s]*',
              'i'
            ),
            '$1'
        );
        var value = attributes[realName] ||
                      attributes[realName.toLowerCase()];
        if (direct)
          holes.push(Attr(value, path, realName, null));
        else {
          var skip = sparse.length - 2;
          while (skip--)
            parts.shift();
          holes.push(Attr(value, path, realName, sparse));
        }
      }
      remove.push(attribute);
    }
  }
  length = remove.length;
  i = 0;
  var cleanValue = 0 < length && UID_IE && !('ownerSVGElement' in node);
  while (i < length) {
    var attr = remove[i++];
    if (cleanValue)
      attr.value = '';
    node.removeAttribute(attr.name);
  }
  var nodeName = node.nodeName;
  if (/^script$/i.test(nodeName)) {
    var script = document.createElement(nodeName);
    length = attributes.length;
    i = 0;
    while (i < length)
      script.setAttributeNode(attributes[i++].cloneNode(true));
    script.textContent = node.textContent;
    node.parentNode.replaceChild(script, node);
  }
}
function Any(node, path) {
  return {
    type: 'any',
    node: node,
    path: path
  };
}
function Attr(node, path, name, sparse) {
  return {
    type: 'attr',
    node: node,
    path: path,
    name: name,
    sparse: sparse
  };
}
function Text(node, path) {
  return {
    type: 'text',
    node: node,
    path: path
  };
}var parsed = umap(new WeakMap$1);
function createInfo(options, template) {
  var markup = (options.convert || sanitize)(template);
  var transform = options.transform;
  if (transform)
    markup = transform(markup);
  var content = createContent(markup, options.type);
  cleanContent(content);
  var holes = [];
  parse(content, holes, template.slice(0), []);
  return {
    content: content,
    updates: function (content) {
      var updates = [];
      var len = holes.length;
      var i = 0;
      var off = 0;
      while (i < len) {
        var info = holes[i++];
        var node = find(content, info.path);
        switch (info.type) {
          case 'any':
            updates.push({fn: options.any(node, []), sparse: false});
            break;
          case 'attr':
            var sparse = info.sparse;
            var fn = options.attribute(node, info.name, info.node);
            if (sparse === null)
              updates.push({fn: fn, sparse: false});
            else {
              off += sparse.length - 2;
              updates.push({fn: fn, sparse: true, values: sparse});
            }
            break;
          case 'text':
            updates.push({fn: options.text(node), sparse: false});
            node.textContent = '';
            break;
        }
      }
      len += off;
      return function () {
        var length = arguments.length;
        if (len !== (length - 1)) {
          throw new Error(
            (length - 1) + ' values instead of ' + len + '\n' +
            template.join('${value}')
          );
        }
        var i = 1;
        var off = 1;
        while (i < length) {
          var update = updates[i - off];
          if (update.sparse) {
            var values = update.values;
            var value = values[0];
            var j = 1;
            var l = values.length;
            off += l - 2;
            while (j < l)
              value += arguments[i++] + values[j++];
            update.fn(value);
          }
          else
            update.fn(arguments[i++]);
        }
        return content;
      };
    }
  };
}
function createDetails(options, template) {
  var info = parsed.get(template) || parsed.set(template, createInfo(options, template));
  return info.updates(importNode.call(document, info.content, true));
}
var empty = [];
function domtagger(options) {
  var previous = empty;
  var updates = cleanContent;
  return function (template) {
    if (previous !== template)
      updates = createDetails(options, (previous = template));
    return updates.apply(null, arguments);
  };
}
function cleanContent(fragment) {
  var childNodes = fragment.childNodes;
  var i = childNodes.length;
  while (i--) {
    var child = childNodes[i];
    if (
      child.nodeType !== 1 &&
      trim.call(child.textContent).length === 0
    ) {
      fragment.removeChild(child);
    }
  }
}/*! (c) Andrea Giammarchi - ISC */
var hyperStyle = (function (){  var IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i;
  var hyphen = /([^A-Z])([A-Z]+)/g;
  return function hyperStyle(node, original) {
    return 'ownerSVGElement' in node ? svg(node, original) : update(node.style, false);
  };
  function ized($0, $1, $2) {
    return $1 + '-' + $2.toLowerCase();
  }
  function svg(node, original) {
    var style;
    if (original)
      style = original.cloneNode(true);
    else {
      node.setAttribute('style', '--hyper:style;');
      style = node.getAttributeNode('style');
    }
    style.value = '';
    node.setAttributeNode(style);
    return update(style, true);
  }
  function toStyle(object) {
    var key, css = [];
    for (key in object)
      css.push(key.replace(hyphen, ized), ':', object[key], ';');
    return css.join('');
  }
  function update(style, isSVG) {
    var oldType, oldValue;
    return function (newValue) {
      var info, key, styleValue, value;
      switch (typeof newValue) {
        case 'object':
          if (newValue) {
            if (oldType === 'object') {
              if (!isSVG) {
                if (oldValue !== newValue) {
                  for (key in oldValue) {
                    if (!(key in newValue)) {
                      style[key] = '';
                    }
                  }
                }
              }
            } else {
              if (isSVG)
                style.value = '';
              else
                style.cssText = '';
            }
            info = isSVG ? {} : style;
            for (key in newValue) {
              value = newValue[key];
              styleValue = typeof value === 'number' &&
                                  !IS_NON_DIMENSIONAL.test(key) ?
                                  (value + 'px') : value;
              if (!isSVG && /^--/.test(key))
                info.setProperty(key, styleValue);
              else
                info[key] = styleValue;
            }
            oldType = 'object';
            if (isSVG)
              style.value = toStyle((oldValue = info));
            else
              oldValue = newValue;
            break;
          }
        default:
          if (oldValue != newValue) {
            oldType = 'string';
            oldValue = newValue;
            if (isSVG)
              style.value = newValue || '';
            else
              style.cssText = newValue || '';
          }
          break;
      }
    };
  }
}());/*! (c) Andrea Giammarchi - ISC */
var Wire = (function (slice, proto) {
  proto = Wire.prototype;
  proto.ELEMENT_NODE = 1;
  proto.nodeType = 111;
  proto.remove = function (keepFirst) {
    var childNodes = this.childNodes;
    var first = this.firstChild;
    var last = this.lastChild;
    this._ = null;
    if (keepFirst && childNodes.length === 2) {
      last.parentNode.removeChild(last);
    } else {
      var range = this.ownerDocument.createRange();
      range.setStartBefore(keepFirst ? childNodes[1] : first);
      range.setEndAfter(last);
      range.deleteContents();
    }
    return first;
  };
  proto.valueOf = function (forceAppend) {
    var fragment = this._;
    var noFragment = fragment == null;
    if (noFragment)
      fragment = (this._ = this.ownerDocument.createDocumentFragment());
    if (noFragment || forceAppend) {
      for (var n = this.childNodes, i = 0, l = n.length; i < l; i++)
        fragment.appendChild(n[i]);
    }
    return fragment;
  };
  return Wire;
  function Wire(childNodes) {
    var nodes = (this.childNodes = slice.call(childNodes, 0));
    this.firstChild = nodes[0];
    this.lastChild = nodes[nodes.length - 1];
    this.ownerDocument = nodes[0].ownerDocument;
    this._ = null;
  }
}([].slice));const DOCUMENT_FRAGMENT_NODE = 11;
const OWNER_SVG_ELEMENT = 'ownerSVGElement';
const CONNECTED = 'connected';
const DISCONNECTED = 'dis' + CONNECTED;const componentType = Component.prototype.nodeType;
const wireType = Wire.prototype.nodeType;
const observe = disconnected({Event: CustomEvent$1, WeakSet: WeakSet$1});
const asHTML = html => ({html});
const asNode = (item, i) => {
  switch (item.nodeType) {
    case wireType:
      return (1 / i) < 0 ?
        (i ? item.remove(true) : item.lastChild) :
        (i ? item.valueOf(true) : item.firstChild);
    case componentType:
      return asNode(item.render(), i);
    default:
      return item;
  }
};
const canDiff = value => 'ELEMENT_NODE' in value;
const booleanSetter = (node, key, oldValue) => newValue => {
  if (oldValue !== !!newValue) {
    if ((oldValue = !!newValue))
      node.setAttribute(key, '');
    else
      node.removeAttribute(key);
  }
};
const hyperSetter = (node, name, svg) => svg ?
  value => {
    try {
      node[name] = value;
    }
    catch (nope) {
      node.setAttribute(name, value);
    }
  } :
  value => {
    node[name] = value;
  };
const invokeAtDistance = (value, callback) => {
  callback(value.placeholder);
  if ('text' in value) {
    Promise.resolve(value.text).then(String).then(callback);
  } else if ('any' in value) {
    Promise.resolve(value.any).then(callback);
  } else if ('html' in value) {
    Promise.resolve(value.html).then(asHTML).then(callback);
  } else {
    Promise.resolve(Intent.invoke(value, callback)).then(callback);
  }
};
const isPromise_ish = value => value != null && 'then' in value;
const readOnly = /^(?:form|list)$/i;
const slice = [].slice;
const text = (node, text) => node.ownerDocument.createTextNode(text);
function Tagger(type) {
  this.type = type;
  return domtagger(this);
}
Tagger.prototype = {
  attribute(node, name, original) {
    const isSVG = OWNER_SVG_ELEMENT in node;
    let oldValue;
    if (name === 'style')
      return hyperStyle(node, original, isSVG);
    else if (name.slice(0, 1) === '.')
      return hyperSetter(node, name.slice(1), isSVG);
    else if (name.slice(0, 1) === '?')
      return booleanSetter(node, name.slice(1));
    else if (/^on/.test(name)) {
      let type = name.slice(2);
      if (type === CONNECTED || type === DISCONNECTED) {
        observe(node);
      }
      else if (name.toLowerCase()
        in node) {
        type = type.toLowerCase();
      }
      return newValue => {
        if (oldValue !== newValue) {
          if (oldValue)
            node.removeEventListener(type, oldValue, false);
          oldValue = newValue;
          if (newValue)
            node.addEventListener(type, newValue, false);
        }
      };
    }
    else if (
      name === 'data' ||
      (!isSVG && name in node && !readOnly.test(name))
    ) {
      return newValue => {
        if (oldValue !== newValue) {
          oldValue = newValue;
          if (node[name] !== newValue && newValue == null) {
            node[name] = '';
            node.removeAttribute(name);
          }
          else
            node[name] = newValue;
        }
      };
    }
    else if (name in Intent.attributes) {
      return any => {
        const newValue = Intent.attributes[name](node, any);
        if (oldValue !== newValue) {
          oldValue = newValue;
          if (newValue == null)
            node.removeAttribute(name);
          else
            node.setAttribute(name, newValue);
        }
      };
    }
    else {
      let owner = false;
      const attribute = original.cloneNode(true);
      return newValue => {
        if (oldValue !== newValue) {
          oldValue = newValue;
          if (attribute.value !== newValue) {
            if (newValue == null) {
              if (owner) {
                owner = false;
                node.removeAttributeNode(attribute);
              }
              attribute.value = newValue;
            } else {
              attribute.value = newValue;
              if (!owner) {
                owner = true;
                node.setAttributeNode(attribute);
              }
            }
          }
        }
      };
    }
  },
  any(node, childNodes) {
    const diffOptions = {node: asNode, before: node};
    const nodeType = OWNER_SVG_ELEMENT in node ?  'svg' : 'html';
    let fastPath = false;
    let oldValue;
    const anyContent = value => {
      switch (typeof value) {
        case 'string':
        case 'number':
        case 'boolean':
          if (fastPath) {
            if (oldValue !== value) {
              oldValue = value;
              childNodes[0].textContent = value;
            }
          } else {
            fastPath = true;
            oldValue = value;
            childNodes = domdiff(
              node.parentNode,
              childNodes,
              [text(node, value)],
              diffOptions
            );
          }
          break;
        case 'function':
          anyContent(value(node));
          break;
        case 'object':
        case 'undefined':
          if (value == null) {
            fastPath = false;
            childNodes = domdiff(
              node.parentNode,
              childNodes,
              [],
              diffOptions
            );
            break;
          }
        default:
          fastPath = false;
          oldValue = value;
          if (isArray(value)) {
            if (value.length === 0) {
              if (childNodes.length) {
                childNodes = domdiff(
                  node.parentNode,
                  childNodes,
                  [],
                  diffOptions
                );
              }
            } else {
              switch (typeof value[0]) {
                case 'string':
                case 'number':
                case 'boolean':
                  anyContent({html: value});
                  break;
                case 'object':
                  if (isArray(value[0])) {
                    value = value.concat.apply([], value);
                  }
                  if (isPromise_ish(value[0])) {
                    Promise.all(value).then(anyContent);
                    break;
                  }
                default:
                  childNodes = domdiff(
                    node.parentNode,
                    childNodes,
                    value,
                    diffOptions
                  );
                  break;
              }
            }
          } else if (canDiff(value)) {
            childNodes = domdiff(
              node.parentNode,
              childNodes,
              value.nodeType === DOCUMENT_FRAGMENT_NODE ?
                slice.call(value.childNodes) :
                [value],
              diffOptions
            );
          } else if (isPromise_ish(value)) {
            value.then(anyContent);
          } else if ('placeholder' in value) {
            invokeAtDistance(value, anyContent);
          } else if ('text' in value) {
            anyContent(String(value.text));
          } else if ('any' in value) {
            anyContent(value.any);
          } else if ('html' in value) {
            childNodes = domdiff(
              node.parentNode,
              childNodes,
              slice.call(
                createContent(
                  [].concat(value.html).join(''),
                  nodeType
                ).childNodes
              ),
              diffOptions
            );
          } else if ('length' in value) {
            anyContent(slice.call(value));
          } else {
            anyContent(Intent.invoke(value, anyContent));
          }
          break;
      }
    };
    return anyContent;
  },
  text(node) {
    let oldValue;
    const textContent = value => {
      if (oldValue !== value) {
        oldValue = value;
        const type = typeof value;
        if (type === 'object' && value) {
          if (isPromise_ish(value)) {
            value.then(textContent);
          } else if ('placeholder' in value) {
            invokeAtDistance(value, textContent);
          } else if ('text' in value) {
            textContent(String(value.text));
          } else if ('any' in value) {
            textContent(value.any);
          } else if ('html' in value) {
            textContent([].concat(value.html).join(''));
          } else if ('length' in value) {
            textContent(slice.call(value).join(''));
          } else {
            textContent(Intent.invoke(value, textContent));
          }
        } else if (type === 'function') {
          textContent(value(node));
        } else {
          node.textContent = value == null ? '' : value;
        }
      }
    };
    return textContent;
  }
};var isNoOp = typeof document !== 'object';
var templateLiteral = function (tl) {
  var RAW = 'raw';
  var isBroken = function (UA) {
    return /(Firefox|Safari)\/(\d+)/.test(UA) &&
          !/(Chrom[eium]+|Android)\/(\d+)/.test(UA);
  };
  var broken = isBroken((document.defaultView.navigator || {}).userAgent);
  var FTS = !(RAW in tl) ||
            tl.propertyIsEnumerable(RAW) ||
            !Object.isFrozen(tl[RAW]);
  if (broken || FTS) {
    var forever = {};
    var foreverCache = function (tl) {
      for (var key = '.', i = 0; i < tl.length; i++)
        key += tl[i].length + '.' + tl[i];
      return forever[key] || (forever[key] = tl);
    };
    if (FTS)
      templateLiteral = foreverCache;
    else {
      var wm = new WeakMap$1;
      var set = function (tl, unique) {
        wm.set(tl, unique);
        return unique;
      };
      templateLiteral = function (tl) {
        return wm.get(tl) || set(tl, foreverCache(tl));
      };
    }
  } else {
    isNoOp = true;
  }
  return TL(tl);
};
function TL(tl) {
  return isNoOp ? tl : templateLiteral(tl);
}function tta (template) {
  var length = arguments.length;
  var args = [TL(template)];
  var i = 1;
  while (i < length)
    args.push(arguments[i++]);
  return args;
}const wires = new WeakMap$1;
const wire = (obj, type) => obj == null ?
  content(type || 'html') :
  weakly(obj, type || 'html');
const content = type => {
  let wire, tagger, template;
  return function () {
    const args = tta.apply(null, arguments);
    if (template !== args[0]) {
      template = args[0];
      tagger = new Tagger(type);
      wire = wireContent(tagger.apply(tagger, args));
    } else {
      tagger.apply(tagger, args);
    }
    return wire;
  };
};
const weakly = (obj, type) => {
  const i = type.indexOf(':');
  let wire = wires.get(obj);
  let id = type;
  if (-1 < i) {
    id = type.slice(i + 1);
    type = type.slice(0, i) || 'html';
  }
  if (!wire)
    wires.set(obj, wire = {});
  return wire[id] || (wire[id] = content(type));
};
const wireContent = node => {
  const childNodes = node.childNodes;
  const {length} = childNodes;
  return length === 1 ?
    childNodes[0] :
    (length ? new Wire(childNodes) : node);
};const bewitched = new WeakMap$1;
function render() {
  const wicked = bewitched.get(this);
  const args = tta.apply(null, arguments);
  if (wicked && wicked.template === args[0]) {
    wicked.tagger.apply(null, args);
  } else {
    upgrade.apply(this, args);
  }
  return this;
}
function upgrade(template) {
  const type = OWNER_SVG_ELEMENT in this ? 'svg' : 'html';
  const tagger = new Tagger(type);
  bewitched.set(this, {tagger, template: template});
  this.textContent = '';
  this.appendChild(tagger.apply(null, arguments));
}/*! (c) Andrea Giammarchi (ISC) */
const bind = context => render.bind(context);
const define = Intent.define;
const tagger = Tagger.prototype;
hyper.Component = Component;
hyper.bind = bind;
hyper.define = define;
hyper.diff = domdiff;
hyper.hyper = hyper;
hyper.observe = observe;
hyper.tagger = tagger;
hyper.wire = wire;
hyper._ = {
  WeakMap: WeakMap$1,
  WeakSet: WeakSet$1
};
setup(content);
function hyper(HTML) {
  return arguments.length < 2 ?
    (HTML == null ?
      content('html') :
      (typeof HTML === 'string' ?
        hyper.wire(null, HTML) :
        ('raw' in HTML ?
          content('html')(HTML) :
          ('nodeType' in HTML ?
            hyper.bind(HTML) :
            weakly(HTML, 'html')
          )
        )
      )) :
    ('raw' in HTML ?
      content('html') : hyper.wire
    ).apply(null, arguments);
}/*! (C) 2017-2018 Andrea Giammarchi - ISC Style License */
const ATTRIBUTE_CHANGED_CALLBACK = 'attributeChangedCallback';
const O = Object;
const classes = [];
const defineProperty = O.defineProperty;
const getOwnPropertyDescriptor = O.getOwnPropertyDescriptor;
const getOwnPropertyNames = O.getOwnPropertyNames;
const getOwnPropertySymbols = O.getOwnPropertySymbols || (() => []);
const getPrototypeOf = O.getPrototypeOf || (o => o.__proto__);
const ownKeys = typeof Reflect === 'object' && Reflect.ownKeys ||
                (o => getOwnPropertyNames(o).concat(getOwnPropertySymbols(o)));
const setPrototypeOf = O.setPrototypeOf ||
                      ((o, p) => (o.__proto__ = p, o));
const camel = name => name.replace(/-([a-z])/g, ($0, $1) => $1.toUpperCase());
const {attachShadow} = HTMLElement.prototype;
const sr = new WeakMap;
class HyperHTMLElement extends HTMLElement {
  static define(name, options) {
    const Class = this;
    const proto = Class.prototype;
    const onChanged = proto[ATTRIBUTE_CHANGED_CALLBACK];
    const hasChange = !!onChanged;
    const booleanAttributes = Class.booleanAttributes || [];
    booleanAttributes.forEach(attribute => {
      const name = camel(attribute);
      if (!(name in proto)) defineProperty(
        proto,
        name,
        {
          configurable: true,
          get() {
            return this.hasAttribute(attribute);
          },
          set(value) {
            if (!value || value === 'false')
              this.removeAttribute(attribute);
            else
              this.setAttribute(attribute, '');
          }
        }
      );
    });
    const observedAttributes = (Class.observedAttributes || []).filter(
      attribute => booleanAttributes.indexOf(attribute) < 0
    );
    observedAttributes.forEach(attribute => {
      const name = camel(attribute);
      if (!(name in proto)) defineProperty(
        proto,
        name,
        {
          configurable: true,
          get() {
            return this.getAttribute(attribute);
          },
          set(value) {
            if (value == null)
              this.removeAttribute(attribute);
            else
              this.setAttribute(attribute, value);
          }
        }
      );
    });
    const attributes = booleanAttributes.concat(observedAttributes);
    if (attributes.length)
      defineProperty(Class, 'observedAttributes', {
        get() { return attributes; }
      });
    const created = proto.created || function () {
      this.render();
    };
    defineProperty(
      proto,
      '_init$',
      {
        configurable: true,
        writable: true,
        value: true
      }
    );
    defineProperty(
      proto,
      ATTRIBUTE_CHANGED_CALLBACK,
      {
        configurable: true,
        value: function aCC(name, prev, curr) {
          if (this._init$) {
            checkReady.call(this, created, attributes, booleanAttributes);
            if (this._init$)
              return this._init$$.push(aCC.bind(this, name, prev, curr));
          }
          if (hasChange && prev !== curr) {
            onChanged.apply(this, arguments);
          }
        }
      }
    );
    const onConnected = proto.connectedCallback;
    const hasConnect = !!onConnected;
    defineProperty(
      proto,
      'connectedCallback',
      {
        configurable: true,
        value: function cC() {
          if (this._init$) {
            checkReady.call(this, created, attributes, booleanAttributes);
            if (this._init$)
              return this._init$$.push(cC.bind(this));
          }
          if (hasConnect) {
            onConnected.apply(this, arguments);
          }
        }
      }
    );
    getOwnPropertyNames(proto).forEach(key => {
      if (/^handle[A-Z]/.test(key)) {
        const _key$ = '_' + key + '$';
        const method = proto[key];
        defineProperty(proto, key, {
          configurable: true,
          get() {
            return  this[_key$] ||
                    (this[_key$] = method.bind(this));
          }
        });
      }
    });
    if (!('handleEvent' in proto)) {
      defineProperty(
        proto,
        'handleEvent',
        {
          configurable: true,
          value(event) {
            this[
              (event.currentTarget.dataset || {}).call ||
              ('on' + event.type)
            ](event);
          }
        }
      );
    }
    if (options && options.extends) {
      const Native = document.createElement(options.extends).constructor;
      const Intermediate = class extends Native {};
      const ckeys = ['length', 'name', 'arguments', 'caller', 'prototype'];
      const pkeys = [];
      let Super = null;
      let BaseClass = Class;
      while (Super = getPrototypeOf(BaseClass)) {
        [
          {target: Intermediate, base: Super, keys: ckeys},
          {target: Intermediate.prototype, base: Super.prototype, keys: pkeys}
        ]
        .forEach(({target, base, keys}) => {
          ownKeys(base)
            .filter(key => keys.indexOf(key) < 0)
            .forEach((key) => {
              keys.push(key);
              defineProperty(
                target,
                key,
                getOwnPropertyDescriptor(base, key)
              );
            });
        });
        BaseClass = Super;
        if (Super === HyperHTMLElement)
          break;
      }
      setPrototypeOf(Class, Intermediate);
      setPrototypeOf(proto, Intermediate.prototype);
      customElements.define(name, Class, options);
    } else {
      customElements.define(name, Class);
    }
    classes.push(Class);
    return Class;
  }
  attachShadow() {
    const shadowRoot = attachShadow.apply(this, arguments);
    sr.set(this, shadowRoot);
    return shadowRoot;
  }
  get refs() {
    const value = {};
    if ('_html$' in this) {
      const all = (sr.get(this) || this).querySelectorAll('[ref]');
      for (let {length} = all, i = 0; i < length; i++) {
        const node = all[i];
        value[node.getAttribute('ref')] = node;
      }
      Object.defineProperty(this, 'refs', {value});
      return value;
    }
    return value;
  }
  get html() {
    return this._html$ || (this.html = bind(
      this.shadowRoot || this._shadowRoot || sr.get(this) || this
    ));
  }
  set html(value) {
    defineProperty(this, '_html$', {configurable: true, value: value});
  }
  render() {}
  get defaultState() { return {}; }
  get state() {
    return this._state$ || (this.state = this.defaultState);
  }
  set state(value) {
    defineProperty(this, '_state$', {configurable: true, value: value});
  }
  setState(state, render) {
    const target = this.state;
    const source = typeof state === 'function' ? state.call(this, target) : state;
    for (const key in source) target[key] = source[key];
    if (render !== false) this.render();
    return this;
  }
}HyperHTMLElement.Component = Component;
HyperHTMLElement.bind = bind;
HyperHTMLElement.intent = define;
HyperHTMLElement.wire = wire;
HyperHTMLElement.hyper = hyper;
try {
  if (Symbol.hasInstance) classes.push(
    defineProperty(HyperHTMLElement, Symbol.hasInstance, {
      enumerable: false,
      configurable: true,
      value(instance) {
        return classes.some(isPrototypeOf, getPrototypeOf(instance));
      }
    }));
} catch(meh) {}
const dom = {
  type: 'DOMContentLoaded',
  handleEvent() {
    if (dom.ready()) {
      document.removeEventListener(dom.type, dom, false);
      dom.list.splice(0).forEach(invoke);
    }
    else
      setTimeout(dom.handleEvent);
  },
  ready() {
    return document.readyState === 'complete';
  },
  list: []
};
if (!dom.ready()) {
  document.addEventListener(dom.type, dom, false);
}
function checkReady(created, attributes, booleanAttributes) {
  if (dom.ready() || isReady.call(this, created, attributes, booleanAttributes)) {
    if (this._init$) {
      const list = this._init$$ || [];
      delete this._init$$;
      const self = defineProperty(this, '_init$', {value: false});
      booleanAttributes.forEach(name => {
        if (self.getAttribute(name) === 'false')
          self.removeAttribute(name);
      });
      attributes.forEach(name => {
        if (self.hasOwnProperty(name)) {
          const curr = self[name];
          delete self[name];
          list.unshift(() => { self[name] = curr; });
        }
      });
      created.call(self);
      list.forEach(invoke);
    }
  } else {
    if (!this.hasOwnProperty('_init$$'))
      defineProperty(this, '_init$$', {configurable: true, value: []});
    dom.list.push(checkReady.bind(this, created, attributes, booleanAttributes));
  }
}
function invoke(fn) {
  fn();
}
function isPrototypeOf(Class) {
  return this === Class.prototype;
}
function isReady(created, attributes, booleanAttributes) {
  let el = this;
  do { if (el.nextSibling) return true; }
  while (el = el.parentNode);
  setTimeout(checkReady.bind(this, created, attributes, booleanAttributes));
  return false;
}const DOMUtils = {
  boolean: {
    attribute(node, name, setAsTrue)
    {
      if (DOMUtils.boolean.value(setAsTrue))
      {
        node.setAttribute(name, "true");
      }
      else
      {
        node.removeAttribute(name);
      }
    },
    value(value)
    {
      if (typeof value === "string" && value.length)
      {
        try
        {
          value = JSON.parse(value);
        }
        catch (error)
        {
        }
      }
      return !!value;
    }
  },
  event: {
    isLeftClick(event)
    {
      const re = /^(?:click|mouse|touch|pointer)/;
      return re.test(event.type) && !event.button;
    }
  }
};
let counter = 0;
class IOElement extends HyperHTMLElement
{
  static get utils()
  {
    return DOMUtils;
  }
  static getID(element)
  {
    return element.getAttribute("id") || IOElement.setID(element);
  }
  static setID(element)
  {
    const id = `${element.nodeName.toLowerCase()}-${counter++}`;
    element.setAttribute("id", id);
    return id;
  }
  get id()
  {
    return IOElement.getID(this);
  }
  get ready()
  {
    return !!this.offsetParent && this.isStyled();
  }
  created() { this.render(); }
  isStyled()
  {
    const computed = window.getComputedStyle(this, null);
    const property = "--" + this.nodeName.toLowerCase();
    return computed.getPropertyValue(property).trim() !== "";
  }
  render() {}
  get child()
  {
    let element = this.firstElementChild;
    if (!element)
    {
      this.render();
      element = this.firstElementChild;
    }
    return element;
  }
}
IOElement.intent("i18n", idOrArgs =>
{
  const fragment = document.createDocumentFragment();
  if (typeof idOrArgs === "string")
    setElementText(fragment, idOrArgs);
  else if (idOrArgs instanceof Array)
    setElementText(fragment, ...idOrArgs);
  return fragment;
});class IOCircleToggle extends IOElement
{
  static get observedAttributes()
  {
    return ["action", "checked", "disabled"];
  }
  static get booleanAttributes()
  {
    return ["checked", "disabled"];
  }
  attributeChangedCallback()
  {
    this.render();
  }
  created()
  {
    this.setState({checked: this.checked});
    this.setAttribute("tabindex", 0);
    this.addEventListener("click", this);
    this.addEventListener("keydown", this);
    $(".outer-circle", this).addEventListener("transitionend", this);
  }
  onclick()
  {
    if (!this.disabled)
    {
      this.checked = !this.checked;
    }
  }
  onkeydown(event)
  {
    switch (event.key)
    {
      case " ":
      case "Enter":
        this.onclick(event);
        break;
    }
  }
  ontransitionend(event)
  {
    if (event.propertyName === "transform" && !this.disabled)
    {
      const {checked} = this.state;
      if (checked !== this.checked)
      {
        this.setState({checked: this.checked}, false);
        $("svg", this).dispatchEvent(new CustomEvent("change", {
          bubbles: true,
          cancelable: true,
          detail: this.checked
        }));
      }
    }
  }
  render()
  {
    this.html`
    <svg
      width="100%"
      viewBox="-2.5 -2.5 71 50" version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      role="checkbox"
      data-action="${this.action}"
      aria-checked="${this.checked}"
      aria-disabled="${this.disabled}"
    >
      <g>
        <rect fill="#E4E4E4" x="1" y="16.8"
              width="64.4" height="12.6" rx="6.3" />
        <g transform="translate(31.6, 0)">
          <circle class="outer-circle" cx="23" cy="22.4" r="22.4" />
          <circle class="on" fill="#0688CB" cx="12" cy="22.4" r="9.8" />
          <circle class="off" fill="#4B4B4B" cx="-24" cy="22.4" r="9.8" />
        </g>
      </g>
    </svg>`;
  }
}
IOCircleToggle.define("io-circle-toggle");api.notifications.get("popup")
  .then((notification) =>
  {
    if (notification)
    {
      window.dispatchEvent(
        new CustomEvent("extension:notification", {detail: notification})
      );
      api.notifications.seen();
    }
  });
window.addEventListener(
  "extension:notification",
  (event) =>
  {
    const notification = event.detail;
    const notifier = IOElement.wire()`
    <div class="${"content " + notification.type}">
      <div>
        <h3 hidden="${!notification.texts.title}">
          <span>${notification.texts.title}</span>
        </h3>
        <p id="notification-message"></p>
        <hr>
        <button onclick="${dismiss}">
          ${{i18n: "overlay_notification_closing_button_hide"}}
        </button>
        <button
          data-pref="notifications_ignoredcategories"
          hidden="${/^(?:critical|relentless)$/.test(notification.type)}"
          onclick="${dismiss}">
          ${{i18n: "overlay_notification_closing_button_optout"}}
        </button>
      </div>
    </div>`;
    const container = $("#notification");
    container.innerHTML = "";
    container.appendChild(notifier);
    container.removeAttribute("hidden");
    const messageElement = $("#notification-message", notifier);
    insertMessage(
      messageElement,
      notification.texts.message,
      (notification.links || []).map((link) => `#${link}`)
    );
    messageElement.addEventListener("click", evt =>
    {
      const link = evt.target.closest("a");
      if (!messageElement.contains(link))
        return;
      evt.preventDefault();
      evt.stopPropagation();
      const linkTarget = link.hash.slice(1);
      if (!linkTarget)
        throw new Error("Link has no target");
      browser.runtime.sendMessage({
        type: "notifications.clicked",
        id: notification.id,
        link: linkTarget
      })
      .then(() => window.close());
    });
    function dismiss(evt)
    {
      const el = evt.currentTarget;
      if (el.dataset.pref)
        setPref(el.dataset.pref, true);
      container.setAttribute("hidden", "");
      notifier.parentNode.removeChild(notifier);
      browser.runtime.sendMessage({
        type: "notifications.clicked",
        id: notification.id
      });
    }
    function insertMessage(element, text, links)
    {
      const match = /^(.*?)<(a|strong)>(.*?)<\/\2>(.*)$/.exec(text);
      if (!match)
      {
        element.appendChild(document.createTextNode(text));
        return;
      }
      const before = match[1];
      const tagName = match[2];
      const value = match[3];
      const after = match[4];
      insertMessage(element, before, links);
      const newElement = document.createElement(tagName);
      if (tagName == "a" && links && links.length)
        newElement.href = links.shift();
      insertMessage(newElement, value, links);
      element.appendChild(newElement);
      insertMessage(element, after, links);
    }
  },
  {once: true}
);const {getMessage} = browser.i18n;
class IOPopupFooter extends IOElement
{
  get defaultState()
  {
    return {messages: [], current: 0, animationIsOn: false};
  }
  created()
  {
    this._animationDuration = 3000;
    this.style.setProperty(
      "--animation-duration",
      this._animationDuration / 1000 + "s"
    );
    this._canAnimate = true;
    this.addEventListener("mouseenter", this.stopAnimation);
    this.addEventListener("mouseleave", this.startAnimation);
    this.addEventListener("focusin", this.stopAnimation);
    this.addEventListener("focusout", this.startAnimation);
  }
  attributeChangedCallback()
  {
    this.render();
  }
  onclick(event)
  {
    const {currentTarget} = event;
    if (currentTarget.getAttribute("role") === "tab")
    {
      this.stopAnimation();
      this._canAnimate = false;
      const idx = parseInt(currentTarget.id.split("-")[2], 10);
      this.setState({current: idx});
    }
  }
  onkeyup(event)
  {
    const {currentTarget} = event;
    if (currentTarget.getAttribute("role") !== "tab")
      return;
    let direction = 0;
    const isRTL = document.documentElement.getAttribute("dir") === "rtl";
    const idx = parseInt(currentTarget.id.split("-")[2], 10);
    switch (event.key)
    {
      case "ArrowLeft":
        direction = -1;
        break;
      case "ArrowRight":
        direction = 1;
        break;
    }
    if (!direction)
      return;
    if (isRTL)
      direction *= -1;
    this._canAnimate = false;
    let newIdx = idx + direction;
    if (newIdx >= this.state.messages.length)
      newIdx = 0;
    else if (newIdx < 0)
      newIdx = this.state.messages.length - 1;
    this.setState({current: newIdx});
    $(`#footer-tab-${newIdx}`).focus();
  }
  startAnimation()
  {
    if (!this._canAnimate)
      return;
    clearInterval(this._timer);
    this._timer = setInterval(() =>
    {
      const nextIdx = (this.state.current + 1) % this.state.messages.length;
      this.setState({current: nextIdx});
    }, this._animationDuration);
    this.setState({animationIsOn: true});
  }
  stopAnimation()
  {
    clearInterval(this._timer);
    this.setState({animationIsOn: false});
  }
  setupDoclinks()
  {
    if (this._setupDoclinksInitialized)
      return;
    const {store} = document.documentElement.dataset;
    const anchors = $$("a[data-doclink]", this);
    if (!store)
      return;
    this._setupDoclinksInitialized = true;
    for (const anchor of anchors)
    {
      const doclink = anchor.dataset.doclink.replace("%store%", store);
      api.doclinks.get(doclink).then((url) =>
      {
        anchor.target = anchor.target || "_blank";
        anchor.href = url;
      });
    }
  }
  render()
  {
    const {messages, animationIsOn} = this.state;
    if (!messages)
      return;
    this.html`
    <ul class="tabs ${animationIsOn ? "animated" : ""}" role="tablist">
      ${messages.map(getTab, this)}
    </ul>
    <ul class="panels">
      ${messages.map(getPanel, this)}
    </ul>`;
    this.setupDoclinks();
  }
}
IOPopupFooter.define("io-popup-footer");
function getPanel(message, idx)
{
  const {current} = this.state;
  return IOElement.wire(message, ":panel")`
  <li
    id="footer-panel-${idx}"
    role="tabpanel"
    aria-hidden=${current === idx ? "false" : "true"}
  >
    <span id="footer-panel-description-${idx}" class="message">
      ${{i18n: message.i18n}}
    </span>
    <span class="buttons" ?hidden=${current !== idx}>
      ${message.buttons.map(getPanelButton, this)}
    </span>
  </li>`;
}
function getTab(message, idx)
{
  const {current} = this.state;
  return IOElement.wire(message, ":tab")`
  <li><button
    id="footer-tab-${idx}"
    role="tab"
    aria-controls="footer-panel-${idx}"
    aria-labelledby="footer-panel-description-${idx}"
    aria-selected=${current === idx ? "true" : "false"}
    tabindex=${current !== idx ? -1 : 0}
    onclick=${this}
    onkeyup=${this}
  /></li>`;
}
function getPanelButton(button)
{
  switch (button.action)
  {
    case "open-doclink":
      const {image} = button;
      return IOElement.wire(button)`
      <a
        class="${image ? "icon" : ""}"
        data-doclink=${button.doclink}
        onclick=${this}
      >${
        image ?
        IOElement.wire()`
          <img src="${image.url}" alt="${getMessage(image.i18nAlt)}"/>` :
        IOElement.wire()`${{i18n: button.i18n}}`
      }</a>`;
  }
}initI18n();
api.app.getInfo().then(info =>
{
  const {dataset} = document.documentElement;
  ["platform", "application", "store"].forEach(key => dataset[key] = info[key]);
});
activeTab.then(tab =>
{
  const urlProtocol = tab.url && new URL(tab.url).protocol;
  if (/^https?:$/.test(urlProtocol))
  {
    whenPageReady(tab).then(() =>
    {
      document.body.classList.remove("nohtml");
    });
  }
  else
  {
    document.body.classList.add("disabled");
    document.body.classList.add("ignore");
    document.body.classList.remove("nohtml");
  }
  document.body.classList.toggle("private", tab.incognito);
  return tab;
})
.then(tab =>
{
  const {url} = tab;
  const defaultDetails = {hostname: "", pathname: "", search: ""};
  const {hostname, pathname, search} = url ? new URL(url) : defaultDetails;
  $("#blocking-domain").textContent = hostname;
  let pageContent = pathname;
  if (!search.includes("&"))
  {
    pageContent += search;
  }
  else if (search)
  {
    pageContent += "?…";
  }
  $("#blocking-page").textContent = pageContent;
  $("#issue-reporter").addEventListener(
    "click", () => reportIssue(tab)
  );
  const options = $("#options");
  options.setAttribute("aria-label", options.textContent);
  options.textContent = "";
  options.addEventListener("click", () =>
  {
    api.app.open("options").then(
      () => window.close()
    );
  });
  setupPremium();
  setupToggles(tab);
  setupStats(tab);
  setupBlock(tab);
  setupShare();
  setupFooter();
  browser.tabs.onActivated.addListener(() =>
  {
    window.close();
  });
});
function updateBlockedPerPage(blockedPage)
{
  $("#stats-page .amount").textContent = blockedPage.toLocaleString();
}
function updateBlockedTotal(blockedTotal)
{
  const total = blockedTotal.toLocaleString();
  $("#stats-total .amount").textContent = total;
  for (const media of ["facebook", "twitter", "weibo"])
  {
    const link = $(`#counter-panel .share a.${media}`);
    link.target = "_blank";
    link.href = createShareLink(media, blockedTotal);
  }
}
async function setupPremium()
{
  setupPremiumBanners();
  const premium = await api.premium.get();
  setPremiumState(premium.isActive);
  api.addListener((msg) =>
  {
    if (msg.type !== "premium.respond" || msg.action !== "changed")
      return;
    setupPremiumBanners();
    setPremiumState(msg.args[0].isActive);
  });
  api.premium.listen(["changed"]);
}
async function setupPremiumBanners()
{
  const premiumManageCTA = $("#premium-manage");
  const premiumUpgradeCTA = $("#premium-upgrade");
  const source = getSourceAttribute(document.body);
  const premiumManageUrl = await api.ctalinks.get("premium-manage", {source});
  const premiumUpgradeUrl = await api.ctalinks.get("premium-upgrade", {source});
  premiumManageCTA.setAttribute("href", premiumManageUrl);
  premiumUpgradeCTA.setAttribute("href", premiumUpgradeUrl);
}
function setPremiumState(premiumIsActive)
{
  document.body.classList.toggle("premium", premiumIsActive);
}
function setupStats(tab)
{
  api.stats.getBlockedPerPage(tab).then((blockedPage) =>
  {
    updateBlockedPerPage(blockedPage);
  });
  api.stats.getBlockedTotal().then((blockedTotal) =>
  {
    updateBlockedTotal(blockedTotal);
  });
  api.addListener((msg) =>
  {
    if (msg.type !== "stats.respond")
      return;
    switch (msg.action)
    {
      case "blocked_per_page":
        if (msg.args[0].tabId === tab.id)
        {
          updateBlockedPerPage(msg.args[0].blocked);
        }
        break;
      case "blocked_total":
        updateBlockedTotal(msg.args[0]);
        break;
    }
  });
  api.stats.listen(["blocked_per_page", "blocked_total"]);
}
function setupShare()
{
  const wrapper = $("#counter-panel .share");
  const shareButton = $(".enter", wrapper);
  const cancelButton = $(".cancel", wrapper);
  const firstFocusable = $("a", wrapper);
  const indexed = $$("[tabindex]", wrapper);
  const isExpanded = () => wrapper.classList.contains("expanded");
  firstFocusable.addEventListener("transitionend", () =>
  {
    if (isExpanded() && document.activeElement === shareButton)
      firstFocusable.focus();
  });
  wrapper.addEventListener("transitionend", () =>
  {
    const expanded = isExpanded();
    const tabindex = expanded ? 0 : -1;
    for (const el of indexed)
    {
      el.setAttribute("tabindex", tabindex);
    }
    shareButton.setAttribute("tabindex", expanded ? -1 : 0);
    if (!expanded && document.activeElement === cancelButton)
      shareButton.focus();
  });
  shareButton.addEventListener("click", (event) =>
  {
    event.preventDefault();
    wrapper.classList.add("expanded");
  });
  cancelButton.addEventListener("click", (event) =>
  {
    event.preventDefault();
    wrapper.classList.remove("expanded");
  });
}
function setupFooter()
{
  const footer = document.querySelector("io-popup-footer");
  fetch("data/popup-footer.json")
    .then((res) => res.json())
    .then((msgs) =>
    {
      const msgsToDisplay = msgs.filter(({exceptions}) =>
      {
        if (!exceptions)
          return true;
        return !["platform", "application", "store"].some((info) =>
        {
          const {[info]: exceptionsInfo} = exceptions;
          if (!exceptionsInfo)
            return false;
          const {[info]: browserInfo} = document.documentElement.dataset;
          return exceptionsInfo.includes(browserInfo);
        });
      });
      msgsToDisplay.sort((a, b) => a.order - b.order);
      footer.setState({
        messages: msgsToDisplay,
        current: Math.floor(Math.random() * msgsToDisplay.length)
      });
      footer.startAnimation();
    });
}})();
