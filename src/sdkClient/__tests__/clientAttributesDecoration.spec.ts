import { sdkClientMethodCSFactory } from '../sdkClientMethodCS';

import { settingsWithKey } from '../../utils/settingsValidation/__tests__/settings.mocks';

const partialStorages: { destroy: jest.Mock }[] = [];

const storageMock = {
  destroy: jest.fn(),
  shared: jest.fn(() => {
    partialStorages.push({ destroy: jest.fn() });
    return partialStorages[partialStorages.length - 1];
  })
};

const partialSdkReadinessManagers: { sdkStatus: jest.Mock, readinessManager: { destroy: jest.Mock } }[] = [];

const sdkReadinessManagerMock = {
  sdkStatus: jest.fn(),
  readinessManager: {
    destroy: jest.fn(),
    isDestroyed: jest.fn(() => { return false; }),
    isReady: jest.fn(() => { return true; })
  },
  shared: jest.fn(() => {
    partialSdkReadinessManagers.push({
      sdkStatus: jest.fn(),
      readinessManager: { destroy: jest.fn() },
    });
    return partialSdkReadinessManagers[partialSdkReadinessManagers.length - 1];
  })
};

const partialSyncManagers: { start: jest.Mock, stop: jest.Mock, flush: jest.Mock }[] = [];

const syncManagerMock = {
  stop: jest.fn(),
  flush: jest.fn(() => Promise.resolve()),
  shared: jest.fn(() => {
    partialSyncManagers.push({ start: jest.fn(), stop: jest.fn(), flush: jest.fn(() => Promise.resolve()) });
    return partialSyncManagers[partialSyncManagers.length - 1];
  })
};

const params = {
  storage: storageMock,
  sdkReadinessManager: sdkReadinessManagerMock,
  syncManager: syncManagerMock,
  signalListener: { stop: jest.fn() },
  settings: settingsWithKey
};

// We are testing attributes binding feature and we just need to know how the attributes are combined before evaluation
// So input validation decorator is mocked to return the combined attributes instead of evaluation so we can verify them
jest.mock('../clientInputValidation', () => {
  return {
    clientInputValidationDecorator() {
      return {
        getTreatment(maybeKey: any, maybeSplit: string, maybeAttributes?: any) {
          return maybeAttributes;
        },
        getTreatmentWithConfig(maybeKey: any, maybeSplit: string, maybeAttributes?: any) {
          return maybeAttributes;
        },
        getTreatments(maybeKey: any, maybeSplits: string[], maybeAttributes?: any) {
          return maybeAttributes;
        },
        getTreatmentsWithConfig(maybeKey: any, maybeSplits: string[], maybeAttributes?: any) {
          return maybeAttributes;
        }
      };
    }
  };
});

// @ts-expect-error
const sdkClientMethod = sdkClientMethodCSFactory(params);
const client = sdkClientMethod();

//expect(client).toBe(AttributesDecorationMockedClient);

test('ATTRIBUTES DECORATION / storage', () => {

  client.setAttribute('attributeName1', 'attributeValue1');
  client.setAttribute('attributeName2', 'attributeValue2');

  expect(client.getAttributes()).toEqual({ attributeName1: 'attributeValue1', attributeName2: 'attributeValue2' }); // It should be equal

  client.removeAttribute('attributeName1');
  client.setAttribute('attributeName2', 'newAttributeValue2');

  expect(client.getAttribute('attributeName1')).toEqual(undefined); // It should throw undefined
  expect(client.getAttribute('attributeName2')).toEqual('newAttributeValue2'); // It should be equal

  client.setAttributes({
    'attributeName3': 'attributeValue3',
    'attributeName4': 'attributeValue4'
  });

  expect(client.getAttributes()).toEqual({ attributeName2: 'newAttributeValue2', attributeName3: 'attributeValue3', attributeName4: 'attributeValue4' }); // It should be equal

  expect(client.clearAttributes()).toEqual(true);

  expect(Object.keys(client.getAttributes()).length).toEqual(0); // It should be zero after clearing attributes

});


