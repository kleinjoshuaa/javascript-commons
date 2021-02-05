export const jwtSample = 'eyJhbGciOiJIUzI1NiIsImtpZCI6ImtleUlkIiwidHlwIjoiSldUIn0.eyJvcmdJZCI6IjEyMTM4YWMxLTA5MmYtMzJlNy1iYTc4LTEyMzk1ZDRhOTYzNCIsImVudklkIjoiODZiMGQzYTAtNWY1NC0zMmU3LTIyZjktMDExNTBmYTlmYTNhIiwieC1hYmx5LWNhcGFiaWxpdHkiOiJ7XCJOek0yTURJNU16YzBfTXpReU9EVTRORFV5Tmc9PV9zZWdtZW50c1wiOltcInN1YnNjcmliZVwiXSxcIk56TTJNREk1TXpjMF9NelF5T0RVNE5EVXlOZz09X3NwbGl0c1wiOltcInN1YnNjcmliZVwiXSxcImNvbnRyb2xcIjpbXCJzdWJzY3JpYmVcIl19IiwieC1hYmx5LWNsaWVudElkIjoiY2xpZW50SWQiLCJleHAiOjE1ODM3ODcxMjQsImlhdCI6MTU4Mzc4MzUyNH0.f3I0ADc3kzQ4RfFywEukBM8bw91AUnJcGH3nwYUjEg0';
export const jwtSampleInvalid = 'eyJhbGciOiJIUzI1NiIsImtpZCI6ImtleUlkIiwidHlwIjoiSldUIn0.aaavcmdJZCI6IjEyMTM4YWMxLTA5MmYtMzJlNy1iYTc4LTEyMzk1ZDRhOTYzNCIsImVudklkIjoiODZiMGQzYTAtNWY1NC0zMmU3LTIyZjktMDExNTBmYTlmYTNhIiwieC1hYmx5LWNhcGFiaWxpdHkiOiJ7XCJOek0yTURJNU16YzBfTXpReU9EVTRORFV5Tmc9PV9zZWdtZW50c1wiOltcInN1YnNjcmliZVwiXSxcIk56TTJNREk1TXpjMF9NelF5T0RVNE5EVXlOZz09X3NwbGl0c1wiOltcInN1YnNjcmliZVwiXSxcImNvbnRyb2xcIjpbXCJzdWJzY3JpYmVcIl19IiwieC1hYmx5LWNsaWVudElkIjoiY2xpZW50SWQiLCJleHAiOjE1ODM3ODcxMjQsImlhdCI6MTU4Mzc4MzUyNH0.f3I0ADc3kzQ4RfFywEukBM8bw91AUnJcGH3nwYUjEg0';
export const jwtSampleNoChannels = 'eyJhbGciOiJIUzI1NiIsImtpZCI6ImtleUlkIiwidHlwIjoiSldUIn0.eyJvcmdJZCI6IjEyMTM4YWMxLTA5MmYtMzJlNy1iYTc4LTEyMzk1ZDRhOTYzNCIsImVudklkIjoiODZiMGQzYTAtNWY1NC0zMmU3LTIyZjktMDExNTBmYTlmYTNhIiwieC1hYmx5LWNsaWVudElkIjoiY2xpZW50SWQiLCJleHAiOjE1ODM3ODcxMjQsImlhdCI6MTU4Mzc4MzUyNH0.aiuUdeBAZaFMtgaH9y9cwxPG3LyiJCGpX54jd1V4Z54';
export const jwtSampleNoIat = 'eyJhbGciOiJIUzI1NiIsImtpZCI6ImtleUlkIiwidHlwIjoiSldUIn0.eyJvcmdJZCI6IjEyMTM4YWMxLTA5MmYtMzJlNy1iYTc4LTEyMzk1ZDRhOTYzNCIsImVudklkIjoiODZiMGQzYTAtNWY1NC0zMmU3LTIyZjktMDExNTBmYTlmYTNhIiwieC1hYmx5LWNhcGFiaWxpdHkiOiJ7XCJOek0yTURJNU16YzBfTXpReU9EVTRORFV5Tmc9PV9zZWdtZW50c1wiOltcInN1YnNjcmliZVwiXSxcIk56TTJNREk1TXpjMF9NelF5T0RVNE5EVXlOZz09X3NwbGl0c1wiOltcInN1YnNjcmliZVwiXSxcImNvbnRyb2xcIjpbXCJzdWJzY3JpYmVcIl19IiwieC1hYmx5LWNsaWVudElkIjoiY2xpZW50SWQiLCJleHAiOjE1ODM3ODcxMjQsImlhdCI6IjE1ODM3ODM1MjQifQ';

export const decodedJwtPayloadSample = {
  orgId: '12138ac1-092f-32e7-ba78-12395d4a9634',
  envId: '86b0d3a0-5f54-32e7-22f9-01150fa9fa3a',
  ['x-ably-capability']: '{"NzM2MDI5Mzc0_MzQyODU4NDUyNg==_segments":["subscribe"],"NzM2MDI5Mzc0_MzQyODU4NDUyNg==_splits":["subscribe"],"control":["subscribe"]}',
  ['x-ably-clientId']: 'clientId',
  exp: 1583787124,
  iat: 1583783524,
};

export const decodedJwtHeadersSample = {
  alg: 'HS256',
  kid: 'keyId',
  typ: 'JWT',
};

export const parsedChannelsSample = {
  'NzM2MDI5Mzc0_MzQyODU4NDUyNg==_segments': ['subscribe'],
  'NzM2MDI5Mzc0_MzQyODU4NDUyNg==_splits': ['subscribe'],
  'control': ['subscribe']
};

export const base64sample = 'ZW1pQHNwbGl0Lmlv';

export const decodedBase64sample = 'emi@split.io';

export const authDataResponseSample = {
  pushEnabled: true,
  token: jwtSample,
};

export const authDataSample = {
  ...authDataResponseSample,
  decodedToken: decodedJwtPayloadSample,
  channels: parsedChannelsSample,
};

export const userKeySample = 'emi@split.io';

export const userKeyBase64HashSample = 'MjAxNjU2NDU5Mw==';

export const channelsQueryParamSample = 'NzM2MDI5Mzc0_MzQyODU4NDUyNg%3D%3D_segments,NzM2MDI5Mzc0_MzQyODU4NDUyNg%3D%3D_splits,control';
