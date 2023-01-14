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
(function(){'use strict';function convertDoclinks()
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
}let browserName = "unknown";
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
}
function asIndentedString(element, indentation = 0)
{
  if (!indentation)
  {
    if (element.nodeType === Node.DOCUMENT_NODE)
      element = element.documentElement;
    if (element.nodeType !== Node.ELEMENT_NODE)
      throw new Error("Unable to serialize " + element);
    element = element.cloneNode(true);
  }
  const before = "  ".repeat(indentation + 1);
  const after = "  ".repeat(indentation);
  const doc = element.ownerDocument;
  for (const child of Array.from(element.childNodes))
  {
    const {nodeType} = child;
    if (nodeType === Node.ELEMENT_NODE || nodeType === Node.TEXT_NODE)
    {
      if (nodeType === Node.TEXT_NODE)
      {
        const content = child.textContent.trim();
        child.textContent = content.length ? `\n${before}${content}` : "";
      }
      else
      {
        element.insertBefore(doc.createTextNode(`\n${before}`), child);
        asIndentedString(child, indentation + 1);
      }
    }
    if (child === element.lastChild)
      element.appendChild(doc.createTextNode(`\n${after}`));
  }
  if (indentation)
    return "";
  if (/^https?:\/\/www\.w3\.org\/1999\/xhtml$/.test(element.namespaceURI))
    return element.outerHTML;
  return new XMLSerializer().serializeToString(element);
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
connect();const reportData = new DOMParser().parseFromString(
  "<report></report>",
  "text/xml"
);
let dataGatheringTabId = null;
let isMinimumTimeMet = false;
function getOriginalTabId()
{
  const tabId = parseInt(location.search.replace(/^\?/, ""), 10);
  if (!tabId && tabId !== 0)
  {
    console.warn("Missing tab id. Try appending '?1' to the end of the url.");
    throw new Error("invalid tab id");
  }
  return tabId;
}
api.addListener((message) =>
{
  if (message.type !== "requests.respond" || message.action !== "hits")
    return;
  const [request, filter, subscriptions] = message.args;
  const requestsContainerElem = $("requests", reportData);
  const filtersElem = $("filters", reportData);
  if (request.url)
  {
    let requestElem = $(`[location="${request.url}"]`, reportData);
    if (!requestElem)
    {
      requestElem = reportData.createElement("request");
      requestElem.setAttribute("location", censorURL(request.url));
      requestElem.setAttribute("type", request.type);
      requestElem.setAttribute("docDomain", request.docDomain);
      requestElem.setAttribute("thirdParty", request.thirdParty);
      requestElem.setAttribute("count", 0);
      requestsContainerElem.appendChild(requestElem);
    }
    const countNum = parseInt(requestElem.getAttribute("count"), 10);
    requestElem.setAttribute("count", countNum + 1);
    if (filter)
      requestElem.setAttribute("filter", filter.text);
  }
  if (filter)
  {
    const escapedText = CSS.escape(filter.text);
    const existingFilter = $(`[text="${escapedText}"]`, reportData);
    if (existingFilter)
    {
      const countNum = parseInt(
        existingFilter.getAttribute("hitCount"),
        10
      );
      existingFilter.setAttribute("hitCount", countNum + 1);
    }
    else
    {
      const filterElem = reportData.createElement("filter");
      filterElem.setAttribute("text", filter.text);
      const subscriptionUrls = subscriptions
        .map((subscription) => subscription.url);
      filterElem.setAttribute("subscriptions", subscriptionUrls.join(" "));
      filterElem.setAttribute("hitCount", 1);
      filtersElem.appendChild(filterElem);
    }
  }
});
function collectRequests(tabId)
{
  reportData.documentElement.appendChild(reportData.createElement("requests"));
  reportData.documentElement.appendChild(reportData.createElement("filters"));
  return browser.tabs.get(tabId).then(tab =>
  {
    return browser.tabs.create({active: false, url: tab.url});
  }).then((tab) =>
  {
    dataGatheringTabId = tab.id;
    api.requests.listen(["hits"], dataGatheringTabId);
    function minimumTimeMet()
    {
      if (isMinimumTimeMet)
        return;
      isMinimumTimeMet = true;
      document.getElementById("showData").disabled = false;
      $("io-steps").dispatchEvent(new CustomEvent("requestcollected"));
      validateCommentsPage();
    }
    browser.tabs.onUpdated.addListener((updatedTabId, changeInfo) =>
    {
      if (updatedTabId == dataGatheringTabId && changeInfo.status == "complete")
        minimumTimeMet();
    });
    window.setTimeout(minimumTimeMet, 5000);
    window.addEventListener("beforeunload", (event) =>
    {
      closeRequestsCollectingTab();
    });
  });
}
let closedRequestsCollectingTab;
function closeRequestsCollectingTab()
{
  if (!closedRequestsCollectingTab)
    closedRequestsCollectingTab = browser.tabs.remove(dataGatheringTabId);
  return closedRequestsCollectingTab;
}
function retrieveAddonInfo()
{
  const element = reportData.createElement("adblock-plus");
  return browser.runtime.sendMessage({
    type: "app.get",
    what: "addonVersion"
  }).then(addonVersion =>
  {
    element.setAttribute("version", addonVersion);
    return browser.runtime.sendMessage({
      type: "app.get",
      what: "localeInfo"
    });
  }).then(({locale}) =>
  {
    element.setAttribute("locale", locale);
    reportData.documentElement.appendChild(element);
  });
}
function retrieveApplicationInfo()
{
  const element = reportData.createElement("application");
  return browser.runtime.sendMessage({
    type: "app.get",
    what: "application"
  }).then(application =>
  {
    element.setAttribute("name", capitalize(application));
    return browser.runtime.sendMessage({
      type: "app.get",
      what: "applicationVersion"
    });
  }).then(applicationVersion =>
  {
    element.setAttribute("version", applicationVersion);
    element.setAttribute("vendor", navigator.vendor);
    element.setAttribute("userAgent", navigator.userAgent);
    reportData.documentElement.appendChild(element);
  });
}
function retrievePlatformInfo()
{
  const element = reportData.createElement("platform");
  const {getBrowserInfo, sendMessage} = browser.runtime;
  return Promise.all([
    (getBrowserInfo) ? getBrowserInfo() : null,
    sendMessage({
      type: "app.get",
      what: "platform"
    }),
    sendMessage({
      type: "app.get",
      what: "platformVersion"
    })
  ])
  .then(([browserInfo, platform, platformVersion]) =>
  {
    if (browserInfo)
    {
      element.setAttribute("build", browserInfo.buildID);
    }
    element.setAttribute("name", capitalize(platform));
    element.setAttribute("version", platformVersion);
    reportData.documentElement.appendChild(element);
  });
}
async function retrieveWindowInfo(tabId)
{
  const tab = await browser.tabs.get(tabId);
  let openerUrl = null;
  let referrerUrl = null;
  if (tab.openerTabId)
  {
    const openerTab = await browser.tabs.get(tab.openerTabId);
    openerUrl = openerTab.url;
  }
  if ("scripting" in browser)
  {
    const [frameResult] = await browser.scripting.executeScript({
      target: {tabId},
      func: () => document.referrer
    });
    referrerUrl = frameResult.result;
  }
  else
  {
    [referrerUrl] = await browser.tabs.executeScript(tabId, {
      code: "document.referrer"
    });
  }
  const element = reportData.createElement("window");
  if (openerUrl)
  {
    element.setAttribute("opener", censorURL(openerUrl));
  }
  if (referrerUrl)
  {
    element.setAttribute("referrer", censorURL(referrerUrl));
  }
  element.setAttribute("url", censorURL(tab.url));
  reportData.documentElement.appendChild(element);
}
function retrieveSubscriptions()
{
  return api.subscriptions.get({
    ignoreDisabled: true,
    disabledFilters: true
  }).then(subscriptions =>
  {
    const element = reportData.createElement("subscriptions");
    for (const subscription of subscriptions)
    {
      if (!/^(http|https|ftp):/.test(subscription.url))
        continue;
      const now = Math.round(Date.now() / 1000);
      const subscriptionElement = reportData.createElement("subscription");
      subscriptionElement.setAttribute("id", subscription.url);
      if (subscription.version)
        subscriptionElement.setAttribute("version", subscription.version);
      if (subscription.lastDownload)
      {
        subscriptionElement.setAttribute("lastDownloadAttempt",
                                         subscription.lastDownload - now);
      }
      if (subscription.lastSuccess)
      {
        subscriptionElement.setAttribute("lastDownloadSuccess",
                                         subscription.lastSuccess - now);
      }
      if (subscription.softExpiration)
      {
        subscriptionElement.setAttribute("softExpiration",
                                         subscription.softExpiration - now);
      }
      if (subscription.expires)
      {
        subscriptionElement.setAttribute("hardExpiration",
                                         subscription.expires - now);
      }
      subscriptionElement.setAttribute("downloadStatus",
                                       subscription.downloadStatus);
      subscriptionElement.setAttribute("disabledFilters",
                                       subscription.disabledFilters.length);
      element.appendChild(subscriptionElement);
    }
    reportData.documentElement.appendChild(element);
  });
}
function setConfigurationInfo(configInfo)
{
  let extensionsContainer = $("extensions", reportData);
  let optionsContainer = $("options", reportData);
  if (!configInfo)
  {
    if (extensionsContainer)
    {
      extensionsContainer.parentNode.removeChild(extensionsContainer);
    }
    if (optionsContainer)
    {
      optionsContainer.parentNode.removeChild(optionsContainer);
    }
    return;
  }
  if (!extensionsContainer)
  {
    extensionsContainer = reportData.createElement("extensions");
    reportData.documentElement.appendChild(extensionsContainer);
  }
  if (!optionsContainer)
  {
    optionsContainer = reportData.createElement("options");
    reportData.documentElement.appendChild(optionsContainer);
  }
  extensionsContainer.innerHTML = "";
  optionsContainer.innerHTML = "";
  const {extensions, options} = configInfo;
  for (const id in options)
  {
    const element = reportData.createElement("option");
    element.setAttribute("id", id);
    element.textContent = options[id];
    optionsContainer.appendChild(element);
  }
  for (const extension of extensions)
  {
    const element = reportData.createElement("extension");
    element.setAttribute("id", extension.id);
    element.setAttribute("name", extension.name);
    element.setAttribute("type", extension.type);
    if (extension.version)
    {
      element.setAttribute("version", extension.version);
    }
    extensionsContainer.appendChild(element);
  }
}
function proxyApiCall(apiId, ...args)
{
  return new Promise((resolve) =>
  {
    const iframe = document.createElement("iframe");
    iframe.hidden = true;
    iframe.src = browser.runtime.getURL("proxy.html");
    iframe.onload = () =>
    {
      function callback(...results)
      {
        document.body.removeChild(iframe);
        resolve(results[0]);
      }
      const proxy = iframe.contentWindow.browser;
      switch (apiId)
      {
        case "contentSettings.cookies":
          if ("contentSettings" in proxy)
          {
            proxy.contentSettings.cookies.get(...args, callback);
          }
          else
          {
            callback(null);
          }
          break;
        case "contentSettings.javascript":
          if ("contentSettings" in proxy)
          {
            proxy.contentSettings.javascript.get(...args, callback);
          }
          else
          {
            callback(null);
          }
          break;
        case "management.getAll":
          if ("getAll" in proxy.management)
          {
            proxy.management.getAll(...args).then(callback);
          }
          else
          {
            callback(null);
          }
          break;
      }
    };
    document.body.appendChild(iframe);
  });
}
function retrieveExtensions()
{
  return proxyApiCall("management.getAll")
    .then((installed) =>
    {
      const extensions = [];
      for (const extension of installed)
      {
        if (!extension.enabled || extension.type != "extension")
          continue;
        extensions.push({
          id: extension.id,
          name: extension.name,
          type: "extension",
          version: extension.version
        });
      }
      const {plugins} = navigator;
      for (const plugin of plugins)
      {
        extensions.push({
          id: plugin.filename,
          name: plugin.name,
          type: "plugin"
        });
      }
      return extensions;
    })
    .catch((err) =>
    {
      console.error("Could not retrieve list of extensions");
      return [];
    });
}
function retrieveOptions()
{
  if (!("contentSettings" in browser))
    return Promise.resolve({});
  let tabId;
  try
  {
    tabId = getOriginalTabId();
  }
  catch (ex)
  {
    return Promise.reject(ex);
  }
  return browser.tabs.get(tabId)
    .then((tab) =>
    {
      const details = {primaryUrl: tab.url, incognito: tab.incognito};
      return Promise.all([
        proxyApiCall("contentSettings.cookies", details),
        proxyApiCall("contentSettings.javascript", details),
        tab.incognito
      ]);
    })
    .then(([cookies, javascript, incognito]) =>
    {
      return {
        cookieBehavior: cookies.setting == "allow" ||
          cookies.setting == "session_only",
        javascript: javascript.setting == "allow",
        privateBrowsing: incognito
      };
    })
    .catch((err) =>
    {
      console.error("Could not retrieve configuration options");
      return {};
    });
}
function updateConfigurationInfo(isAccessible)
{
  if (!isAccessible)
  {
    setConfigurationInfo(null);
    return Promise.resolve();
  }
  return Promise.all([
    retrieveExtensions(),
    retrieveOptions()
  ])
  .then(([extensions, options]) =>
  {
    setConfigurationInfo({extensions, options});
  });
}
function capitalize(str)
{
  return str[0].toUpperCase() + str.slice(1);
}
function censorURL(url)
{
  return url.replace(/([?;&/#][^?;&/#]+?=)[^?;&/#]+/g, "$1*");
}
function setReportType(event)
{
  reportData.documentElement.setAttribute("type", event.target.value);
}
for (const typeElement of $$("#typeSelectorGroup input"))
{
  typeElement.addEventListener("change", setReportType);
}
let commentElement = null;
$("#comment").addEventListener("input", (event) =>
{
  const comment = event.target.value;
  if (!comment)
  {
    if (commentElement)
    {
      commentElement.parentNode.removeChild(commentElement);
      commentElement = null;
    }
  }
  else if (commentElement)
  {
    commentElement.textContent = comment;
  }
  else
  {
    commentElement = reportData.createElement("comment");
    commentElement.textContent = comment;
    reportData.documentElement.appendChild(commentElement);
  }
});
const anonSubmissionField = $("#anonymousSubmission");
const emailField = $("#email");
emailField.addEventListener("input", validateCommentsPage);
anonSubmissionField.addEventListener("click", validateCommentsPage);
const emailElement = reportData.createElement("email");
function validateCommentsPage()
{
  const sendButton = $("#send");
  $("#anonymousSubmissionWarning").setAttribute(
    "data-invisible",
    !anonSubmissionField.checked
  );
  if (anonSubmissionField.checked)
  {
    emailField.value = "";
    emailField.disabled = true;
    sendButton.disabled = !isMinimumTimeMet;
    if (emailElement.parentNode)
      emailElement.parentNode.removeChild(emailElement);
  }
  else
  {
    emailField.disabled = false;
    const value = emailField.value.trim();
    emailElement.textContent = value;
    reportData.documentElement.appendChild(emailElement);
    sendButton.disabled = (value == "" || !emailField.validity.valid ||
      !isMinimumTimeMet);
  }
  $("io-steps").dispatchEvent(
    new CustomEvent("formvalidated", {detail: !sendButton.disabled})
  );
}
function collectData()
{
  let tabId;
  try
  {
    tabId = getOriginalTabId();
  }
  catch (ex)
  {
    return Promise.reject(ex);
  }
  return Promise.all([
    retrieveAddonInfo(),
    retrieveApplicationInfo(),
    retrievePlatformInfo(),
    retrieveWindowInfo(tabId),
    collectRequests(tabId),
    retrieveSubscriptions()
  ]).then(() => reportData);
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
const wire$1 = (obj, type) => obj == null ?
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
hyper.wire = wire$1;
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
HyperHTMLElement.wire = wire$1;
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
});class IOSteps extends IOElement
{
  static get observedAttributes()
  {
    return ["i18n-labels"];
  }
  created()
  {
    reset.call(this);
  }
  attributeChangedCallback()
  {
    reset.call(this);
    for (const label of this.i18nLabels.split(/[\n ]+/))
    {
      const trimmed = label.trim();
      if (trimmed.length)
      {
        this.labels.push(browser.i18n.getMessage(trimmed));
      }
    }
    this.render();
  }
  get enabled()
  {
    return this._enabled;
  }
  getCompleted(index)
  {
    return index < this._enabled;
  }
  setCompleted(index, completed = true)
  {
    if (index < 0)
      index = this.children.length + index;
    this.children[index].classList.toggle("completed", completed);
    if (
      completed &&
      index < this.labels.length &&
      this._enabled <= index
    )
    {
      this._enabled = index + 1;
      this.render();
    }
  }
  onclick(event)
  {
    event.preventDefault();
    event.stopPropagation();
    const indexOf = Array.prototype.indexOf;
    this.dispatchEvent(new CustomEvent("step:click", {
      bubbles: true,
      detail: indexOf.call(this.children, event.currentTarget)
    }));
  }
  render()
  {
    this.html`${this.labels.map(getButton, this)}`;
  }
}
const {wire} = IOElement;
function getButton(label, index)
{
  return wire(this, `:${index}`)`
    <button
      onclick="${this}"
      disabled="${index > this._enabled}"
      data-value="${index + 1}"
    >${label}</button>`;
}
function reset()
{
  this._enabled = 0;
  this.labels = [];
}
IOSteps.define("io-steps");const requestIdleCb = window.requestIdleCallback || setTimeout;
class DrawingHandler
{
  constructor(canvas, maxSize)
  {
    this.paths = new Set();
    this.canvas = canvas;
    this.maxSize = maxSize;
    const canvasRect = canvas.getBoundingClientRect();
    canvas.width = canvasRect.width;
    canvas.height = canvasRect.height;
    this.ratio = (maxSize / canvas.width) * (window.devicePixelRatio || 1);
    if ("onpointerup" in canvas)
    {
      canvas.addEventListener("pointerdown", this, {passive: false});
      canvas.addEventListener("pointermove", this, {passive: false});
      canvas.addEventListener("pointerup", this, {passive: false});
      document.addEventListener("pointerup", this, {passive: false});
    }
    else
    {
      this.onmousedown = this.onpointerdown;
      this.onmousemove = this.onpointermove;
      this.onmouseup = this.onpointerup;
      canvas.addEventListener("mousedown", this, {passive: false});
      canvas.addEventListener("mousemove", this, {passive: false});
      canvas.addEventListener("mouseup", this, {passive: false});
      document.addEventListener("mouseup", this, {passive: false});
    }
  }
  changeColorDepth(image)
  {
    this.clear();
    const {naturalWidth, naturalHeight} = image;
    const canvasWidth = this.canvas.width * this.ratio;
    const canvasHeight = (canvasWidth * naturalHeight) / naturalWidth;
    this.canvas.width = canvasWidth;
    this.canvas.height = canvasHeight;
    this.canvas.style.width = Math.round(canvasWidth / this.ratio) + "px";
    this.canvas.style.height = Math.round(canvasHeight / this.ratio) + "px";
    this.ctx.drawImage(
      image,
      0, 0, naturalWidth, naturalHeight,
      0, 0, canvasWidth, canvasHeight
    );
    this.imageData = this.ctx.getImageData(0, 0, canvasWidth, canvasHeight);
    const data = this.imageData.data;
    const length = data.length;
    const mapping = [0x00, 0x55, 0xAA, 0xFF];
    const avoidBlocking = Math.round(5000 * this.ratio);
    return new Promise(resolve =>
    {
      const remap = i =>
      {
        for (; i < length; i++)
        {
          data[i] = mapping[data[i] >> 6];
          if (i > 0 && i % avoidBlocking == 0)
          {
            notifyColorDepthChanges.call(this, i, length);
            return requestIdleCb(() =>
            {
              this.draw();
              requestIdleCb(() => remap(i + 1));
            });
          }
        }
        notifyColorDepthChanges.call(this, i, length);
        resolve();
      };
      remap(0);
    });
  }
  clear()
  {
    if (!this.ctx)
    {
      this.ctx = this.canvas.getContext("2d");
    }
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.lineJoin = "round";
    this.ctx.strokeStyle = "#ED1E45";
    this.ctx.fillStyle = "#000";
    this.ctx.lineWidth = 4 * this.ratio;
  }
  draw()
  {
    this.clear();
    if (this.imageData)
    {
      this.ctx.putImageData(this.imageData, 0, 0);
    }
    for (const rect of this.paths)
    {
      const method = `${rect.type}Rect`;
      this.ctx[method](
        rect.x * this.ratio,
        rect.y * this.ratio,
        rect.width * this.ratio,
        rect.height * this.ratio
      );
    }
  }
  handleEvent(event)
  {
    this[`on${event.type}`](event);
  }
  onpointerdown(event)
  {
    if (this.drawing || !IOElement.utils.event.isLeftClick(event))
      return;
    stopEvent(event);
    this.drawing = true;
    const start = relativeCoordinates(event);
    this.rect = {
      type: this.mode,
      x: start.x,
      y: start.y,
      width: 0,
      height: 0
    };
    this.paths.add(this.rect);
  }
  onpointermove(event)
  {
    if (!this.drawing)
      return;
    stopEvent(event);
    this.updateRect(event);
    this.draw();
  }
  onpointerup(event)
  {
    if (!this.drawing)
      return;
    stopEvent(event);
    if (event.currentTarget === this.canvas)
    {
      this.updateRect(event);
    }
    this.draw();
    this.drawing = false;
    if (!this.rect.width && !this.rect.height)
    {
      this.paths.delete(this.rect);
      return;
    }
    const rect = this.rect;
    const parent = this.canvas.parentNode;
    const closeCoords = getRelativeCoordinates(
      this.canvas,
      rect,
      {
        x: rect.x + rect.width,
        y: rect.y + rect.height
      }
    );
    parent.appendChild(IOElement.wire()`
      <span
        class="closer"
        onclick="${
          evt =>
          {
            if (!IOElement.utils.event.isLeftClick(evt))
              return;
            stopEvent(evt);
            parent.removeChild(evt.currentTarget);
            this.paths.delete(rect);
            this.draw();
          }
        }"
        style="${{
          top: closeCoords.y + "px",
          left: closeCoords.x + "px"
        }}"
      >
        <img src="/skin/icons/close.svg" />
      </span>`);
  }
  updateRect(event)
  {
    const coords = relativeCoordinates(event);
    this.rect.width = coords.x - this.rect.x;
    this.rect.height = coords.y - this.rect.y;
  }
}
function notifyColorDepthChanges(value, max)
{
  const info = {detail: {value, max}};
  const ioHighlighter = this.canvas.closest("io-highlighter");
  ioHighlighter.dispatchEvent(new CustomEvent("changecolordepth", info));
}
function getRelativeCoordinates(canvas, start, end)
{
  const x = Math.max(start.x, end.x) + canvas.offsetLeft;
  const y = Math.min(start.y, end.y) + canvas.offsetTop;
  return {x: Math.round(x), y: Math.round(y)};
}
function stopEvent(event)
{
  event.preventDefault();
  event.stopPropagation();
}class IOHighlighter extends IOElement
{
  get defaultState()
  {
    return {drawing: "", changeDepth: null};
  }
  get changeDepth()
  {
    return this.state.changeDepth;
  }
  get edited()
  {
    return this.drawingHandler ? this.drawingHandler.paths.size > 0 : false;
  }
  edit(source)
  {
    return this.setState({
      changeDepth: new Promise((res, rej) =>
      {
        const changeDepth = image =>
        {
          this.drawingHandler.changeColorDepth(image).then(res, rej);
        };
        if (typeof source === "string")
        {
          const img = this.ownerDocument.createElement("img");
          img.onload = () => changeDepth(img);
          img.onerror = rej;
          img.src = source;
        }
        else
        {
          changeDepth(source);
        }
      })
    });
  }
  render()
  {
    if (this.state.drawing)
      this.setAttribute("drawing", this.state.drawing);
    else
      this.removeAttribute("drawing");
    this.html`
    <div class="split">
      <div class="options">
        <button
          tabindex="-1"
          class="highlight"
          onclick="${
            event =>
            {
              if (IOElement.utils.event.isLeftClick(event))
                changeMode(this, "highlight");
            }
          }"
        >
          ${{i18n: "issueReporter_screenshot_highlight"}}
        </button>
        <button
          tabindex="-1"
          class="hide"
          onclick="${
            event =>
            {
              if (IOElement.utils.event.isLeftClick(event))
                changeMode(this, "hide");
            }
          }"
        >
          ${{i18n: "issueReporter_screenshot_hide"}}
        </button>
      </div>
      <canvas />
    </div>`;
    if (!this.drawingHandler)
      this.drawingHandler = new DrawingHandler(
        $("canvas", this),
        parseInt(this.dataset.maxSize, 10) || 800
      );
  }
  toDataURL()
  {
    return $("canvas", this).toDataURL();
  }
}
IOHighlighter.define("io-highlighter");
const changeMode = (self, mode) =>
{
  const drawing = self.state.drawing === mode ? "" : mode;
  self.drawingHandler.mode = mode === "hide" ? "fill" : "stroke";
  self.setState({drawing});
};const managers = [
  ({ioSteps, page, index}) =>
  {
    page.addEventListener("change", event =>
    {
      ioSteps.setCompleted(index, true);
      enableContinue();
    });
  },
  ({ioSteps, page, index, screenshot}) =>
  {
    ioSteps.addEventListener("step:click", function once(event)
    {
      if (event.detail !== index)
        return;
      ioSteps.removeEventListener(event.type, once);
      const ioHighlighter = document.createElement("io-highlighter");
      page.appendChild(ioHighlighter);
      ioHighlighter.edit(screenshot);
      ioSteps.setCompleted(index, true);
      enableContinue();
    });
  },
  ({ioSteps, page, index}) =>
  {
    Promise.all([
      new Promise(resolve =>
      {
        ioSteps.addEventListener("requestcollected", resolve);
      }),
      new Promise(resolve =>
      {
        ioSteps.addEventListener("formvalidated", event =>
        {
          ioSteps.setCompleted(index, event.detail);
          $("button:last-child", ioSteps).disabled = true;
          if (event.detail)
            resolve();
        });
      })
    ]).then(() =>
    {
      $("#continue").hidden = true;
      $("#send").hidden = false;
    });
  },
  ({ioSteps, page, index, resolve}) =>
  {
    ioSteps.addEventListener("step:click", function once(event)
    {
      ioSteps.removeEventListener(event.type, once);
      const ioHighlighter = $("io-highlighter");
      ioHighlighter.changeDepth.then(() =>
      {
        resolve({
          screenshot:
          {
            get edited()
            {
              return ioHighlighter.edited;
            },
            get data()
            {
              return ioHighlighter.toDataURL();
            }
          }
        });
      });
    });
  }
];
const stepManager = ({screenshot}) => new Promise(resolve =>
{
  const ioSteps = $("io-steps");
  const pages = $$("main > .page");
  const btnContinue = $("#continue");
  let currentPage = pages[0];
  let index = 0;
  ioSteps.addEventListener(
    "step:click",
    event =>
    {
      index = event.detail;
      const nextPage = pages[index];
      if (nextPage === currentPage)
        return;
      currentPage.hidden = true;
      currentPage = nextPage;
      currentPage.hidden = false;
      btnContinue.disabled = !ioSteps.getCompleted(index);
    }
  );
  btnContinue.addEventListener(
    "click",
    event =>
    {
      ioSteps.dispatchEvent(
        new CustomEvent("step:click", {detail: index + 1})
      );
    }
  );
  managers.forEach((setup, i) =>
  {
    setup({ioSteps, page: pages[i], index: i, resolve, screenshot});
  });
});
function enableContinue()
{
  $("#continue").disabled = false;
}const optionalPermissions = {
  permissions: [
    "contentSettings",
    "management"
  ]
};
convertDoclinks();
initI18n();
function containsPermissions()
{
  try
  {
    return browser.permissions.contains(optionalPermissions);
  }
  catch (ex)
  {
    return Promise.reject(ex);
  }
}
document.addEventListener("DOMContentLoaded", () =>
{
  const supportEmail = "support@adblockplus.org";
  setElementLinks("sr-warning", `mailto:${supportEmail}`);
  setElementLinks(
    "other-issues",
    `mailto:${supportEmail}?subject=${encodeURIComponent("[Issue Reporter]")}`
  );
  const cancelButton = $("#cancel");
  cancelButton.addEventListener("click", closeMe);
  $("#hide-notification").addEventListener("click", () =>
  {
    $("#notification").setAttribute("aria-hidden", true);
  });
  const collectedData = collectData().catch(e =>
  {
    console.error(e);
    alert(e);
    closeMe();
  });
  const manageSteps = browser.tabs.captureVisibleTab(null, {format: "png"})
    .then(screenshot =>
    {
      return browser.tabs.getCurrent()
        .then(tab => browser.tabs.update(tab.id, {active: true}))
        .then(() => stepManager({screenshot}));
    });
  $("#send").addEventListener("click", function sendAll(event)
  {
    const sendButton = event.currentTarget;
    const lastStep = $("io-steps button:last-child");
    sendButton.removeEventListener("click", sendAll);
    sendButton.disabled = true;
    lastStep.disabled = false;
    lastStep.click();
    $("io-highlighter").addEventListener("changecolordepth", evt =>
    {
      const progress = $("#sendingProgress");
      const {max, value} = evt.detail;
      progress.max = max * 2;
      progress.value = value;
    });
    Promise.all([collectedData, manageSteps]).then(results =>
    {
      window.removeEventListener("beforeunload", closeMe);
      cancelButton.disabled = true;
      cancelButton.hidden = true;
      sendReport(reportWithScreenshot(...results));
      sendButton.textContent =
        browser.i18n.getMessage("issueReporter_closeButton_label");
      $("io-steps").setCompleted(-1, true);
    });
  });
  containsPermissions()
    .then(() =>
    {
      const includeConfig = $("#includeConfig");
      includeConfig.addEventListener("change", (event) =>
      {
        if (!includeConfig.checked)
        {
          updateConfigurationInfo(false);
          return;
        }
        event.preventDefault();
        browser.permissions.request(optionalPermissions)
          .then((granted) =>
          {
            return updateConfigurationInfo(granted)
              .then(() =>
              {
                includeConfig.checked = granted;
              });
          })
          .catch(console.error)
          .then(() => browser.permissions.remove(optionalPermissions))
          .then((success) =>
          {
            if (!success)
              throw new Error("Failed to remove permissions");
          })
          .catch(console.error);
      });
    })
    .catch((err) =>
    {
      const includeConfig = $("#includeConfigContainer");
      includeConfig.hidden = true;
    });
  const showDataOverlay = $("#showDataOverlay");
  $("#showData").addEventListener("click", event =>
  {
    event.preventDefault();
    collectedData.then(
      xmlReport =>
      {
        closeRequestsCollectingTab().then(() =>
        {
          showDataOverlay.hidden = false;
          reportWithScreenshot(xmlReport, {screenshot: $("io-highlighter")});
          const element = $("#showDataValue");
          element.textContent = asIndentedString(xmlReport);
          element.focus();
        });
      }
    );
  });
  $("#showDataClose").addEventListener("click", event =>
  {
    showDataOverlay.hidden = true;
    $("#showData").focus();
  });
});
let notifyClosing = true;
window.addEventListener("beforeunload", closeMe);
function closeMe()
{
  if (notifyClosing)
  {
    notifyClosing = false;
    browser.runtime.sendMessage({
      type: "app.get",
      what: "senderId"
    }).then(tabId => browser.tabs.remove(tabId));
  }
}
function reportWithScreenshot(xmlReport, stepsData)
{
  const {edited, data} = stepsData.screenshot;
  const element = $("screenshot", xmlReport.documentElement) ||
                  xmlReport.createElement("screenshot");
  element.setAttribute("edited", edited);
  const proc = browser.i18n.getMessage("issueReporter_processing_screenshot");
  element.textContent = data || `data:image/png;base64,...${proc}...`;
  xmlReport.documentElement.appendChild(element);
  return xmlReport;
}
function generateUUID(size = 8)
{
  const uuid = new Uint16Array(size);
  window.crypto.getRandomValues(uuid);
  uuid[3] = uuid[3] & 0x0FFF | 0x4000;
  uuid[4] = uuid[4] & 0x3FFF | 0x8000;
  const uuidChunks = [];
  for (let i = 0; i < uuid.length; i++)
  {
    const component = uuid[i].toString(16);
    uuidChunks.push(("000" + component).slice(-4));
    if (i >= 1 && i <= 4)
      uuidChunks.push("-");
  }
  return uuidChunks.join("");
}
function sendReport(reportData)
{
  const params = new URLSearchParams();
  for (const [param, value] of [
    ["version", 1],
    ["guid", generateUUID()],
    ["lang", $("adblock-plus", reportData)
                       .getAttribute("locale")]
  ])
  {
    params.append(param, value);
  }
  const url = "https://reports.adblockplus.org/submitReport?" + params;
  const reportSent = event =>
  {
    let success = false;
    let errorMessage = browser.i18n.getMessage(
      "filters_subscription_lastDownload_connectionError"
    );
    try
    {
      success = request.status == 200;
      if (request.status != 0)
        errorMessage = request.status + " " + request.statusText;
    }
    catch (e)
    {
    }
    let result;
    try
    {
      result = request.responseText;
    }
    catch (e)
    {
      result = "";
    }
    if (!success)
    {
      const errorElement = document.getElementById("error");
      const template = browser.i18n.getMessage("issueReporter_errorMessage")
                                    .replace(/[\r\n\s]+/g, " ");
      const [, before, linkText, after] =
              /(.*)\[link\](.*)\[\/link\](.*)/.exec(template) ||
              [null, "", template, ""];
      const beforeLink = before.replace(/\?1\?/g, errorMessage);
      const afterLink = after.replace(/\?1\?/g, errorMessage);
      while (errorElement.firstChild)
        errorElement.removeChild(errorElement.firstChild);
      const link = document.createElement("a");
      link.textContent = linkText;
      browser.runtime.sendMessage({
        type: "app.get",
        what: "doclink",
        link: "reporter_connect_issue"
      }).then(supportUrl =>
      {
        link.href = supportUrl;
      });
      errorElement.appendChild(document.createTextNode(beforeLink));
      errorElement.appendChild(link);
      errorElement.appendChild(document.createTextNode(afterLink));
      errorElement.hidden = false;
    }
    result = result.replace(
      /%CONFIRMATION%/g,
      encodeHTML(browser.i18n.getMessage("issueReporter_confirmationMessage"))
    );
    result = result.replace(
      /%KNOWNISSUE%/g,
      encodeHTML(browser.i18n.getMessage("issueReporter_knownIssueMessage"))
    );
    const {direction} = window.getComputedStyle(document.documentElement, "");
    result = result.replace(
      /(<html)\b/,
      `$1 dir="${encodeHTML(direction)}"`
    );
    document.getElementById("sendReportMessage").hidden = true;
    document.getElementById("sendingProgressContainer").hidden = true;
    const resultFrame = document.getElementById("result");
    resultFrame.setAttribute("src", "data:text/html;charset=utf-8," +
                                    encodeURIComponent(result));
    resultFrame.hidden = false;
    document.getElementById("continue").disabled = false;
    if (success)
    {
      $("#send").disabled = false;
      $("#send").addEventListener("click", closeMe);
    }
  };
  const request = new XMLHttpRequest();
  request.open("POST", url);
  request.setRequestHeader("Content-Type", "text/xml");
  request.setRequestHeader("X-Adblock-Plus", "1");
  request.addEventListener("load", reportSent);
  request.addEventListener("error", reportSent);
  const progress = document.getElementById("sendingProgress");
  request.upload.addEventListener("progress", event =>
  {
    if (!event.lengthComputable)
      return;
    if (event.loaded > 0)
    {
      progress.max = 100;
      progress.value = 50 + (50 * event.loaded) / event.total;
    }
  });
  request.send(asIndentedString(reportData));
}
function encodeHTML(str)
{
  return str.replace(/[&<>"]/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;"
  }[c]));
}})();
