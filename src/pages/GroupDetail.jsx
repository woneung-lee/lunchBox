import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../utils/auth';
import { getGroup } from '../utils/groups';
import { ArrowLeft, Settings, Users, Store } from 'lucide-react';
import Calendar from '../components/Calendar';
import { formatDateKey } from '../utils/calendar';
import './GroupDetail.css';

export default function GroupDetail() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mealRecords, setMealRecords] = useState({});

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/login');
    } else {
      setUser(currentUser);
      loadGroup();
    }
  }, [groupId, navigate]);

  const loadGroup = async () => {
    setLoading(true);
    const result = await getGroup(groupId);
    if (result.success) {
      setGroup(result.group);
    } else {
      alert('그룹을 찾을 수 없습니다.');
      navigate('/groups');
    }
    setLoading(false);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    const dateKey = formatDateKey(date);
    navigate(`/group/${groupId}/date/${dateKey}`);
  };

  if (loading || !group || !user) {
    return (
      <div className="group-detail-container">
        <div className="loading-state">
          <div className="loading-spinner">🍱</div>
          <p>그룹 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="group-detail-container">
      {/* 헤더 */}
      <div className="group-detail-header">
        <button className="btn-back" onClick={() => navigate('/groups')}>
          <ArrowLeft size={24} />
        </button>
        <div className="group-title">
          <h1>{group.name}</h1>
          <div className="group-meta">
            <span className="group-type-badge" data-type={group.type}>
              {group.type === 'manager' ? '총괄형' : '참여형'}
            </span>
            <span className="member-count">
              <Users size={16} />
              {group.members.length}명
            </span>
          </div>
        </div>
        <button className="btn-settings" onClick={() => navigate(`/group/${groupId}/settings`)}>
          <Settings size={24} />
        </button>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="group-detail-content">
        {/* 캘린더 */}
        <div className="calendar-section">
          <Calendar
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            mealRecords={mealRecords}
          />
        </div>

        {/* 안내 메시지 */}
        <div className="info-section">
          <div className="info-card">
            <div className="info-icon">📅</div>
            <h3>날짜를 선택하세요</h3>
            <p>캘린더에서 날짜를 클릭하면 해당 날짜의 식사 기록을 볼 수 있어요</p>
          </div>

          <div className="info-card" onClick={() => navigate(`/group/${groupId}/settings`)}>
            <div className="info-icon">🍽️</div>
            <h3>음식점 관리</h3>
            <p>설정에서 자주 가는 음식점을 등록하고 관리할 수 있어요</p>
          </div>
        </div>

        {/* 빠른 액션 */}
        <div className="quick-actions">
          <button 
            className="action-card"
            onClick={() => navigate(`/group/${groupId}/settings`)}
          >
            <Store size={24} />
            <span>음식점 관리</span>
          </button>
        </div>
      </div>
    </div>
  );
}
