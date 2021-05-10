import SplitsCacheInMemory from './SplitsCacheInMemory';
import SegmentsCacheInMemory from './SegmentsCacheInMemory';
import ImpressionsCacheInMemory from './ImpressionsCacheInMemory';
import EventsCacheInMemory from './EventsCacheInMemory';
import { IStorageFactoryParams, IStorageSync } from '../types';
import ImpressionCountsCacheInMemory from './ImpressionCountsCacheInMemory';

/**
 * InMemory storage factory for standalone server-side SplitFactory
 *
 * @param params parameters required by EventsCacheSync
 */
export function InMemoryStorageFactory(params: IStorageFactoryParams): IStorageSync {

  // Meant for consumer mode. InMemory storage is ready asynchronously
  if (params.onReadyCb) setTimeout(params.onReadyCb);

  return {
    splits: new SplitsCacheInMemory(),
    segments: new SegmentsCacheInMemory(),
    impressions: new ImpressionsCacheInMemory(),
    impressionCounts: params.optimize ? new ImpressionCountsCacheInMemory() : undefined,
    events: new EventsCacheInMemory(params.eventsQueueSize),

    // When using MEMORY we should clean all the caches to leave them empty
    destroy() {
      this.splits.clear();
      this.segments.clear();
      this.impressions.clear();
      this.impressionCounts && this.impressionCounts.clear();
      this.events.clear();
    }
  };
}
