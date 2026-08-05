import {
  useEffect,
  useState,
} from "react";

import {
  Cloud,
  CloudOff,
  Clock3,
  Loader2,
} from "lucide-react";

import {
  fetchForecastForEvent,
} from "../../weather/services/weatherService";

import type {
  EventForecastResult,
} from "../../weather/services/weatherService";

interface Props {
  location: string;
  eventDate: string;
  eventTime?: string;
  compact?: boolean;
}

interface CacheEntry {
  expiresAt: number;
  request: Promise<EventForecastResult>;
}

const CACHE_TTL_MS =
  30 * 60 * 1000;

const snapshotCache =
  new Map<string, CacheEntry>();

function getLocalEventTimestamp(
  date: string,
  time?: string
): number {
  const safeTime =
    time || "12:00";

  return new Date(
    `${date}T${safeTime}`
  ).getTime();
}

/**
 * Evita consulta para eventos claramente passados no
 * fuso local do navegador. O serviço faz uma segunda
 * validação usando o fuso retornado pela cidade.
 */
function isClearlyPast(
  date: string,
  time?: string
): boolean {
  const timestamp =
    getLocalEventTimestamp(date, time);

  return (
    Number.isFinite(timestamp) &&
    timestamp <= Date.now()
  );
}

function getSnapshot(
  location: string,
  eventDate: string,
  eventTime?: string
): Promise<EventForecastResult> {
  const key = [
    location
      .trim()
      .toLocaleLowerCase("pt-BR"),
    eventDate,
    eventTime || "12:00",
  ].join("|");

  const now = Date.now();

  const cached =
    snapshotCache.get(key);

  if (
    cached &&
    cached.expiresAt > now
  ) {
    return cached.request;
  }

  if (cached) {
    snapshotCache.delete(key);
  }

  const request =
    fetchForecastForEvent(
      location,
      eventDate,
      eventTime
    ).catch((error) => {
      snapshotCache.delete(key);
      throw error;
    });

  snapshotCache.set(
    key,
    {
      expiresAt:
        now + CACHE_TTL_MS,
      request,
    }
  );

  return request;
}

function formatForecastTime(
  time: string
): string {
  const [hour, minute] =
    time.split(":");

  return minute === "00"
    ? `${Number(hour)}h`
    : `${hour}h${minute}`;
}

function getSelectionDescription(
  result: Extract<
    EventForecastResult,
    { status: "available" }
  >
): string {
  switch (result.selection) {
    case "next":
      return "próximo intervalo disponível";

    case "noon":
      return "intervalo mais próximo de 12h";

    case "nearest":
    default:
      return "intervalo mais próximo do horário do evento";
  }
}

export default function EventWeatherBadge({
  location,
  eventDate,
  eventTime,
  compact = false,
}: Props) {
  const [result, setResult] =
    useState<EventForecastResult | null>(
      null
    );

  const [loading, setLoading] =
    useState(false);

  const [failed, setFailed] =
    useState(false);

  useEffect(() => {
    let active = true;

    const cleanLocation =
      location.trim();

    if (
      !cleanLocation ||
      !eventDate
    ) {
      setResult(null);
      setFailed(false);

      return;
    }

    if (
      isClearlyPast(
        eventDate,
        eventTime
      )
    ) {
      setResult({
        status: "unavailable",
        reason: "past",
      });
      setFailed(false);
      setLoading(false);

      return;
    }

    setLoading(true);
    setFailed(false);

    void getSnapshot(
      cleanLocation,
      eventDate,
      eventTime
    )
      .then((snapshot) => {
        if (active) {
          setResult(snapshot);
        }
      })
      .catch(() => {
        if (active) {
          setFailed(true);
          setResult(null);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [
    location,
    eventDate,
    eventTime,
  ]);

  if (
    !location.trim() ||
    !eventDate
  ) {
    return null;
  }

  if (
    result?.status === "unavailable" &&
    result.reason === "past"
  ) {
    return null;
  }

  if (loading) {
    return (
      <span className="badge badge-ghost gap-2 h-auto py-2">
        <Loader2
          size={14}
          className="animate-spin"
        />

        {!compact &&
          "Consultando previsão"}
      </span>
    );
  }

  if (failed) {
    return (
      <span
        className="badge badge-ghost gap-2 h-auto py-2"
        title="Não foi possível consultar a previsão. Verifique o nome da cidade ou a configuração do serviço de clima."
      >
        <CloudOff size={14} />

        {!compact &&
          "Previsão indisponível"}
      </span>
    );
  }

  if (
    result?.status === "unavailable"
  ) {
    return (
      <span
        className="badge badge-warning badge-outline gap-2 h-auto py-2"
        title={
          result.reason ===
          "outside-window"
            ? "A data está fora da janela disponível na previsão de cinco dias."
            : "Não foi possível localizar uma previsão para esse evento."
        }
      >
        <Clock3 size={14} />

        {compact
          ? "Sem previsão"
          : "Previsão ainda indisponível"}
      </span>
    );
  }

  if (
    !result ||
    result.status !== "available"
  ) {
    return null;
  }

  const forecastTime =
    formatForecastTime(result.time);

  return (
    <span
      className="badge badge-info badge-outline gap-2 h-auto py-2"
      title={`${result.description} em ${result.city}, previsão das ${result.time} — ${getSelectionDescription(
        result
      )}.`}
    >
      {result.icon ? (
        <img
          src={`https://openweathermap.org/img/wn/${result.icon}.png`}
          alt=""
          aria-hidden="true"
          className="h-5 w-5"
        />
      ) : (
        <Cloud size={14} />
      )}

      <strong>
        {result.temp}°C
      </strong>

      <span>
        {compact
          ? `· ${forecastTime}`
          : `às ${forecastTime}`}
      </span>
    </span>
  );
}
