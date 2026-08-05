import {
  afterAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import express from 'express';
import request from 'supertest';

import {
  requireAuth,
} from '../src/middleware/requireAuth.js';

import weatherRoutes
  from '../src/routes/weather.js';

process.env.OPENWEATHER_API_KEY =
  'test-openweather-key';

const {
  clearWeatherCacheForTests,
  getCurrentWeather,
  getDailyForecast,
  getEventForecast,
  WEATHER_CACHE_TTL_MS,
} =
  await import(
    '../src/services/weatherService.js'
  );

const TIMEZONE_OFFSET =
  -3 * 60 * 60;

function cityLocalToUnix(
  date,
  hour
) {
  const [
    year,
    month,
    day,
  ] =
    date.split('-')
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
      - TIMEZONE_OFFSET
        * 1000
    )
    / 1000
  );
}

const forecastDate =
  '2099-08-05';

const currentPayload = {
  name:
    'São José dos Campos',
  dt:
    cityLocalToUnix(
      forecastDate,
      10
    ),
  timezone:
    TIMEZONE_OFFSET,
  main: {
    temp: 21.4,
    feels_like: 20.8,
    humidity: 61,
  },
  wind: {
    speed: 0.88,
  },
  weather: [
    {
      main: 'Clouds',
      description: 'nublado',
      icon: '04d',
    },
  ],
};

const forecastPayload = {
  city: {
    name:
      'São José dos Campos',
    timezone:
      TIMEZONE_OFFSET,
  },
  list: [
    {
      dt:
        cityLocalToUnix(
          forecastDate,
          12
        ),
      main: {
        temp: 29.1,
      },
      weather: [
        {
          main: 'Clear',
          description:
            'céu limpo',
          icon: '01d',
        },
      ],
    },
    {
      dt:
        cityLocalToUnix(
          forecastDate,
          18
        ),
      main: {
        temp: 24.4,
      },
      weather: [
        {
          main: 'Clouds',
          description:
            'nublado',
          icon: '04d',
        },
      ],
    },
    {
      dt:
        cityLocalToUnix(
          forecastDate,
          21
        ),
      main: {
        temp: 22.2,
      },
      weather: [
        {
          main: 'Clouds',
          description:
            'nublado',
          icon: '04n',
        },
      ],
    },
  ],
};

const fetchMock =
  vi.fn(
    async (input) => {
      const url =
        new URL(
          input.toString()
        );

      if (
        url.pathname
          .endsWith('/weather')
      ) {
        return {
          ok: true,
          status: 200,
          json: async () =>
            currentPayload,
        };
      }

      if (
        url.pathname
          .endsWith('/forecast')
      ) {
        return {
          ok: true,
          status: 200,
          json: async () =>
            forecastPayload,
        };
      }

      throw new Error(
        `URL inesperada: ${url}`
      );
    }
  );

const protectedApp =
  express();

protectedApp.use(
  (req, _res, next) => {
    req.session = {};
    next();
  }
);

protectedApp.use(
  '/api/weather',
  requireAuth,
  weatherRoutes
);

describe(
  'Weather service and routes',
  () => {
    beforeEach(() => {
      clearWeatherCacheForTests();
      fetchMock.mockClear();

      vi.stubGlobal(
        'fetch',
        fetchMock
      );
    });

    afterAll(() => {
      vi.unstubAllGlobals();
    });

    it(
      'usa TTL de 30 minutos',
      () => {
        expect(
          WEATHER_CACHE_TTL_MS
        ).toBe(
          30 * 60 * 1000
        );
      }
    );

    it(
      'protege as rotas de clima sem inicializar o banco',
      async () => {
        const response =
          await request(
            protectedApp
          ).get(
            '/api/weather/current?city=Sao%20Paulo'
          );

        expect(
          response.status
        ).toBe(401);

        expect(
          response.body.error
        ).toContain(
          'Não autenticado'
        );

        expect(
          fetchMock
        ).not.toHaveBeenCalled();
      }
    );

    it(
      'deduplica chamadas simultâneas e reutiliza o clima atual',
      async () => {
        const [
          first,
          second,
        ] =
          await Promise.all([
            getCurrentWeather(
              'São José dos Campos'
            ),
            getCurrentWeather(
              'sao jose dos campos'
            ),
          ]);

        const third =
          await getCurrentWeather(
            'São José dos Campos'
          );

        expect(
          first.temp
        ).toBe(21);

        expect(
          second.observedTime
        ).toBe('10:00');

        expect(
          third.city
        ).toBe(
          'São José dos Campos'
        );

        const currentCalls =
          fetchMock.mock.calls
            .filter(
              ([input]) =>
                new URL(
                  input.toString()
                )
                  .pathname
                  .endsWith(
                    '/weather'
                  )
            );

        expect(
          currentCalls
        ).toHaveLength(1);
      }
    );

    it(
      'compartilha uma única previsão entre página e evento',
      async () => {
        const daily =
          await getDailyForecast(
            'São José dos Campos'
          );

        const event =
          await getEventForecast(
            'sao jose dos campos',
            forecastDate,
            '18:40'
          );

        expect(
          daily[0].temp
        ).toBe(29);

        expect(
          event.status
        ).toBe('available');

        expect(
          event.time
        ).toBe('18:00');

        expect(
          event.temp
        ).toBe(24);

        const forecastCalls =
          fetchMock.mock.calls
            .filter(
              ([input]) =>
                new URL(
                  input.toString()
                )
                  .pathname
                  .endsWith(
                    '/forecast'
                  )
            );

        expect(
          forecastCalls
        ).toHaveLength(1);
      }
    );
  }
);
