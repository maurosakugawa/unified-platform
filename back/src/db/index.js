import '../config/env.js';

import {
  PGlite,
} from '@electric-sql/pglite';
import {
  readFileSync,
} from 'fs';
import {
  dirname,
  join,
} from 'path';
import {
  fileURLToPath,
} from 'url';

import {
  resolveBackendPath,
} from '../config/env.js';

const __dirname =
  dirname(
    fileURLToPath(
      import.meta.url
    )
  );

export const pgdataPath =
  resolveBackendPath(
    process.env.PGDATA_PATH,
    './pgdata'
  );

const db =
  new PGlite(pgdataPath);

export async function initDatabase() {
  console.log(
    '🗄️  Inicializando banco de dados...'
  );

  const migrations = [
    '001_create_users.sql',
    '002_create_contacts.sql',
    '003_create_events.sql',
  ];

  for (
    const migration
    of migrations
  ) {
    const path =
      join(
        __dirname,
        'migrations',
        migration
      );

    try {
      const sql =
        readFileSync(
          path,
          'utf-8'
        );

      await db.exec(sql);

      console.log(
        `   ✅ ${migration}`
      );
    } catch (error) {
      console.error(
        `   ❌ Erro em ${migration}:`,
        error.message
      );

      throw error;
    }
  }

  console.log(
    '✅ Banco pronto!'
  );
}

export { db };
