import {
  getCurrentWeather,
  getDailyForecast,
  getEventForecast,
} from '../services/weatherService.js';

function queryString(
  value
) {
  return (
    typeof value === 'string'
      ? value
      : ''
  );
}

export async function current(
  req,
  res,
  next
) {
  try {
    const weather =
      await getCurrentWeather(
        queryString(
          req.query.city
        )
      );

    res.json(weather);
  } catch (error) {
    next(error);
  }
}

export async function forecast(
  req,
  res,
  next
) {
  try {
    const forecastData =
      await getDailyForecast(
        queryString(
          req.query.city
        )
      );

    res.json(forecastData);
  } catch (error) {
    next(error);
  }
}

export async function event(
  req,
  res,
  next
) {
  try {
    const forecastData =
      await getEventForecast(
        queryString(
          req.query.city
        ),
        queryString(
          req.query.date
        ),
        queryString(
          req.query.time
        ) || undefined
      );

    res.json(forecastData);
  } catch (error) {
    next(error);
  }
}
