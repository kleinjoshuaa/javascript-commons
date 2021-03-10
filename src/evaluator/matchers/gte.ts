import { DEBUG_15 } from '../../logger/constants';
// import { logFactory } from '../../logger/sdkLogger';
// const log = logFactory('splitio-engine:matcher');
import { ILogger } from '../../logger/types';

export default function greaterThanEqualMatcherContext(log: ILogger, ruleAttr: number) /*: Function */ {
  return function greaterThanEqualMatcher(runtimeAttr: number): boolean {
    let isGreaterEqualThan = runtimeAttr >= ruleAttr;

    log.debug(DEBUG_15, [runtimeAttr, ruleAttr, isGreaterEqualThan]);

    return isGreaterEqualThan;
  };
}
