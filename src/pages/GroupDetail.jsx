import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../utils/auth';
import { getGroup } from '../utils/groups';
import { ArrowLeft, Settings, Calendar, Users } from 'lucide-react';
import './GroupDetail.css';

export default function GroupDetail() {
  const { groupId } = useParams();
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
      <div className="group-detail-container">
        <div className="loading-state">
          <div className="loading-spinner">🍱</div>
          <p>그룹 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const isCreator = group.creatorId === user.uid;

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
        <div className="coming-soon-section">
          <div className="coming-soon-icon">
            <Calendar size={80} color="var(--primary)" />
          </div>
          <h2>🗓️ 캘린더 준비 중</h2>
          <p>3단계에서 캘린더와 식사 기록 기능이 추가될 예정입니다!</p>
          
          <div className="feature-preview">
            <h3>곧 만나볼 기능들</h3>
            <ul>
              <li>📅 캘린더에서 날짜별 식사 기록</li>
              <li>🍱 음식점 등록 및 관리</li>
              <li>💰 식대 자동 계산 및 N빵</li>
              <li>📊 통계 및 정산 내역</li>
              <li>🎲 음식점 룰렛</li>
            </ul>
          </div>

          <button 
            className="btn-back-to-list"
            onClick={() => navigate('/groups')}
          >
            그룹 목록으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
