import { useState, useEffect } from 'react';
import { X, Users } from 'lucide-react';
import './GroupForm.css';

export default function GroupForm({ 
  isOpen, 
  onClose, 
  onSave, 
  group = null 
}) {
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (group) {
      setGroupName(group.name);
    } else {
      setGroupName('');
    }
  }, [group, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!groupName.trim()) {
      alert('그룹 이름을 입력해주세요.');
      return;
    }

    setLoading(true);
    await onSave({ name: groupName.trim() });
    setLoading(false);
  };

  const handleClose = () => {
    if (!loading) {
      setGroupName('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content group-form" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-with-icon">
            <Users size={24} color="var(--primary)" />
            <h2>{group ? '그룹 수정' : '그룹 생성'}</h2>
          </div>
          <button className="btn-close" onClick={handleClose} disabled={loading}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label htmlFor="groupName">
              그룹 이름 <span className="required">*</span>
            </label>
            <input
              type="text"
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="예: 회사 동료들"
              maxLength={50}
              autoFocus
            />
          </div>

          <div className="info-box">
            <p>💡 <strong>모든 멤버가 동등한 권한</strong>을 가집니다</p>
            <ul>
              <li>모든 식사 기록 추가/수정/삭제 가능</li>
              <li>모든 음식점 추가/수정/삭제 가능</li>
              <li>모든 모임원 추가/수정/삭제 가능</li>
            </ul>
          </div>

          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading || !groupName.trim()}
          >
            {loading ? '생성 중...' : group ? '수정하기' : '생성하기'}
          </button>
        </form>
      </div>
    </div>
  );
}
