/* globals browser */

import { isTrustedSender } from "./trust.js";

export function getURL(path) {
  // noinspection JSUnresolvedFunction
  return browser.runtime.getURL(path);
}

/**
 * Retrieve management info for the extension if it exists.
 *
 * @return {Promise<{installType:string}|null>} management info or null if none found
 */
export async function getManagementInfo() {
  if (browser.management && browser.management.getSelf) {
    return await browser.management.getSelf();
  }
  return null;
}

/**
 * Adds a browser runtime message listener that is handled by the given function.
 * The function must return a promise that resolves to the response to return
 * to the sender.
 *
 * @param msg {string} the message that the listener is looking for.
 * @param fn {function} a function that returns a promise (or is async) to handle the message
 */
export function addRuntimeMessageListener(msg, fn) {
  // noinspection JSUnresolvedFunction
  browser.runtime.onMessage.addListener((cmd, sender) => {
    if (cmd && cmd["type"] === msg && isTrustedSender(sender)) {
      return fn(cmd);
    }
  });
}
