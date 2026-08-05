import '../config/env.js';

const OPENWEATHER_BASE_URL =
  process.env
    .OPENWEATHER_BASE_URL
    ?.trim()
  || 'https://api.openweathermap.org/data/2.5';

export const WEATHER_CACHE_TTL_MS =
  30 * 60 * 1000;

const REQUEST_TIMEOUT_MS =
  10 * 1000;

const MAX_CACHE_ENTRIES =
  200;

const currentWeatherCache =
  new Map();

const forecastCache =
  new Map();

const cityAliases = {
  moscou: 'Moscow',
  genebra: 'Geneva',
  londres: 'London',
  toquio: 'Tokyo',
  'sao paulo': 'Sao Paulo',
  'rio de janeiro': 'Rio de Janeiro',
  'sao jose dos campos':
    'Sao Jose dos Campos',
};

function createHttpError(
  message,
  status
) {
  const error =
    new Error(message);

  error.status = status;

  return error;
}

function removeDiacritics(
  value
) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

function normalizeCity(
  city
) {
  if (
    typeof city !== 'string'
  ) {
    throw createHttpError(
      'Cidade é obrigatória',
      400
    );
  }

  const cleanCity =
    city.trim();

  if (!cleanCity) {
    throw createHttpError(
      'Cidade é obrigatória',
      400
    );
  }

  if (cleanCity.length > 120) {
    throw createHttpError(
      'Cidade inválida',
      400
    );
  }

  const aliasKey =
    removeDiacritics(cleanCity)
      .toLocaleLowerCase('pt-BR');

  return (
    cityAliases[aliasKey]
    || cleanCity
  );
}

function getCacheKey(
  city
) {
  return removeDiacritics(
    normalizeCity(city)
  )
    .toLocaleLowerCase('pt-BR');
}

function getApiKey() {
  const apiKey =
    process.env
      .OPENWEATHER_API_KEY
      ?.trim();

  if (!apiKey) {
    throw createHttpError(
      'OPENWEATHER_API_KEY não configurada no backend',
      503
    );
  }

  return apiKey;
}

function pruneCache(
  cache
) {
  const now = Date.now();

  for (
    const [key, entry]
    of cache.entries()
  ) {
    if (
      !entry.promise
      && entry.expiresAt <= now
    ) {
      cache.delete(key);
    }
  }

  while (
    cache.size >
    MAX_CACHE_ENTRIES
  ) {
    const oldestKey =
      cache.keys().next().value;

    if (
      typeof oldestKey ===
      'undefined'
    ) {
      break;
    }

    cache.delete(oldestKey);
  }
}

/**
 * Reutiliza:
 * - valores válidos durante 30 minutos;
 * - a mesma Promise quando várias solicitações
 *   chegam simultaneamente para a mesma cidade.
 */
async function getCached(
  cache,
  key,
  loader
) {
  const now = Date.now();

  const existing =
    cache.get(key);

  if (
    existing?.value
    && existing.expiresAt > now
  ) {
    return existing.value;
  }

  if (existing?.promise) {
    return existing.promise;
  }

  const promise =
    Promise.resolve()
      .then(loader)
      .then((value) => {
        cache.delete(key);

        cache.set(
          key,
          {
            value,
            expiresAt:
              Date.now()
              + WEATHER_CACHE_TTL_MS,
          }
        );

        pruneCache(cache);

        return value;
      })
      .catch((error) => {
        cache.delete(key);

        throw error;
      });

  cache.delete(key);

  cache.set(
    key,
    {
      promise,
      expiresAt: 0,
    }
  );

  return promise;
}

async function readOpenWeatherError(
  response
) {
  const body =
    await response
      .json()
      .catch(() => null);

  const upstreamMessage =
    typeof body?.message ===
    'string'
      ? body.message
      : '';

  if (response.status === 404) {
    return createHttpError(
      'Cidade não encontrada',
      404
    );
  }

  if (response.status === 401) {
    return createHttpError(
      'Chave OpenWeather inválida ou não autorizada',
      503
    );
  }

  if (response.status === 429) {
    return createHttpError(
      'Limite temporário da OpenWeather atingido',
      503
    );
  }

  return createHttpError(
    upstreamMessage
      ? `OpenWeather: ${upstreamMessage}`
      : 'Falha ao consultar a OpenWeather',
    502
  );
}

