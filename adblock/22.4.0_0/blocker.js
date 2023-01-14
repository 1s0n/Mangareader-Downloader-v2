/* globals EWE */

import { parseUri } from "./utils.js";
import {
  storageLocalGet,
  storageLocalRemove,
  storageLocalSet,
  isDataCorrupted,
} from "./storage.js";
import { isFirstRun } from "./first-run.js";
import { openInstalled } from "./slash-installed.js";

// storage key paused state is saved under
export const PAUSED_KEY = "ub_paused";
// allow-list all blocking requests regardless of frame / document, but still allows element hiding
const PAUSED_FILTER_TEXT1 = "@@*";
// allow-list all documents, which prevents element hiding
const PAUSED_FILTER_TEXT2 = "@@*$document";

/**
 * The ad blocking manager.
 */
export class Blocker {
  constructor(name, version) {
    this.name = name;
    this.version = version;
  }

  /**
   * Checks if the given URL can have the ad blocker running on it.
   *
   * @param url {string|URL} the url to check
   * @returns {boolean} true if the ad blocker cannot be blocked
   */
  isPageUnblockable(url) {
    if (!url) {
      // Protect against empty URLs - e.g. Safari empty/bookmarks/top sites page
      return true;
    }
    let scheme;
    if (!url.protocol) {
      scheme = parseUri(url).protocol;
    } else {
      scheme = url.protocol;
    }
    return scheme !== "http:" && scheme !== "https:" && scheme !== "feed:";
  }

  /**
   * Get or set if uBlock is paused
   *
   * @param [newValue] {boolean} undefined to retrieve paused state, true if uBlock will be paused, false to unpause.
   * @returns {boolean|undefined} undefined if newValue was specified, otherwise, it returns true if paused, false otherwise
   */
  async isPaused(newValue) {
    if (newValue === undefined) {
      const paused = await storageLocalGet(PAUSED_KEY);
      return paused[PAUSED_KEY] === true;
    }
    if (newValue === true) {
      await storageLocalSet({ [PAUSED_KEY]: true });
      EWE.filters.add([PAUSED_FILTER_TEXT1]);
      EWE.filters.add([PAUSED_FILTER_TEXT2]);
    } else {
      EWE.filters.remove([PAUSED_FILTER_TEXT1]);
      EWE.filters.remove([PAUSED_FILTER_TEXT2]);
      await storageLocalRemove(PAUSED_KEY);
    }
    return undefined;
  }

  /**
   * Creates a custom filter entry that allow-lists a given domain
   * @param pageUrl {string} url of the page
   * @param origin {string} the source or trigger for the filter list entry
   * @return {Promise<*|null|undefined>} null if successful, otherwise an exception
   */
  async createDomainAllowListFilter(pageUrl, origin) {
    const theURL = new URL(pageUrl);
    const host = theURL.hostname.replace(/^www\./, "");
    const filter = `@@||${host}/*^$document`;
    return this.addCustomFilter(filter, origin);
  }

