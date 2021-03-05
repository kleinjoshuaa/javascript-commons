import { ISplitFiltersValidation } from '../../dtos/types';
import { ISettings } from '../../types';

/**
 * Parameters used to specialize the settings validation for each API variant
 * (client-side, server-side) and environment (Node server, Browser, etc)
 */
export interface ISettingsValidationParams {
  /**
   * Version and startup properties are mandatory, because these values are not part of the base setting.
   */
  defaults: Partial<ISettings> & { version: string } & { startup: ISettings['startup'] },
  runtime: (settings: ISettings) => ISettings['runtime'],
  /** Storage validator */
  storage?: (settings: ISettings) => ISettings['storage'],
  /** Integrations validator */
  integrations?: (settings: ISettings) => ISettings['integrations'],
}

/**
 * Settings interface extended with private properties used for internal purposes.
 */
export interface ISettingsInternal extends ISettings {
  readonly sync: ISettings['sync'] & {
    __splitFiltersValidation: ISplitFiltersValidation
  }
  readonly impressionListener?: unknown
}
