import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, signOut } from '../utils/auth';
import { LogOut, Plus } from 'lucide-react';
import './Groups.css';

export default function Groups() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/login');
    } else {
      setUser(currentUser);
    }
  }, [navigate]);

  const handleLogout = async () => {
    const result = await signOut();
    if (result.success) {
      navigate('/login');
    }
  };

  if (!user) return null;

  return (
    <div className="groups-container">
      <div className="groups-header">
        <div>
          <h1>🍱 내 그룹</h1>
          <p>안녕하세요, <strong>{user.displayName}</strong>님!</p>
        </div>
        <button onClick={handleLogout} className="btn-logout">
          <LogOut size={20} />
          로그아웃
        </button>
      </div>

      <div className="groups-content">
        <div className="empty-state">
          <div className="empty-icon">🍱</div>
          <h2>아직 그룹이 없어요</h2>
          <p>새로운 그룹을 만들어서 점심 정산을 시작해보세요!</p>
          <button className="btn-create-group">
            <Plus size={20} />
            그룹 만들기
          </button>
        </div>
      </div>

      <div className="coming-soon-notice">
        <p>🚀 2단계: 그룹 생성 및 관리 기능 개발 예정</p>
      </div>
    </div>
  );
}
