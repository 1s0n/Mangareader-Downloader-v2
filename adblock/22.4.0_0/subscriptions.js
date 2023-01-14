/* globals EWE */

import { storageLocalGet, storageLocalSet } from "./storage.js";

const SUBS_KEY = "ub_subs";

export class Subscriptions {
  /**
   * Sync begins an asynchronous download of filter subscriptions and schedules the next sync event.
   *
   * @return {Promise<void>} a promise that resolves when the subscription sync begins and another sync event is scheduled.
   */
  async sync() {
    const settings = await this.getSubSettings();
    settings.totalSyncs = settings.totalSyncs + 1;
    await storageLocalSet({ [SUBS_KEY]: settings });

    EWE.subscriptions.sync();
    await this.scheduleSyncEvent();
  }

  /**
   * Obtain the subscription settings.
   *
   * @return {Promise<*|{subscriptions: {}, totalSyncs: number}>} a promise that resolves with the subscription settings for the extension.
   */
  async getSubSettings() {
    const data = await storageLocalGet(SUBS_KEY);
    return (
      (data && data[SUBS_KEY]) || {
        subscriptions: {},
        totalSyncs: 0,
      }
    );
  }

  /**
   * Retrieve the next time a sync should occur.
   *
   * @return {Promise<number>} a promise that resolves to the number of milliseconds before the next sync.
   */
  async getNextSyncScheduleTiming() {
    const details = await this.getSubSettings();
    let totalSyncs = details.totalSyncs;

    if (typeof totalSyncs !== "number" || isNaN(totalSyncs)) {
      totalSyncs = 0;
    }

    let delayHours;

    if (totalSyncs <= 1) {
      // Ping one hour after install
      delayHours = 1;
    } else {
      // Then daily forever
      delayHours = 24;
    }

    return 1000 * 60 * 60 * delayHours;
  }

  /**
   * Schedule the next sync event - should be called once during initialization to
   * schedule the first sync event. Once sync has occurred, the system calls itself
   * forever.
   *
   * @return {Promise<void>} resolves when the sync event has been scheduled.
   */
  async scheduleSyncEvent() {
    const delayTiming = await this.getNextSyncScheduleTiming();
    setTimeout(() => {
      this.sync();
    }, delayTiming);
  }
}
