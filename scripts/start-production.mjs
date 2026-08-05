import {
  spawn,
} from 'node:child_process';
import {
  existsSync,
} from 'node:fs';
import {
  resolve,
} from 'node:path';

const indexPath =
  resolve(
    'dist',
    'index.html'
  );

if (!existsSync(indexPath)) {
  console.error(
    '❌ dist/index.html não encontrado.'
  );
  console.error(
    '   Execute npm run build antes de npm start.'
  );
  process.exit(1);
}

const child =
  spawn(
    process.execPath,
    [
      'back/src/server.js',
    ],
    {
      stdio:
        'inherit',
      env: {
        ...process.env,
        NODE_ENV:
          'production',
        SERVE_SPA:
          'true',
      },
    }
  );

child.on(
  'exit',
  (
    code,
    signal
  ) => {
    if (signal) {
      console.log(
        `Servidor encerrado por ${signal}`
      );
    }

    process.exitCode =
      code ?? 0;
  }
);

for (
  const signal
  of [
    'SIGINT',
    'SIGTERM',
  ]
) {
  process.on(
    signal,
    () => {
      child.kill(signal);
    }
  );
}
