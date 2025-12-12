import { useState } from 'react';
import { X, Users, UserCog } from 'lucide-react';
import './CreateGroupModal.css';

export default function CreateGroupModal({ isOpen, onClose, onCreate }) {
  const [groupName, setGroupName] = useState('');
  const [groupType, setGroupType] = useState('manager');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!groupName.trim()) {
      alert('그룹 이름을 입력해주세요.');
      return;
    }

    setLoading(true);
    await onCreate(groupName, groupType);
    setLoading(false);

    // 초기화
    setGroupName('');
    setGroupType('manager');
  };

  const handleClose = () => {
    if (!loading) {
      setGroupName('');
      setGroupType('manager');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🍱 새 그룹 만들기</h2>
          <button className="btn-close" onClick={handleClose} disabled={loading}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {/* 그룹 이름 */}
          <div className="form-group">
            <label htmlFor="groupName">그룹 이름</label>
            <input
              type="text"
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="예: 우리 팀, 점심 메이트"
              maxLength={30}
              autoFocus
            />
            <span className="char-count">{groupName.length}/30</span>
          </div>

          {/* 그룹 타입 */}
          <div className="form-group">
            <label>그룹 타입</label>
            <div className="type-options">
              <div
                className={`type-option ${groupType === 'manager' ? 'active' : ''}`}
                onClick={() => setGroupType('manager')}
              >
                <div className="type-icon">
                  <UserCog size={32} />
                </div>
                <h3>총괄형</h3>
                <p>총무가 모든 식사 기록을 관리해요</p>
                <ul>
                  <li>총무가 기록 입력</li>
                  <li>멤버 관리 편리</li>
                  <li>간편한 정산</li>
                </ul>
              </div>

              <div
                className={`type-option ${groupType === 'participant' ? 'active' : ''}`}
                onClick={() => setGroupType('participant')}
              >
                <div className="type-icon">
                  <Users size={32} />
                </div>
                <h3>참여형</h3>
                <p>각자 자신의 식사 기록을 입력해요</p>
                <ul>
                  <li>개인이 직접 입력</li>
                  <li>투명한 기록</li>
                  <li>자율적인 관리</li>
                </ul>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-create"
            disabled={loading || !groupName.trim()}
          >
            {loading ? '생성 중...' : '그룹 만들기'}
          </button>
        </form>
      </div>
    </div>
  );
}
