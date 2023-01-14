/* globals EWE, browser */
"use strict";

import { storageLocalGet, testStorage, isDataCorrupted } from "./storage.js";
import { detectFirstRun } from "./first-run.js";
import { addRuntimeMessageListener } from "./browser.js";
import { Blocker, PAUSED_KEY } from "./blocker.js";
import { Telemetry } from "./telemetry.js";
import { Subscriptions } from "./subscriptions.js";
import isolatedV3Code from "./mv3.isolated.mjs";
import injectedV3Code from "./mv3.injected.mjs";
import {
  debugError,
  debugGetLastError,
  filtersGet,
  filtersImportRaw,
  filtersRemove,
  subscriptionsGet,
  subscriptionsRemove,
} from "./qa-messages.js";

// -----------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------
const ADDON_NAME = "uBlock";
const ADDON_VERSION = "0.1.0";

if (typeof EWE === "undefined" || typeof browser === "undefined") {
  // TODO bail
}

// -----------------------------------------------------------------------
// Pre-start
// -----------------------------------------------------------------------

const blocker = new Blocker(ADDON_NAME, ADDON_VERSION);
const telemetry = new Telemetry(ADDON_NAME, ADDON_VERSION);
const subscriptions = new Subscriptions();

// Register listeners
addRuntimeMessageListener("getTabInfo", (msg) =>
  blocker.getTabInfo(false, msg.tabId)
);
addRuntimeMessageListener("pause", () => blocker.isPaused(true));
addRuntimeMessageListener("resume", () => blocker.isPaused(false));
addRuntimeMessageListener("allow", (msg) =>
  blocker.createDomainAllowListFilter(msg.url, msg.origin)
);
addRuntimeMessageListener("clear", (msg) =>
  blocker.tryToRemoveAllowList(msg.url, msg.tabId)
);

// QA listeners
addRuntimeMessageListener("error", debugError);
addRuntimeMessageListener("subscriptions.get", subscriptionsGet);
addRuntimeMessageListener("subscriptions.remove", subscriptionsRemove);
addRuntimeMessageListener("filters.get", filtersGet);
addRuntimeMessageListener("filters.remove", filtersRemove);
addRuntimeMessageListener("filters.importRaw", filtersImportRaw);
addRuntimeMessageListener("debug.getLastError", debugGetLastError);

// -----------------------------------------------------------------------
// Startup
// -----------------------------------------------------------------------

// If uBlock was paused on shutdown (ublock_is_paused is true), then
// unpause / remove the allow-list all entry at startup.
storageLocalGet(PAUSED_KEY).then((response) => {
  if (response[PAUSED_KEY]) {
    initialize.then(() => {
      blocker.isPaused(false);
    });
  }
});

const initialize = (async function initialize() {
  EWE.snippets.setLibrary({
    isolatedCode: isolatedV3Code,
    injectedCode: injectedV3Code,
  });
  const [eweFirstRun] = await Promise.all([
    EWE.start({ name: ADDON_NAME, version: ADDON_VERSION }),
    testStorage().catch(() => {
      isDataCorrupted(true);
    }),
  ]);

  await detectFirstRun(
    eweFirstRun.foundSubscriptions,
    eweFirstRun.foundStorage
  );
  // Add default filter lists
  blocker.addSubscriptions();
  // Clean up any "extra" filter lists
  await blocker.removeSubscriptions();
  // Start telemetry
  await telemetry.scheduleStatsEvent();
  // Start subscription sync
  await subscriptions.scheduleSyncEvent();
})();
