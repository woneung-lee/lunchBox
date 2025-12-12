import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, signOut } from '../utils/auth';
import { getUserGroups, createGroup } from '../utils/groups';
import { LogOut, Plus, RefreshCw } from 'lucide-react';
import GroupCard from '../components/GroupCard';
import CreateGroupModal from '../components/CreateGroupModal';
import './Groups.css';

export default function Groups() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/login');
    } else {
      setUser(currentUser);
      loadGroups(currentUser.uid);
    }
  }, [navigate]);

  const loadGroups = async (userId) => {
    setLoading(true);
    const result = await getUserGroups(userId);
    if (result.success) {
      setGroups(result.groups);
    } else {
      alert('그룹 목록을 불러오는데 실패했습니다.');
    }
    setLoading(false);
  };

  const handleCreateGroup = async (groupName, groupType) => {
    const result = await createGroup(user.uid, user.displayName, groupName, groupType);
    
    if (result.success) {
      setIsModalOpen(false);
      await loadGroups(user.uid);
      alert('그룹이 생성되었습니다! 🎉');
    } else {
      alert(result.error);
    }
  };

  const handleLogout = async () => {
    const result = await signOut();
    if (result.success) {
      navigate('/login');
    }
  };

  const handleGroupClick = (groupId) => {
    navigate(`/group/${groupId}`);
  };

  if (!user) return null;

  return (
    <div className="groups-container">
      <div className="groups-header">
        <div>
          <h1>🍱 내 그룹</h1>
          <p>안녕하세요, <strong>{user.displayName}</strong>님!</p>
        </div>
        <div className="header-actions">
          <button onClick={() => loadGroups(user.uid)} className="btn-refresh" title="새로고침">
            <RefreshCw size={20} />
          </button>
          <button onClick={handleLogout} className="btn-logout">
            <LogOut size={20} />
            로그아웃
          </button>
        </div>
      </div>

      <div className="groups-content">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner">🍱</div>
            <p>그룹 목록을 불러오는 중...</p>
          </div>
        ) : groups.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🍱</div>
            <h2>아직 그룹이 없어요</h2>
            <p>새로운 그룹을 만들어서 점심 정산을 시작해보세요!</p>
            <button className="btn-create-group" onClick={() => setIsModalOpen(true)}>
              <Plus size={20} />
              그룹 만들기
            </button>
          </div>
        ) : (
          <>
            <div className="groups-grid">
              {groups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onClick={() => handleGroupClick(group.id)}
                />
              ))}
            </div>
            <button className="btn-floating" onClick={() => setIsModalOpen(true)}>
              <Plus size={24} />
            </button>
          </>
        )}
      </div>

      <CreateGroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateGroup}
      />
    </div>
  );
}
