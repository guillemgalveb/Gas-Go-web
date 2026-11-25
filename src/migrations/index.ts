import * as migration_20261125_182555_initial from './20261125_182555_initial';

export const migrations = [
  {
    up: migration_20261125_182555_initial.up,
    down: migration_20261125_182555_initial.down,
    name: '20261125_182555_initial'
  },
];
