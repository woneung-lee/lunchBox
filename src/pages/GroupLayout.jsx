import { useState, useEffect } from 'react';
import { Outlet, useParams, useNavigate } from 'react-router-dom';
import { Calendar, Store, Users, BarChart3, Shuffle, ChevronLeft } from 'lucide-react';
import { getGroup } from '../utils/groups';
import './GroupLayout.css';

export default function GroupLayout() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('calendar');

  useEffect(() => {
    if (groupId) {
      loadGroup();
    }
  }, [groupId]);

  const loadGroup = async () => {
    setLoading(true);
    const result = await getGroup(groupId);
    
    if (result.success) {
      setGroup(result.group);
    } else {
      alert('그룹을 찾을 수 없습니다.');
      navigate('/');
    }
    
    setLoading(false);
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleTabClick = (tab, path) => {
    setActiveTab(tab);
    navigate(`/group/${groupId}${path}`);
  };

  if (loading) {
    return (
      <div className="group-layout loading">
        <div className="loading-spinner">로딩 중...</div>
      </div>
    );
  }

  if (!group) {
    return null;
  }

  return (
    <div className="group-layout">
      {/* 헤더 */}
      <div className="group-header">
        <button className="btn-back" onClick={handleBack}>
          <ChevronLeft size={24} />
        </button>
        <div className="group-info">
          <h1 className="group-title">{group.name}</h1>
          <p className="group-members">👥 멤버 {group.memberIds?.length || 0}명</p>
        </div>
        <div className="header-spacer"></div>
      </div>

      {/* 컨텐츠 */}
      <div className="group-content">
        <Outlet context={{ group, reloadGroup: loadGroup }} />
      </div>

      {/* 하단 네비게이션 - 5개 탭 */}
      <nav className="bottom-nav">
        <button
          className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => handleTabClick('calendar', '')}
        >
          <Calendar size={24} />
          <span>달력</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'restaurants' ? 'active' : ''}`}
          onClick={() => handleTabClick('restaurants', '/restaurants')}
        >
          <Store size={24} />
          <span>음식점</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => handleTabClick('members', '/members')}
        >
          <Users size={24} />
          <span>모임원</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'statistics' ? 'active' : ''}`}
          onClick={() => handleTabClick('statistics', '/statistics')}
        >
          <BarChart3 size={24} />
          <span>통계</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'roulette' ? 'active' : ''}`}
          onClick={() => handleTabClick('roulette', '/roulette')}
        >
          <Shuffle size={24} />
          <span>룰렛</span>
        </button>
      </nav>
    </div>
  );
}
