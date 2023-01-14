// Message handlers specifically to support QA testing of the extension

let lastError;

export function subscriptionsGet(msg) {
  return [];
  /*
  const subscriptions = [];
  for (const s of filterStorage.subscriptions())
  {
    if (msg.ignoreDisabled && s.disabled)
      continue;

    if (msg.downloadable && !(s instanceof DownloadableSubscription))
      continue;

    if (msg.special && !(s instanceof SpecialSubscription))
      continue;

    const subscription = convertSubscription(s);
    if (msg.disabledFilters)
    {
      subscription.disabledFilters =
        Array.from(s.filterText(), Filter.fromText)
          .filter((f) => f instanceof ActiveFilter && f.disabled)
          .map((f) => f.text);
    }
    subscriptions.push(subscription);
  }
  return subscriptions;
   */
}

export function subscriptionsRemove(msg) {}

export function filtersGet(msg) {
  return [];
  /*
  const subscription = Subscription.fromURL(msg.subscriptionUrl);
  if (!subscription)
    return [];

  return convertSubscriptionFilters(subscription);
   */
}

export function filtersRemove(msg) {}

export function filtersImportRaw(msg) {}

export function debugError(msg) {
  if (!msg || !msg.error) {
    return;
  }
  if (typeof msg === "string") {
    lastError = msg.error;
    return;
  }
  try {
    lastError = String(msg.error);
  } catch {
    lastError = "<string conversion error>";
  }
}

export function debugGetLastError() {
  let error = lastError;
  lastError = null;
  return error;
}