async function fetchOpenWeather(
  endpoint,
  city
) {
  const normalizedCity =
    normalizeCity(city);

  const url = new URL(
    `${OPENWEATHER_BASE_URL}/${endpoint}`
  );

  url.searchParams.set(
    'q',
    normalizedCity
  );
  url.searchParams.set(
    'appid',
    getApiKey()
  );
  url.searchParams.set(
    'units',
    'metric'
  );
  url.searchParams.set(
    'lang',
    'pt'
  );

  const controller =
    new AbortController();

  const timeoutId =
    setTimeout(
      () => controller.abort(),
      REQUEST_TIMEOUT_MS
    );

  try {
    const response =
      await fetch(
        url,
        {
          signal:
            controller.signal,
        }
      );

    if (!response.ok) {
      throw await readOpenWeatherError(
        response
      );
    }

    return await response.json();
  } catch (error) {
    if (
      error?.name ===
      'AbortError'
    ) {
      throw createHttpError(
        'Tempo limite ao consultar a OpenWeather',
        504
      );
    }

    if (
      typeof error?.status ===
      'number'
    ) {
      throw error;
    }

    throw createHttpError(
      'Não foi possível conectar à OpenWeather',
      502
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

function getCityLocalDateParts(
  unixSeconds,
  timezoneOffsetSeconds
) {
  const cityDate =
    new Date(
      (
        unixSeconds
        + timezoneOffsetSeconds
      ) * 1000
    );

  const year =
    cityDate.getUTCFullYear();

  const month =
    String(
      cityDate.getUTCMonth() + 1
    ).padStart(2, '0');

  const day =
    String(
      cityDate.getUTCDate()
    ).padStart(2, '0');

  const hour =
    String(
      cityDate.getUTCHours()
    ).padStart(2, '0');

  const minute =
    String(
      cityDate.getUTCMinutes()
    ).padStart(2, '0');

  return {
    date:
      `${year}-${month}-${day}`,
    time:
      `${hour}:${minute}`,
    minutesFromMidnight:
      cityDate.getUTCHours()
      * 60
      + cityDate.getUTCMinutes(),
  };
}

function parseTimeToMinutes(
  time
) {
  if (!time) {
    return 12 * 60;
  }

  const match =
    /^(\d{2}):(\d{2})/
      .exec(time);

  if (!match) {
    return 12 * 60;
  }

  const hour =
    Number(match[1]);

  const minute =
    Number(match[2]);

  if (
    !Number.isInteger(hour)
    || !Number.isInteger(minute)
    || hour < 0
    || hour > 23
    || minute < 0
    || minute > 59
  ) {
    return 12 * 60;
  }

  return (
    hour * 60
    + minute
  );
}

function eventCivilTimeToUtcMs(
  date,
  minutesFromMidnight,
  timezoneOffsetSeconds
) {
  const [
    year,
    month,
    day,
  ] =
    date.split('-')
      .map(Number);

  const hour =
    Math.floor(
      minutesFromMidnight / 60
    );

  const minute =
    minutesFromMidnight % 60;

  return (
    Date.UTC(
      year,
      month - 1,
      day,
      hour,
      minute,
      0,
      0
    )
    - timezoneOffsetSeconds
      * 1000
  );
}

function isValidDateKey(
  date
) {
  return (
    /^\d{4}-\d{2}-\d{2}$/
      .test(date)
  );
}

function chooseNearestEntry(
  entries,
  targetUtcMs
) {
  let selected = null;

  let selectedDistance =
    Number.POSITIVE_INFINITY;

  for (
    const entry
    of entries
  ) {
    const entryMs =
      entry.dt * 1000;

    const distance =
      Math.abs(
        entryMs
        - targetUtcMs
      );

    if (
      distance
      < selectedDistance
    ) {
      selected = entry;
      selectedDistance =
        distance;

      continue;
    }

    /**
     * Em empate, prefere o intervalo anterior.
     */
    if (
      distance
        === selectedDistance
      && selected
      && entryMs
        <= targetUtcMs
      && selected.dt * 1000
        > targetUtcMs
    ) {
      selected = entry;
    }
  }

  return selected;
}

function ensureCondition(
  entry
) {
  const condition =
    entry?.weather?.[0];

  if (!condition) {
    throw createHttpError(
      'Resposta meteorológica incompleta',
      502
    );
  }

  return condition;
}

async function getRawCurrent(
  city
) {
  const key =
    getCacheKey(city);

  return getCached(
    currentWeatherCache,
    key,
    () =>
      fetchOpenWeather(
        'weather',
        city
      )
  );
}

async function getRawForecast(
  city
) {
  const key =
    getCacheKey(city);

  return getCached(
    forecastCache,
    key,
    () =>
      fetchOpenWeather(
        'forecast',
        city
      )
  );
}

export async function getCurrentWeather(
  city
) {
  const data =
    await getRawCurrent(city);

  const condition =
    ensureCondition(data);

  const timezoneOffset =
    Number(
      data.timezone || 0
    );

  const observation =
    getCityLocalDateParts(
      data.dt,
      timezoneOffset
    );

  return {
    city: data.name,
    temp:
      Math.round(
        data.main.temp
      ),
    feels_like:
      Math.round(
        data.main.feels_like
      ),
    humidity:
      data.main.humidity,
    wind_speed:
      data.wind.speed,
    description:
      condition.description,
    icon:
      condition.icon,
    condition:
      condition.main,
    isDay:
      condition.icon
        .endsWith('d'),
    observedAt:
      data.dt,
    timezoneOffset,
    observedTime:
      observation.time,
  };
}

/**
 * Previsão diária:
 * usa o ponto de três horas mais próximo de
 * 12h no horário local da cidade.
 */
export async function getDailyForecast(
  city
) {
  const data =
    await getRawForecast(city);

  const timezoneOffset =
    Number(
      data.city?.timezone
      || 0
    );

  const daily =
    new Map();

  for (
    const entry
    of data.list || []
  ) {
    const local =
      getCityLocalDateParts(
        entry.dt,
        timezoneOffset
      );

    const distanceFromNoon =
      Math.abs(
        local.minutesFromMidnight
        - 12 * 60
      );

    const existing =
      daily.get(local.date);

    if (
      !existing
      || distanceFromNoon
        < existing.distanceFromNoon
    ) {
      daily.set(
        local.date,
        {
          entry,
          distanceFromNoon,
        }
      );
    }
  }

  return Array.from(
    daily.entries()
  )
    .sort(
      (
        [firstDate],
        [secondDate]
      ) =>
        firstDate.localeCompare(
          secondDate
        )
    )
    .slice(0, 5)
    .map(
      (
        [
          date,
          candidate,
        ]
      ) => {
        const condition =
          ensureCondition(
            candidate.entry
          );

        return {
          date,
          temp:
            Math.round(
              candidate
                .entry
                .main
                .temp
            ),
          description:
            condition.description,
          icon:
            condition.icon,
          condition:
            condition.main,
        };
      }
    );
}

/**
 * Previsão específica do evento:
 * - futuro: ponto de 3h mais próximo;
 * - hoje: próximo ponto disponível;
 * - sem horário: ponto mais próximo de 12h;
 * - fora da janela: indisponível;
 * - passado: indisponível com reason=past.
 */
export async function getEventForecast(
  city,
  eventDate,
  eventTime
) {
  normalizeCity(city);

  if (
    typeof eventDate !== 'string'
    || !isValidDateKey(
      eventDate
    )
  ) {
    throw createHttpError(
      'Data do evento inválida',
      400
    );
  }

  if (
    eventTime
    && !/^(\d{2}):(\d{2})/
      .test(eventTime)
  ) {
    throw createHttpError(
      'Horário do evento inválido',
      400
    );
  }

  const data =
    await getRawForecast(city);

  const timezoneOffset =
    Number(
      data.city?.timezone
      || 0
    );

  const eventMinutes =
    parseTimeToMinutes(
      eventTime
    );

  const eventUtcMs =
    eventCivilTimeToUtcMs(
      eventDate,
      eventMinutes,
      timezoneOffset
    );

  const cityNow =
    getCityLocalDateParts(
      Math.floor(
        Date.now() / 1000
      ),
      timezoneOffset
    );

  if (
    eventDate < cityNow.date
    || (
      eventDate
        === cityNow.date
      && eventUtcMs
        <= Date.now()
    )
  ) {
    return {
      status: 'unavailable',
      reason: 'past',
    };
  }

  const entriesOnEventDate =
    (data.list || [])
      .filter((entry) => {
        const local =
          getCityLocalDateParts(
            entry.dt,
            timezoneOffset
          );

        return (
          local.date
          === eventDate
        );
      });

  if (
    entriesOnEventDate.length
    === 0
  ) {
    return {
      status: 'unavailable',
      reason:
        'outside-window',
    };
  }

  let selected = null;
  let selection;

  if (!eventTime) {
    selection = 'noon';

    selected =
      chooseNearestEntry(
        entriesOnEventDate,
        eventUtcMs
      );
  } else if (
    eventDate
    === cityNow.date
  ) {
    selection = 'next';

    selected =
      entriesOnEventDate
        .filter(
          (entry) =>
            entry.dt * 1000
            >= eventUtcMs
        )
        .sort(
          (
            first,
            second
          ) =>
            first.dt
            - second.dt
        )[0] || null;
  } else {
    selection = 'nearest';

    selected =
      chooseNearestEntry(
        entriesOnEventDate,
        eventUtcMs
      );
  }

  if (!selected) {
    return {
      status: 'unavailable',
      reason:
        'outside-window',
    };
  }

  const condition =
    ensureCondition(
      selected
    );

  const selectedLocal =
    getCityLocalDateParts(
      selected.dt,
      timezoneOffset
    );

  return {
    status: 'available',
    city:
      data.city?.name
      || normalizeCity(city),
    date:
      selectedLocal.date,
    time:
      selectedLocal.time,
    temp:
      Math.round(
        selected.main.temp
      ),
    description:
      condition.description,
    icon:
      condition.icon,
    condition:
      condition.main,
    selection,
  };
}

/**
 * Utilitário exclusivo para testes automatizados.
 */
export function clearWeatherCacheForTests() {
  currentWeatherCache.clear();
  forecastCache.clear();
}
