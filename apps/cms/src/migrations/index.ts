import * as migration_20260922_213600_initial from './20260922_213600_initial';

export const migrations = [
  {
    up: migration_20260922_213600_initial.up,
    down: migration_20260922_213600_initial.down,
    name: '20260922_213600_initial'
  },
];
