/* eslint-disable no-undef */
// @TODO eventually migrate to JS-Browser-SDK package.
import { ISignalListener } from './types';
import { IRecorderCacheProducerSync, IStorageSync } from '../storages/types';
import { fromImpressionsCollector } from '../sync/submitters/impressionsSubmitter';
import { fromImpressionCountsCollector } from '../sync/submitters/impressionCountsSubmitter';
import { IResponse, ISplitApi } from '../services/types';
import { ImpressionDTO, ISettings } from '../types';
import { ImpressionsPayload } from '../sync/submitters/types';
import { OPTIMIZED, DEBUG } from '../utils/constants';
import { objectAssign } from '../utils/lang/objectAssign';
import { CLEANUP_REGISTERING, CLEANUP_DEREGISTERING } from '../logger/constants';
import { ISyncManager } from '../sync/types';
import { isConsentGranted } from '../consent';
import { telemetryCacheStatsAdapter } from '../sync/submitters/telemetrySubmitter';

// flushing upon pageVisbility === hidden is the preferred approach as per the MDN


const EVENT_NAME = 'for visibilityChange page event.';
const DOM_EVENT = 'visibilitychange';
const FLUSH_VALUE = 'hidden';
/**
 * We'll listen for 'unload' event over the window object, since it's the standard way to listen page reload and close.
 */
export class BrowserSignalListener implements ISignalListener {

  private fromImpressionsCollector: (data: ImpressionDTO[]) => ImpressionsPayload;

  constructor(
    private syncManager: ISyncManager | undefined,
    private settings: ISettings,
    private storage: IStorageSync,
    private serviceApi: ISplitApi,
  ) {
    this.flushData = this.flushData.bind(this);
    this.fromImpressionsCollector = fromImpressionsCollector.bind(undefined, settings.core.labelsEnabled);
  }

  /**
   * start method.
   * Called when SplitFactory is initialized.
   * We add a handler on unload events. The handler flushes remaining impressions and events to the backend.
   */
  start() {
    if (typeof window !== 'undefined' && window.addEventListener) {
      this.settings.log.debug(CLEANUP_REGISTERING, [EVENT_NAME]);
      window.addEventListener(DOM_EVENT, this.flushData.bind(this, document.visibilityState));
    }
  }

  /**
   * stop method.
   * Called when client is destroyed.
   * We need to remove the handler for unload events, since it can break if called when Split context was destroyed.
   */
  stop() {
    if (typeof window !== 'undefined' && window.removeEventListener) {
      this.settings.log.debug(CLEANUP_DEREGISTERING, [EVENT_NAME]);
      window.addEventListener(DOM_EVENT, this.flushData.bind(this, document.visibilityState));
    }
  }

  /**
   * flushData method.
   * Called when visibilitychange event is triggered. It flushed remaining impressions and events to the backend,
   * using beacon API if possible, or falling back to regular post transport.
   */
  flushData(visibilityState: String) {
    if (!this.syncManager) return; // In consumer mode there is not sync manager and data to flush
    if (visibilityState !== FLUSH_VALUE) return; // returning because we only care about changes to hidden
    // Flush data if there is user consent
    if (isConsentGranted(this.settings)) {
      const eventsUrl = this.settings.urls.events;
      const extraMetadata = {
        // sim stands for Sync/Split Impressions Mode
        sim: this.settings.sync.impressionsMode === OPTIMIZED ? OPTIMIZED : DEBUG
      };

      this._flushData(eventsUrl + '/testImpressions/beacon', this.storage.impressions, this.serviceApi.postTestImpressionsBulk, this.fromImpressionsCollector, extraMetadata);
      this._flushData(eventsUrl + '/events/beacon', this.storage.events, this.serviceApi.postEventsBulk);
      if (this.storage.impressionCounts) this._flushData(eventsUrl + '/testImpressions/count/beacon', this.storage.impressionCounts, this.serviceApi.postTestImpressionsCount, fromImpressionCountsCollector);
      if (this.storage.telemetry) {
        const telemetryUrl = this.settings.urls.telemetry;
        const telemetryCacheAdapter = telemetryCacheStatsAdapter(this.storage.telemetry, this.storage.splits, this.storage.segments);
        this._flushData(telemetryUrl + '/v1/metrics/usage/beacon', telemetryCacheAdapter, this.serviceApi.postMetricsUsage);
      }
    }

    // Close streaming connection
    if (this.syncManager.pushManager) this.syncManager.pushManager.stop();
  }

  private _flushData<TState>(url: string, cache: IRecorderCacheProducerSync<TState>, postService: (body: string) => Promise<IResponse>, fromCacheToPayload?: (cacheData: TState) => any, extraMetadata?: {}) {
    // if there is data in cache, send it to backend
    if (!cache.isEmpty()) {
      const dataPayload = fromCacheToPayload ? fromCacheToPayload(cache.state()) : cache.state();
      if (!this._sendBeacon(url, dataPayload, extraMetadata)) {
        postService(JSON.stringify(dataPayload)).catch(() => { }); // no-op just to catch a possible exception
      }
      cache.clear();
    }
  }

  /**
   * _sendBeacon method.
   * Util method that check if beacon API is available, build the payload and send it.
   */
  private _sendBeacon(url: string, data: any, extraMetadata?: {}) {
    // eslint-disable-next-line compat/compat
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const json = {
        entries: data,
        token: this.settings.core.authorizationKey,
        sdk: this.settings.version
      };

      // Extend with endpoint specific metadata where needed
      if (extraMetadata) objectAssign(json, extraMetadata);

      // Stringify the payload
      const payload = JSON.stringify(json);

      // eslint-disable-next-line compat/compat
      return navigator.sendBeacon(url, payload);
    }
    return false;
  }
}
