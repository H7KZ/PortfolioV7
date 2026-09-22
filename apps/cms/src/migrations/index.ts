import * as migration_20260922_193426_initial from './20260922_193426_initial';
import * as migration_20260922_202117_drafts_for_listed_content from './20260922_202117_drafts_for_listed_content';

export const migrations = [
  {
    up: migration_20260922_193426_initial.up,
    down: migration_20260922_193426_initial.down,
    name: '20260922_193426_initial',
  },
  {
    up: migration_20260922_202117_drafts_for_listed_content.up,
    down: migration_20260922_202117_drafts_for_listed_content.down,
    name: '20260922_202117_drafts_for_listed_content'
  },
];
