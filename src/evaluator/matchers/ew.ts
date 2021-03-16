import { DEBUG_14 } from '../../logger/constants';
import { ILogger } from '../../logger/types';
import { endsWith as strEndsWith } from '../../utils/lang';

export default function endsWithMatcherContext(log: ILogger, ruleAttr: string[]) /*: Function */ {
  return function endsWithMatcher(runtimeAttr: string): boolean {
    let endsWith = ruleAttr.some(e => strEndsWith(runtimeAttr, e));

    log.debug(DEBUG_14, [runtimeAttr, ruleAttr, endsWith]);

    return endsWith;
  };
}
