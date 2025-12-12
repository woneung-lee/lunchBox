import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, ChevronRight } from 'lucide-react';
import { getUserGroups, createGroup, deleteGroup } from '../utils/groups';
import { getCurrentUser } from '../utils/auth';
import GroupForm from '../components/GroupForm';
import './Groups.css';

export default function Groups() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const user = getCurrentUser();
      const result = await getUserGroups(user.uid);
      
      if (result.success) {
        setGroups(result.groups || []);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('그룹 조회 오류:', err);
      setError('그룹을 불러오는 중 오류가 발생했습니다.');
    }
    
    setLoading(false);
  };

  const handleCreateGroup = async (groupData) => {
    try {
      const user = getCurrentUser();
      const result = await createGroup(user.uid, groupData);
      
      if (result.success) {
        setIsFormOpen(false);
        await loadGroups();
      } else {
        alert(result.error || '그룹 생성에 실패했습니다.');
      }
    } catch (err) {
      console.error('그룹 생성 오류:', err);
      alert('그룹 생성 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteGroup = async (group) => {
    if (!confirm(`${group.name} 그룹을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const result = await deleteGroup(group.id);
      
      if (result.success) {
        await loadGroups();
      } else {
        alert(result.error || '그룹 삭제에 실패했습니다.');
      }
    } catch (err) {
      console.error('그룹 삭제 오류:', err);
      alert('그룹 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleGroupClick = (groupId) => {
    navigate(`/group/${groupId}`);
  };

  return (
    <div className="groups-page">
      <div className="groups-container">
        <div className="groups-header">
          <div className="header-content">
            <h1>🍱 점심 정산</h1>
            <p>그룹을 선택하여 시작하세요</p>
          </div>
          <button className="btn-create-group" onClick={() => setIsFormOpen(true)}>
            <Plus size={20} />
            그룹 생성
          </button>
        </div>

        {error && (
          <div className="error-message">
            <p>⚠️ {error}</p>
            <button onClick={loadGroups} className="btn-retry">
              다시 시도
            </button>
          </div>
        )}

        {loading ? (
          <div className="loading">로딩 중...</div>
        ) : (
          <div className="groups-list">
            {!groups || groups.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">👥</div>
                <h3>그룹이 없습니다</h3>
                <p>새로운 그룹을 만들어보세요!</p>
                <button className="btn-create-empty" onClick={() => setIsFormOpen(true)}>
                  <Plus size={20} />
                  그룹 생성하기
                </button>
              </div>
            ) : (
              groups.map(group => (
                <div 
                  key={group.id} 
                  className="group-card"
                  onClick={() => handleGroupClick(group.id)}
                >
                  <div className="group-info">
                    <div className="group-icon">
                      <Users size={32} />
                    </div>
                    <div className="group-details">
                      <h3 className="group-name">{group.name}</h3>
                      <div className="group-meta">
                        👥 멤버 {group.memberIds?.length || 0}명
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={24} color="var(--text-secondary)" />
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <GroupForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleCreateGroup}
        group={null}
      />
    </div>
  );
}
