import { useState } from 'react';
import { useOutletContext, useNavigate, useParams } from 'react-router-dom';
import { Calendar as CalendarIcon } from 'lucide-react';
import Calendar from '../components/Calendar';
import { formatDateKey } from '../utils/calendar';
import './GroupMain.css';

export default function GroupMain() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user, group } = useOutletContext();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mealRecords, setMealRecords] = useState({});

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    const dateKey = formatDateKey(date);
    navigate(`/group/${groupId}/date/${dateKey}`);
  };

  return (
    <div className="group-main">
      {/* 캘린더 섹션 */}
      <div className="main-section">
        <div className="section-header">
          <CalendarIcon size={20} />
          <h2>식사 캘린더</h2>
        </div>
        <Calendar
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          mealRecords={mealRecords}
        />
      </div>

      {/* 안내 카드 */}
      <div className="info-cards">
        <div className="info-card">
          <div className="card-icon">📅</div>
          <div className="card-content">
            <h3>날짜를 선택하세요</h3>
            <p>캘린더에서 날짜를 클릭하면 식사 기록을 확인하고 추가할 수 있어요</p>
          </div>
        </div>

        <div className="info-card">
          <div className="card-icon">🍽️</div>
          <div className="card-content">
            <h3>음식점 관리</h3>
            <p>하단의 음식점 탭에서 자주 가는 음식점을 등록하세요</p>
          </div>
        </div>

        <div className="info-card">
          <div className="card-icon">👥</div>
          <div className="card-content">
            <h3>모임원 관리</h3>
            <p>자주 함께하는 사람들을 모임원으로 등록하면 편리해요</p>
          </div>
        </div>
      </div>
    </div>
  );
}
