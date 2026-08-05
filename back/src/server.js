import './config/env.js';

import app
  from './app.js';
import {
  initDatabase,
  pgdataPath,
} from './db/index.js';

const PORT =
  Number(
    process.env.PORT
    || 3101
  );

async function start() {
  try {
    await initDatabase();

    app.listen(
      PORT,
      () => {
        console.log(
          `🚀 Plataforma em http://localhost:${PORT}`
        );
        console.log(
          `   Ambiente: ${process.env.NODE_ENV || 'development'}`
        );
        console.log(
          `   PGlite:   ${pgdataPath}`
        );
        console.log(
          '   Auth:     /auth'
        );
        console.log(
          '   Contacts: /api/contacts'
        );
        console.log(
          '   Events:   /api/events'
        );
        console.log(
          '   Weather:  /api/weather'
        );

        if (
          process.env
            .SERVE_SPA
          === 'true'
          || process.env
            .NODE_ENV
          === 'production'
        ) {
          console.log(
            '   SPA:      dist/'
          );
        }
      }
    );
  } catch (error) {
    console.error(
      '❌ Falha ao iniciar:',
      error
    );

    process.exit(1);
  }
}

start();
