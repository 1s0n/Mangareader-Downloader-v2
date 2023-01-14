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
(function(){'use strict';let browserName = "unknown";
if (browser.runtime.getBrowserInfo)
{
  browser.runtime.getBrowserInfo().then(info =>
  {
    browserName = info.name.toLowerCase();
  });
}
const $ = (selector, container = document) =>
  container.querySelector(selector);
const $$ = (selector, container = document) =>
  container.querySelectorAll(selector);
const clipboard = {
  copy(text)
  {
    const selection = document.getSelection();
    const selected = selection.rangeCount > 0 ?
                      selection.getRangeAt(0) : null;
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.cssText = "position:fixed;top:-999px";
    document.body.appendChild(el).select();
    document.execCommand("copy");
    document.body.removeChild(el);
    if (selected)
    {
      selection.removeAllRanges();
      const range = document.createRange();
      range.setStart(selected.startContainer, selected.startOffset);
      range.setEnd(selected.endContainer, selected.endOffset);
      selection.addRange(range);
    }
  },
  paste(event)
  {
    if (!event)
      event = window;
    const clipboardData = event.clipboardData || window.clipboardData;
    return clipboardData ? clipboardData.getData("text") : "";
  }
};
function relativeCoordinates(event)
{
  let el = event.currentTarget;
  if ("layerX" in event && "layerY" in event)
  {
    let {layerX} = event;
    if (browserName === "firefox")
      layerX -= el.offsetLeft;
    return {x: layerX, y: event.layerY};
  }
  let x = 0;
  let y = 0;
  do
  {
    x += el.offsetLeft - el.scrollLeft;
    y += el.offsetTop - el.scrollTop;
  } while (
    (el = el.offsetParent) &&
    !isNaN(el.offsetLeft) &&
    !isNaN(el.offsetTop)
  );
  return {x: event.pageX - x, y: event.pageY - y};
}let ignoreFocus = false;
function closeAddFiltersByURL()
{
  if (!isClosed())
  {
    ignoreFocus = false;
    $("[data-action='open-filterlist-by-url']").focus();
  }
}
function setupAddFiltersByURL()
{
  const wrapper = $("#filterlist-by-url-wrap");
  wrapper.addEventListener("blur", filtersBlur, true);
  wrapper.addEventListener("keydown", filtersKeydown);
  const opener = $("[data-action='open-filterlist-by-url']", wrapper);
  opener.addEventListener("mousedown", filtersToggle);
  opener.addEventListener("focus", filtersToggle);
  opener.addEventListener("keydown", openerKeys);
  const input = $("input[type='url']", wrapper);
  input.addEventListener("keyup", checkIfValid);
}
function checkIfValid(event)
{
  const {currentTarget} = event;
  const isValid = currentTarget.checkValidity();
  currentTarget.setAttribute("aria-invalid", !isValid);
  let errorText = "";
  if (!isValid)
  {
    const url = currentTarget.value;
    if (url)
    {
      let errorId = null;
      if (!(new RegExp(currentTarget.pattern).test(url)))
      {
        errorId = "options_dialog_import_subscription_location_error_protocol";
      }
      else
      {
        errorId = "options_dialog_import_subscription_location_error";
      }
      errorText = browser.i18n.getMessage(errorId);
    }
  }
  $("#import-list-url ~ .error-msg").textContent = errorText;
}
function filtersBlur()
{
  setTimeout(
    (wrapper) =>
    {
      const {activeElement} = document;
      if (!activeElement || !wrapper.contains(activeElement))
      {
        filtersClose();
      }
    },
    0,
    $("#filterlist-by-url-wrap")
  );
}
function filtersClose()
{
  $("#filterlist-by-url").setAttribute("aria-hidden", "true");
}
function filtersKeydown(event)
{
  if (isClosed())
    return;
  const {key} = event;
  if (key !== "Enter" && key !== "Escape")
    return;
  event.preventDefault();
  event.stopPropagation();
  switch (key)
  {
    case "Enter":
      $("[data-action='validate-import-subscription']").click();
      break;
    case "Escape":
      $("[data-action='open-filterlist-by-url']").focus();
      filtersClose();
      break;
  }
}
function filtersOpen()
{
  const element = $("#filterlist-by-url");
  element.removeAttribute("aria-hidden");
  $("input[type='url']", element).focus();
}
function filtersToggle(event)
{
  if (ignoreFocus)
  {
    ignoreFocus = false;
    return;
  }
  const {currentTarget} = event;
  const {activeElement} = document;
  ignoreFocus = event.type === "mousedown" && currentTarget !== activeElement;
  if (isClosed())
  {
    event.preventDefault();
    filtersOpen();
  }
  else
  {
    filtersClose();
  }
}
function isClosed()
{
  return $("#filterlist-by-url").getAttribute("aria-hidden") === "true";
}
function openerKeys(event)
{
  switch (event.key)
  {
    case " ":
    case "Enter":
      ignoreFocus = false;
      filtersToggle(event);
      break;
  }
}const {getMessage: getMessage$1} = browser.i18n;
let languageNames = new Map();
function getRawItemTitle(item)
{
  return item.title || item.originalTitle || item.url || item.text;
}
function getLanguageItemTitle(item)
{
  const description = item.languages
    .map((langCode) => languageNames.get(langCode))
    .filter((langName, idx, arr) => arr.indexOf(langName) === idx)
    .reduce(
      (acc, langName, idx) =>
      {
        if (idx === 0)
          return langName;
        return getMessage$1("options_language_join", [acc, langName]);
      },
      ""
    );
  if (/\+EasyList$/.test(getRawItemTitle(item)))
    return `${description} + ${getMessage$1("options_english")}`;
  return description;
}
function getPrettyItemTitle(item, includeRaw)
{
  const {recommended} = item;
  let description = null;
  if (recommended === "ads")
  {
    description = getLanguageItemTitle(item);
  }
  else
  {
    description = getMessage$1(`common_feature_${recommended}_title`);
  }
  if (!description)
    return getRawItemTitle(item);
  if (includeRaw)
    return `${getRawItemTitle(item)} (${description})`;
  return description;
}
async function loadLanguageNames()
{
  const resp = await fetch("./data/locales.json");
  const localeData = await resp.json();
  languageNames = new Map(Object.entries(localeData.nativeNames));
}function __rest(s, e) {
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
connect();function convertDoclinks()
{
  const links = document.querySelectorAll("a[data-doclink]");
  for (const link of links)
  {
    getDoclink(link.dataset.doclink).then((url) =>
    {
      link.target = link.target || "_blank";
      link.href = url;
    });
  }
}
function getDoclink(link)
{
  return browser.runtime.sendMessage({
    type: "app.get",
    what: "doclink",
    link
  });
}
function getErrorMessage(error)
{
  let message = null;
  if (error)
  {
    let messageId = error.reason || error.type;
    let placeholders = [];
    if (error.reason === "filter_unknown_option")
    {
      if (error.option)
        placeholders = [error.option];
      else
        messageId = "filter_invalid_option";
    }
    message = browser.i18n.getMessage(messageId, placeholders);
  }
  if (!message)
  {
    message = browser.i18n.getMessage("filter_action_failed");
  }
  if (!error || typeof error.lineno !== "number")
    return message;
  return browser.i18n.getMessage("line", [
    error.lineno.toLocaleString(),
    message
  ]);
}
function getSourceAttribute(element)
{
  const sourceContainer = element.closest("[data-source]");
  if (!sourceContainer)
    return null;
  return sourceContainer.dataset.source;
}const i18nAttributes = ["alt", "placeholder", "title", "value"];
function assignAction(elements, action)
{
  for (const element of elements)
  {
    switch (typeof action)
    {
      case "string":
        element.href = action;
        element.target = "_blank";
        break;
      case "function":
        element.href = "#";
        element.addEventListener("click", (ev) =>
        {
          ev.preventDefault();
          action();
        });
        break;
    }
  }
}
function* getRemainingLinks(parent)
{
  const links = parent.querySelectorAll("a:not([data-i18n-index])");
  for (const link of links)
  {
    yield link;
  }
}
function setElementLinks(idOrElement, ...actions)
{
  const element = typeof idOrElement === "string" ?
                  document.getElementById(idOrElement) :
                  idOrElement;
  const remainingLinks = getRemainingLinks(element);
  for (let i = 0; i < actions.length; i++)
  {
    const links = element.querySelectorAll(`a[data-i18n-index='${i}']`);
    if (links.length)
    {
      assignAction(links, actions[i]);
      continue;
    }
    const link = remainingLinks.next();
    if (link.done)
      continue;
    assignAction([link.value], actions[i]);
  }
}
function stripTagsUnsafe(text)
{
  return text.replace(/<\/?[^>]+>/g, "");
}
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
let length$1 = 0;
var Intent = {
  attributes,
  define: (intent, callback) => {
    if (intent.indexOf('-') < 0) {
      if (!(intent in intents)) {
        length$1 = keys.push(intent);
      }
      intents[intent] = callback;
    } else {
      attributes[intent] = callback;
    }
  },
  invoke: (object, callback) => {
    for (let i = 0; i < length$1; i++) {
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
});const {isLeftClick} = IOElement.utils.event;
class IOScrollbar extends IOElement
{
  static get observedAttributes()
  {
    return ["direction", "position", "size"];
  }
  created()
  {
    this.addEventListener(
      "click",
      (event) =>
      {
        if (event.target !== this || !isLeftClick(event))
          return;
        if (this._dragging)
        {
          this._dragging = false;
          return;
        }
        const {x, y} = relativeCoordinates(event);
        if (this.direction === "horizontal")
          setPosition.call(this, x - (this._sliderSize / 2));
        else if (this.direction === "vertical")
          setPosition.call(this, y - (this._sliderSize / 2));
        this.dispatchEvent(new CustomEvent("scroll"));
      }
    );
    this.addEventListener(
      "wheel",
      (event) =>
      {
        stopEvent(event);
        let delta = 0;
        if (this.direction === "vertical")
          delta = event.deltaY;
        else if (this.direction === "horizontal")
          delta = event.deltaX;
        delta = delta * this._sliderSize / this.size;
        setPosition.call(this, this.position + delta);
        this.dispatchEvent(new CustomEvent("scroll"));
      },
      {passive: false}
    );
  }
  get defaultState()
  {
    return {
      direction: "",
      position: 0,
      size: 0
    };
  }
  get direction()
  {
    return this.state.direction;
  }
  set direction(value)
  {
    value = value.toLowerCase();
    this.setState({direction: value});
    this.setAttribute("direction", value);
    sizeChange.call(this);
  }
  get position()
  {
    return this.state.position || 0;
  }
  set position(value)
  {
    if (!this._elSize)
      return;
    setPosition.call(this, value);
  }
  get range()
  {
    return this._elSize - this._sliderSize;
  }
  get size()
  {
    return this.state.size;
  }
  set size(value)
  {
    this.setState({size: parseInt(value, 10)});
    sizeChange.call(this);
  }
  onmousedown(event)
  {
    if (!isLeftClick(event))
      return;
    this._dragging = true;
    this._coords = {
      x: event.clientX,
      y: event.clientY
    };
    const slider = event.currentTarget;
    const doc = slider.ownerDocument;
    doc.addEventListener("mousemove", this, true);
    doc.addEventListener("mouseup", this, true);
    doc.addEventListener("selectstart", stopEvent, true);
  }
  onmousemove(event)
  {
    const {x, y} = this._coords;
    if (this.direction === "horizontal")
    {
      const {clientX} = event;
      setPosition.call(this, this.position + clientX - x);
      this._coords.x = clientX;
    }
    else if (this.direction === "vertical")
    {
      const {clientY} = event;
      setPosition.call(this, this.position + clientY - y);
      this._coords.y = clientY;
    }
    this.dispatchEvent(new CustomEvent("scroll"));
  }
  onmouseup(event)
  {
    if (!isLeftClick(event))
      return;
    const {currentTarget: doc, target} = event;
    doc.removeEventListener("mousemove", this, true);
    doc.removeEventListener("mouseup", this, true);
    doc.removeEventListener("selectstart", stopEvent, true);
    if (target !== this || target === this.child)
      this._dragging = false;
  }
  render()
  {
    this.html`<div
      class="slider"
      onmousedown="${this}"
    />`;
  }
}
IOScrollbar.define("io-scrollbar");
function setPosition(value)
{
  this.setState({
    position: Math.max(
      0,
      Math.min(
        parseFloat(value),
        this.range
      )
    )
  });
  this.style.setProperty(
    "--position",
    this.state.position + "px"
  );
}
function sizeChange()
{
  if (this.direction === "horizontal")
    this._elSize = this.clientWidth;
  else if (this.direction === "vertical")
    this._elSize = this.clientHeight;
  this._sliderSize = Math.floor(
    Math.min(1, this._elSize / this.state.size) * this._elSize
  );
  if (this.direction === "horizontal")
    this._sliderSize = Math.max(this._sliderSize, this.clientHeight);
  else if (this.direction === "vertical")
    this._sliderSize = Math.max(this._sliderSize, this.clientWidth);
  this.style.setProperty("--slider-size", this._sliderSize + "px");
  setPosition.call(this, this.position);
}
function stopEvent(event)
{
  event.preventDefault();
  event.stopPropagation();
}class IOCheckbox extends IOElement
{
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
    this.addEventListener("click", this);
    this.render();
  }
  onclick(event)
  {
    if (!this.disabled)
    {
      this.checked = !this.checked;
      this.dispatchEvent(new CustomEvent("change", {
        bubbles: true,
        cancelable: true,
        detail: this.checked
      }));
    }
  }
  render()
  {
    this.html`
    <button
      role="checkbox"
      disabled="${this.disabled}"
      aria-checked="${this.checked}"
      aria-disabled="${this.disabled}"
    />`;
  }
}
IOCheckbox.define("io-checkbox");class IOToggle extends IOElement
{
  static get observedAttributes()
  {
    return ["checked", "disabled"];
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
    this.addEventListener("click", this);
    this.render();
  }
  onclick(event)
  {
    if (!this.disabled)
    {
      this.checked = !this.checked;
      if (this.ownerDocument.activeElement !== this.child)
      {
        this.child.focus();
      }
      this.firstElementChild.dispatchEvent(new CustomEvent("change", {
        bubbles: true,
        cancelable: true,
        detail: this.checked
      }));
    }
  }
  render()
  {
    this.html`
    <button
      role="checkbox"
      disabled="${this.disabled}"
      aria-checked="${this.checked}"
      aria-disabled="${this.disabled}"
    />`;
  }
}
IOToggle.define("io-toggle");class IOFilterBase extends IOElement
{
  static get booleanAttributes()
  {
    return ["disabled"];
  }
  static get observedAttributes()
  {
    return ["filters"];
  }
  get selected()
  {
    return this._selected || (this._selected = new Set());
  }
  set selected(value)
  {
    this._selected = new Set(value);
    this.render();
  }
  get defaultState()
  {
    return {
      infinite: false,
      filters: [],
      viewHeight: 0,
      rowHeight: 0,
      scrollTop: 0,
      scrollHeight: 0,
      tbody: null
    };
  }
  get filters()
  {
    return this.state.filters || [];
  }
  set filters(value)
  {
    if (!this.ready)
    {
      this._filters = value;
      return;
    }
    this.selected = [];
    this.style.setProperty("--rule-width", "auto");
    this.setState({infinite: false, filters: []});
    this.style.setProperty(
      "--rule-width",
      $('[data-column="rule"]', this).clientWidth + "px"
    );
    if (value.length)
    {
      const tbody = $("tbody", this);
      const rowHeight = $("tr", tbody).clientHeight;
      const viewHeight = tbody.clientHeight;
      this.setState({
        infinite: true,
        filters: value,
        scrollTop: tbody.scrollTop,
        scrollHeight: rowHeight * (value.length + 1) - viewHeight,
        viewHeight,
        rowHeight
      });
      this.style.setProperty("--row-height", `${rowHeight}px`);
      this.scrollbar.size = rowHeight * value.length;
    }
  }
  created()
  {
    if (!this.ready)
      this.addEventListener(
        "animationstart",
        function prepare(event)
        {
          this.removeEventListener(event.type, prepare);
          if (this._filters)
          {
            this.filters = this._filters;
            this._filters = null;
          }
        }
      );
    this.scrollbar = new IOScrollbar();
    this.scrollbar.direction = "vertical";
    this.scrollbar.addEventListener("scroll", () =>
    {
      const {position, range} = this.scrollbar;
      const {scrollHeight} = this.state;
      this.setState({
        scrollTop: getScrollTop$1(scrollHeight * position / range)
      });
    });
    this.addEventListener(
      "wheel",
      event =>
      {
        event.preventDefault();
        const activeElement = this.ownerDocument.activeElement;
        if (activeElement && activeElement !== this.ownerDocument.body)
        {
          activeElement.blur();
          return;
        }
        const {scrollHeight, scrollTop, rowHeight, viewHeight} = this.state;
        const scrollFactors = {
          0: 1,
          1: rowHeight,
          2: viewHeight - Math.min(0.1 * viewHeight, 2 * rowHeight)
        };
        this.setState({
          scrollTop: getScrollTop$1(
            scrollTop + event.deltaY * scrollFactors[event.deltaMode],
            scrollHeight
          )
        });
        updateScrollbarPosition.call(this);
      },
      {passive: false}
    );
    setScrollbarReactiveOpacity.call(this);
  }
  scrollTo(row)
  {
    const {rowHeight, scrollHeight} = this.state;
    const index = typeof row === "string" ?
      this.filters.findIndex(filter => filter.text === row) :
      this.filters.findIndex(filter => filter === row);
    if (index < 0)
      console.error("invalid filter", row);
    else
    {
      this.setState({
        scrollTop: getScrollTop$1(index * rowHeight, scrollHeight)
      });
      updateScrollbarPosition.call(this);
    }
  }
  renderTable()
  {
    throw new Error("renderTable not implemented");
  }
  render()
  {
    let list = this.state.filters;
    if (this.state.infinite)
    {
      list = [];
      const {rowHeight, scrollTop, viewHeight} = this.state;
      const length = this.state.filters.length;
      let count = 0;
      let i = Math.floor(scrollTop / rowHeight);
      while ((count * rowHeight) < (viewHeight + rowHeight))
      {
        list[count++] = i < length ? this.state.filters[i++] : null;
      }
    }
    this.renderTable(list);
    postRender.call(this, list);
  }
  updateScrollbar()
  {
    const {rowHeight, viewHeight} = this.state;
    const {length} = this.filters;
    this.scrollbar.size = rowHeight * length;
    this.setState({
      scrollHeight: rowHeight * (length + 1) - viewHeight
    });
  }
}
function getScrollTop$1(value, scrollHeight)
{
  const scrollTop = Math.max(
    0,
    Math.min(scrollHeight || Infinity, value)
  );
  return isNaN(scrollTop) ? 0 : scrollTop;
}
function postRender(list)
{
  const {tbody, scrollTop, rowHeight} = this.state;
  if (this.state.infinite)
  {
    tbody.scrollTop = scrollTop % rowHeight;
  }
  else if (
    !tbody ||
    (tbody.scrollHeight <= tbody.clientHeight && tbody.clientHeight)
  )
  {
    this.setState({
      tbody: tbody || $("tbody", this),
      filters: list.concat({})
    });
  }
}
function setScrollbarReactiveOpacity()
{
  const opacity = this.scrollbar.style.opacity;
  const cancelOpacity = () =>
  {
    this.scrollbar.style.opacity = opacity;
    document.removeEventListener("pointerup", cancelOpacity);
    document.removeEventListener("pointercancel", cancelOpacity);
  };
  this.scrollbar.addEventListener("pointerdown", () =>
  {
    this.scrollbar.style.opacity = 1;
    document.addEventListener("pointerup", cancelOpacity);
    document.addEventListener("pointercancel", cancelOpacity);
  });
}
function updateScrollbarPosition()
{
  const {scrollbar, state} = this;
  const {scrollHeight, scrollTop} = state;
  scrollbar.position = scrollTop * scrollbar.range / scrollHeight;
}const prevFilterText = new WeakMap();
class IOFilterList extends IOFilterBase
{
  get defaultState()
  {
    return Object.assign(super.defaultState, {
      sort: {
        current: "",
        asc: false
      },
      sortMap: {
        status: "disabled",
        rule: "text",
        warning: "slow"
      }
    });
  }
  created()
  {
    setupPort.call(this);
    super.created();
  }
  onheaderclick(event)
  {
    const th = event.target.closest("th");
    if (!IOElement.utils.event.isLeftClick(event) || !th)
      return;
    const {column} = th.dataset;
    if (column === "selected")
    {
      const ioCheckbox = event.target.closest("io-checkbox");
      if (ioCheckbox)
        this.selected = ioCheckbox.checked ? this.filters : [];
      return;
    }
    event.preventDefault();
    const {sort, sortMap} = this.state;
    if (column !== sort.current)
    {
      sort.current = column;
      sort.asc = false;
    }
    sort.asc = !sort.asc;
    const sorter = sort.asc ? 1 : -1;
    const property = sortMap[column];
    const direction = property === "slow" ? -1 : 1;
    this.filters.sort((fa, fb) =>
    {
      if (fa[property] === fb[property])
        return 0;
      return (fa[property] < fb[property] ? -sorter : sorter) * direction;
    });
    this.render();
    const dataset = th.closest("thead").dataset;
    dataset.sort = column;
    dataset.dir = sort.asc ? "asc" : "desc";
  }
  onpaste(event)
  {
    event.preventDefault();
    const data = event.clipboardData.getData("text/plain");
    const [text] = data.trim().split("\n", 1);
    document.execCommand("insertText", false, text);
  }
  onkeydown(event)
  {
    const {key} = event;
    if (key === "Enter" || key === "Escape")
    {
      event.preventDefault();
      if (key === "Escape" && this._filter)
      {
        const {currentTarget} = event;
        const text = prevFilterText.get(this._filter) || this._filter.text;
        currentTarget.textContent = text;
        currentTarget.blur();
        this._filter = null;
      }
    }
  }
  onkeyup(event)
  {
    const isEnter = event.key === "Enter";
    const update = isEnter || event.type === "blur";
    const {currentTarget} = event;
    const {title} = currentTarget;
    const text = currentTarget.textContent.trim();
    const filter = this._filter;
    if (!filter)
      return;
    if (!text)
    {
      if (!update)
        return;
      browser.runtime.sendMessage({
        type: "filters.remove",
        text: filter.text
      }).then(errors =>
      {
        if (!errors.length)
        {
          this.selected.delete(filter);
          this.render();
          this.dispatchEvent(new CustomEvent("filter:removed", {
            cancelable: false,
            bubbles: true
          }));
        }
      });
      this._filter = null;
      return;
    }
    if (!prevFilterText.has(filter))
      prevFilterText.set(filter, title);
    if (prevFilterText.get(filter) === text)
    {
      if (isEnter)
        focusTheNextFilterIfAny.call(this, currentTarget.closest("tr"));
      return;
    }
    if (update)
    {
      filter.text = text;
      currentTarget.title = text;
      this._validating = 0;
      if (this.filters.some(f => f.text === filter.text && f !== filter))
      {
        const {reason} = filter;
        filter.reason = {type: "filter_duplicated"};
        if (!isSameError(filter.reason, reason))
        {
          this.render();
        }
      }
      else
      {
        replaceFilter.call(this, filter, currentTarget);
        if (isEnter)
          focusTheNextFilterIfAny.call(this, currentTarget.closest("tr"));
      }
      return;
    }
    if (this._validating > 0)
    {
      this._validating++;
      return;
    }
    this._validating = 1;
    browser.runtime.sendMessage({
      type: "filters.validate",
      text
    }).then(errors =>
    {
      if (this._validating < 1)
        return;
      if (this._validating > 1)
      {
        this._validating = 0;
        this.onkeyup({currentTarget});
        return;
      }
      const {reason} = filter;
      if (errors.length)
        filter.reason = errors[0];
      else
        delete filter.reason;
      if (!isSameError(filter.reason, reason))
        this.render();
    });
  }
  onfocus(event)
  {
    const {currentTarget} = event;
    this._filter = currentTarget.data;
    currentTarget.closest("tr").classList.add("editing");
  }
  onblur(event)
  {
    const {currentTarget} = event;
    currentTarget.closest("tr").classList.remove("editing");
    currentTarget.scrollLeft = 0;
    if (this._changingFocus)
    {
      this._filter = null;
      return;
    }
    this.onkeyup(event);
    this._filter = null;
  }
  onclick(event)
  {
    const filter = getFilter(event);
    const {filters} = this;
    if (event.shiftKey && this.selected.size)
    {
      let start = filters.indexOf(this._lastFilter);
      const end = filters.indexOf(filter);
      const method = this.selected.has(this._lastFilter) ?
                          "add" :
                          "delete";
      if (start < end)
      {
        while (start++ < end)
          this.selected[method](filters[start]);
      }
      else
      {
        while (start-- > end)
          this.selected[method](filters[start]);
      }
    }
    else
    {
      this._lastFilter = filter;
      if (this.selected.has(filter))
        this.selected.delete(filter);
      else
        this.selected.add(filter);
    }
  }
  onchange(event)
  {
    const {currentTarget} = event;
    const td = currentTarget.closest("td");
    if (td.dataset.column === "status")
    {
      const checkbox = currentTarget.closest("io-toggle");
      const filter = getFilter(event);
      filter.disabled = !checkbox.checked;
      browser.runtime.sendMessage({
        type: "filters.toggle",
        text: filter.text,
        disabled: filter.disabled
      });
    }
    else
    {
      this.render();
    }
  }
  renderTable(visibleFilters)
  {
    const {length} = this.filters;
    this.html`<table cellpadding="0" cellspacing="0">
      <thead onclick="${this}" data-call="onheaderclick">
        <th data-column="selected">
          <io-checkbox ?checked=${!!length && this.selected.size === length} />
        </th>
        <th data-column="status"></th>
        <th data-column="rule">${{i18n: "options_filter_list_rule"}}</th>
        <th data-column="warning">${
          warnings.get(this) ||
          warnings.set(this, createImageForType(false)).get(this)
        }</th>
      </thead>
      <tbody>${visibleFilters.map(getRow, this)}</tbody>
      ${this.scrollbar}
    </table>`;
  }
  sortBy(type, isAscending)
  {
    const th = $(`th[data-column="${type}"]`, this);
    if (!th)
    {
      console.error(`unable to sort by ${type}`);
      return;
    }
    const {sort} = this.state;
    sort.current = type;
    sort.asc = !isAscending;
    th.click();
  }
}
IOFilterList.define("io-filter-list");
function getRow(filter, i)
{
  if (filter)
  {
    const selected = this.selected.has(filter);
    return IOElement.wire(filter)`
    <tr class="${selected ? "selected" : ""}">
      <td data-column="selected">
        <io-checkbox
          ?checked=${selected}
          onclick="${this}" onchange="${this}"
        />
      </td>
      <td data-column="status">
        <!-- Not all filters can be en-/disabled (e.g. comments) -->
        <io-toggle
          ?checked=${!filter.disabled}
          ?disabled=${!("disabled" in filter)}
          aria-hidden="${!("disabled" in filter)}"
          onchange="${this}"
        />
      </td>
      <td data-column="rule">
        <div
          class="content"
          contenteditable="${!this.disabled}"
          title="${filter.text}"
          onpaste="${this}"
          onkeydown="${this}"
          onkeyup="${this}"
          onfocus="${this}"
          onblur="${this}"
          data="${filter}"
        >${filter.text}</div>
      </td>
      <td data-column="warning">
        ${getWarning(filter)}
      </td>
    </tr>`;
  }
  return IOElement.wire(this, `:${i}`)`
    <tr class="empty">
      <td data-column="selected"></td>
      <td data-column="status"></td>
      <td data-column="rule"></td>
      <td data-column="warning"></td>
    </tr>`;
}
const issues = new WeakMap();
const warnings = new WeakMap();
const createImageForFilter = (isIssue, filter) =>
{
  const error = (isIssue) ? filter.reason : {type: "filter_slow"};
  const image = createImageForType(isIssue);
  image.title = stripTagsUnsafe(getErrorMessage(error));
  return image;
};
const createImageForType = (isIssue) =>
{
  const image = new Image();
  image.src = `skin/icons/${isIssue ? "error" : "alert"}.svg`;
  return image;
};
function focusTheNextFilterIfAny(tr)
{
  const i = this.filters.indexOf(this._filter) + 1;
  if (i < this.filters.length)
  {
    const next = tr.nextElementSibling;
    const {rowHeight, scrollTop, viewHeight} = this.state;
    this._changingFocus = true;
    if (next.offsetTop > viewHeight)
    {
      this.setState({
        scrollTop: getScrollTop(scrollTop + rowHeight)
      });
    }
    $(".content", next).focus();
    this._changingFocus = false;
  }
}
function animateAndDrop(target)
{
  target.addEventListener("animationend", dropSavedClass);
  target.classList.add("saved");
}
function dropSavedClass(event)
{
  const {currentTarget} = event;
  currentTarget.classList.remove("saved");
  currentTarget.removeEventListener(event.type, dropSavedClass);
}
function getFilter(event)
{
  const el = event.currentTarget;
  const div = $('td[data-column="rule"] > .content', el.closest("tr"));
  return div.data;
}
function getScrollTop(value, scrollHeight)
{
  const scrollTop = Math.max(
    0,
    Math.min(scrollHeight || Infinity, value)
  );
  return isNaN(scrollTop) ? 0 : scrollTop;
}
function getWarning(filter)
{
  let map;
  if (filter.reason)
  {
    map = issues;
  }
  else if (filter.slow)
  {
    map = warnings;
  }
  else
    return "";
  let warning = map.get(filter);
  if (warning)
    return warning;
  warning = createImageForFilter(map === issues, filter);
  map.set(filter, warning);
  return warning;
}
function isSameError(errorA = {}, errorB = {})
{
  return errorA.type === errorB.type && errorA.reason === errorB.reason;
}
function replaceFilter(filter, currentTarget)
{
  const {text} = filter;
  const old = prevFilterText.get(filter);
  if (old === text)
  {
    animateAndDrop(currentTarget);
    return;
  }
  browser.runtime.sendMessage({
    type: "filters.replace",
    new: text,
    old
  }).then(errors =>
  {
    if (errors.length)
    {
      filter.reason = errors[0];
    }
    else
    {
      const {filters} = this;
      let i = filters.length;
      let newFilter;
      while (i--)
      {
        newFilter = filters[i];
        if (newFilter.text === text)
          break;
      }
      filters.splice(i, 1);
      delete filter.disabled;
      delete filter.reason;
      Object.assign(filter, newFilter);
      prevFilterText.set(filter, text);
      animateAndDrop(currentTarget);
    }
    this.render();
  });
}
function setupPort()
{
  api.addListener((message) =>
  {
    if (message.type === "filters.respond" && message.action === "changed")
    {
      const {text, disabled} = message.args[0];
      const filter = this.filters.find(f => f.text === text);
      if (!filter)
        return;
      const shownDisabled = filter.disabled;
      if (disabled !== shownDisabled)
      {
        filter.reason = {type: "filter_disabled"};
        filter.disabled = disabled;
      }
      this.render();
    }
  });
}const MINIMUM_SEARCH_LENGTH = 3;
class IOFilterSearch extends IOElement
{
  static get booleanAttributes()
  {
    return ["disabled"];
  }
  static get observedAttributes()
  {
    return ["match"];
  }
  get defaultState()
  {
    return {
      filterExists: true,
      filters: [],
      match: -1
    };
  }
  get filters()
  {
    return this.state.filters;
  }
  set filters(value)
  {
    this.setState({filters: value || []});
  }
  get match()
  {
    return this.state.match;
  }
  set match(value)
  {
    this.setState({
      match: Math.max(-1, Math.min(1, parseFloat(value) || 0))
    }, false);
  }
  get value()
  {
    return $("input", this).value.trim();
  }
  set value(text)
  {
    const value = String(text || "").trim();
    $("input", this).value = value;
    this.setState({
      filterExists: value.length ?
                      this.state.filters.some(hasValue, value) :
                      false
    });
  }
  attributeChangedCallback(name, previous, current)
  {
    if (name === "match")
      this.match = current;
    else
      this.render();
  }
  created()
  {
    const {i18n} = browser;
    this._placeholder = i18n.getMessage("options_filters_search_or_add");
    this._addingFilter = false;
    this._timer = 0;
    this.render();
  }
  onclick()
  {
    if (this.value)
      addFilter.call(this, this.value);
  }
  ondrop(event)
  {
    event.preventDefault();
    addFilter.call(this, event.dataTransfer.getData("text"));
  }
  onkeydown(event)
  {
    switch (event.key)
    {
      case "Enter":
        const {value} = this;
        if (
          value.length &&
          !this.disabled &&
          !this.state.filters.some(hasValue, value)
        )
          addFilter.call(this, value);
        break;
      case "Escape":
        dispatch.call(this, "filter:none");
        this.value = "";
        break;
    }
  }
  onkeyup()
  {
    clearTimeout(this._timer);
    if (this._addingFilter)
    {
      this._addingFilter = false;
      return;
    }
    this._timer = setTimeout(() =>
    {
      this._timer = 0;
      const {match, value} = this;
      if (!value.length)
      {
        dispatch.call(this, "filter:none");
        this.value = "";
      }
      else if (
        !match ||
        value.length < MINIMUM_SEARCH_LENGTH ||
        isMultiLine(value)
      )
      {
        this.setState({filterExists: this.state.filters.some(hasValue, value)});
        dispatch.call(this, "filter:none");
      }
      else
      {
        const result = search.call(this, value);
        if (result.accuracy && match <= result.accuracy)
          dispatch.call(this, "filter:match", result);
        else
          dispatch.call(this, "filter:none");
      }
    }, 100);
  }
  onpaste(event)
  {
    const clipboardData = event.clipboardData || window.clipboardData;
    const data = clipboardData.getData("text").trim();
    if (isMultiLine(data))
      addFilter.call(this, data);
  }
  render()
  {
    const {disabled} = this;
    this.html`
    <input
      placeholder="${this._placeholder}"
      onkeydown="${this}" onkeyup="${this}"
      ondrop="${this}" onpaste="${this}"
      disabled="${disabled}"
    >
    <button
      onclick="${this}"
      disabled="${disabled || this.state.filterExists || !this.value}">
      + ${{i18n: "add"}}
    </button>`;
  }
}
IOFilterSearch.define("io-filter-search");
function addFilter(data)
{
  dispatch.call(this, "filter:none");
  let value = data.trim();
  if (!value)
    return;
  if (isMultiLine(value))
  {
    value = clearMultiLine(value);
    dispatch.call(this, "filter:add", value);
  }
  else
  {
    const result = search.call(this, value);
    if (result.accuracy < 1)
    {
      this._addingFilter = true;
      dispatch.call(this, "filter:add", value);
    }
    else if (result.accuracy && value.length >= MINIMUM_SEARCH_LENGTH)
      dispatch.call(this, "filter:match", result);
  }
}
function dispatch(type, detail)
{
  if (type === "filter:add" || this.filters.length)
    this.dispatchEvent(new CustomEvent(type, {detail}));
}
function hasValue(filter)
{
  return filter.text == this;
}
function clearMultiLine(data)
{
  return data.split(/[\r\n]/)
              .map(text => text.trim())
              .filter(text => text.length)
              .join("\n");
}
function isMultiLine(data)
{
  return /[\r\n]/.test(data.trim());
}
function search(value)
{
  let accuracy = 0;
  let closerFilter = null;
  const matches = [];
  const searchLength = value.length;
  if (searchLength)
  {
    const match = this.match;
    const {filters} = this.state;
    const {length} = filters;
    for (let i = 0; i < length; i++)
    {
      const filter = filters[i];
      const filterLength = filter.text.length;
      if (searchLength > filterLength)
        continue;
      if (searchLength === filterLength)
      {
        if (filter.text === value)
        {
          matches.push(filter);
          closerFilter = filter;
          accuracy = 1;
        }
        continue;
      }
      if (match < 1 && filter.text.includes(value))
      {
        matches.push(filter);
        const tmpAccuracy = searchLength / filterLength;
        if (accuracy < tmpAccuracy)
        {
          closerFilter = filter;
          accuracy = tmpAccuracy;
        }
      }
    }
    this.setState({filterExists: accuracy === 1});
  }
  return {accuracy, matches, value, filter: closerFilter};
}class IOFilterTable extends IOElement
{
  static get booleanAttributes()
  {
    return ["disabled"];
  }
  static get observedAttributes()
  {
    return ["match"];
  }
  get defaultState()
  {
    return {filters: [], match: -1, ready: false};
  }
  created()
  {
    this._showing = null;
    this.search = this.appendChild(new IOFilterSearch());
    this.search.addEventListener(
      "filter:add",
      event => this.onFilterAdd(event)
    );
    this.search.addEventListener(
      "filter:match",
      event => this.onFilterMatch(event)
    );
    this.search.addEventListener(
      "filter:none",
      () =>
      {
        this.list.selected = [];
        this.updateFooter();
      }
    );
    this.list = this.appendChild(new IOFilterList());
    this.list.addEventListener(
      "filter:removed",
      event => this.onFilterRemoved(event)
    );
    this.footer = this.appendChild(IOElement.wire()`<div class="footer" />`);
    this.addEventListener("click", this);
    this.addEventListener("error", this);
    this.setState({ready: true});
  }
  attributeChangedCallback(name, prev, value)
  {
    if (name === "match")
      this.setState({match: value}, false);
    this.render();
  }
  get filters()
  {
    return this.state.filters;
  }
  set filters(value)
  {
    this.setState({filters: value});
  }
  get match()
  {
    return this.state.match;
  }
  set match(value)
  {
    this.setState({match: value});
  }
  onclick(event)
  {
    if (event.target.closest("io-checkbox"))
    {
      cleanErrors.call(this);
    }
  }
  onerror(event)
  {
    this.updateFooter();
    this.footer.classList.add("visible");
    const {errors} = event.detail;
    const footerError = $(".footer .error", this);
    const errorMessages = errors.map(getErrorMessage);
    IOElement.bind(footerError)`
      ${errorMessages.map(mssg => `<li>${mssg}</li>`)}`;
    footerError.removeAttribute("hidden");
  }
  onfooterclick(event)
  {
    const {classList} = event.currentTarget;
    switch (true)
    {
      case classList.contains("delete"):
        const resolve = [];
        for (const filter of this.list.selected)
        {
          this.list.selected.delete(filter);
          this.filters.splice(this.filters.indexOf(filter), 1);
          resolve.push(browser.runtime.sendMessage({
            type: "filters.remove",
            text: filter.text
          }));
        }
        Promise.all(resolve).then(
          () => updateList(this.list),
          (errors) => this.onerror({detail: {errors}})
        );
        cleanErrors.call(this);
        break;
      case classList.contains("copy"):
        const filters = [];
        for (const filter of this.list.selected)
        {
          filters.push(filter.text);
        }
        clipboard.copy(filters.join("\n"));
        break;
    }
  }
  onFilterAdd(event)
  {
    const filters = event.detail.split(/(?:\r\n|\n)/);
    cleanErrors.call(this);
    browser.runtime.sendMessage({
      type: "filters.importRaw",
      text: filters.join("\n")
    })
    .then(errors =>
    {
      if (!errors.length)
      {
        filters.reverse();
        let added = false;
        for (const text of filters)
        {
          if (text[0] === "[")
            continue;
          added = true;
          const i = this.filters.findIndex(flt => flt.text === text);
          const [filter] = i < 0 ? [{text}] : this.filters.splice(i, 1);
          this.filters.unshift(filter);
        }
        this.search.value = "";
        if (!added)
          return;
        this.render();
        updateList(this.list);
        this.list.scrollTo(this.filters[0]);
        this.updateFooter();
      }
      else
      {
        this.onerror({detail: {errors}});
      }
    });
  }
  onFilterMatch(event)
  {
    const {accuracy, filter, matches} = event.detail;
    this.list.selected = matches;
    this.list.scrollTo(accuracy === 1 ? filter : matches[0]);
    this.updateFooter();
  }
  onFilterRemoved()
  {
    cleanErrors.call(this);
    this.updateFooter();
  }
  render()
  {
    const {disabled} = this;
    const {filters, match, ready} = this.state;
    if (!ready || !filters.length)
      return;
    this.search.disabled = disabled;
    this.search.match = match;
    if (this.search.filters !== filters)
      this.search.filters = filters;
    this.list.disabled = disabled;
    if (this.list.filters !== filters)
      this.list.filters = filters;
    this.updateFooter();
  }
  updateFooter()
  {
    const disabled = !this.list.selected.size;
    IOElement.bind(this.footer)`
      <button
        class="delete"
        onclick="${this}"
        disabled="${disabled}"
        data-call="onfooterclick"
      >${{i18n: "delete"}}</button>
      <button
        class="copy"
        onclick="${this}"
        disabled="${disabled}"
        data-call="onfooterclick"
      >${{i18n: "copy_selected"}}</button>
      <ul class="error" hidden></ul>
    `;
  }
}
IOFilterTable.define("io-filter-table");
function cleanErrors()
{
  const footerError = $(".footer .error", this);
  if (footerError)
  {
    footerError.setAttribute("hidden", true);
    IOElement.bind(footerError)``;
  }
  this.updateFooter();
}
function updateList(list)
{
  list.render();
  list.updateScrollbar();
}const DELAY = 200;
const KeyCode = {
  ARROW_DOWN: "ArrowDown",
  ARROW_UP: "ArrowUp",
  BACKSPACE: "Backspace",
  DELETE: "Delete",
  ENTER: "Enter",
  ESCAPE: "Escape",
  END: "End",
  HOME: "Home",
  PAGE_DOWN: "PageDown",
  PAGE_UP: "PageUp",
  SPACE: " ",
  TAB: "Tab"
};
class IOListBox extends IOElement
{
  static get observedAttributes()
  {
    return ["action", "swap", "disabled", "expanded", "items"];
  }
  static get booleanAttributes()
  {
    return ["autoclose"];
  }
  created()
  {
    this._blurTimer = 0;
    this._bootstrap = true;
    if (this.hasOwnProperty("items"))
    {
      const items = this.items;
      delete this.items;
      this.items = items;
    }
    this.addEventListener("blur", this, true);
  }
  getItemTitle(item)
  {
    return item.title;
  }
  get swap()
  {
    return !!this._swap;
  }
  set swap(value)
  {
    this._swap = !!value;
  }
  get label()
  {
    return $(`#${this.id}label`, this);
  }
  get popup()
  {
    return $(`#${this.id}popup`, this);
  }
  get disabled()
  {
    return this.hasAttribute("disabled");
  }
  set disabled(value)
  {
    IOElement.utils.boolean.attribute(this, "disabled", value);
    this.render();
  }
  get expanded()
  {
    return this.hasAttribute("expanded");
  }
  set expanded(value)
  {
    IOElement.utils.boolean.attribute(this, "expanded", value);
    this.render();
    setTimeout(
      () =>
      {
        if (!value && this.expanded)
          this.ownerDocument.activeElement.blur();
        this.dispatchEvent(new CustomEvent(value ? "open" : "close"));
      },
      DELAY + 1
    );
  }
  get items()
  {
    return this._items || [];
  }
  set items(items)
  {
    this._items = items;
    this.render();
    if (!items.length)
    {
      this._bootstrap = true;
    }
    else if (this._bootstrap)
    {
      this._bootstrap = false;
      for (const item of items)
      {
        if (item.group)
          continue;
        if (!item.disabled)
        {
          hover.call(this, "items", item);
          return;
        }
      }
      hover.call(this, "items", items.find(item => !item.group));
    }
  }
  handleEvent(event)
  {
    if (!this.disabled)
    {
      this[`on${event.type}`](event);
    }
  }
  onblur(event)
  {
    if (event.relatedTarget && this.contains(event.relatedTarget))
      return;
    if (this.expanded)
      this._blurTimer = setTimeout(() =>
      {
        this.expanded = false;
      }, DELAY);
  }
  onfocus(event)
  {
    clearTimeout(this._blurTimer);
    this.expanded = true;
  }
  onkeydown(event)
  {
    const hovered = $(".hover", this);
    switch (event.key)
    {
      case KeyCode.BACKSPACE:
      case KeyCode.DELETE:
        event.preventDefault();
        break;
      case KeyCode.ENTER:
      case KeyCode.SPACE:
        hovered.dispatchEvent(new CustomEvent("click", {bubbles: true}));
      case KeyCode.ESCAPE:
        event.preventDefault();
        this.expanded = false;
        break;
      case KeyCode.ARROW_UP:
        const prev = findNext.call(
          this,
          hovered, "previousElementSibling"
        );
        if (prev)
          hover.call(this, "key", getItem.call(this, prev.id));
        event.preventDefault();
        break;
      case KeyCode.ARROW_DOWN:
        const next = findNext.call(
          this,
          hovered, "nextElementSibling"
        );
        if (next)
          hover.call(this, "key", getItem.call(this, next.id));
        event.preventDefault();
        break;
    }
  }
  onclick(event)
  {
    if (!IOElement.utils.event.isLeftClick(event))
      return;
    event.preventDefault();
    clearTimeout(this._blurTimer);
    const el = event.target.closest('[role="option"]');
    if (el)
    {
      const detail = getItem.call(this, el.id);
      const {unselectable} = detail;
      if (el.getAttribute("aria-disabled") !== "true")
      {
        this.dispatchEvent(new CustomEvent("change", {detail}));
        this.render();
      }
      if ((this.swap || this.autoclose) && !unselectable)
      {
        this.expanded = false;
      }
    }
  }
  onmousedown(event)
  {
    this.expanded = !this.expanded;
  }
  onmouseover(event)
  {
    const el = event.target.closest('[role="option"]');
    if (el && !el.classList.contains("hover"))
    {
      const item = getItem.call(this, el.id);
      if (item)
        hover.call(this, "mouse", item);
    }
  }
  render()
  {
    const {action, dataset, disabled, expanded, id, swap} = this;
    const enabled = this._items.filter(item => !item.disabled).length;
    let buttonText = "";
    if (expanded && dataset.expanded)
      buttonText = dataset.expanded;
    else
      buttonText = dataset.text;
    const {i18n} = browser;
    this.html`
    <button
      role="combobox"
      aria-readonly="true"
      id="${id + "label"}"
      disabled="${disabled}"
      data-action="${action}"
      aria-owns="${id + "popup"}"
      aria-disabled="${disabled}"
      aria-expanded="${expanded}"
      aria-haspopup="${id + "popup"}"
      onblur="${this}" onfocus="${this}"
      onkeydown="${this}" onmousedown="${this}"
    >${"+ " + i18n.getMessage(buttonText)}</button>
    <ul
      role="listbox"
      tabindex="-1"
      id="${id + "popup"}"
      aria-labelledby="${id + "label"}"
      hidden="${!expanded}"
      onclick="${this}" onmouseover="${this}"
    >${this._items.map(item =>
    {
      if (item.group)
        return IOElement.wire()`<li class="group">${item.description}</li>`;
      const itemID = getID(item);
      const selected = !swap && !item.disabled;
      const liDisabled = item.unselectable || (selected && enabled === 1);
      return IOElement.wire(this, `html:${itemID}`)`
      <li
        id="${itemID}"
        class="${item.premium ? "premium" : ""}"
        role="option"
        aria-disabled="${swap ? !item.disabled : liDisabled}"
        aria-selected="${selected}"
      >${this.getItemTitle(item)}</li>`;
    })}</ul>`;
  }
}
IOListBox.define("io-list-box");
let resizeTimer = 0;
window.addEventListener("resize", () =>
{
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() =>
  {
    resizeTimer = 0;
    for (const ioListBox of $$("io-list-box"))
    {
      if (!ioListBox.items || isVisible(ioListBox))
        return;
      ioListBox.style.setProperty("--width", "100%");
      requestAnimationFrame(() =>
      {
        requestAnimationFrame(setWidth.bind(ioListBox));
      });
    }
  }, 1000 / 30);
});
function getID(item)
{
  return `li-${item.url.split("").map(
    c => c.charCodeAt(0).toString(32)
  ).join("")}`;
}
function getItem(id)
{
  return this._items.find(item => (!item.group && getID(item) === id));
}
function hover(type, item)
{
  const id = getID(item);
  if (!id)
    return;
  const hovered = $(".hover", this);
  if (hovered)
    hovered.classList.remove("hover");
  const option = $(`#${id}`, this);
  option.classList.add("hover");
  this.label.setAttribute("aria-activedescendant", id);
  const popup = this.popup;
  if (type !== "mouse" && popup.scrollHeight > popup.clientHeight)
  {
    const scrollBottom = popup.clientHeight + popup.scrollTop;
    const elementBottom = option.offsetTop + option.offsetHeight;
    if (elementBottom > scrollBottom)
    {
      popup.scrollTop = elementBottom - popup.clientHeight;
    }
    else if (option.offsetTop < popup.scrollTop)
    {
      popup.scrollTop = option.offsetTop;
    }
  }
}
function findNext(el, other)
{
  const first = el;
  do
  {
    el = el[other];
  }
  while (el && el !== first && !isDisabled.call(this, el));
  return el === first ? null : el;
}
function isDisabled(el)
{
  return el.id && getItem.call(this, el.id).disabled;
}
function isVisible(el)
{
  const cstyle = window.getComputedStyle(el, null);
  return cstyle.getPropertyValue("display") !== "none";
}
function setWidth()
{
  this.style.setProperty("--width", this.label.offsetWidth + "px");
}class IOPopout extends IOElement
{
  static get observedAttributes()
  {
    return ["anchor-icon", "expanded", "i18n-body", "i18n-doclinks", "type"];
  }
  created()
  {
    this._children = Array.from(this.children);
    this.addEventListener("blur", this);
    this.addEventListener("click", this);
    this.setAttribute("tabindex", 0);
  }
  attributeChangedCallback()
  {
    this.render();
  }
  onblur(ev)
  {
    if (ev.relatedTarget && this.contains(ev.relatedTarget))
      return;
    this.expanded = null;
  }
  onclick(ev)
  {
    const {target} = ev;
    if (target.classList.contains("wrapper"))
    {
      ev.preventDefault();
      if (this.expanded)
      {
        this.expanded = null;
      }
      else if (this.type == "dialog" || this.type == "tooltip")
      {
        const {bottom, top} = ev.target.getBoundingClientRect();
        const {clientHeight} = document.documentElement;
        this.expanded = (clientHeight - bottom > top) ? "below" : "above";
      }
      else
      {
        this.expanded = "start";
      }
    }
    else if (target.nodeName == "A" || target.nodeName == "BUTTON")
    {
      this.expanded = null;
    }
  }
  render()
  {
    const {wire} = IOPopout;
    const role = this.type || "tooltip";
    const content = [];
    if (role == "dialog" || role == "tooltip")
    {
      content.push(wire(this, ":close")`
        <button class="icon close secondary"></button>
      `);
    }
    if (this.i18nBody)
    {
      const body = wire(this, ":body")`
        <p>${{i18n: this.i18nBody}}</p>
      `;
      const {i18nDoclinks} = this.dataset;
      if (i18nDoclinks)
      {
        Promise.all(i18nDoclinks.split(",").map(getDoclink)).then(links =>
        {
          setElementLinks(body, ...links);
        });
      }
      content.push(body);
    }
    content.push(...this._children);
    this.html`
    <div class="wrapper icon">
      <div role="${role}" aria-hidden="${!this.expanded}">
        ${content}
      </div>
    </div>
    `;
  }
}
IOPopout.define("io-popout");const ALLOWED_PROTOCOLS = /^(?:data|https):/;
let subscriptionsMap = Object.create(null);
let filtersMap = Object.create(null);
let acceptableAdsUrl = null;
let acceptableAdsPrivacyUrl = null;
let isCustomFiltersLoaded = false;
let additionalSubscriptions = [];
let premiumIsActive = null;
const collections = Object.create(null);
const {getMessage} = browser.i18n;
const customFilters = [];
const syncErrorIds = new Map([
  ["synchronize_invalid_url",
   "options_filterList_lastDownload_invalidURL"],
  ["synchronize_connection_error",
   "options_filterList_lastDownload_connectionError"],
  ["synchronize_invalid_data",
   "options_filterList_lastDownload_invalidData"],
  ["synchronize_checksum_mismatch",
   "options_filterList_lastDownload_checksumMismatch"]
]);
const filtersDisabledErrorId = "options_filterList_filtersDisabled";
const subscriptionErrorIds = new Map();
const timestampUI = Symbol();
const allowlistedDomainRegexp = /^@@\|\|([^/:]+)\^\$document$/;
const allowlistedPageRegexp = /^@@\|([^?|]+(?:\?[^|]*)?)\|?\$document$/;
const minuteInMs = 60000;
const hourInMs = 3600000;
const fullDayInMs = 86400000;
convertDoclinks();
initI18n();
const promisedLocaleInfo = browser.runtime.sendMessage({
  type: "app.get",
  what: "localeInfo"
});
const promisedDateFormat = promisedLocaleInfo.then((addonLocale) =>
{
  return new Intl.DateTimeFormat(addonLocale.locale);
}).catch(dispatchError);
const promisedResources = loadResources();
function Collection(details)
{
  this.details = details;
  this.items = [];
}
Collection.prototype._setEmpty = function(table, detail, removeEmpty)
{
  if (removeEmpty)
  {
    const placeholders = $$(".empty-placeholder", table);
    for (const placeholder of placeholders)
      table.removeChild(placeholder);
    execAction(detail.removeEmptyAction, table);
  }
  else
  {
    const {emptyTexts = []} = detail;
    for (const text of emptyTexts)
    {
      const placeholder = document.createElement("li");
      placeholder.className = "empty-placeholder";
      placeholder.textContent = getMessage(text);
      table.appendChild(placeholder);
    }
    execAction(detail.setEmptyAction, table);
  }
};
Collection.prototype._createElementQuery = function(item)
{
  const access = (item.url || item.text).replace(/'/g, "\\'");
  return function(container)
  {
    return $(`[data-access="${access}"]`, container);
  };
};
Collection.prototype._getItemTitle = function(item, i)
{
  if (this.details[i].getItemTitle)
    return this.details[i].getItemTitle(item);
  return getRawItemTitle(item);
};
Collection.prototype._sortItems = function()
{
  this.items.sort((a, b) =>
  {
    if (a.url && isAcceptableAds(a.url))
      return 1;
    if (b.url && isAcceptableAds(b.url))
      return -1;
    const aTimestamp = a[timestampUI] || 0;
    const bTimestamp = b[timestampUI] || 0;
    if (aTimestamp || bTimestamp)
      return bTimestamp - aTimestamp;
    const aTitle = this._getItemTitle(a, 0).toLowerCase();
    const bTitle = this._getItemTitle(b, 0).toLowerCase();
    return aTitle.localeCompare(bTitle);
  });
};
Collection.prototype.addItem = function(item)
{
  if (this.items.indexOf(item) >= 0)
    return;
  this.items.push(item);
  this._sortItems();
  for (let j = 0; j < this.details.length; j++)
  {
    const detail = this.details[j];
    const table = $(`#${detail.id}`);
    const template =
      $("template", table) ||
      $("template", table.closest(".template-container"));
    const listItem = document.createElement("li");
    listItem.appendChild(document.importNode(template.content, true));
    listItem.setAttribute("aria-label", this._getItemTitle(item, j));
    listItem.setAttribute("data-recommended", item.recommended);
    listItem.setAttribute("data-access", item.url || item.text);
    listItem.setAttribute("role", "section");
    if (item.recommended === "distractions")
    {
      listItem.classList.add("beta");
      updatePremiumStateInListItem(listItem);
    }
    const tooltip = $("io-popout[type='tooltip']", listItem);
    if (tooltip)
    {
      let tooltipId = tooltip.dataset.templateI18nBody;
      tooltipId = tooltipId.replace("%value%", item.recommended);
      if (getMessage(tooltipId))
      {
        tooltip.setAttribute("i18n-body", tooltipId);
      }
    }
    const descriptionNode = $(".description", listItem);
    if (descriptionNode)
    {
      let descriptionId = descriptionNode.dataset.templateI18nBody;
      descriptionId = descriptionId.replace("%value%", item.recommended);
      const description = getMessage(descriptionId);
      descriptionNode.textContent = description;
    }
    this._setEmpty(table, detail, true);
    if (table.children.length > 0)
      table.insertBefore(listItem, table.children[this.items.indexOf(item)]);
    else
      table.appendChild(listItem);
    this.updateItem(item);
  }
  return length;
};
Collection.prototype.removeItem = function(item)
{
  const index = this.items.indexOf(item);
  if (index == -1)
    return;
  this.items.splice(index, 1);
  const getListElement = this._createElementQuery(item);
  for (const detail of this.details)
  {
    const table = $(`#${detail.id}`);
    const element = getListElement(table);
    const control = $(".control", element);
    if (control && control == document.activeElement)
    {
      if (!focusNextElement(element.parentElement, control))
      {
        let focusableElement = element.parentElement;
        while (focusableElement)
        {
          if (focusableElement.classList.contains("tab-content") ||
              focusableElement.classList.contains("dialog-content"))
            break;
          focusableElement = focusableElement.parentElement;
        }
        focusNextElement(focusableElement || document, control);
      }
    }
    element.parentElement.removeChild(element);
    if (this.items.length == 0)
      this._setEmpty(table, detail);
  }
};
Collection.prototype.updateItem = function(item)
{
  const oldIndex = this.items.indexOf(item);
  if (oldIndex === -1)
    return;
  this._sortItems();
  const access = (item.url || item.text).replace(/'/g, "\\'");
  for (let i = 0; i < this.details.length; i++)
  {
    const table = $(`#${this.details[i].id}`);
    const element = $(`[data-access="${access}"]`, table);
    const title = this._getItemTitle(item, i);
    const displays = $$("[data-display]", element);
    for (let j = 0; j < displays.length; j++)
    {
      if (item[displays[j].dataset.display])
        displays[j].textContent = item[displays[j].dataset.display];
      else
        displays[j].textContent = title;
    }
    element.setAttribute("aria-label", title);
    if (this.details[i].searchable)
      element.setAttribute("data-search", title.toLowerCase());
    const controls = $$(
      `.control[role='checkbox'],
      io-toggle.control`,
      element
    );
    for (const control of controls)
    {
      const checked = !item.disabled;
      if (control.matches("io-toggle"))
        control.checked = checked;
      else
        control.setAttribute("aria-checked", checked);
      if (isAcceptableAds(item.url) && this == collections.filterLists)
      {
        control.disabled = true;
        control.setAttribute("aria-hidden", true);
      }
    }
    if (additionalSubscriptions.includes(item.url))
    {
      element.classList.add("preconfigured");
      const disablePreconfigures =
        $$("[data-disable~='preconfigured']", element);
      for (const disablePreconfigure of disablePreconfigures)
        disablePreconfigure.disabled = true;
    }
    const lastUpdateElement = $(".last-update", element);
    if (lastUpdateElement)
    {
      element.classList.remove("show-message");
      cleanSyncErrorIdsFromSubscription(item.url);
      if (item.downloading)
      {
        const text = getMessage("options_filterList_lastDownload_inProgress");
        $(".message", element).textContent = text;
        element.classList.add("show-message");
      }
      else if (item.downloadStatus != "synchronize_ok")
      {
        if (item.downloadStatus === "synchronize_invalid_url" &&
            !ALLOWED_PROTOCOLS.test(item.url))
        {
          addErrorIdToSubscription(
            item.url,
            "options_filterList_lastDownload_invalidURLProtocol"
          );
        }
        else
        {
          const errorId = syncErrorIds.get(item.downloadStatus) ||
                          item.downloadStatus;
          if (errorId)
            addErrorIdToSubscription(item.url, errorId);
        }
      }
      else if (item.lastDownload > 0)
      {
        const lastUpdate = item.lastDownload * 1000;
        const sinceUpdate = Date.now() - lastUpdate;
        if (sinceUpdate > fullDayInMs)
        {
          const lastUpdateDate = new Date(item.lastDownload * 1000);
          promisedDateFormat.then((dateFormat) =>
          {
            lastUpdateElement.textContent = dateFormat.format(lastUpdateDate);
          });
        }
        else if (sinceUpdate > hourInMs)
        {
          lastUpdateElement.textContent =
            getMessage("options_filterList_hours");
        }
        else if (sinceUpdate > minuteInMs)
        {
          lastUpdateElement.textContent =
            getMessage("options_filterList_minutes");
        }
        else
        {
          lastUpdateElement.textContent =
            getMessage("options_filterList_now");
        }
      }
      updateErrorTooltip(element, subscriptionErrorIds.get(item.url));
    }
    const websiteElement = $("io-popout .website", element);
    if (websiteElement)
    {
      if (item.homepage)
        websiteElement.setAttribute("href", item.homepage);
      websiteElement.setAttribute("aria-hidden", !item.homepage);
    }
    const sourceElement = $("io-popout .source", element);
    if (sourceElement)
      sourceElement.setAttribute("href", item.url);
    const newIndex = this.items.indexOf(item);
    if (oldIndex != newIndex)
      table.insertBefore(element, table.childNodes[newIndex]);
  }
};
Collection.prototype.clearAll = function()
{
  this.items = [];
  for (const detail of this.details)
  {
    const table = $(`#${detail.id}`);
    let element = table.firstChild;
    while (element)
    {
      if (element.tagName == "LI" && !element.classList.contains("static"))
        table.removeChild(element);
      element = element.nextElementSibling;
    }
    this._setEmpty(table, detail);
  }
};
function focusNextElement(container, currentElement)
{
  let focusables = $$("a, button, input, .control", container);
  focusables = Array.prototype.slice.call(focusables);
  let index = focusables.indexOf(currentElement);
  index += (index == focusables.length - 1) ? -1 : 1;
  const nextElement = focusables[index];
  if (!nextElement)
    return false;
  nextElement.focus();
  return true;
}
collections.recommendedFreeList = new Collection([
  {
    id: "free-list-table",
    getItemTitle: (item) => getPrettyItemTitle(item, false)
  }
]);
collections.recommendedPremiumList = new Collection([
  {
    id: "premium-list-table",
    getItemTitle: (item) => getPrettyItemTitle(item, false)
  }
]);
collections.langs = new Collection([
  {
    id: "blocking-languages-table",
    emptyTexts: ["options_language_empty"],
    getItemTitle: (item) => getPrettyItemTitle(item, false)
  }
]);
collections.more = new Collection([
  {
    id: "more-list-table",
    setEmptyAction: "hide-more-filters-section",
    removeEmptyAction: "show-more-filters-section"
  }
]);
collections.allowlist = new Collection([
  {
    id: "allowlisting-table",
    emptyTexts: ["options_allowlist_empty_1", "options_allowlist_empty_2"]
  }
]);
collections.filterLists = new Collection([
  {
    id: "all-filter-lists-table",
    emptyTexts: ["options_filterList_empty"]
  }
]);
function addSubscription(subscription)
{
  const {disabled, recommended, url} = subscription;
  let collection = null;
  switch (recommended)
  {
    case "ads":
      if (disabled == false)
        collection = collections.langs;
      const ioListBox = $("#languages-box");
      ioListBox.items = ioListBox.items.concat(subscription);
      break;
    case "distractions":
      collection = collections.recommendedPremiumList;
      break;
    case "notifications":
    case "privacy":
    case "social":
      collection = collections.recommendedFreeList;
      break;
    default:
      if (typeof recommended === "undefined" &&
          !isAcceptableAds(url) &&
          disabled == false)
        collection = collections.more;
      break;
  }
  if (collection)
  {
    collection.addItem(subscription);
  }
  subscriptionsMap[url] = subscription;
}
function updateSubscription(subscription)
{
  for (const name in collections)
    collections[name].updateItem(subscription);
  if (subscription.recommended == "ads")
  {
    if (subscription.disabled)
      collections.langs.removeItem(subscription);
    else
      collections.langs.addItem(subscription);
  }
  else if (!subscription.recommended && !isAcceptableAds(subscription.url))
  {
    if (subscription.disabled == false)
    {
      collections.more.addItem(subscription);
    }
    else
    {
      collections.more.removeItem(subscription);
    }
  }
  if (!(subscription.url in subscriptionsMap))
  {
    subscriptionsMap[subscription.url] = subscription;
  }
}
function updateFilter(filter)
{
  let allowlistTitle = null;
  const domainMatch = filter.text.match(allowlistedDomainRegexp);
  if (domainMatch && !filtersMap[filter.text])
  {
    allowlistTitle = domainMatch[1];
  }
  else
  {
    const pageMatch = filter.text.match(allowlistedPageRegexp);
    if (pageMatch && !filtersMap[filter.text])
    {
      const url = pageMatch[1];
      allowlistTitle = url.replace(/^[\w-]+:\/+(?:www\.)?/, "");
      if (/\?$/.test(allowlistTitle))
      {
        allowlistTitle += "…";
      }
    }
  }
  if (allowlistTitle)
  {
    filter.title = allowlistTitle;
    collections.allowlist.addItem(filter);
    if (isCustomFiltersLoaded)
    {
      const text = getMessage("options_allowlist_notification", [filter.title]);
      showNotification(text, "info");
    }
  }
  else
  {
    customFilters.push(filter);
  }
  filtersMap[filter.text] = filter;
}
function loadCustomFilters(filters)
{
  for (const filter of filters)
    updateFilter(filter);
  const cfTable = $("#custom-filters io-filter-table");
  cfTable.filters = customFilters;
}
function removeCustomFilter(text)
{
  const index = customFilters.findIndex(filter => filter.text === text);
  if (index >= 0)
    customFilters.splice(index, 1);
}
async function loadResources()
{
  const subscriptions = [];
  try
  {
    await loadLanguageNames();
    const recommendations = await api.app.get("recommendations");
    for (const recommendation of recommendations)
    {
      const subscription = {
        disabled: true,
        downloadStatus: null,
        homepage: null,
        languages: recommendation.languages,
        recommended: recommendation.type,
        title: recommendation.title,
        url: recommendation.url
      };
      subscriptions.push(subscription);
      addSubscription(subscription);
    }
  }
  catch (ex)
  {
    dispatchError(ex);
  }
  return {recommendations: subscriptions};
}
function findParentData(element, dataName, returnElement)
{
  element = element.closest(`[data-${dataName}]`);
  if (!element)
    return null;
  if (returnElement)
    return element;
  return element.getAttribute(`data-${dataName}`);
}
function sendMessageHandleErrors(message, onSuccess)
{
  browser.runtime.sendMessage(message).then(errors =>
  {
    if (errors.length > 0)
    {
      errors = errors.map(getErrorMessage);
      alert(stripTagsUnsafe(errors.join("\n")));
    }
    else if (onSuccess)
      onSuccess();
  });
}
function switchTab(id)
{
  location.hash = id;
}
function isAcceptableAds(url)
{
  return url == acceptableAdsUrl || url == acceptableAdsPrivacyUrl;
}
function hasPrivacyConflict()
{
  const acceptableAdsList = subscriptionsMap[acceptableAdsUrl];
  let privacyList = null;
  for (const url in subscriptionsMap)
  {
    const subscription = subscriptionsMap[url];
    if (subscription.recommended == "privacy")
    {
      privacyList = subscription;
      break;
    }
  }
  return acceptableAdsList && acceptableAdsList.disabled == false &&
    privacyList && privacyList.disabled == false;
}
const setAcceptableAds = async(options = {}) =>
{
  const {firstLoad} = options;
  const subscriptions = await api.subscriptions.get();
  const activeSubscriptionUrls = subscriptions.map(
    ({disabled, url}) => !disabled && url
  ).filter(Boolean);
  const acceptableAds = $("#acceptable-ads-allow");
  const acceptableAdsPrivacy = $("#acceptable-ads-privacy-allow");
  const acceptableAdsWhyNot = $("#acceptable-ads-why-not");
  if (activeSubscriptionUrls.includes(acceptableAdsUrl))
  {
    acceptableAds.checked = true;
    acceptableAdsPrivacy.disabled = false;
    toggleDntNotification(false);
    acceptableAdsWhyNot.setAttribute("aria-hidden", true);
  }
  else if (activeSubscriptionUrls.includes(acceptableAdsPrivacyUrl))
  {
    acceptableAds.checked = true;
    acceptableAdsPrivacy.checked = true;
    acceptableAdsPrivacy.disabled = false;
    if (navigator.doNotTrack !== "1")
    {
      toggleDntNotification(true);
    }
  }
  else
  {
    acceptableAds.checked = false;
    acceptableAdsPrivacy.checked = false;
    acceptableAdsPrivacy.disabled = true;
    if (!firstLoad)
    {
      acceptableAdsWhyNot.setAttribute("aria-hidden", false);
    }
    toggleDntNotification(false);
  }
};
const setAcceptableAdsSubscriptions = ({ads, privacyAds}) =>
{
  browser.runtime.sendMessage({
    type: ads ? "subscriptions.add" : "subscriptions.remove",
    url: acceptableAdsUrl
  });
  browser.runtime.sendMessage({
    type: privacyAds ? "subscriptions.add" : "subscriptions.remove",
    url: acceptableAdsPrivacyUrl
  });
};
function setPrivacyConflict()
{
  const acceptableAdsForm = $("#acceptable-ads");
  if (hasPrivacyConflict())
  {
    getPref("ui_warn_tracking").then((showTrackingWarning) =>
    {
      acceptableAdsForm.classList.toggle("show-warning", showTrackingWarning);
    });
  }
  else
  {
    acceptableAdsForm.classList.remove("show-warning");
  }
}
const switchAcceptableAds = (e) =>
{
  e.stopPropagation();
  const {checked, dataset: {value}} = e.target;
  if (value === "ads")
  {
    const acceptableAdsPrivacy = $("#acceptable-ads-privacy-allow");
    const aaSurvey = $("#acceptable-ads-why-not");
    if (checked === false)
    {
      aaSurvey.setAttribute("aria-hidden", false);
      acceptableAdsPrivacy.checked = false;
      toggleDntNotification(false);
    }
    else
    {
      aaSurvey.setAttribute("aria-hidden", true);
    }
    setAcceptableAdsSubscriptions({ads: checked, privacyAds: false});
    acceptableAdsPrivacy.disabled = !checked;
  }
  else
  {
    setAcceptableAdsSubscriptions({ads: !checked, privacyAds: checked});
  }
};
const toggleDntNotification = (show) =>
{
  const acceptableAdsForm = $("#acceptable-ads");
  if (show === false)
  {
    acceptableAdsForm.classList.remove("show-dnt-notification");
  }
  else
  {
    acceptableAdsForm.classList.add("show-dnt-notification");
  }
};
function execAction(action, element)
{
  if (
    element.getAttribute("aria-disabled") === "true" ||
    element.disabled === true ||
    !action
  )
  {
    return false;
  }
  switch (action)
  {
    case "add-domain-exception":
      addAllowlistedDomain();
      return true;
    case "add-language-subscription":
      addEnableSubscription(findParentData(element, "access", false));
      return true;
    case "add-predefined-subscription": {
      const dialog = $("#dialog-content-predefined");
      const title = $(".title > span", dialog).textContent;
      const url = $(".url > a", dialog).textContent;
      addEnableSubscription(url, title);
      closeDialog();
      return true;
    }
    case "change-language-subscription":
      changeLanguageSubscription(findParentData(element, "access", false));
      return true;
    case "close-dialog":
      closeDialog();
      return true;
    case "hide-more-filters-section":
      $("#more-filters").setAttribute("aria-hidden", true);
      return true;
    case "hide-acceptable-ads-survey":
      $("#acceptable-ads-why-not").setAttribute("aria-hidden", true);
      return false;
    case "hide-notification":
      hideNotification();
      return true;
    case "import-subscription": {
      const url = $("#blockingList-textbox").value;
      addEnableSubscription(url);
      closeDialog();
      return true;
    }
    case "open-dialog": {
      const dialog = findParentData(element, "dialog", false);
      openDialog(dialog);
      return true;
    }
    case "close-filterlist-by-url":
      closeAddFiltersByURL();
      return true;
    case "open-languages-box":
      const ioListBox = $("#languages-box");
      ioListBox.swap = true;
      $("button", ioListBox).focus();
      return true;
    case "remove-filter":
      browser.runtime.sendMessage({
        type: "filters.remove",
        text: findParentData(element, "access", false)
      });
      return true;
    case "remove-subscription":
      browser.runtime.sendMessage({
        type: "subscriptions.remove",
        url: findParentData(element, "access", false)
      });
      return true;
    case "show-more-filters-section":
      $("#more-filters").setAttribute("aria-hidden", false);
      return true;
    case "switch-tab":
      switchTab(element.getAttribute("href").substr(1));
      return true;
    case "enable-filters":
      const url = findParentData(element, "access", false);
      const subscription = subscriptionsMap[url];
      browser.runtime.sendMessage({
        type: "subscriptions.enableAllFilters",
        url
      }).then(() => updateSubscription(subscription));
      return true;
    case "toggle-disable-subscription":
      browser.runtime.sendMessage({
        type: "subscriptions.toggle",
        keepInstalled: true,
        url: findParentData(element, "access", false)
      });
      return true;
    case "toggle-pref":
      browser.runtime.sendMessage({
        type: "prefs.toggle",
        key: findParentData(element, "pref", false)
      });
      return true;
    case "toggle-remove-subscription":
      const subscriptionUrl = findParentData(element, "access", false);
      if (element.getAttribute("aria-checked") == "true")
      {
        browser.runtime.sendMessage({
          type: "subscriptions.remove",
          url: subscriptionUrl
        });
      }
      else
        addEnableSubscription(subscriptionUrl);
      return true;
    case "update-all-subscriptions":
      browser.runtime.sendMessage({
        type: "subscriptions.update"
      });
      return true;
    case "update-subscription":
      browser.runtime.sendMessage({
        type: "subscriptions.update",
        url: findParentData(element, "access", false)
      });
      return true;
    case "validate-import-subscription":
      const form = findParentData(element, "validation", true);
      if (!form)
        return;
      if (form.checkValidity())
      {
        addEnableSubscription($("#import-list-url", form).value);
        form.reset();
        closeAddFiltersByURL();
      }
      else
      {
        $(":invalid", form).focus();
      }
      return true;
  }
  return false;
}
function execActions(actions, element)
{
  actions = actions.split(",");
  let foundAction = false;
  for (const action of actions)
  {
    foundAction |= execAction(action, element);
  }
  return !!foundAction;
}
function changeLanguageSubscription(url)
{
  for (const key in subscriptionsMap)
  {
    const subscription = subscriptionsMap[key];
    const subscriptionType = subscription.recommended;
    if (subscriptionType == "ads" && subscription.disabled == false)
    {
      browser.runtime.sendMessage({
        type: "subscriptions.remove",
        url: subscription.url
      });
      browser.runtime.sendMessage({
        type: "subscriptions.add",
        url
      });
      break;
    }
  }
}
function onClick(e)
{
  const actions = findParentData(e.target, "action", false);
  if (!actions)
    return;
  const foundAction = execActions(actions, e.target);
  if (foundAction)
  {
    e.preventDefault();
  }
}
function onKeyUp(event)
{
  const {key} = event;
  let element = document.activeElement;
  if (!key || !element)
    return;
  const container = findParentData(element, "action", true);
  if (!container || !container.hasAttribute("data-keys"))
    return;
  const keys = container.getAttribute("data-keys").split(" ");
  if (keys.indexOf(key) < 0)
    return;
  if (element.getAttribute("role") == "tab")
  {
    let parent = element.parentElement;
    if (key == "ArrowLeft" || key == "ArrowUp")
      parent = parent.previousElementSibling || container.lastElementChild;
    else if (key == "ArrowRight" || key == "ArrowDown")
      parent = parent.nextElementSibling || container.firstElementChild;
    element = parent.firstElementChild;
  }
  const actions = container.getAttribute("data-action");
  const foundAction = execActions(actions, element);
  if (foundAction)
  {
    event.preventDefault();
  }
}
function selectTabItem(tabId, container, focus)
{
  document.body.setAttribute("data-tab", tabId);
  const tabList = $("[role='tablist']", container);
  if (!tabList)
    return null;
  const previousTab = $("[aria-selected]", tabList);
  previousTab.removeAttribute("aria-selected");
  previousTab.setAttribute("tabindex", -1);
  const tab = $(`a[href="#${tabId}"]`, tabList);
  tab.setAttribute("aria-selected", true);
  tab.setAttribute("tabindex", 0);
  const tabContentId = tab.getAttribute("aria-controls");
  const tabContent = document.getElementById(tabContentId);
  if (tab && focus)
    tab.focus();
  if (tabId === "advanced")
  {
    setupFiltersBox();
    setupAddFiltersByURL();
  }
  return tabContent;
}
function onHashChange()
{
  const hash = location.hash.substr(1);
  if (!hash)
    return;
  const tabIds = hash.split("-");
  let tabContent = document.body;
  for (let i = 0; i < tabIds.length; i++)
  {
    const tabId = tabIds.slice(0, i + 1).join("-");
    tabContent = selectTabItem(tabId, tabContent, true);
    if (!tabContent)
      break;
  }
}
function setupFiltersBox()
{
  const ioListBox = $("#filters-box");
  if (!ioListBox.items.length)
  {
    ioListBox.getItemTitle = (item) => getPrettyItemTitle(item, true);
    ioListBox.addEventListener("change", (event) =>
    {
      const item = event.detail;
      addEnableSubscription(item.url, item.title, item.homepage);
    });
  }
  promisedResources.then(({recommendations}) =>
  {
    ioListBox.items = getListBoxItems(recommendations);
  });
}
function getListBoxItems(subscriptions)
{
  const urls = new Set();
  for (const subscription of collections.filterLists.items)
    urls.add(subscription.url);
  const groups = {
    ads: [],
    others: []
  };
  for (const subscription of subscriptions)
  {
    const {recommended, url} = subscription;
    if (recommended === "allowing")
      continue;
    const key = recommended === "ads" ? recommended : "others";
    const label = getPrettyItemTitle(subscription, true);
    const selected = urls.has(url);
    const premium = recommended === "distractions";
    const overrides = {unselectable: selected, label, selected, premium};
    groups[key].push(Object.assign({}, subscription, overrides));
  }
  return [
    ...groups.others,
    {
      type: "ads",
      group: true,
      description: browser.i18n.getMessage("options_language_filter_list")
    },
    ...groups.ads
  ];
}
function setupLanguagesBox()
{
  const ioListBox = $("#languages-box");
  ioListBox.getItemTitle = (item) => getPrettyItemTitle(item, false);
  ioListBox.addEventListener("close", (event) =>
  {
    ioListBox.swap = false;
  });
  ioListBox.addEventListener("change", (event) =>
  {
    const item = event.detail;
    if (ioListBox.swap)
      changeLanguageSubscription(item.url);
    else
    {
      item.disabled = !item.disabled;
      addEnableSubscription(item.url, item.title, item.homepage);
    }
  });
}
function onDOMLoaded()
{
  setupPremium();
  setupLanguagesBox();
  populateLists().catch(dispatchError);
  populateFilters().catch(dispatchError);
  browser.runtime.sendMessage({
    type: "app.get",
    what: "addonVersion"
  }).then(addonVersion =>
  {
    $("#abp-version").textContent = getMessage(
      "options_dialog_about_version",
      [addonVersion]
    );
  });
  document.body.addEventListener("click", onClick, false);
  $("#acceptable-ads-allow").addEventListener("click", switchAcceptableAds);
  $("#acceptable-ads-privacy-allow")
    .addEventListener("click", switchAcceptableAds);
  document.body.addEventListener("keyup", onKeyUp, false);
  $("#allowlisting-textbox").addEventListener("keyup", (e) =>
  {
    $("#allowlisting-add-button").disabled = !e.target.value;
  }, false);
  $$("li[data-pref]").forEach(async(option) =>
  {
    const key = option.dataset.pref;
    const value = await getPref(key);
    onPrefMessage(key, value);
  });
  getDoclink("acceptable_ads_criteria").then(link =>
  {
    setElementLinks("enable-acceptable-ads-description", link);
  });
  getDoclink("imprint").then((url) =>
  {
    setElementText(
      $("#copyright"),
      "options_dialog_about_copyright",
      [new Date().getFullYear()]
    );
    setElementLinks("copyright", url);
  });
  getDoclink("privacy").then((url) =>
  {
    $("#privacy-policy").href = url;
  });
  getDoclink("language_subscription").then((url) =>
  {
    setElementLinks("blocking-languages-description", url);
  });
  setElementText(
    $("#tracking-warning-1"),
    "options_tracking_warning_1",
    [
      getMessage("common_feature_privacy_title"),
      getMessage("options_acceptableAds_ads_label")
    ]
  );
  setElementText(
    $("#tracking-warning-3"),
    "options_tracking_warning_3",
    [getMessage("options_acceptableAds_privacy_label")]
  );
  getDoclink("adblock_plus_{browser}_dnt").then(url =>
  {
    setElementLinks("dnt", url);
  });
  getDoclink("acceptable_ads_survey").then(url =>
  {
    $("#acceptable-ads-why-not a.primary").href = url;
  });
  browser.runtime.sendMessage({
    type: "app.get",
    what: "features"
  }).then(features =>
  {
    hidePref("show_devtools_panel", !features.devToolsPanel);
  });
  getDoclink("filterdoc").then(link =>
  {
    setElementLinks("custom-filters-description", link);
  });
  getDoclink("help_center_abp_en").then(link =>
  {
    setElementLinks("help-center", link);
  });
  getDoclink("adblock_plus_report_bug").then(link =>
  {
    setElementLinks("report-bug", link);
  });
  getDoclink("{browser}_support").then(url =>
  {
    setElementLinks("visit-forum", url);
  });
  api.app.getInfo().then(({application, store}) =>
  {
    document.documentElement.dataset.application = application;
    if (!["chrome", "chromium", "opera", "firefox"].includes(application))
    {
      $("#support-us").setAttribute("aria-hidden", true);
      return;
    }
    api.doclinks.get(`${store}_review`).then((url) =>
    {
      $("#support-us a[data-i18n='options_rating_button']").href = url;
    });
  });
  $("#dialog").addEventListener("keydown", function(event)
  {
    const {key, preventDefault, shiftKey, target} = event;
    switch (key)
    {
      case "Escape":
        closeDialog();
        break;
      case "Tab":
        if (shiftKey)
        {
          if (target.classList.contains("focus-first"))
          {
            preventDefault();
            $(".focus-last", this).focus();
          }
        }
        else if (target.classList.contains("focus-last"))
        {
          preventDefault();
          $(".focus-first", this).focus();
        }
        break;
    }
  }, false);
  onHashChange();
}
let focusedBeforeDialog = null;
function openDialog(name)
{
  const dialog = $("#dialog");
  dialog.setAttribute("aria-hidden", false);
  dialog.setAttribute("aria-labelledby", `dialog-title-${name}`);
  dialog.setAttribute("aria-describedby", `dialog-description-${name}`);
  document.body.setAttribute("data-dialog", name);
  let defaultFocus = $(`#dialog-content-${name} .default-focus`);
  if (!defaultFocus)
    defaultFocus = $(".focus-first", dialog);
  focusedBeforeDialog = document.activeElement;
  defaultFocus.focus();
}
function closeDialog()
{
  const dialog = $("#dialog");
  dialog.setAttribute("aria-hidden", true);
  dialog.removeAttribute("aria-labelledby");
  document.body.removeAttribute("data-dialog");
  focusedBeforeDialog.focus();
}
function showNotification(text, kind)
{
  const notification = $("#notification");
  notification.setAttribute("aria-hidden", false);
  $("#notification-text", notification).textContent = text;
  notification.classList.add(kind);
  notification.addEventListener("animationend", hideNotification);
}
function hideNotification()
{
  const notification = $("#notification");
  notification.classList.remove("info", "error");
  notification.setAttribute("aria-hidden", true);
  $("#notification-text", notification).textContent = "";
}
async function populateFilters()
{
  const filters = await api.filters.get();
  loadCustomFilters([].concat(...filters));
  isCustomFiltersLoaded = true;
}
async function populateLists()
{
  subscriptionsMap = Object.create(null);
  filtersMap = Object.create(null);
  for (const property in collections)
    collections[property].clearAll();
  const [
    url,
    privacyUrl,
    additionalSubscriptionUrls,
    subscriptions
  ] = await Promise.all([
    api.app.get("acceptableAdsUrl"),
    api.app.get("acceptableAdsPrivacyUrl"),
    api.prefs.get("additional_subscriptions"),
    api.subscriptions.get()
  ]);
  acceptableAdsUrl = url;
  acceptableAdsPrivacyUrl = privacyUrl;
  additionalSubscriptions = additionalSubscriptionUrls;
  setAcceptableAds({firstLoad: true});
  for (const subscription of subscriptions)
    onSubscriptionMessage("added", subscription);
}
function addAllowlistedDomain()
{
  const domain = $("#allowlisting-textbox");
  const value = domain.value.trim();
  if (!value)
    return;
  for (const allowlistItem of collections.allowlist.items)
  {
    if (allowlistItem.title == value)
    {
      allowlistItem[timestampUI] = Date.now();
      collections.allowlist.updateItem(allowlistItem);
      domain.value = "";
      break;
    }
  }
  try
  {
    const {host} = new URL(/^https?:/.test(value) ? value : `http://${value}`);
    sendMessageHandleErrors({
      type: "filters.add",
      text: "@@||" + host.toLowerCase() + "^$document"
    });
    domain.value = "";
    $("#allowlisting-add-button").disabled = true;
  }
  catch (error)
  {
    dispatchError(error);
  }
}
function addEnableSubscription(url, title, homepage)
{
  let messageType = null;
  const knownSubscription = subscriptionsMap[url];
  if (knownSubscription && knownSubscription.disabled == true)
    messageType = "subscriptions.toggle";
  else
    messageType = "subscriptions.add";
  const message = {
    type: messageType,
    url
  };
  if (title)
    message.title = title;
  if (homepage)
    message.homepage = homepage;
  browser.runtime.sendMessage(message);
}
function cleanSyncErrorIdsFromSubscription(url)
{
  for (const syncErrorId of syncErrorIds.values())
  {
    removeErrorIdFromSubscription(url, syncErrorId);
  }
}
function addErrorIdToSubscription(url, errorId)
{
  let errorIds = subscriptionErrorIds.get(url);
  if (!errorIds)
  {
    errorIds = new Set();
    subscriptionErrorIds.set(url, errorIds);
  }
  errorIds.add(errorId);
}
function removeErrorIdFromSubscription(url, errorId)
{
  const errorIds = subscriptionErrorIds.get(url);
  if (!errorIds)
    return;
  errorIds.delete(errorId);
  if (errorIds.size === 0)
    subscriptionErrorIds.delete(url);
}
function updateErrorTooltip(element, errorIds)
{
  const errorTooltip = $("io-popout[anchor-icon='error']", element);
  const errorList = $(".error-list", errorTooltip);
  errorList.innerHTML = "";
  if (!errorIds || element.classList.contains("show-message"))
  {
    element.classList.remove("error");
    return;
  }
  for (const errorId of errorIds)
  {
    const listItem = document.createElement("li");
    listItem.textContent = getMessage(errorId) || errorId;
    if (errorId === filtersDisabledErrorId)
    {
      const enableFiltersButton = document.createElement("a");
      enableFiltersButton.textContent = getMessage(
        "options_filterList_enableFilters"
      );
      enableFiltersButton.setAttribute("data-action", "enable-filters");
      listItem.appendChild(enableFiltersButton);
    }
    errorList.appendChild(listItem);
  }
  element.classList.add("error");
}
async function setupPremium()
{
  setupPremiumBanners();
  setupPremiumInRecommended();
  const premium = await api.premium.get();
  premiumIsActive = premium.isActive;
  updatePremiumStateInPage();
}
async function setupPremiumBanners()
{
  const premiumUpgradeBanner = $(".premium-upgrade.banner");
  const upgradeCTA = $(".upgrade.button", premiumUpgradeBanner);
  const upgradeDescription = $("#premium-upgrade-description");
  const source = getSourceAttribute(premiumUpgradeBanner);
  const manageUrl = await api.ctalinks.get("premium-manage", {source});
  const upgradeUrl = await api.ctalinks.get("premium-upgrade", {source});
  $$(".premium-manage.banner a").forEach(cta =>
  {
    cta.setAttribute("href", manageUrl);
  });
  upgradeCTA.setAttribute("href", upgradeUrl);
  setElementLinks(upgradeDescription, upgradeUrl);
}
async function setupPremiumInRecommended()
{
  const upgradeCTA = $(".recommended-features .upgrade.button");
  const source = getSourceAttribute(upgradeCTA);
  const upgradeUrl = await api.ctalinks.get("premium-upgrade", {source});
  upgradeCTA.setAttribute("href", upgradeUrl);
}
function updatePremiumStateInPage()
{
  document.body.classList.toggle("premium", premiumIsActive);
  const premiumListItems = $$("#premium-list-table li");
  premiumListItems.forEach((listItem) =>
    updatePremiumStateInListItem(listItem)
  );
  setupFiltersBox();
}
function updatePremiumStateInListItem(listItem)
{
  if (!listItem)
    return;
  const checkbox = $("button[role='checkbox']", listItem);
  if (checkbox)
    checkbox.toggleAttribute("disabled", !premiumIsActive);
}
function onFilterMessage(action, filter)
{
  switch (action)
  {
    case "added":
      filter[timestampUI] = Date.now();
      updateFilter(filter);
      break;
    case "removed":
      const knownFilter = filtersMap[filter.text];
      if (allowlistedDomainRegexp.test(knownFilter.text) ||
          allowlistedPageRegexp.test(knownFilter.text))
        collections.allowlist.removeItem(knownFilter);
      else
        removeCustomFilter(filter.text);
      delete filtersMap[filter.text];
      break;
  }
}
function onSubscriptionMessage(action, subscription, ...args)
{
  promisedResources.then(() =>
  {
    if (subscription.url in subscriptionsMap)
    {
      const knownSubscription = subscriptionsMap[subscription.url];
      for (const property in subscription)
      {
        knownSubscription[property] = subscription[property];
      }
      subscription = knownSubscription;
    }
    switch (action)
    {
      case "added":
        const {url} = subscription;
        if (/^~user/.test(url))
        {
          loadCustomFilters(subscription.filters);
          return;
        }
        else if (url in subscriptionsMap)
          updateSubscription(subscription);
        else
          addSubscription(subscription);
        if (isAcceptableAds(url))
        {
          setAcceptableAds();
        }
        browser.runtime.sendMessage({
          type: "subscriptions.getDisabledFilterCount",
          url: subscription.url
        }).then(disabledFilterCount =>
        {
          if (disabledFilterCount > 0)
            addErrorIdToSubscription(subscription.url, filtersDisabledErrorId);
          collections.filterLists.addItem(subscription);
          setPrivacyConflict();
        });
        break;
      case "changed":
        updateSubscription(subscription);
        setPrivacyConflict();
        break;
      case "filtersDisabled":
        const filtersDisabled = args[0];
        if (filtersDisabled)
          addErrorIdToSubscription(subscription.url, filtersDisabledErrorId);
        else
        {
          removeErrorIdFromSubscription(
            subscription.url,
            filtersDisabledErrorId
          );
        }
        updateSubscription(subscription);
        break;
      case "removed":
        if (subscription.recommended && subscription.recommended !== "allowing")
        {
          subscription.disabled = true;
          onSubscriptionMessage("changed", subscription);
        }
        else
        {
          delete subscriptionsMap[subscription.url];
          if (isAcceptableAds(subscription.url))
          {
            setAcceptableAds();
          }
          else
          {
            collections.more.removeItem(subscription);
          }
        }
        subscriptionErrorIds.delete(subscription.url);
        collections.filterLists.removeItem(subscription);
        setPrivacyConflict();
        break;
    }
  }).catch(dispatchError);
}
function hidePref(key, value)
{
  const element = getPrefElement(key);
  if (element)
    element.setAttribute("aria-hidden", value);
}
function getPrefElement(key)
{
  return $(`[data-pref="${key}"]`);
}
function getPref(key)
{
  return browser.runtime.sendMessage({
    type: "prefs.get",
    key
  });
}
function onPrefMessage(key, value, initial)
{
  switch (key)
  {
    case "notifications_ignoredcategories":
      value = value.indexOf("*") == -1;
      break;
    case "ui_warn_tracking":
      setPrivacyConflict();
      break;
  }
  const checkbox = $(`[data-pref="${key}"] button[role="checkbox"]`);
  if (checkbox)
    checkbox.setAttribute("aria-checked", value);
}
api.addListener((message) =>
{
  switch (message.type)
  {
    case "app.respond":
      switch (message.action)
      {
        case "addSubscription":
          const subscription = message.args[0];
          let {title, url} = subscription;
          if (!title || title == url)
          {
            title = "";
          }
          if (ALLOWED_PROTOCOLS.test(url))
          {
            const dialog = $("#dialog-content-predefined");
            $(".title > span", dialog).textContent = title;
            $(".title", dialog).hidden = !title;
            const link = $(".url > a", dialog);
            link.href = url;
            link.textContent = url;
            openDialog("predefined");
          }
          else
          {
            openDialog("invalid");
          }
          break;
        case "focusSection":
          let section = message.args[0];
          if (section == "notifications")
          {
            section = "advanced";
            const elem = getPrefElement("notifications_ignoredcategories");
            elem.classList.add("highlight-animate");
            $("button", elem).focus();
          }
          selectTabItem(section, document.body, false);
          break;
      }
      break;
    case "filters.respond":
      onFilterMessage(message.action, message.args[0]);
      break;
    case "prefs.respond":
      onPrefMessage(message.action, message.args[0]);
      break;
    case "premium.respond":
      premiumIsActive = message.args[0].isActive;
      setupPremiumBanners();
      updatePremiumStateInPage();
      break;
    case "subscriptions.respond":
      onSubscriptionMessage(message.action, ...message.args);
      setupFiltersBox();
      break;
  }
});
api.app.listen(["addSubscription", "focusSection"]);
api.filters.listen(["added", "changed", "removed"]);
api.prefs.listen([
  "elemhide_debug",
  "notifications_ignoredcategories",
  "recommend_language_subscriptions",
  "shouldShowBlockElementMenu",
  "show_devtools_panel",
  "show_statsinicon",
  "ui_warn_tracking"
]);
api.premium.listen(["changed"]);
api.subscriptions.listen(["added", "changed", "filtersDisabled", "removed"]);
onDOMLoaded();
window.addEventListener("hashchange", onHashChange, false);
window.addEventListener(
  "error",
  showNotification.bind(
    null,
    browser.i18n.getMessage("options_generic_error"),
    "error"
  )
);
function dispatchError(error)
{
  if (error)
    window.console.error(error);
  window.dispatchEvent(new CustomEvent("error"));
}})();
