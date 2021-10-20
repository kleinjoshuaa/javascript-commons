import { IIntegrationFactoryParams } from '../types';
import { GaToSplit } from './GaToSplit';
import { GoogleAnalyticsToSplitOptions } from './types';

export function GoogleAnalyticsToSplit(options: GoogleAnalyticsToSplitOptions) {

  // GaToSplit integration factory
  return (params: IIntegrationFactoryParams) => {
    return GaToSplit(options, params);
  };
}