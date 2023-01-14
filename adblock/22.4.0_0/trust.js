import { getURL } from "./browser.js";

// -----------------------------------------------------------------------
// Message verification
// -----------------------------------------------------------------------

/** Trusted uBlock domains allowed to trigger extension actions. */
const UB_HOSTNAMES = ["https://ublock.org", "https://help.ublock.org"];

// noinspection JSUnresolvedFunction
/** Base URL of the extension */
const TRUSTED_BASE_URL = getURL("");

/**
 * Checks if the sender is trusted - originating from the popup.
 *
 * @param sender {object} - the message sender (see web extension browser.runtime.sendMessage API)
 * @param sender.url {string} - the url sending the message
 * @returns {boolean} - true if the sender is trusted
 */
export function isTrustedSender(sender) {
  return sender.url.startsWith(TRUSTED_BASE_URL);
}

/**
 * Checks if the target is trusted - either the extension or one of the trusted uBlock domains.
 *
 * @param url {string} - the URL of the target
 * @returns {boolean} - true if the target is trusted
 */
export function isTrustedTarget(url) {
  return (
    url.startsWith(TRUSTED_BASE_URL) ||
    UB_HOSTNAMES.includes(new URL(url).origin)
  );
}

/**
 * Checks if the sender's domain is trusted - originating from trusted domains or the popup.
 *
 * @param sender {object} the message sender (see web extension browser.runtime.sendMessage API)
 * @param sender.origin {string} the origin of the sender
 * @param sender.url {string} the url of the sender
 * @returns {boolean} - true if the sender's domain is trusted
 */
export function isTrustedSenderDomain(sender) {
  if (sender.origin) {
    return UB_HOSTNAMES.includes(sender.origin);
  }
  if (sender.url) {
    return UB_HOSTNAMES.includes(new URL(sender.url).origin);
  }
  return false;
}
