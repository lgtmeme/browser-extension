// @flow
// @format

import {
  version,
  toReadVersion,
  toWriteVersion,
  versionStr,
  strToVersion,
  canClientRead,
  canClientWrite,
} from '../versioning';

describe('versioning', () => {
  const ver001 = version(0, 0, 1);
  const ver113 = version(1, 1, 3);
  const ver122 = version(1, 2, 2);
  const ver123 = version(1, 2, 3);
  const ver124 = version(1, 2, 4);
  const ver133 = version(1, 3, 3);
  const ver220 = version(2, 0, 0);

  describe('version', () => {
    test('versions', () => {
      expect(ver123.major).toBe(1);
      expect(ver123.minor).toBe(2);
      expect(ver123.patch).toBe(3);
    });

    test('throws', () => {
      expect(() => version(-1, 0, 0)).toThrow();
      expect(() => version(1, -1, 0)).toThrow();
      expect(() => version(1, 2, -2)).toThrow();
      expect(() => version(1.5, 2, 3)).toThrow();
      expect(() => version(1, 2.5, 3)).toThrow();
      expect(() => version(1, 2, 0.5)).toThrow();
    });
  });

  describe('conversion', () => {
    test('toReadVersion', () => {
      const verRead = toReadVersion(ver123);
      expect(verRead.major).toBe(1);
    });

    test('toWriteVersion', () => {
      const verWrite = toWriteVersion(ver123);
      expect(verWrite.major).toBe(1);
      expect(verWrite.minor).toBe(2);
    });
  });

  describe('serialization', () => {
    test('to string', () => {
      expect(versionStr(ver123)).toEqual('1.2.3');

      expect(versionStr(toReadVersion(ver123))).toEqual('1.x');

      expect(versionStr(toWriteVersion(ver123))).toEqual('1.2.x');
    });

    test('from string', () => {
      expect(strToVersion(versionStr(ver123))).toMatchObject(ver123);
    });
  });

  describe('read/write', () => {
    test('canClientRead', () => {
      expect(canClientRead(ver123, ver001)).toBe(true);
      expect(canClientRead(ver123, ver113)).toBe(true);
      expect(canClientRead(ver123, ver122)).toBe(true);
      expect(canClientRead(ver123, ver123)).toBe(true);
      expect(canClientRead(ver123, ver124)).toBe(true);
      expect(canClientRead(ver123, ver133)).toBe(true);
      expect(canClientRead(ver123, ver220)).toBe(false);
    });

    test('canClientWrite', () => {
      expect(canClientWrite(ver123, ver001)).toBe(true);
      expect(canClientWrite(ver123, ver113)).toBe(true);
      expect(canClientWrite(ver123, ver122)).toBe(true);
      expect(canClientWrite(ver123, ver123)).toBe(true);
      expect(canClientWrite(ver123, ver124)).toBe(true);
      expect(canClientWrite(ver123, ver133)).toBe(false);
      expect(canClientWrite(ver123, ver220)).toBe(false);
    });
  });
});