describe('ATTRIBUTES DECORATION / validation', () => {

  test('Should return true if it is a valid attributes map without logging any errors', () => {
    const validAttributes = { amIvalid: 'yes', 'are_you_sure': true, howMuch: 10, 'spell': ['1', '0'] };

    expect(client.setAttributes(validAttributes)).toEqual(true); // It should return true if it is valid.
    expect(client.getAttributes()).toEqual(validAttributes); // It should be the same.
    expect(client.setAttribute('attrKey', 'attrValue')).toEqual(true); // It should return true.
    expect(client.getAttribute('attrKey')).toEqual('attrValue'); // It should return true.

    expect(client.removeAttribute('attrKey')).toEqual(true); // It should return true.
    expect(client.getAttributes()).toEqual(validAttributes); // It should be equal to the first set.

    expect(client.clearAttributes()).toEqual(true);

    expect(Object.keys(client.getAttributes()).length).toEqual(0); // It should be zero after clearing attributes

  });

  test('Should return false if it is an invalid attributes map', () => {
    expect(client.setAttribute('', 'attributeValue')).toEqual(false); // It should be invalid if the attribute key is not a string
    expect(client.setAttribute('attributeKey1', new Date())).toEqual(false); // It should be invalid if the attribute value is not a String, Number, Boolean or Lists.
    expect(client.setAttribute('attributeKey2', { 'some': 'object' })).toEqual(false); // It should be invalid if the attribute value is not a String, Number, Boolean or Lists.
    expect(client.setAttribute('attributeKey3', Infinity)).toEqual(false); // It should be invalid if the attribute value is not a String, Number, Boolean or Lists.

    expect(client.clearAttributes()).toEqual(true);

    let values = client.getAttributes();

    expect(Object.keys(values).length).toEqual(0); // It should be zero after clearing attributes

    let attributes = {
      'attributeKey': 'attributeValue',
      '': 'attributeValue'
    };

    expect(client.setAttributes(attributes)).toEqual(false); // It should be invalid if the attribute key is not a string

    expect(Object.keys(client.getAttributes()).length).toEqual(0); // It should be zero after trying to add an invalid attribute

    expect(client.clearAttributes()).toEqual(true);

  });

  test('Should return true if attributes map is valid', () => {
    const validAttributes = {
      'attributeKey1': 'attributeValue',
      'attributeKey2': ['attribute', 'value'],
      'attributeKey3': 25,
      'attributeKey4': false
    };

    expect(client.setAttribute('attributeKey1', 'attributeValue')).toEqual(true); // It should be valid if the attribute value is a String, Number, Boolean or Lists.
    expect(client.setAttribute('attributeKey2', ['attribute', 'value'])).toEqual(true); // It should be valid if the attribute value is a String, Number, Boolean or Lists.
    expect(client.setAttribute('attributeKey3', 25)).toEqual(true); // It should be valid if the attribute value is a String, Number, Boolean or Lists.
    expect(client.setAttribute('attributeKey4', false)).toEqual(true); // It should be valid if the attribute value is a String, Number, Boolean or Lists.
    expect(client.setAttribute('attributeKey5', Date.now())).toEqual(true); // It should be valid if the attribute value is a String, Number, Boolean or Lists.

    expect(client.removeAttribute('attributeKey5')).toEqual(true); // It should be capable of remove the attribute with that name
    expect(client.getAttributes()).toEqual(validAttributes); // It should had stored every valid attributes.

    expect(client.clearAttributes()).toEqual(true);

    expect(client.setAttributes(validAttributes)).toEqual(true); // It should add them all because they are valid attributes.
    expect(client.getAttributes()).toEqual(validAttributes); // It should had stored every valid attributes.

    expect(client.clearAttributes()).toEqual(true);

  });

});

