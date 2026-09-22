import * as migration_20260922_193426_initial from './20260922_193426_initial';

export const migrations = [
  {
    up: migration_20260922_193426_initial.up,
    down: migration_20260922_193426_initial.down,
    name: '20260922_193426_initial'
  },
];
