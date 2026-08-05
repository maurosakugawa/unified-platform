import assert
  from 'node:assert/strict';
import {
  spawn,
} from 'node:child_process';
import {
  once,
} from 'node:events';
import {
  mkdtemp,
  rm,
} from 'node:fs/promises';
import {
  createServer,
} from 'node:http';
import {
  tmpdir,
} from 'node:os';
import {
  join,
  resolve,
} from 'node:path';
import {
  setTimeout as delay,
} from 'node:timers/promises';

const projectRoot =
  resolve('.');

const timezoneOffset =
  -3 * 60 * 60;

function cityDateKey(
  unixSeconds =
    Math.floor(
      Date.now() / 1000
    )
) {
  const date =
    new Date(
      (
        unixSeconds
        + timezoneOffset
      ) * 1000
    );

  const year =
    date.getUTCFullYear();

  const month =
    String(
      date.getUTCMonth() + 1
    ).padStart(2, '0');

  const day =
    String(
      date.getUTCDate()
    ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function addDays(
  dateKey,
  amount
) {
  const [
    year,
    month,
    day,
  ] =
    dateKey
      .split('-')
      .map(Number);

  const date =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day + amount
      )
    );

  return [
    date.getUTCFullYear(),
    String(
      date.getUTCMonth() + 1
    ).padStart(2, '0'),
    String(
      date.getUTCDate()
    ).padStart(2, '0'),
  ].join('-');
}

function cityLocalToUnix(
  dateKey,
  hour
) {
  const [
    year,
    month,
    day,
  ] =
    dateKey
      .split('-')
      .map(Number);

  return Math.floor(
    (
      Date.UTC(
        year,
        month - 1,
        day,
        hour,
        0,
        0,
        0
      )
      - timezoneOffset
        * 1000
    )
    / 1000
  );
}

async function freePort() {
  const server =
    createServer();

  await new Promise(
    (
      resolvePromise,
      rejectPromise
    ) => {
      server.once(
        'error',
        rejectPromise
      );

      server.listen(
        0,
        '127.0.0.1',
        resolvePromise
      );
    }
  );

  const address =
    server.address();

  assert(
    address
    && typeof address
      === 'object'
  );

  const port =
    address.port;

  await new Promise(
    (
      resolvePromise,
      rejectPromise
    ) => {
      server.close(
        (error) =>
          error
            ? rejectPromise(error)
            : resolvePromise()
      );
    }
  );

  return port;
}

function jsonResponse(
  response,
  status,
  body
) {
  response.writeHead(
    status,
    {
      'Content-Type':
        'application/json; charset=utf-8',
    }
  );

  response.end(
    JSON.stringify(body)
  );
}

const tempDirectory =
  await mkdtemp(
    join(
      tmpdir(),
      'unified-platform-e2e-'
    )
  );

const backendPort =
  await freePort();

const weatherPort =
  await freePort();

const today =
  cityDateKey();

const tomorrow =
  addDays(
    today,
    1
  );

const forecastList = [];

for (
  let dayOffset = 0;
  dayOffset < 5;
  dayOffset += 1
) {
  const date =
    addDays(
      today,
      dayOffset
    );

  for (
    const hour
    of [
      9,
      12,
      15,
      18,
    ]
  ) {
    forecastList.push({
      dt:
        cityLocalToUnix(
          date,
          hour
        ),
      main: {
        temp:
          20
          + dayOffset
          + hour / 10,
      },
      weather: [
        {
          main:
            hour >= 18
              ? 'Clouds'
              : 'Clear',
          description:
            hour >= 18
              ? 'nublado'
              : 'céu limpo',
          icon:
            hour >= 18
              ? '04n'
              : '01d',
        },
      ],
    });
  }
}

const weatherCalls = {
  current: 0,
  forecast: 0,
};