describe('ATTRIBUTES DECORATION / evaluation', () => {

  test('Evaluation attributes logic and precedence / getTreatment', () => {

    // If the same attribute is “cached” and provided on the function, the value received on the function call takes precedence.
    expect(client.getTreatment('split')).toEqual(undefined); // Nothing changes if no attributes were provided using the new api
    expect(client.getTreatment('split', { func_attr_bool: true, func_attr_str: 'true' })).toEqual({ func_attr_bool: true, func_attr_str: 'true' }); // Nothing changes if no attributes were provided using the new api
    expect(client.getAttributes()).toEqual({}); // Attributes in memory storage must be empty
    client.setAttribute('func_attr_bool', false);
    expect(client.getAttributes()).toEqual({ 'func_attr_bool': false }); // In memory attribute storage must have the unique stored attribute
    expect(client.getTreatment('split', { func_attr_bool: true, func_attr_str: 'true' })).toEqual({ func_attr_bool: true, func_attr_str: 'true' }); // Function attributes has precedence against api ones
    // @ts-ignore
    expect(client.getTreatment('split', null)).toEqual({ func_attr_bool: false }); // API attributes should be kept in memory and use for evaluations
    expect(client.getTreatment('split', { func_attr_str: 'true' })).toEqual({ func_attr_bool: false, func_attr_str: 'true' }); // API attributes should be kept in memory and use for evaluations
    client.setAttributes({ func_attr_str: 'false' });
    expect(client.getAttributes()).toEqual({ 'func_attr_bool': false, 'func_attr_str': 'false' }); // In memory attribute storage must have two stored attributes
    expect(client.getTreatment('split', { func_attr_bool: true, func_attr_str: 'true', func_attr_number: 1 })).toEqual({ func_attr_bool: true, func_attr_str: 'true', func_attr_number: 1 }); // Function attributes has precedence against api ones
    // @ts-ignore
    expect(client.getTreatment('split', null)).toEqual({ func_attr_bool: false, func_attr_str: 'false' }); // If the getTreatment function is called without attributes, stored attributes will be used to evaluate.
    expect(client.getTreatment('split')).toEqual({ func_attr_bool: false, func_attr_str: 'false' }); // If the getTreatment function is called without attributes, stored attributes will be used to evaluate.
    expect(client.clearAttributes()).toEqual(true);

  });

  test('Evaluation attributes logic and precedence / getTreatments', () => {

    // If the same attribute is “cached” and provided on the function, the value received on the function call takes precedence.
    expect(client.getTreatments(['split'])).toEqual(undefined); // Nothing changes if no attributes were provided using the new api
    expect(client.getTreatments(['split'], { func_attr_bool: true, func_attr_str: 'true' })).toEqual({ func_attr_bool: true, func_attr_str: 'true' }); // Nothing changes if no attributes were provided using the new api
    expect(client.getAttributes()).toEqual({}); // Attributes in memory storage must be empty
    client.setAttribute('func_attr_bool', false);
    expect(client.getAttributes()).toEqual({ 'func_attr_bool': false }); // In memory attribute storage must have the unique stored attribute
    expect(client.getTreatments(['split'], { func_attr_bool: true, func_attr_str: 'true' })).toEqual({ func_attr_bool: true, func_attr_str: 'true' }); // Function attributes has precedence against api ones
    // @ts-ignore
    expect(client.getTreatments(['split'], null)).toEqual({ func_attr_bool: false }); // API attributes should be kept in memory and use for evaluations
    expect(client.getTreatments(['split'], { func_attr_str: 'true' })).toEqual({ func_attr_bool: false, func_attr_str: 'true' }); // API attributes should be kept in memory and use for evaluations
    client.setAttributes({ func_attr_str: 'false' });
    expect(client.getAttributes()).toEqual({ 'func_attr_bool': false, 'func_attr_str': 'false' }); // In memory attribute storage must have two stored attributes
    expect(client.getTreatments(['split'], { func_attr_bool: true, func_attr_str: 'true', func_attr_number: 1 })).toEqual({ func_attr_bool: true, func_attr_str: 'true', func_attr_number: 1 }); // Function attributes has precedence against api ones
    // @ts-ignore
    expect(client.getTreatments(['split'], null)).toEqual({ func_attr_bool: false, func_attr_str: 'false' }); // If the getTreatment function is called without attributes, stored attributes will be used to evaluate.
    expect(client.getTreatments(['split'])).toEqual({ func_attr_bool: false, func_attr_str: 'false' }); // If the getTreatment function is called without attributes, stored attributes will be used to evaluate.
    expect(client.clearAttributes()).toEqual(true);

  });

  test('Evaluation attributes logic and precedence / getTreatmentWithConfig', () => {

    // If the same attribute is “cached” and provided on the function, the value received on the function call takes precedence.
    expect(client.getTreatmentWithConfig('split')).toEqual(undefined); // Nothing changes if no attributes were provided using the new api
    expect(client.getTreatmentWithConfig('split', { func_attr_bool: true, func_attr_str: 'true' })).toEqual({ func_attr_bool: true, func_attr_str: 'true' }); // Nothing changes if no attributes were provided using the new api
    expect(client.getAttributes()).toEqual({}); // Attributes in memory storage must be empty
    client.setAttribute('func_attr_bool', false);
    expect(client.getAttributes()).toEqual({ 'func_attr_bool': false }); // In memory attribute storage must have the unique stored attribute
    expect(client.getTreatmentWithConfig('split', { func_attr_bool: true, func_attr_str: 'true' })).toEqual({ func_attr_bool: true, func_attr_str: 'true' }); // Function attributes has precedence against api ones
    // @ts-ignore
    expect(client.getTreatmentWithConfig('split', null)).toEqual({ func_attr_bool: false }); // API attributes should be kept in memory and use for evaluations
    expect(client.getTreatmentWithConfig('split', { func_attr_str: 'true' })).toEqual({ func_attr_bool: false, func_attr_str: 'true' }); // API attributes should be kept in memory and use for evaluations
    client.setAttributes({ func_attr_str: 'false' });
    expect(client.getAttributes()).toEqual({ 'func_attr_bool': false, 'func_attr_str': 'false' }); // In memory attribute storage must have two stored attributes
    expect(client.getTreatmentWithConfig('split', { func_attr_bool: true, func_attr_str: 'true', func_attr_number: 1 })).toEqual({ func_attr_bool: true, func_attr_str: 'true', func_attr_number: 1 }); // Function attributes has precedence against api ones
    // @ts-ignore
    expect(client.getTreatmentWithConfig('split', null)).toEqual({ func_attr_bool: false, func_attr_str: 'false' }); // If the getTreatment function is called without attributes, stored attributes will be used to evaluate.
    expect(client.getTreatmentWithConfig('split')).toEqual({ func_attr_bool: false, func_attr_str: 'false' }); // If the getTreatment function is called without attributes, stored attributes will be used to evaluate.
    expect(client.clearAttributes()).toEqual(true);

  });

  test('Evaluation attributes logic and precedence / getTreatmentsWithConfig', () => {

    // If the same attribute is “cached” and provided on the function, the value received on the function call takes precedence.
    expect(client.getTreatmentsWithConfig(['split'])).toEqual(undefined); // Nothing changes if no attributes were provided using the new api
    expect(client.getTreatmentsWithConfig(['split'], { func_attr_bool: true, func_attr_str: 'true' })).toEqual({ func_attr_bool: true, func_attr_str: 'true' }); // Nothing changes if no attributes were provided using the new api
    expect(client.getAttributes()).toEqual({}); // Attributes in memory storage must be empty
    client.setAttribute('func_attr_bool', false);
    expect(client.getAttributes()).toEqual({ 'func_attr_bool': false }); // In memory attribute storage must have the unique stored attribute
    expect(client.getTreatmentsWithConfig(['split'], { func_attr_bool: true, func_attr_str: 'true' })).toEqual({ func_attr_bool: true, func_attr_str: 'true' }); // Function attributes has precedence against api ones
    // @ts-ignore
    expect(client.getTreatmentsWithConfig(['split'], null)).toEqual({ func_attr_bool: false }); // API attributes should be kept in memory and use for evaluations
    expect(client.getTreatmentsWithConfig(['split'], { func_attr_str: 'true' })).toEqual({ func_attr_bool: false, func_attr_str: 'true' }); // API attributes should be kept in memory and use for evaluations
    client.setAttributes({ func_attr_str: 'false' });
    expect(client.getAttributes()).toEqual({ 'func_attr_bool': false, 'func_attr_str': 'false' }); // In memory attribute storage must have two stored attributes
    expect(client.getTreatmentsWithConfig(['split'], { func_attr_bool: true, func_attr_str: 'true', func_attr_number: 1 })).toEqual({ func_attr_bool: true, func_attr_str: 'true', func_attr_number: 1 }); // Function attributes has precedence against api ones
    // @ts-ignore
    expect(client.getTreatmentsWithConfig(['split'], null)).toEqual({ func_attr_bool: false, func_attr_str: 'false' }); // If the getTreatment function is called without attributes, stored attributes will be used to evaluate.
    expect(client.getTreatmentsWithConfig(['split'])).toEqual({ func_attr_bool: false, func_attr_str: 'false' }); // If the getTreatment function is called without attributes, stored attributes will be used to evaluate.
    client.clearAttributes();

  });

});
