import { useEffect, useState } from 'react';
import { Outlet, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getCurrentUser } from '../utils/auth';
import { getGroup } from '../utils/groups';
import BottomNav from '../components/BottomNav';
import './GroupLayout.css';

export default function GroupLayout() {
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
      <div className="group-layout-loading">
        <div className="loading-spinner">🍱</div>
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="group-layout">
      {/* 상단 헤더 */}
      <div className="group-header">
        <button className="btn-back" onClick={() => navigate('/groups')}>
          <ArrowLeft size={24} />
        </button>
        <div className="group-info">
          <h1>{group.name}</h1>
          <span className="group-badge" data-type={group.type}>
            {group.type === 'manager' ? '총괄형' : '참여형'}
          </span>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="group-content">
        <Outlet context={{ user, group, loadGroup }} />
      </div>

      {/* 하단 네비게이션 */}
      <BottomNav />
    </div>
  );
}