const weatherServer =
  createServer(
    (
      request,
      response
    ) => {
      const url =
        new URL(
          request.url,
          `http://${request.headers.host}`
        );

      if (
        url.pathname
          .endsWith('/weather')
      ) {
        weatherCalls.current += 1;

        jsonResponse(
          response,
          200,
          {
            name:
              'São José dos Campos',
            dt:
              Math.floor(
                Date.now() / 1000
              ),
            timezone:
              timezoneOffset,
            main: {
              temp: 24.4,
              feels_like: 24.1,
              humidity: 61,
            },
            wind: {
              speed: 1.5,
            },
            weather: [
              {
                main: 'Clear',
                description:
                  'céu limpo',
                icon: '01d',
              },
            ],
          }
        );

        return;
      }

      if (
        url.pathname
          .endsWith('/forecast')
      ) {
        weatherCalls.forecast += 1;

        jsonResponse(
          response,
          200,
          {
            city: {
              name:
                'São José dos Campos',
              timezone:
                timezoneOffset,
            },
            list:
              forecastList,
          }
        );

        return;
      }

      jsonResponse(
        response,
        404,
        {
          message:
            'mock route not found',
        }
      );
    }
  );

await new Promise(
  (
    resolvePromise,
    rejectPromise
  ) => {
    weatherServer.once(
      'error',
      rejectPromise
    );

    weatherServer.listen(
      weatherPort,
      '127.0.0.1',
      resolvePromise
    );
  }
);

let backendOutput = '';

const backend =
  spawn(
    process.execPath,
    [
      'back/src/server.js',
    ],
    {
      cwd:
        projectRoot,
      env: {
        ...process.env,
        NODE_ENV:
          'production',
        SERVE_SPA:
          'true',
        PORT:
          String(
            backendPort
          ),
        PGDATA_PATH:
          join(
            tempDirectory,
            'pgdata'
          ),
        SESSION_SECRET:
          'e2e-session-secret',
        COOKIE_SECURE:
          'false',
        FRONTEND_ORIGIN:
          '',
        OPENWEATHER_API_KEY:
          'e2e-openweather-key',
        OPENWEATHER_BASE_URL:
          `http://127.0.0.1:${weatherPort}/data/2.5`,
      },
      stdio: [
        'ignore',
        'pipe',
        'pipe',
      ],
    }
  );

backend.stdout.on(
  'data',
  (chunk) => {
    backendOutput +=
      chunk.toString();
  }
);

backend.stderr.on(
  'data',
  (chunk) => {
    backendOutput +=
      chunk.toString();
  }
);

const baseUrl =
  `http://127.0.0.1:${backendPort}`;

async function waitForBackend() {
  const deadline =
    Date.now()
    + 20_000;

  while (
    Date.now()
    < deadline
  ) {
    if (
      backend.exitCode
      !== null
    ) {
      throw new Error(
        `Backend encerrou antes do health check.\n${backendOutput}`
      );
    }

    try {
      const response =
        await fetch(
          `${baseUrl}/health`
        );

      if (response.ok) {
        return;
      }
    } catch {
      // Aguarda a inicialização do PGlite.
    }

    await delay(100);
  }

  throw new Error(
    `Timeout aguardando backend.\n${backendOutput}`
  );
}

let cookie = '';

async function request(
  path,
  {
    method = 'GET',
    body,
    authenticated = true,
    accept =
      'application/json',
  } = {}
) {
  const headers = {
    Accept:
      accept,
  };

  if (
    typeof body !==
    'undefined'
  ) {
    headers[
      'Content-Type'
    ] =
      'application/json';
  }

  if (
    authenticated
    && cookie
  ) {
    headers.Cookie =
      cookie;
  }

  const response =
    await fetch(
      `${baseUrl}${path}`,
      {
        method,
        headers,
        body:
          typeof body
          === 'undefined'
            ? undefined
            : JSON.stringify(
                body
              ),
        redirect:
          'manual',
      }
    );

  const setCookie =
    response.headers
      .get('set-cookie');

  if (setCookie) {
    cookie =
      setCookie
        .split(';')[0];
  }

  const contentType =
    response.headers
      .get('content-type')
    || '';

  const text =
    await response.text();

  let data = null;

  if (
    contentType.includes(
      'application/json'
    )
    && text
  ) {
    data =
      JSON.parse(text);
  }

  return {
    response,
    data,
    text,
    contentType,
  };
}

