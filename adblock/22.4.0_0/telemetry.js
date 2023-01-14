// -----------------------------------------------------------------------
// Telemetry
// -----------------------------------------------------------------------

import { storageLocalGet, storageLocalSet } from "./storage.js";
import { generateUserId, ping } from "./utils.js";
import { getManagementInfo } from "./browser.js";

const STATS_KEY = "ub_stats";

/**
 * Telemetry manager contains a bunch of static stats that are generated once,
 * and several stats that are generated on the fly each time stats are sent
 * to the server.
 */
export class Telemetry {
  constructor(name, version) {
    this.name = name;
    this.version = version;
    const reOS = /(CrOS \w+|Windows NT|Mac OS X|Linux) ([\d._]+)?/;

    let matches = reOS.exec(navigator.userAgent);

    this.operatingSystem = (matches || [])[1] || "Unknown";

    this.operatingSystemVersion = (matches || [])[2] || "Unknown";

    const reBW =
      /(MSIE|Trident|(?!Gecko.+)Firefox|(?!AppleWebKit.+Chrome.+)Safari(?!.+Edge)|(?!AppleWebKit.+)Chrome(?!.+Edge)|(?!AppleWebKit.+Chrome.+Safari.+)Edge|AppleWebKit(?!.+Chrome|.+Safari)|Gecko(?!.+Firefox))[ \/]([\d.apre]+)/;

    matches = reBW.exec(navigator.userAgent);

    this.browserName = (matches || [])[1] || "Unknown";

    if (window["opr"]) this.browserFlavor = "O"; // Opera
    else if (window["safari"]) this.browserFlavor = "S"; // Safari
    else if (this.browserName === "Firefox")
      this.browserFlavor = "F"; // Firefox
    else this.browserFlavor = "E"; // Chrome

    this.browserVersion = (matches || [])[2] || "Unknown";

    this.browserLanguage = navigator.language.match(/^[a-z]+/i)[0];

    this.storageStatsAttr = {
      userId: null,
      totalPings: 0,
    };
  }

  async getStatsSettings() {
    if (this.storageStatsAttr.userId != null) {
      return this.storageStatsAttr;
    }
    const data = await storageLocalGet(STATS_KEY);
    const entries = (data && data[STATS_KEY]) || {
      userId: generateUserId(),
      totalPings: 0,
    };
    this.storageStatsAttr = entries;
    return entries;
  }

  /**
   * Get the stats document for the extension. Currently, the stats data only
   * contains "static" information about the extension since we do not track
   * things like block counts.
   *
   * @param userId {string} id of the user
   * @return {{bv: (*|string), u, v: string, f: (string|*), ov: (*|string), l: string, n: string, o: (*|string)}} the current stats
   */
  getStats(userId) {
    return {
      n: this.name,
      v: this.version,
      u: userId,
      f: this.browserFlavor,
      o: this.operatingSystem,
      bv: this.browserVersion,
      ov: this.operatingSystemVersion,
      l: this.browserLanguage,
    };
  }

  async sendStats() {
    const settings = await this.getStatsSettings();
    settings.totalPings = settings.totalPings + 1;
    await storageLocalSet({ [STATS_KEY]: settings });

    const data = this.getStats(settings.userId);

    if (this.browserName === "Chrome") {
      const info = await getManagementInfo();
      if (info && typeof info.installType === "string") {
        data["it"] = info.installType.charAt(0);
      }
    }
    ping(data);
    await this.scheduleStatsEvent();
  }

  async getNextScheduleTiming() {
    const details = await this.getStatsSettings();
    let totalPings = details.totalPings;

    if (typeof totalPings !== "number" || isNaN(totalPings)) {
      totalPings = 0;
    }

    let delayHours;

    if (totalPings <= 1) {
      // Ping one hour after install
      delayHours = 1;
    } else if (totalPings < 9) {
      // Then every day for a week
      delayHours = 24;
    } else {
      // Then weekly forever
      delayHours = 24 * 7;
    }

    return 1000 * 60 * 60 * delayHours;
  }

  async scheduleStatsEvent() {
    const delayTiming = await this.getNextScheduleTiming();
    setTimeout(() => {
      this.sendStats();
    }, delayTiming);
  }
}
