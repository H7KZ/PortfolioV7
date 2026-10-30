import * as migration_20260922_213600_initial from './20260922_213600_initial';
import * as migration_20261029_131241_v7_schema from './20261029_131241_v7_schema';
import * as migration_20261030_212158_v7_copy_fields from './20261030_212158_v7_copy_fields';

export const migrations = [
  {
    up: migration_20260922_213600_initial.up,
    down: migration_20260922_213600_initial.down,
    name: '20260922_213600_initial',
  },
  {
    up: migration_20261029_131241_v7_schema.up,
    down: migration_20261029_131241_v7_schema.down,
    name: '20261029_131241_v7_schema',
  },
  {
    up: migration_20261030_212158_v7_copy_fields.up,
    down: migration_20261030_212158_v7_copy_fields.down,
    name: '20261030_212158_v7_copy_fields'
  },
];
