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
    port.onDisconnect.addListener(onDisconnect$1);
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
function onDisconnect$1() {
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
connect();let blockelementPopupId = null;
let currentlyPickingElement = false;
let lastMouseOverEvent = null;
let currentElement = null;
let highlightedElementsSelector = null;
let highlightedElementsInterval = null;
let lastRightClickEvent = null;
let lastRightClickEventIsMostRecent = false;
let keepPreviewEnabled = false;
let previewSelectors = [];
function getURLFromElement(element)
{
  if (element.localName == "object")
  {
    if (element.data)
      return element.data;
    for (const child of element.children)
    {
      if (child.localName == "param" && child.name == "movie" && child.value)
        return new URL(child.value, document.baseURI).href;
    }
    return null;
  }
  return element.currentSrc || element.src;
}
function getFiltersForElement(element)
{
  const src = element.getAttribute("src");
  return browser.runtime.sendMessage({
    type: "composer.getFilters",
    tagName: element.localName,
    id: element.id,
    src: src && src.length <= 1000 ? src : null,
    style: element.getAttribute("style"),
    classes: Array.prototype.slice.call(element.classList),
    url: getURLFromElement(element)
  });
}
async function getBlockableElementOrAncestor(element)
{
  while (element && element != document.documentElement &&
         element != document.body)
  {
    if (!(element instanceof HTMLElement) || element.localName == "area")
    {
      element = element.parentElement;
    }
    else if (element.localName == "map")
    {
      const images = document.querySelectorAll("img[usemap]");
      let image = null;
      for (const currentImage of images)
      {
        const usemap = currentImage.getAttribute("usemap");
        const index = usemap.indexOf("#");
        if (index != -1 && usemap.substr(index + 1) == element.name)
        {
          image = currentImage;
          break;
        }
      }
      element = image;
    }
    else
    {
      const {filters} = await getFiltersForElement(element);
      if (filters.length > 0)
        return element;
      return getBlockableElementOrAncestor(element.parentElement);
    }
  }
  return null;
}
function addElementOverlay(element)
{
  let position = "absolute";
  let offsetX = window.scrollX;
  let offsetY = window.scrollY;
  for (let e = element; e; e = e.parentElement)
  {
    const style = getComputedStyle(e);
    if (style.display == "none")
      return null;
    if (style.position == "fixed")
    {
      position = "fixed";
      offsetX = offsetY = 0;
    }
  }
  const overlay = document.createElement("div");
  overlay.prisoner = element;
  overlay.className = "__adblockplus__overlay";
  overlay.setAttribute("style",
                       "opacity:0.4; display:inline-block !important; " +
                       "overflow:hidden; box-sizing:border-box;");
  const rect = element.getBoundingClientRect();
  overlay.style.width = rect.width + "px";
  overlay.style.height = rect.height + "px";
  overlay.style.left = (rect.left + offsetX) + "px";
  overlay.style.top = (rect.top + offsetY) + "px";
  overlay.style.position = position;
  overlay.style.zIndex = 0x7FFFFFFE;
  document.documentElement.appendChild(overlay);
  return overlay;
}
function highlightElement(element, border, backgroundColor)
{
  unhighlightElement(element);
  const highlightWithOverlay = () =>
  {
    const overlay = addElementOverlay(element);
    if (!overlay)
      return;
    highlightElement(overlay, border, backgroundColor);
    overlay.style.pointerEvents = "none";
    element._unhighlight = () =>
    {
      overlay.parentNode.removeChild(overlay);
    };
  };
  const highlightWithStyleAttribute = () =>
  {
    const originalBorder = element.style.getPropertyValue("border");
    const originalBorderPriority =
      element.style.getPropertyPriority("box-shadow");
    const originalBackgroundColor =
      element.style.getPropertyValue("background-color");
    const originalBackgroundColorPriority =
      element.style.getPropertyPriority("background-color");
    element.style.setProperty("border", `2px solid ${border}`, "important");
    element.style.setProperty("background-color", backgroundColor, "important");
    element._unhighlight = () =>
    {
      element.style.removeProperty("box-shadow");
      element.style.setProperty(
        "border",
        originalBorder,
        originalBorderPriority
      );
      element.style.removeProperty("background-color");
      element.style.setProperty(
        "background-color",
        originalBackgroundColor,
        originalBackgroundColorPriority
      );
    };
  };
  if ("prisoner" in element)
    highlightWithStyleAttribute();
  else
    highlightWithOverlay();
}
function unhighlightElement(element)
{
  if (element && "_unhighlight" in element)
  {
    element._unhighlight();
    delete element._unhighlight;
  }
}
function highlightElements(selectorString)
{
  unhighlightElements();
  const elements = Array.prototype.slice.call(
    document.querySelectorAll(selectorString)
  );
  highlightedElementsSelector = selectorString;
  highlightedElementsInterval = setInterval(() =>
  {
    if (elements.length > 0)
    {
      const element = elements.shift();
      if (element != currentElement)
        highlightElement(element, "#CA0000", "#CA0000");
    }
    else
    {
      clearInterval(highlightedElementsInterval);
      highlightedElementsInterval = null;
    }
  }, 0);
}
function unhighlightElements()
{
  if (highlightedElementsInterval)
  {
    clearInterval(highlightedElementsInterval);
    highlightedElementsInterval = null;
  }
  if (highlightedElementsSelector)
  {
    Array.prototype.forEach.call(
      document.querySelectorAll(highlightedElementsSelector),
      unhighlightElement
    );
    highlightedElementsSelector = null;
  }
}
function stopEventPropagation(event)
{
  event.stopPropagation();
}
async function mouseOver(event)
{
  lastMouseOverEvent = event;
  const element = await getBlockableElementOrAncestor(event.target);
  if (event == lastMouseOverEvent)
  {
    lastMouseOverEvent = null;
    if (currentlyPickingElement)
    {
      if (currentElement)
        unhighlightElement(currentElement);
      if (element)
        highlightElement(element, "#CA0000", "#CA0000");
      currentElement = element;
    }
  }
  event.stopPropagation();
}
function mouseOut(event)
{
  if (!currentlyPickingElement || currentElement != event.target)
    return;
  unhighlightElement(currentElement);
  event.stopPropagation();
}
function keyDown(event)
{
  if (!event.ctrlKey && !event.altKey && !event.shiftKey)
  {
    if (event.keyCode == 13)
      elementPicked(event);
    else if (event.keyCode == 27)
      deactivateBlockElement();
  }
}
function startPickingElement()
{
  currentlyPickingElement = true;
  Array.prototype.forEach.call(
    document.querySelectorAll("object,embed,iframe,frame"),
    async element =>
    {
      const {filters} = await getFiltersForElement(element);
      if (filters.length > 0)
        addElementOverlay(element);
    }
  );
  document.addEventListener("mousedown", stopEventPropagation, true);
  document.addEventListener("mouseup", stopEventPropagation, true);
  document.addEventListener("mouseenter", stopEventPropagation, true);
  document.addEventListener("mouseleave", stopEventPropagation, true);
  document.addEventListener("mouseover", mouseOver, true);
  document.addEventListener("mouseout", mouseOut, true);
  document.addEventListener("click", elementPicked, true);
  document.addEventListener("contextmenu", elementPicked, true);
  document.addEventListener("keydown", keyDown, true);
  api.addDisconnectListener(onDisconnect);
}
async function previewBlockedElements(active)
{
  if (!currentElement)
    return;
  const element = currentElement.prisoner || currentElement;
  const overlays = document.querySelectorAll(".__adblockplus__overlay");
  previewBlockedElement(element, active, overlays);
  let selectors;
  if (active)
  {
    ({selectors} = await getFiltersForElement(element));
    previewSelectors = selectors;
  }
  else
  {
    selectors = previewSelectors;
    previewSelectors = [];
  }
  if (selectors.length > 0)
  {
    const cssQuery = selectors.join(",");
    for (const node of document.querySelectorAll(cssQuery))
      previewBlockedElement(node, active, overlays);
  }
}
function previewBlockedElement(element, active, overlays)
{
  const display = active ? "none" : null;
  const find = Array.prototype.find;
  const overlay = find.call(overlays, ({prisoner}) => prisoner === element);
  if (overlay)
    overlay.style.display = display;
  element.style.display = display;
}
async function elementPicked(event)
{
  if (!currentElement)
    return;
  event.preventDefault();
  event.stopPropagation();
  const element = currentElement.prisoner || currentElement;
  const {filters, selectors} = await getFiltersForElement(element);
  if (currentlyPickingElement)
    stopPickingElement();
  highlightElement(currentElement, "#CA0000", "#CA0000");
  let highlights = 1;
  if (selectors.length > 0)
  {
    const cssQuery = selectors.join(",");
    highlightElements(cssQuery);
    highlights = document.querySelectorAll(cssQuery).length;
  }
  const popupId = await browser.runtime.sendMessage({
    type: "composer.openDialog",
    filters,
    highlights
  });
  if (window == window.top)
  {
    blockelementPopupId = popupId;
  }
  else
  {
    browser.runtime.sendMessage({
      type: "composer.forward",
      payload: {type: "composer.content.dialogOpened", popupId}
    });
  }
}
function stopPickingElement()
{
  currentlyPickingElement = false;
  document.removeEventListener("mousedown", stopEventPropagation, true);
  document.removeEventListener("mouseup", stopEventPropagation, true);
  document.removeEventListener("mouseenter", stopEventPropagation, true);
  document.removeEventListener("mouseleave", stopEventPropagation, true);
  document.removeEventListener("mouseover", mouseOver, true);
  document.removeEventListener("mouseout", mouseOut, true);
  document.removeEventListener("click", elementPicked, true);
  document.removeEventListener("contextmenu", elementPicked, true);
  document.removeEventListener("keydown", keyDown, true);
}
function deactivateBlockElement(popupAlreadyClosed)
{
  if (!keepPreviewEnabled)
    previewBlockedElements(false);
  if (currentlyPickingElement)
    stopPickingElement();
  if (blockelementPopupId != null && !popupAlreadyClosed)
  {
    browser.runtime.sendMessage({
      type: "composer.forward",
      targetPageId: blockelementPopupId,
      payload:
      {
        type: "composer.dialog.close"
      }
    });
  }
  blockelementPopupId = null;
  lastRightClickEvent = null;
  if (currentElement)
  {
    unhighlightElement(currentElement);
    currentElement = null;
  }
  unhighlightElements();
  const overlays = document.getElementsByClassName("__adblockplus__overlay");
  while (overlays.length > 0)
    overlays[0].parentNode.removeChild(overlays[0]);
  api.removeDisconnectListener(onDisconnect);
}
function onDisconnect()
{
  deactivateBlockElement(true);
}
function initializeComposer()
{
  document.addEventListener("contextmenu", event =>
  {
    lastRightClickEvent = event;
    lastRightClickEventIsMostRecent = true;
    browser.runtime.sendMessage({
      type: "composer.forward",
      payload:
      {
        type: "composer.content.clearPreviousRightClickEvent"
      }
    });
  }, true);
  ext.onMessage.addListener((message, sender) =>
  {
    switch (message.type)
    {
      case "composer.content.preview":
        previewBlockedElements(message.active);
        break;
      case "composer.content.getState":
        if (window == window.top)
        {
          return {
            active: currentlyPickingElement || blockelementPopupId != null
          };
        }
        break;
      case "composer.content.startPickingElement":
        if (window == window.top)
          startPickingElement();
        break;
      case "composer.content.contextMenuClicked":
        const event = lastRightClickEvent;
        deactivateBlockElement();
        if (event)
        {
          getBlockableElementOrAncestor(event.target).then(element =>
          {
            if (element)
            {
              currentElement = element;
              elementPicked(event);
            }
          });
        }
        break;
      case "composer.content.finished":
        if (currentElement && message.apply)
        {
          keepPreviewEnabled = true;
          previewBlockedElements(true);
        }
        deactivateBlockElement(!!message.popupAlreadyClosed);
        if (message.reload)
          location.reload();
        break;
      case "composer.content.clearPreviousRightClickEvent":
        if (!lastRightClickEventIsMostRecent)
          lastRightClickEvent = null;
        lastRightClickEventIsMostRecent = false;
        break;
      case "composer.content.dialogOpened":
        if (window == window.top)
          blockelementPopupId = message.popupId;
        break;
      case "composer.content.dialogClosed":
        if (window == window.top && blockelementPopupId == message.popupId)
        {
          browser.runtime.sendMessage({
            type: "composer.forward",
            payload:
            {
              type: "composer.content.finished",
              popupAlreadyClosed: true
            }
          });
        }
        break;
    }
  });
  if (window == window.top)
    browser.runtime.sendMessage({type: "composer.ready"});
}
if (document instanceof HTMLDocument && location.href != "about:blank")
  initializeComposer();})();
