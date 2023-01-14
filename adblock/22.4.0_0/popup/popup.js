/* globals browser */
"use strict";

/**
 * Popup encapsulates all the functionality for the popup.
 */
class Popup {
  /**
   * Create a new popup.
   */
  constructor() {
    // immediately grab the current tab info for the popup
    let tabId;
    if (
      document.location.search &&
      document.location.search.indexOf("tabId") > 0
    ) {
      const params = new URLSearchParams(document.location.search);
      tabId = params.get("tabId");
      if (tabId === "error") {
        // allows testing of the error handling logic
        console.log("throwing error");
        throw new Error("anError");
      }
    }
    this.sendMessage("getTabInfo", tabId).then((tabInfo) => {
      if (tabInfo) {
        this.onTabInfo(tabInfo);
      }
    });

    // Setup translations
    this.needsUpdateContent = false; // flag to know if we should do an update later
    let initialized = false; // prevent languageChanged events from firing before init is done
    i18next.on("languageChanged", () => {
      if (initialized) {
        this.updateContent(i18next.t);
      }
    });
    i18next
      .use(i18nextHttpBackend)
      .use(i18nextBrowserLanguageDetector)
      .init({
        fallbackLng: "en",
        supportedLngs: [
          "de",
          "en",
          "es",
          "fr",
          "it",
          "ja",
          "nl",
          "pt-BR",
          "ru",
          "sv",
          "zh-CN",
          "zh-TW",
          "zh-HK",
          "zh"
        ],
        debug: false,
        ns: ["common"],
        defaultNS: "common",
        backend: {
          loadPath: "/popup/i18n/{{ns}}-{{lng}}.json",
          crossDomain: false,
        },
      })
      .then((t) => {
        initialized = true;
        this.updateContent(t);
      })
      .catch((err) => console.log("trouble loading i18n", err));
  }

  // -----------------------------------------------------------------------
  // i18n
  // -----------------------------------------------------------------------
  updateContent(t) {
    this.needsUpdateContent = false;
    this.translateId(t, "allow");
    this.translateId(t, "clear");
    this.translateId(t, "allowing");
    this.translateId(t, "nothing");
    this.translateClass(t, "resume");
    this.translateClass(t, "pause");
    this.translateClass(t, "allow");
    // try again in a little while - sometimes we can be just a little too fast
    if (this.needsUpdateContent) {
      setTimeout(() => this.updateContent(t), 100);
    }
  }

  /**
   * Translate using the given translator assuming the id and translation key
   * is the same.
   *
   * @param t {function} translation function
   * @param id {string} id if the element to set innerText
   */
  translateId(t, id) {
    const el = document.getElementById(id);
    if (el) {
      el.innerText = t(id, {});
    } else {
      this.needsUpdateContent = true;
    }
  }

  /**
   * Translate using the given translator all elements wih the class name
   * `<name>-text` and translation key name.
   * @param t {function} translation function
   * @param name {string} name of the element class and translation key
   */
  translateClass(t, name) {
    const elements = document.getElementsByClassName(name + "-text");
    if (elements.length === 0) {
      this.needsUpdateContent = true;
      return;
    }
    const text = t(name, {});
    for (let i = 0; i < elements.length; i++) {
      elements[i].innerText = text;
    }
  }

  // -----------------------------------------------------------------------
  // State management
  // -----------------------------------------------------------------------

  /**
   * onTabInfo updates the UI state based on the current tab information.
   *
   * @param tabInfo {object} information on the current tab
   * @param tabInfo.disabledSite {boolean} true if the current page is unblockable
   * @param tabInfo.paused {boolean} true if the ad blocker is paused
   * @param tabInfo.allowListed {boolean} true if the ad locker is allow-listed on the current page
   */
  onTabInfo(tabInfo) {
    const container = document.getElementById("content");
    let template;
    if (tabInfo.disabledSite) {
      template = document.getElementById("offline");
    } else if (tabInfo.paused) {
      template = document.getElementById("paused");
    } else if (tabInfo.allowListed) {
      template = document.getElementById("allowed");
    } else {
      template = document.getElementById("running");
    }
    const clone = template.content.cloneNode(true);
    container.appendChild(clone);
    if (tabInfo.disabledSite) {
      return;
    }
    if (tabInfo.paused) {
      this.addClickHandler("resume");
      this.addStyle(
        "body",
        "background: linear-gradient(153.37deg, #666666 12.24%, #333333 78.38%);"
      );
    } else if (tabInfo.allowListed) {
      this.addClickHandler("clear");
    } else {
      this.addClickHandler("pause");
      this.addClickHandler("allow");
    }
  }

  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------

  /**
   * Set style on element.
   *
   * @param tag {string} name of the element to apply the style
   * @param style {string} the style as a string to apply
   */
  addStyle(tag, style) {
    for (let el of document.getElementsByTagName(tag)) {
      el.setAttribute("style", style);
    }
  }

  /**
   * Add a click handler for the given ID preventing default behavior.
   *
   * @param id {string} the id of the element to attach the click handler
   */
  addClickHandler(id) {
    const el = document.getElementById(id);
    if (!el) {
      console.log("missing element", id);
      return;
    }
    el.addEventListener("click", (ev) => {
      ev.stopImmediatePropagation();
      ev.preventDefault();
      this.sendMessageAndReload(id);
    });
  }

  /**
   * Reload the browser tabs because of a change in ad blocker state.
   * This is a simple wrapper around the web extensions API so that we
   * can instrument this action later if we want to.
   */
  reloadTabs() {
    browser.tabs.reload();
  }

  /**
   * We needed to reload popover in Safari, so that we could
   * update popover according to the status of AdBlock.
   * We don't need to reload popup in Chrome because Chrome
   * reloads every time the popup for us.
   * Leaving the behavior centralized just in case Chrome changes.
   */
  closeAndReloadPopup() {
    window.close();
  }

  /**
   * send a message to the background page.
   *
   * @param name {string} the name of the message to send
   * @param [tabId] {int} the id of the tab to send a message if overriding the current active
   * @return {Promise<object>|Promise<>} a promise that resolves to the response from the background page (or undefined if no response was sent)
   */
  async sendMessage(name, tabId) {
    if (typeof tabId === "string") {
      tabId = parseInt(tabId);
    }
    if (typeof tabId === "number" && !isNaN(tabId)) {
      try {
        const tab = await browser.tabs.get(tabId);
        const msg = {
          type: name,
          tabId: tabId,
          url: tab.url,
        };
        return browser.runtime.sendMessage(msg);
      } catch (err) {
        // Should we do something with the error?
        // console.log("error loading tab", err);
      }
    }
    // If there is no overriding tab, or it could not be found...
    const tabs = await browser.tabs.query({
      active: true,
      lastFocusedWindow: true,
    });
    const msg = { type: name };
    if (tabs.length > 0) {
      const tab = tabs[0];
      msg.tabId = tab.id;
      msg.url = tab.url;
    }
    return browser.runtime.sendMessage(msg);
  }

  /**
   * send a message to the background page, and when there is a successful return,
   * reload tabs and close the popup.
   *
   * @param name {string} name of message to send
   */
  sendMessageAndReload(name) {
    this.sendMessage(name).then(() => {
      this.reloadTabs();
      this.closeAndReloadPopup();
    });
  }
}

// -----------------------------------------------------------------------
// Start
// -----------------------------------------------------------------------

const popup = new Popup();
