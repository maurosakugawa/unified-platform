import {
  spawn,
} from 'node:child_process';
import {
  mkdtempSync,
  rmSync,
} from 'node:fs';
import {
  tmpdir,
} from 'node:os';
import {
  join,
} from 'node:path';

const npmCommand =
  process.platform === 'win32'
    ? 'npm.cmd'
    : 'npm';

const tempDirectory =
  mkdtempSync(
    join(
      tmpdir(),
      'unified-platform-back-tests-'
    )
  );

const pgdataPath =
  join(
    tempDirectory,
    'pgdata'
  );

const testEnv = {
  ...process.env,
  NODE_ENV:
    'test',
  PGDATA_PATH:
    pgdataPath,
  SESSION_SECRET:
    'backend-tests-session-secret',
  OPENWEATHER_API_KEY:
    'backend-tests-key',
  COOKIE_SECURE:
    'false',
  SERVE_SPA:
    'false',
};

console.log(
  `🧪 Banco isolado: ${pgdataPath}`
);

async function initializeTestDatabase() {
  /**
   * As variáveis precisam existir antes do import,
   * pois db/index.js cria a instância PGlite ao ser
   * carregado.
   */
  Object.assign(
    process.env,
    testEnv
  );

  const databaseModule =
    await import(
      '../back/src/db/index.js'
    );

  try {
    await databaseModule
      .initDatabase();
  } finally {
    if (
      typeof databaseModule
        .db
        ?.close
      === 'function'
    ) {
      await databaseModule
        .db
        .close();
    }
  }
}

function runTests() {
  return new Promise(
    (
      resolvePromise,
      rejectPromise
    ) => {
      const child =
        spawn(
          npmCommand,
          [
            '--prefix',
            'back',
            'test',
          ],
          {
            stdio:
              'inherit',
            env:
              testEnv,
          }
        );

      child.once(
        'error',
        rejectPromise
      );

      child.once(
        'exit',
        (
          code,
          signal
        ) => {
          if (signal) {
            console.error(
              `Testes encerrados por ${signal}`
            );
          }

          resolvePromise(
            code ?? 1
          );
        }
      );
    }
  );
}

let exitCode = 1;

try {
  console.log(
    '🗄️  Aplicando migrations no banco isolado...'
  );

  await initializeTestDatabase();

  console.log(
    '✅ Banco isolado inicializado'
  );

  exitCode =
    await runTests();
} finally {
  rmSync(
    tempDirectory,
    {
      recursive: true,
      force: true,
    }
  );
}

process.exitCode =
  exitCode;
