import type { Forecast, Place } from "../api/schemas";
import { placeLabel } from "../lib/format";
import { formatWind } from "../lib/units";
import type { Units } from "../lib/units";
import { describeWeather } from "../lib/weatherCodes";
import { Temp } from "./Temp";
import { WeatherIcon } from "./WeatherIcon";

interface Props {
  place: Place;
  forecast: Forecast;
  units: Units;
}

export function CurrentConditions({ place, forecast, units }: Props) {
  const { current } = forecast;
  const today = forecast.days[0];
  const condition = describeWeather(current.weatherCode);

  return (
    <section aria-labelledby="current-title" className="card current">
      <h2 id="current-title" className="place">
        {placeLabel(place)}
      </h2>
      <div className="current-main">
        <WeatherIcon kind={condition.icon} night={!current.isDay} size={72} />
        <div>
          <p className="temp">
            <Temp c={current.temperatureC} units={units} />
          </p>
          <p className="condition">{condition.label}</p>
        </div>
      </div>
      <dl className="facts">
        <div>
          <dt>Feels like</dt>
          <dd>
            <Temp c={current.feelsLikeC} units={units} />
          </dd>
        </div>
        <div>
          <dt>Humidity</dt>
          <dd>{Math.round(current.humidity)}%</dd>
        </div>
        <div>
          <dt>Wind</dt>
          <dd>{formatWind(current.windKmh, units)}</dd>
        </div>
        {today ? (
          <div>
            <dt>Today</dt>
            <dd>
              <Temp c={today.maxC} units={units} prefix="High" /> /{" "}
              <Temp c={today.minC} units={units} prefix="Low" />
            </dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
