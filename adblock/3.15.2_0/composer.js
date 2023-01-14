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
(function(){'use strict';function getErrorMessage(error)
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
}const i18nAttributes = ["alt", "placeholder", "title", "value"];
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
}let initialFilterText = "";
let targetPageId = null;
function onKeyDown(event)
{
  if (event.keyCode == 27)
  {
    event.preventDefault();
    closeDialog();
  }
}
function addFilters(reload = false)
{
  const textarea = document.getElementById("filters");
  browser.runtime.sendMessage({
    type: "filters.importRaw",
    text: textarea.value
  }).then((errors) =>
  {
    if (errors.length > 0)
    {
      errors = errors.map(getErrorMessage);
      alert(stripTagsUnsafe(errors.join("\n")));
    }
    else
      closeDialog(!reload, reload);
  });
}
async function closeMe()
{
  try
  {
    const tab = await browser.tabs.getCurrent();
    await browser.tabs.remove(tab.id);
  }
  catch (ex)
  {
    window.close();
  }
}
function closeDialog(apply = false, reload = false)
{
  document.getElementById("filters").disabled = true;
  browser.runtime.sendMessage({
    type: "composer.forward",
    targetPageId,
    payload:
    {
      type: "composer.content.finished",
      popupAlreadyClosed: true,
      reload,
      apply
    }
  }).then(() =>
  {
    closeMe();
  });
}
function resetFilters()
{
  browser.tabs.sendMessage(targetPageId, {
    type: "composer.content.finished"
  }).then(() =>
  {
    browser.tabs.sendMessage(targetPageId, {
      type: "composer.content.startPickingElement"
    }).then(closeMe);
  });
}
function previewFilters({currentTarget})
{
  const {preview} = currentTarget.dataset;
  const wasActive = preview === "active";
  const filtersTextArea = document.getElementById("filters");
  if (!wasActive)
    filtersTextArea.disabled = true;
  browser.runtime.sendMessage({
    type: "composer.forward",
    targetPageId,
    payload:
    {
      type: "composer.content.preview",
      active: !wasActive
    }
  }).then(() =>
  {
    if (wasActive)
      filtersTextArea.disabled = false;
    currentTarget.dataset.preview = wasActive ? "inactive" : "active";
    currentTarget.textContent =
      browser.i18n.getMessage(
        wasActive ? "composer_preview" : "composer_undo_preview"
      );
  });
}
function updateComposerState({currentTarget})
{
  const {value} = currentTarget;
  const disabled = !value.trim().length;
  const changed = (initialFilterText !== value);
  const block = document.getElementById("block");
  block.hidden = changed;
  block.disabled = disabled;
  const blockReload = document.getElementById("block-reload");
  blockReload.hidden = !changed;
  blockReload.disabled = disabled;
  document.getElementById("details").hidden = changed;
  document.getElementById("preview").disabled = changed;
}
function init()
{
  window.addEventListener("keydown", onKeyDown, false);
  const block = document.getElementById("block");
  block.addEventListener("click", () => addFilters());
  const blockReload = document.getElementById("block-reload");
  blockReload.addEventListener("click", () => addFilters(true));
  const preview = document.getElementById("preview");
  preview.addEventListener("click", previewFilters);
  const filtersTextArea = document.getElementById("filters");
  filtersTextArea.addEventListener("input", updateComposerState);
  document.getElementById("unselect").addEventListener(
    "click",
    () => resetFilters()
  );
  document.getElementById("cancel").addEventListener(
    "click",
    () => closeDialog()
  );
  ext.onMessage.addListener((msg, sender) =>
  {
    switch (msg.type)
    {
      case "composer.dialog.init":
        targetPageId = msg.sender;
        initialFilterText = msg.filters.join("\n");
        filtersTextArea.value = initialFilterText;
        filtersTextArea.disabled = false;
        preview.disabled = false;
        block.disabled = false;
        block.focus();
        document.getElementById("selected").dataset.count = msg.highlights;
        return true;
      case "composer.dialog.close":
        closeMe();
        break;
    }
  });
  window.removeEventListener("load", init);
}
initI18n();
window.addEventListener("load", init, false);})();
