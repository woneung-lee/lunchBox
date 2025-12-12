import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Plus } from 'lucide-react';
import { getCurrentUser } from '../utils/auth';
import { getGroup } from '../utils/groups';
import { parseDateKey, dateUtils } from '../utils/calendar';
import './DateDetail.css';

export default function DateDetail() {
  const { groupId, dateKey } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading || !group || !user) {
    return (
      <div className="date-detail-container">
        <div className="loading-state">
          <div className="loading-spinner">🍱</div>
          <p>정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const selectedDate = parseDateKey(dateKey);
  const isCreator = group.creatorId === user.uid;
  const canAddMeal = group.type === 'manager' ? isCreator : true;

  return (
    <div className="date-detail-container">
      {/* 헤더 */}
      <div className="date-detail-header">
        <button className="btn-back" onClick={() => navigate(`/group/${groupId}`)}>
          <ArrowLeft size={24} />
        </button>
        <div className="date-info">
          <div className="date-icon">
            <Calendar size={20} />
          </div>
          <div>
            <h1>{dateUtils.format(selectedDate, 'M월 d일 (EEE)')}</h1>
            <p className="group-name">{group.name}</p>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="date-detail-content">
        {/* 식사 기록 목록 (아직 없음) */}
        <div className="meals-section">
          <div className="empty-meals">
            <div className="empty-icon">🍱</div>
            <h3>아직 식사 기록이 없어요</h3>
            <p>이 날짜의 점심 기록을 추가해보세요!</p>
          </div>
        </div>

        {/* 식사 추가 버튼 */}
        {canAddMeal && (
          <button
            className="btn-add-meal"
            onClick={() => alert('4단계에서 구현됩니다!')}
          >
            <Plus size={24} />
            식사 기록 추가
          </button>
        )}

        {/* 안내 메시지 */}
        <div className="info-notice">
          <div className="notice-card">
            <h4>🚀 4단계 준비 중</h4>
            <p>음식점 등록 및 식사 기록 기능이 추가될 예정입니다</p>
            <ul>
              <li>음식점 선택</li>
              <li>메뉴 및 가격 입력</li>
              <li>N빵 계산</li>
              <li>정산 내역 확인</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
