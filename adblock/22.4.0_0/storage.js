/* globals EWE, browser */

// Simple wrappers to make it easier to control storage access in one place

/** Flag that is true if the data storage is corrupted and should not be used */
let dataCorrupted = false;

/**
 * Returns the data corruption state for the storage system or sets a new value if called with a boolean.
 *
 * @param [value] {boolean} true if the data storage system should be marked as corrupted, call without arguments to retrieve the value.
 * @return {boolean} true if the data storage system is corrupted.
 */
export function isDataCorrupted(value) {
  if (typeof value === "boolean") {
    dataCorrupted = value;
  }
  return dataCorrupted;
}

/**
 * Stores one or more items in the local browser storage area or update existing items.
 *
 * @param keys {object} object containing one or more key/value pairs to be stored in storage. If an item already exists, its value will be updated.
 * @return {Promise<>} promise fulfilled by no arguments if operation succeeded.
 */
export function storageLocalSet(keys) {
  // noinspection JSValidateTypes
  return browser.storage.local.set(keys);
}

/**
 * Retrieves one or more items from the browser local storage area.
 *
 * @param key {null|string|object|string[]} A key (string) or keys (an array of strings, or an object specifying default values) to identify the item(s) to be retrieved from storage. If you pass an empty object or array here, an empty object will be retrieved. If you pass null, or an undefined value, the entire storage contents will be retrieved.
 * @return {Promise<object>} the data found in storage
 */
export function storageLocalGet(key) {
  // noinspection JSValidateTypes
  return browser.storage.local.get(key);
}

/**
 * Removes one or more items from the storage area.
 *
 * @param key {string|string[]} A string, or array of strings, representing the key(s) of the item(s) to be removed.
 * @return {Promise<>} A Promise that will be fulfilled with no arguments if the operation succeeded. If the operation failed, the promise will be rejected with an error message.
 */
export function storageLocalRemove(key) {
  // noinspection JSValidateTypes
  return browser.storage.local.remove(key);
}

/**
 * We need to check whether we can safely write to/read from storage
 * before we start relying on it for storing preferences.
 */
export async function testStorage() {
  let testKey = "readwrite_test";
  let testValue = Math.random();

  try {
    await storageLocalSet({ [testKey]: testValue });
    let result = await storageLocalGet(testKey);
    if (result[testKey] !== testValue)
      throw new Error("Storage test: Failed to read and write value");
  } finally {
    await storageLocalRemove(testKey);
  }
}
