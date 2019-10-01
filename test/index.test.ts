import Logger from '../src';

jest.genMockFromModule('fs');
jest.genMockFromModule('console');

test("creates a log file if doesn't exist", () => {
  let options = {
    transports: ['file', 'console'],
  };
});
