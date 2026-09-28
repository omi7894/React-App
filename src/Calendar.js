import { useState } from 'react';
import './Calendar.css';

function Calendar({ t }) {
  const [current, setCurrent] = useState(new Date());
  const [selected, setSelected] = useState(new Date());

  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // 2023-01-01은 일요일이라, 0~6을 더하면 일~토 순서가 된다.
  const weekdays = Array.from({ length: 7 }, (_, i) =>
    new Date(2023, 0, 1 + i).toLocaleDateString(t.locale, { weekday: 'short' })
  );
  const title = new Date(year, month, 1).toLocaleDateString(t.locale, {
    year: 'numeric',
    month: 'long',
  });

  const today = new Date();
  const isToday = (day) =>
    today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === day;

  const isSelected = (day) =>
    selected &&
    selected.getFullYear() === year &&
    selected.getMonth() === month &&
    selected.getDate() === day;

  const goPrevMonth = () => setCurrent(new Date(year, month - 1, 1));
  const goNextMonth = () => setCurrent(new Date(year, month + 1, 1));
  const goToday = () => {
    const now = new Date();
    setCurrent(now);
    setSelected(now);
  };

  const selectDay = (day) => setSelected(new Date(year, month, day));

  const cells = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push(<div key={`blank-${i}`} className="calendar-cell empty" />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const classNames = ['calendar-cell'];
    if (isToday(day)) classNames.push('today');
    if (isSelected(day)) classNames.push('selected');
    cells.push(
      <button
        key={day}
        type="button"
        className={classNames.join(' ')}
        onClick={() => selectDay(day)}
      >
        {day}
      </button>
    );
  }

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button type="button" onClick={goPrevMonth} aria-label={t.prevMonth}>
          ‹
        </button>
        <button type="button" className="calendar-title" onClick={goToday}>
          {title}
        </button>
        <button type="button" onClick={goNextMonth} aria-label={t.nextMonth}>
          ›
        </button>
      </div>
      <div className="calendar-grid">
        {weekdays.map((d) => (
          <div key={d} className="calendar-weekday">
            {d}
          </div>
        ))}
        {cells}
      </div>
      {selected && (
        <p className="calendar-selected-label">
          {t.selectedDate}:{' '}
          {selected.toLocaleDateString(t.locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      )}
    </div>
  );
}

export default Calendar;