  /**
   * Look for a custom filter that would allow-list the 'url' parameter
   * and if any exist, remove the first one.
   * @param pageUrl {string} a URL that may be allow-listed by a custom filter
   * @param tabId {int} tab id of the tab that may be allow-listed by a custom filter
   * @return {Promise<boolean>} true if a filter was found and removed; false otherwise.
   */
  async tryToRemoveAllowList(pageUrl, tabId) {
    const url = pageUrl.replace(/#.*$/, ""); // Whitelist ignores anchors
    const customFilters = await this.getUserFilters();
    if (!customFilters || customFilters.length === 0) {
      return false;
    }

    /* eslint-disable no-await-in-loop */
    for (let i = 0; i < customFilters.length; i++) {
      const { text } = customFilters[i];
      const allow = text.search(/@@\*\$document,domain=~/);
      // Remove allow-list site, which is allow-listed by global @@*&document,domain=~
      // filter
      if (allow > -1) {
        // Remove protocols
        const [finalUrl] = url
          .replace(/((http|https):\/\/)?(www.)?/, "")
          .split(/[/?#]/);
        await EWE.filters.remove([text]);
        await EWE.filters.remove([`${text}|~${finalUrl}`]);
        return true;
      }
      if (
        this.isAllowlistFilter(text) &&
        EWE.filters.getAllowingFilters(tabId).includes(text)
      ) {
        await EWE.filters.remove([text]);
        return true;
      }
    }
    return false;
  }

  /**
   * Checks if the given filter is an allow-list filter rule.
   * @param text {string} the filter rule to check
   * @return {boolean} true if the rule is an allow-list rule.
   */
  isAllowlistFilter(text) {
    return /^@@/.test(text);
  }

  /**
   * Retrieve all user filters.
   *
   * @return {Promise<*>} promise resolving to all the user filters.
   */
  async getUserFilters() {
    return EWE.filters.getUserFilters();
  }

  /**
   * Add a new custom filter entry.
   * @param filterText {string} line of text to add to custom filters.
   * @param origin {string} the source or trigger for the filter list entry
   * @return {Promise<string|null|*>} null if successful, otherwise an exception
   */
  async addCustomFilter(filterText, origin) {
    try {
      const response = EWE.filters.validate(filterText);
      if (response) {
        return response;
      }
      await EWE.filters.add([filterText], this.createFilterMetaData(origin));
      await EWE.filters.enable([filterText]);
      return null;
    } catch (ex) {
      // convert to a string so that Safari can pass
      // it back to content scripts
      return ex.toString();
    }
  }

  /**
   * Creates the meta-data to be saved with a users custom filter rules.
   *
   * - created - an integer representing the number of milliseconds elapsed since January 1, 1970 00:00:00 UTC.
   * - origin - a string representing the method the user added the filter rule
   *
   * @param [origin] {string} a string representing the method the user added the filter rule
   * @return {{created:number}|{created:number, origin:string}} a new meta-data object for the filter containing a created timestamp
   */
  createFilterMetaData(origin) {
    const data = { created: Date.now() };
    if (origin) {
      data.origin = origin;
    }
    return data;
  }

  /**
   * Add subscriptions on first run and configure AA.
   */
  addSubscriptions() {
    // Remove "acceptable ads" if Gecko
    // Add "uBlock Custom" subscriptions
    if (isFirstRun()) {
      // TODO we need to remove AA from Gecko - detect and enforce
      // We are going to do that anyway for our launch
      // if (info.platform === "gecko") {
      try {
        EWE.subscriptions.remove(EWE.subscriptions.ACCEPTABLE_ADS_URL);
      } catch (ex) {
        console.error(`Failed to remove AA subscription`);
      }
      // }

      // TODO we currently don't have uBlock custom subscriptions (or a CDN)
      // try {
      //   EWE.subscriptions.add("https://cdn.ublockcdn.com/filters/ublock_custom.txt");
      //   EWE.subscriptions.sync("https://cdn.ublockcdn.com/filters/ublock_custom.txt");
      // }
      // catch (ex) {
      //   console.error(`Failed to add additional subscription`);
      // }
    }

    // Show first run page or the updates page. The latter is only shown
    // on Chromium (since the current updates page announces features that
    // aren't new to Firefox users), and only if this version of the
    // updates page hasn't been shown yet.

    // Always show the first run page if a data corruption was detected
    // (either through failure of reading from or writing to storage.local).
    // The first run page could notify the user about the data corruption.
    if (isFirstRun() || isDataCorrupted()) {
      // TODO we may also want to clean out any old storage data that we aren't using
      openInstalled();
    }
  }

  /**
   * Remove any subscriptions that a user or administrator has added to a
   * central / common configuration (such as the Windows Registry)
   *
   * @return {Promise}
   */
  removeSubscriptions() {
    return new Promise((resolve) => {
      if ("managed" in browser.storage) {
        storageLocalGet(null).then(
          (items) => {
            for (let key in items) {
              if (
                key === "remove_subscriptions" &&
                Array.isArray(items[key]) &&
                items[key].length
              ) {
                for (let inx = 0; inx < items[key].length; inx++) {
                  EWE.subscriptions.remove(items[key][inx]);
                }
              }
            }
            resolve();
          },

          // Opera doesn't support browser.storage.managed, but instead of simply
          // removing the API, it gives an asynchronous error which we ignore here.
          () => {
            resolve();
          }
        );
      } else {
        resolve();
      }
    });
  }

  /**
   * Obtain meta-data about the current tab and the extension's state on that tab.
   *
   * info object passed to resolve: {
   * page: Page object
   * tab: Tab object
   * allowListed: bool - whether the current tab's URL is allow-listed.
   * disabled_site: bool - true if the url is e.g. about:blank or the
   * Extension Gallery, where extensions don't run.
   * settings: Settings object
   * paused: bool - whether AdBlock is paused
   * domainPaused: bool - whether the current tab's URL is paused
   * blockCountPage: int - number of ads blocked on the current page
   * blockCountTotal: int - total number of ads blocked since install
   * customFilterCount: int - number of custom rules for the current tab's URL
   * showMABEnrollment: bool - whether to show MAB enrollment
   * popupMenuThemeCTA: string - name of current popup menu CTA theme
   * lastGetStatusCode: int - status code for last GET request
   * lastGetErrorResponse: error object - error response for last GET request
   * lastPostStatusCode: int - status code for last POST request
   * allowListRuleText: string - allow-list rule text for use on YouTube and Twitch
   * }
   *
   * @param secondTime {boolean} true if the method is being called recursively
   * @param [tabId] {int} the tab to obtain data about, or undefined for the current active tab
   * @returns {Promise<{stack: *, message, errorStr: string}|{}|{disabledSite: boolean, settings: *, paused: (boolean|undefined), domainPaused: (any|boolean), id, url: string}>}
   */
  async getTabInfo(secondTime, tabId) {
    const tab = await this.getTab(tabId);
    if (tab && !tab.url) {
      // Issue 6877: tab URL is not set directly after you opened a window
      // using window.open()
      if (!secondTime) {
        window.setTimeout(() => {
          return this.getTabInfo(true);
        }, 250);
      }
      return {};
    }
    try {
      const disabledSite = this.isPageUnblockable(tab.url);

      const result = {
        disabledSite,
        url: String(tab.url),
        id: tab.id,
        paused: await this.isPaused(),
      };
      if (!disabledSite) {
        result.allowListed = !!EWE.filters.getAllowingFilters(tab.id).length;
        result.allowListedText = EWE.filters.getAllowingFilters(tab.id);
      }
      return result;
    } catch (err) {
      return {
        errorStr: err.toString(),
        stack: err.stack,
        message: err.message,
      };
    }
  }

  /**
   * Get a tab by ID or the current focused tab if no ID provided.
   *
   * @param [tabId] {int} the ID of the tab to locate or undefined to retrieve the current active tab
   * @returns {Promise<object>} the tab found (https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/Tab)
   */
  async getTab(tabId) {
    if (tabId) {
      let id = tabId;
      if (typeof id === "string") {
        id = parseInt(id, 10);
      }
      return await browser.tabs.get(id);
    } else {
      const tabs = await browser.tabs.query({
        active: true,
        lastFocusedWindow: true,
      });
      if (tabs.length === 0) {
        return; // For example: only the background devtools or a popup are opened
      }
      return tabs[0];
    }
  }
}
