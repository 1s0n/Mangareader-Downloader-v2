/* globals EWE */
let firstRun = true;
let reinitialized = false;

/**
 * Returns true if the extension is in "first run" mode.
 *
 * @return {boolean} true if extension is in "first run" mode.
 */
export function isFirstRun() {
  return firstRun;
}

/**
 * If there aren't any filters, the default subscriptions are added.
 * However, if patterns.ini already did exist and/or any preference
 * is set to a non-default value, this indicates that this isn't the
 * first run, but something went wrong.
 *
 * This function detects the first run, and makes sure that the user
 * gets notified (on the first run page) if the data appears incomplete
 * and therefore will be reinitialized.
 */
export async function detectFirstRun(foundSubscriptions, foundStorage) {
  let userFilters = await EWE.filters.getUserFilters();
  firstRun = !foundSubscriptions && !userFilters.length;

  if (firstRun && foundStorage) reinitialized = true;
}
