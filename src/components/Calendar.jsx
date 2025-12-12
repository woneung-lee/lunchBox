import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  getCalendarDates,
  getNextMonth,
  getPreviousMonth,
  formatDateKey,
  dateUtils,
  WEEKDAYS,
  isWeekend
} from '../utils/calendar';
import './Calendar.css';

export default function Calendar({ selectedDate, onDateSelect, mealRecords = {} }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const calendarDates = getCalendarDates(currentMonth);

  const handlePrevMonth = () => {
    setCurrentMonth(getPreviousMonth(currentMonth));
  };

  const handleNextMonth = () => {
    setCurrentMonth(getNextMonth(currentMonth));
  };

  const handleToday = () => {
    setCurrentMonth(new Date());
  };

  const handleDateClick = (date) => {
    onDateSelect(date);
  };

  // 해당 날짜에 식사 기록이 있는지 확인
  const hasMealRecord = (date) => {
    const dateKey = formatDateKey(date);
    return mealRecords[dateKey] && mealRecords[dateKey].length > 0;
  };

  return (
    <div className="calendar-container">
      {/* 캘린더 헤더 */}
      <div className="calendar-header">
        <button className="btn-nav" onClick={handlePrevMonth}>
          <ChevronLeft size={24} />
        </button>
        
        <div className="month-display">
          <h2>{dateUtils.format(currentMonth, 'yyyy년 M월')}</h2>
          <button className="btn-today" onClick={handleToday}>
            오늘
          </button>
        </div>

        <button className="btn-nav" onClick={handleNextMonth}>
          <ChevronRight size={24} />
        </button>
      </div>

      {/* 요일 행 */}
      <div className="calendar-weekdays">
        {WEEKDAYS.map((day, index) => (
          <div
            key={day}
            className={`weekday ${index === 0 ? 'sunday' : ''} ${index === 6 ? 'saturday' : ''}`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="calendar-grid">
        {calendarDates.map((date, index) => {
          const isCurrentMonth = dateUtils.isSameMonth(date, currentMonth);
          const isSelected = selectedDate && dateUtils.isSameDay(date, selectedDate);
          const isTodayDate = dateUtils.isToday(date);
          const isWeekendDate = isWeekend(date);
          const hasMeal = hasMealRecord(date);

          return (
            <div
              key={index}
              className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${
                isSelected ? 'selected' : ''
              } ${isTodayDate ? 'today' : ''} ${isWeekendDate ? 'weekend' : ''}`}
              onClick={() => isCurrentMonth && handleDateClick(date)}
            >
              <div className="day-number">{dateUtils.format(date, 'd')}</div>
              {hasMeal && isCurrentMonth && (
                <div className="meal-indicator">
                  <span className="dot"></span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
