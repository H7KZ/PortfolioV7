import * as migration_20260922_213600_initial from './20260922_213600_initial';
import * as migration_20261029_131241_v7_schema from './20261029_131241_v7_schema';

export const migrations = [
  {
    up: migration_20260922_213600_initial.up,
    down: migration_20260922_213600_initial.down,
    name: '20260922_213600_initial',
  },
  {
    up: migration_20261029_131241_v7_schema.up,
    down: migration_20261029_131241_v7_schema.down,
    name: '20261029_131241_v7_schema'
  },
];