async function stopChild(
  child
) {
  if (
    child.exitCode
    !== null
  ) {
    return;
  }

  child.kill(
    'SIGTERM'
  );

  await Promise.race([
    once(
      child,
      'exit'
    ),
    delay(3_000)
      .then(() => {
        if (
          child.exitCode
          === null
        ) {
          child.kill(
            'SIGKILL'
          );
        }
      }),
  ]);
}

try {
  await waitForBackend();

  console.log(
    '🧪 E2E — servidor de produção iniciado'
  );

  const health =
    await request(
      '/health',
      {
        authenticated:
          false,
      }
    );

  assert.equal(
    health.response.status,
    200
  );
  assert.equal(
    health.data.phase,
    5
  );
  assert.equal(
    health.data.environment,
    'production'
  );

  console.log(
    '   ✅ health check da Fase 5'
  );

  let rootHtml = '';

  for (
    const path
    of [
      '/',
      '/calendar',
      '/weather',
    ]
  ) {
    const page =
      await request(
        path,
        {
          authenticated:
            false,
          accept:
            'text/html',
        }
      );

    assert.equal(
      page.response.status,
      200,
      `SPA não respondeu em ${path}`
    );

    assert.match(
      page.contentType,
      /text\/html/
    );

    assert.match(
      page.text,
      /id=["']root["']/
    );

    if (path === '/') {
      rootHtml =
        page.text;
    }
  }

  const assetMatch =
    rootHtml.match(
      /(?:src|href)=["'](\/assets\/[^"']+)["']/
    );

  assert(
    assetMatch,
    'Asset do Vite não encontrado no index.html'
  );

  const asset =
    await request(
      assetMatch[1],
      {
        authenticated:
          false,
        accept: '*/*',
      }
    );

  assert.equal(
    asset.response.status,
    200
  );

  console.log(
    '   ✅ fallback SPA e assets do build'
  );

  const unknownApi =
    await request(
      '/api/rota-inexistente',
      {
        authenticated:
          false,
      }
    );

  assert.equal(
    unknownApi.response.status,
    404
  );
  assert.match(
    unknownApi.data.error,
    /API/
  );

  const unauthorized =
    await request(
      '/api/contacts',
      {
        authenticated:
          false,
      }
    );

  assert.equal(
    unauthorized.response.status,
    401
  );

  console.log(
    '   ✅ API desconhecida não recebe HTML e rotas são protegidas'
  );

  const username =
    `fase5_${Date.now()}`;

  const password =
    'Fase5@Teste123';

  const registration =
    await request(
      '/auth/register',
      {
        method: 'POST',
        body: {
          username,
          password,
        },
        authenticated:
          false,
      }
    );

  assert.equal(
    registration.response.status,
    201
  );

  const login =
    await request(
      '/auth/login',
      {
        method: 'POST',
        body: {
          username,
          password,
        },
        authenticated:
          false,
      }
    );

  assert.equal(
    login.response.status,
    200
  );
  assert(
    cookie,
    'Cookie de sessão não foi recebido'
  );

  const me =
    await request(
      '/auth/me'
    );

  assert.equal(
    me.response.status,
    200
  );
  assert.equal(
    me.data.username,
    username
  );

  console.log(
    '   ✅ registro, login, sessão e /auth/me'
  );

  const contact =
    await request(
      '/api/contacts',
      {
        method: 'POST',
        body: {
          name:
            'Contato Fase 5',
          phone:
            '(12) 99999-0000',
          email:
            'fase5@example.com',
          cep:
            '12210-000',
          logradouro:
            'Rua de Teste',
          numero:
            '500',
          bairro:
            'Centro',
          cidade:
            'São José dos Campos',
          uf:
            'SP',
        },
      }
    );

  assert.equal(
    contact.response.status,
    201
  );
  assert(
    Number.isInteger(
      contact.data.id
    )
  );

  const contactId =
    contact.data.id;

  const contacts =
    await request(
      '/api/contacts'
    );

  assert.equal(
    contacts.response.status,
    200
  );
  assert(
    contacts.data.some(
      (item) =>
        item.id
        === contactId
    )
  );

  console.log(
    '   ✅ criação e listagem de contato'
  );

  const event =
    await request(
      '/api/events',
      {
        method: 'POST',
        body: {
          title:
            'Evento E2E Fase 5',
          description:
            'Evento com participante e previsão',
          event_date:
            tomorrow,
          event_time:
            '12:00',
          category:
            'Trabalho',
          priority:
            'Alta',
          location:
            'São José dos Campos',
          contact_ids: [
            contactId,
          ],
          reminder_minutes:
            30,
        },
      }
    );

  assert.equal(
    event.response.status,
    201
  );

  const eventId =
    event.data.id;

  assert.deepEqual(
    event.data.contact_ids,
    [
      contactId,
    ]
  );

  const events =
    await request(
      '/api/events'
    );

  assert.equal(
    events.response.status,
    200
  );
  assert(
    events.data.some(
      (item) =>
        item.id
        === eventId
    )
  );

  const participants =
    await request(
      `/api/events/${eventId}/contacts`
    );

  assert.equal(
    participants.response.status,
    200
  );
  assert.equal(
    participants.data.length,
    1
  );
  assert.equal(
    participants.data[0].id,
    contactId
  );

  console.log(
    '   ✅ evento criado e participante associado'
  );

  const current =
    await request(
      '/api/weather/current?city=S%C3%A3o%20Jos%C3%A9%20dos%20Campos'
    );

  assert.equal(
    current.response.status,
    200
  );
  assert.equal(
    current.data.city,
    'São José dos Campos'
  );

  const forecast =
    await request(
      '/api/weather/forecast?city=S%C3%A3o%20Jos%C3%A9%20dos%20Campos'
    );

  assert.equal(
    forecast.response.status,
    200
  );
  assert.equal(
    forecast.data.length,
    5
  );

  const eventWeather =
    await request(
      `/api/weather/event?city=S%C3%A3o%20Jos%C3%A9%20dos%20Campos&date=${tomorrow}&time=12%3A00`
    );

  assert.equal(
    eventWeather.response.status,
    200
  );
  assert.equal(
    eventWeather.data.status,
    'available'
  );
  assert.equal(
    eventWeather.data.date,
    tomorrow
  );

  assert.equal(
    weatherCalls.current,
    1,
    'Clima atual deveria consultar o mock uma vez'
  );

  assert.equal(
    weatherCalls.forecast,
    1,
    'Página e evento deveriam compartilhar uma única previsão'
  );

  console.log(
    '   ✅ clima atual, previsão e cache compartilhado do evento'
  );

  const logout =
    await request(
      '/auth/logout',
      {
        method:
          'POST',
      }
    );

  assert.equal(
    logout.response.status,
    200
  );

  const afterLogout =
    await request(
      '/api/events'
    );

  assert.equal(
    afterLogout.response.status,
    401
  );

  console.log(
    '   ✅ logout invalida acesso protegido'
  );

  console.log();
  console.log(
    '✅ E2E completo aprovado'
  );
} catch (error) {
  console.error();
  console.error(
    '❌ E2E falhou:'
  );
  console.error(error);

  if (backendOutput) {
    console.error();
    console.error(
      'Saída do backend:'
    );
    console.error(
      backendOutput
    );
  }

  process.exitCode = 1;
} finally {
  await stopChild(
    backend
  );

  await new Promise(
    (resolvePromise) => {
      weatherServer.close(
        resolvePromise
      );
    }
  );

  await rm(
    tempDirectory,
    {
      recursive: true,
      force: true,
    }
  );
}
