import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { getGroupMeals } from '../utils/meals';
import { calculateDateTotal } from '../utils/meals';
import './GroupCalendar.css';

export default function GroupCalendar() {
  const { group } = useOutletContext();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (group?.id) {
      loadMeals();
    }
  }, [group, currentDate]);

  const loadMeals = async () => {
    setLoading(true);
    const result = await getGroupMeals(group.id);
    
    if (result.success) {
      setMeals(result.meals || []);
    } else {
      console.error('식사 기록 조회 실패:', result.error);
      setMeals([]);
    }
    
    setLoading(false);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();

    const days = [];
    
    // 이전 달 빈칸
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    // 현재 달 날짜
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getMealsForDate = (date) => {
    if (!date) return [];
    const dateKey = formatDateKey(date);
    return meals.filter(meal => meal.dateKey === dateKey);
  };

  const getTotalForDate = (date) => {
    const dateMeals = getMealsForDate(date);
    return calculateDateTotal(dateMeals);
  };

  const formatDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatYearMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return `${year}년 ${month}월`;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (date) => {
    if (date) {
      const dateKey = formatDateKey(date);
      navigate(`/group/${group.id}/date/${dateKey}`);
    }
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const days = getDaysInMonth(currentDate);

  if (loading) {
    return (
      <div className="group-calendar">
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="group-calendar">
      {/* 월 선택 */}
      <div className="month-selector">
        <button className="btn-nav" onClick={handlePrevMonth}>
          <ChevronLeft size={24} />
        </button>
        <h2 className="month-title">{formatYearMonth(currentDate)}</h2>
        <button className="btn-nav" onClick={handleNextMonth}>
          <ChevronRight size={24} />
        </button>
      </div>

      <button className="btn-today" onClick={handleToday}>
        오늘
      </button>

      {/* 요일 헤더 */}
      <div className="calendar-header">
        {['일', '월', '화', '수', '목', '금', '토'].map(day => (
          <div key={day} className="weekday">{day}</div>
        ))}
      </div>

      {/* 캘린더 그리드 */}
      <div className="calendar-grid">
        {days.map((date, index) => {
          const dateMeals = date ? getMealsForDate(date) : [];
          const total = date ? getTotalForDate(date) : 0;
          const today = isToday(date);

          return (
            <div
              key={index}
              className={`calendar-day ${!date ? 'empty' : ''} ${today ? 'today' : ''}`}
              onClick={() => handleDateClick(date)}
            >
              {date && (
                <>
                  <div className="day-number">{date.getDate()}</div>
                  {dateMeals.length > 0 && (
                    <div className="day-info">
                      <div className="meal-count">{dateMeals.length}끼</div>
                      <div className="meal-total">{total.toLocaleString()}원</div>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
