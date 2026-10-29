import type { Forecast } from "../api/schemas";
import { dayLabel } from "../lib/format";
import type { Units } from "../lib/units";
import { describeWeather } from "../lib/weatherCodes";
import { Temp } from "./Temp";
import { WeatherIcon } from "./WeatherIcon";

export const FORECAST_LENGTH = 5;

export function ForecastList({ forecast, units }: { forecast: Forecast; units: Units }) {
  const days = forecast.days.slice(1, 1 + FORECAST_LENGTH);
  return (
    <section aria-labelledby="forecast-title" className="forecast">
      <h2 id="forecast-title" className="section-title">
        Next {days.length} days
      </h2>
      <ol className="days">
        {days.map((d) => {
          const { weekday, date } = dayLabel(d.date);
          const condition = describeWeather(d.weatherCode);
          return (
            <li key={d.date} className="card day">
              <p className="day-name">
                <span>{weekday}</span> <span className="day-date">{date}</span>
              </p>
              <WeatherIcon kind={condition.icon} size={40} />
              <p className="day-condition">{condition.label}</p>
              <p className="day-temps">
                <Temp c={d.maxC} units={units} prefix="High" />
                <Temp c={d.minC} units={units} prefix="Low" className="day-low" />
              </p>
              {d.precipitationChance !== null ? (
                <p className="day-rain">{Math.round(d.precipitationChance)}% rain</p>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
