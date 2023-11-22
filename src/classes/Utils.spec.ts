import { describe, expect, it } from 'bun:test';

import { Utils } from './Utils';

describe('Utils', () => {
  describe('computeArrayElementDifferences', () => {
    it('should return the correct array differences', () => {
      expect(
        Utils.computeArrayElementDifferences(
          [0, 1, 2, 3],
          [2, 3, 4, 5],
          (i1, i2) => {
            return i1 === i2;
          }
        )
      ).toEqual({
        onlyInArray1: [0, 1],
        onlyInArray2: [4, 5]
      });
    });
  });
});
