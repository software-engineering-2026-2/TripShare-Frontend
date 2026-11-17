import {
  formatDuration,
  formatTime,
  getTimeOfDay,
  TIME_OF_DAY,
  type DaySchedule,
  type ScheduledActivity,
  type TimeOfDay,
} from '../itinerary';

interface DayItineraryProps {
  schedule: DaySchedule;
}

interface TimeOfDayGroup {
  timeOfDay: TimeOfDay;
  items: { item: ScheduledActivity; number: number }[];
}

function groupByTimeOfDay(items: ScheduledActivity[]): TimeOfDayGroup[] {
  const groups: TimeOfDayGroup[] = [];

  items.forEach((item, index) => {
    const timeOfDay = getTimeOfDay(item.start);
    const last = groups[groups.length - 1];

    if (last && last.timeOfDay === timeOfDay) {
      last.items.push({ item, number: index + 1 });
    } else {
      groups.push({ timeOfDay, items: [{ item, number: index + 1 }] });
    }
  });

  return groups;
}

export default function DayItinerary({ schedule }: DayItineraryProps) {
  return (
    <div className="day-itinerary">
      <div className="day-itinerary__endpoint">
        <p className="day-itinerary__endpoint-label">Saída da hospedagem</p>
        <span className="day-itinerary__endpoint-time">
          {formatTime(schedule.departure)}
        </span>
      </div>

      {groupByTimeOfDay(schedule.items).map((group, groupIndex) => {
        const { label, range } = TIME_OF_DAY[group.timeOfDay];

        return (
          <section
            className={`day-itinerary__group time-of-day--${group.timeOfDay}`}
            key={`${group.timeOfDay}-${groupIndex}`}
            aria-label={`${label}, ${range}`}
          >
            <header className="day-itinerary__group-header">
              <h3 className="day-itinerary__group-title">{label}</h3>
              <span className="day-itinerary__group-range">
                {range} · {group.items.length}{' '}
                {group.items.length === 1 ? 'parada' : 'paradas'}
              </span>
            </header>

            <ol className="day-itinerary__list">
              {group.items.map(({ item, number }) => (
                <li className="day-itinerary__item" key={item.activity.id}>
                  <p className="day-itinerary__travel">
                    {formatDuration(item.travelMinutes)} de deslocamento
                    {item.waitMinutes > 4 &&
                      ` · ${formatDuration(item.waitMinutes)} livre`}
                  </p>

                  <article className="day-itinerary__card">
                    <span className="day-itinerary__number">{number}</span>
                    <div>
                      <p className="day-itinerary__time">
                        {formatTime(item.start)} – {formatTime(item.end)}
                      </p>
                      <h4 className="day-itinerary__name">
                        {item.activity.name}
                      </h4>
                      <p className="day-itinerary__details">
                        {item.activity.location} ·{' '}
                        {formatDuration(item.activity.durationMinutes)}
                      </p>
                      {item.activity.startsAt && (
                        <span className="day-itinerary__tag">
                          Início fixo às {item.activity.startsAt}
                        </span>
                      )}
                      {item.late && (
                        <span className="day-itinerary__tag day-itinerary__tag--warning">
                          Chegada depois do horário fixo
                        </span>
                      )}
                    </div>
                  </article>
                </li>
              ))}
            </ol>
          </section>
        );
      })}

      <div className="day-itinerary__endpoint">
        <div>
          <p className="day-itinerary__endpoint-label">Retorno à hospedagem</p>
          <p className="day-itinerary__endpoint-detail">
            {formatDuration(schedule.returnTravelMinutes)} de deslocamento
          </p>
        </div>
        <span className="day-itinerary__endpoint-time">
          {formatTime(schedule.returnArrival)}
        </span>
      </div>
    </div>
  );
}
