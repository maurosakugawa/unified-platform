import {
  spawn,
} from 'node:child_process';

const npmCommand =
  process.platform === 'win32'
    ? 'npm.cmd'
    : 'npm';

const children = [];
let shuttingDown = false;

function start(
  name,
  args
) {
  console.log(
    `▶ ${name}`
  );

  const child =
    spawn(
      npmCommand,
      args,
      {
        stdio: 'inherit',
        env:
          process.env,
      }
    );

  children.push(child);

  child.on(
    'exit',
    (
      code,
      signal
    ) => {
      if (shuttingDown) {
        return;
      }

      shuttingDown = true;

      console.log(
        `\n■ ${name} finalizou`,
        signal
          ? `por ${signal}`
          : `com código ${code}`
      );

      for (
        const running
        of children
      ) {
        if (
          running !== child
          && !running.killed
        ) {
          running.kill(
            'SIGTERM'
          );
        }
      }

      process.exitCode =
        code ?? 1;
    }
  );

  return child;
}

start(
  'Frontend',
  [
    'run',
    'dev:front',
  ]
);

start(
  'Backend',
  [
    'run',
    'dev:back',
  ]
);

function shutdown(signal) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  console.log(
    `\nEncerrando por ${signal}...`
  );

  for (
    const child
    of children
  ) {
    if (!child.killed) {
      child.kill(
        'SIGTERM'
      );
    }
  }
}

process.on(
  'SIGINT',
  () => shutdown('SIGINT')
);

process.on(
  'SIGTERM',
  () => shutdown('SIGTERM')
);
