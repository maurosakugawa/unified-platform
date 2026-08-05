import './config/env.js';

import cors from 'cors';
import express from 'express';
import session from 'express-session';
import {
  existsSync,
} from 'fs';
import {
  resolve,
} from 'path';

import {
  envFlag,
  PROJECT_ROOT,
} from './config/env.js';
import {
  errorHandler,
} from './middleware/errorHandler.js';
import {
  requireAuth,
} from './middleware/requireAuth.js';
import authRoutes
  from './routes/auth.js';
import contactRoutes
  from './routes/contacts.js';
import eventRoutes
  from './routes/events.js';
import weatherRoutes
  from './routes/weather.js';

const app =
  express();

const isProduction =
  process.env.NODE_ENV
  === 'production';

const shouldServeSpa =
  envFlag(
    'SERVE_SPA',
    isProduction
  );

const configuredOrigins =
  (
    process.env
      .FRONTEND_ORIGIN
    || ''
  )
    .split(',')
    .map(
      (origin) =>
        origin.trim()
    )
    .filter(Boolean);

const allowedOrigins =
  configuredOrigins.length
    ? configuredOrigins
    : isProduction
      ? []
      : [
          'http://localhost:3000',
        ];

if (isProduction) {
  const trustProxy =
    Number(
      process.env
        .TRUST_PROXY
      || 1
    );

  app.set(
    'trust proxy',
    Number.isFinite(trustProxy)
      ? trustProxy
      : 1
  );
}

/**
 * Em produção com frontend e backend na mesma origem,
 * CORS não é necessário.
 *
 * FRONTEND_ORIGIN pode receber uma lista separada por
 * vírgulas quando houver frontend em outra origem.
 */
if (
  !isProduction
  || allowedOrigins.length > 0
) {
  app.use(
    cors({
      credentials: true,
      origin(
        origin,
        callback
      ) {
        if (
          !origin
          || allowedOrigins
            .includes(origin)
        ) {
          callback(
            null,
            true
          );
          return;
        }

        const error =
          new Error(
            'Origem não permitida pelo CORS'
          );

        error.status = 403;

        callback(error);
      },
    })
  );
}

app.use(
  express.json({
    limit: '1mb',
  })
);

const sessionSecret =
  process.env
    .SESSION_SECRET
  || 'dev-secret-change-in-prod';

if (
  isProduction
  && !process.env
    .SESSION_SECRET
) {
  console.warn(
    '⚠️ SESSION_SECRET não configurada; usando valor de desenvolvimento.'
  );
}

const secureCookie =
  envFlag(
    'COOKIE_SECURE',
    isProduction
  );

app.use(
  session({
    name:
      'unified.sid',
    secret:
      sessionSecret,
    resave:
      false,
    saveUninitialized:
      false,
    proxy:
      isProduction,
    cookie: {
      httpOnly:
        true,
      secure:
        secureCookie,
      sameSite:
        'lax',
      maxAge:
        24
        * 60
        * 60
        * 1000,
    },
  })
);

app.get(
  '/health',
  (_req, res) => {
    res
      .set(
        'Cache-Control',
        'no-store'
      )
      .json({
        status: 'ok',
        phase: 5,
        environment:
          process.env
            .NODE_ENV
          || 'development',
        uptime:
          Math.round(
            process.uptime()
          ),
      });
  }
);

// Rotas públicas.
app.use(
  '/auth',
  authRoutes
);

// Rotas protegidas.
app.use(
  '/api/contacts',
  requireAuth,
  contactRoutes
);
app.use(
  '/api/events',
  requireAuth,
  eventRoutes
);
app.use(
  '/api/weather',
  requireAuth,
  weatherRoutes
);

/**
 * Rotas desconhecidas da API nunca devem receber o
 * index.html da SPA.
 */
app.use(
  '/api',
  (_req, res) => {
    res.status(404).json({
      error:
        'Rota de API não encontrada',
    });
  }
);

app.use(
  '/auth',
  (_req, res) => {
    res.status(404).json({
      error:
        'Rota de autenticação não encontrada',
    });
  }
);

if (shouldServeSpa) {
  const distPath =
    resolve(
      PROJECT_ROOT,
      'dist'
    );

  const indexPath =
    resolve(
      distPath,
      'index.html'
    );

  app.use(
    express.static(
      distPath,
      {
        index: false,
        maxAge:
          isProduction
            ? '1d'
            : 0,
      }
    )
  );

  app.get(
    '*',
    (_req, res) => {
      if (
        !existsSync(indexPath)
      ) {
        res.status(503).json({
          error:
            'Build do frontend não encontrado. Execute npm run build.',
        });
        return;
      }

      res.sendFile(indexPath);
    }
  );
}

app.use(
  (_req, res) => {
    res.status(404).json({
      error:
        'Rota não encontrada',
    });
  }
);

// Sempre por último.
app.use(errorHandler);

export default app;
