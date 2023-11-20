import { createDB, type Database } from 'blinkdb';

import { useSingleInstance } from '../classes/useSingleInstance';

const createBlinkDb = (): Database =>
  createDB({
    clone: true
  });

export function useBlinkDB(): Database {
  return useSingleInstance(createBlinkDb);
}
