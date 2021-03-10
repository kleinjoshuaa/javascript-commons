import thenable from '../promise/thenable';
import { LOCALHOST_MODE } from '../constants';
import { ISplitsCacheBase } from '../../storages/types';
import { IReadinessManager } from '../../readiness/types';
import { SDKMode } from '../../types';
import { MaybeThenable } from '../../dtos/types';
import { ILogger } from '../../logger/types';
import { WARN_20 } from '../../logger/constants';
// import { logFactory } from '../../logger/sdkLogger';
// const log = logFactory('');

function logTTExistanceWarning(log: ILogger, maybeTT: string, method: string) {
  log.warn(WARN_20, [method, maybeTT]);
}

/**
 * Separated from the previous method since on some cases it'll be async.
 */
export function validateTrafficTypeExistance(log: ILogger, readinessManager: IReadinessManager, splitsCache: ISplitsCacheBase, mode: SDKMode, maybeTT: string, method: string): MaybeThenable<boolean> {

  // If not ready or in localhost mode, we won't run the validation
  if (!readinessManager.isReady() || mode === LOCALHOST_MODE) return true;

  const res = splitsCache.trafficTypeExists(maybeTT);

  if (thenable(res)) {
    res.then(function (isValid) {
      if (!isValid) logTTExistanceWarning(log, maybeTT, method);

      return isValid; // propagate result
    });
  } else {
    if (!res) logTTExistanceWarning(log, maybeTT, method);
  }

  return res;
}
