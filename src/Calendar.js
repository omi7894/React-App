import { useState } from 'react';
import './Calendar.css';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function Calendar() {
  const [current, setCurrent] = useState(new Date());
  const [selected, setSelected] = useState(new Date());

  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

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
        <button type="button" onClick={goPrevMonth} aria-label="이전 달">
          ‹
        </button>
        <button type="button" className="calendar-title" onClick={goToday}>
          {year}년 {month + 1}월
        </button>
        <button type="button" onClick={goNextMonth} aria-label="다음 달">
          ›
        </button>
      </div>
      <div className="calendar-grid">
        {WEEKDAYS.map((d) => (
          <div key={d} className="calendar-weekday">
            {d}
          </div>
        ))}
        {cells}
      </div>
      {selected && (
        <p className="calendar-selected-label">
          선택한 날짜: {selected.getFullYear()}년 {selected.getMonth() + 1}월{' '}
          {selected.getDate()}일
        </p>
      )}
    </div>
  );
}

export default Calendar;
